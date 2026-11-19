const enc = new TextEncoder();

const b64url = bytes =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

function decodePart(value) {
  const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}

async function verifyGoogleToken(token, clientId) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  const header = JSON.parse(new TextDecoder().decode(decodePart(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decodePart(parts[1])));

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Invalid algorithm");
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", {
    cf: { cacheTtl: 3600, cacheEverything: true }
  });

  if (!response.ok) throw new Error("Google keys unavailable");

  const data = await response.json();
  const jwk = data.keys.find(k => k.kid === header.kid && k.alg === "RS256");

  if (!jwk) throw new Error("Unknown signing key");

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    decodePart(parts[2]),
    enc.encode(parts[0] + "." + parts[1])
  );

  const now = Math.floor(Date.now() / 1000);

  if (
    !valid ||
    claims.aud !== clientId ||
    !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss) ||
    !claims.sub ||
    !claims.exp ||
    claims.exp <= now ||
    !claims.iat ||
    claims.iat > now + 60 ||
    !(claims.email_verified === true || claims.email_verified === "true")
  ) {
    throw new Error("Google token verification failed");
  }

  return claims;
}

export async function onRequestPost({ request, env }) {
  try {
    if (
      !env.GOOGLE_CLIENT_ID ||
      !env.SESSION_SECRET ||
      env.SESSION_SECRET.length < 32 ||
      !env.DB
    ) {
      return Response.json(
        { success: false, message: "إعدادات تسجيل الدخول أو قاعدة البيانات غير مكتملة." },
        { status: 503 }
      );
    }

    const origin = request.headers.get("Origin");
    if (origin !== new URL(request.url).origin) {
      return Response.json(
        { success: false, message: "طلب غير مسموح." },
        { status: 403 }
      );
    }

    if (!(request.headers.get("Content-Type") || "").includes("application/json")) {
      return Response.json(
        { success: false, message: "نوع الطلب غير صالح." },
        { status: 415 }
      );
    }

    const body = await request.json();
    const credential = body.credential;

    if (typeof credential !== "string" || credential.length > 10000) {
      return Response.json(
        { success: false, message: "بيانات الدخول غير صالحة." },
        { status: 400 }
      );
    }

    const claims = await verifyGoogleToken(
      credential,
      env.GOOGLE_CLIENT_ID
    );

    // إنشاء الحساب عند أول تسجيل فقط.
    // عند تسجيل الدخول مرة أخرى لا نستبدل اسم وصورة GTXMOD المخصصين.
    await env.DB.prepare(`
      INSERT INTO users
        (id, google_sub, email, display_name, avatar_url)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      crypto.randomUUID(),
      claims.sub,
      claims.email || "",
      claims.name || claims.email || "مستخدم GTXMOD",
      claims.picture || ""
    ).run();

    const dbUser = await env.DB.prepare(`
      SELECT id, google_sub, email, display_name, username, avatar_url
      FROM users
      WHERE google_sub = ?
      LIMIT 1
    `).bind(claims.sub).first();

    if (!dbUser) throw new Error("User record not found");

    const user = {
      id: dbUser.id,
      sub: dbUser.google_sub,
      email: dbUser.email,
      name: dbUser.display_name,
      username: dbUser.username || "",
      picture: dbUser.avatar_url || ""
    };

    const payload = b64url(
      enc.encode(JSON.stringify({
        user: { ...user, picture: (user.picture || "").startsWith("https:") && user.picture.length < 500 ? user.picture : "" },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
      }))
    );

    const signature = await sign(payload, env.SESSION_SECRET);

    return new Response(JSON.stringify({ success: true, user }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": `gtx_google_session=${payload}.${signature}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "تعذر التحقق من تسجيل Google أو حفظ الحساب." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

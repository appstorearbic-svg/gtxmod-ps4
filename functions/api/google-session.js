const enc = new TextEncoder();

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

async function verifySignature(payload, signature, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    decodeBase64Url(signature),
    enc.encode(payload)
  );
}

export async function onRequestGet({ request, env }) {
  const headers = { "Cache-Control": "no-store" };

  try {
    if (
      !env.SESSION_SECRET ||
      env.SESSION_SECRET.length < 32 ||
      !env.DB
    ) {
      return Response.json({ success: false }, { headers });
    }

    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)gtx_google_session=([^;]+)/);

    if (!match) {
      return Response.json({ success: false }, { headers });
    }

    const parts = match[1].split(".");

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return Response.json({ success: false }, { headers });
    }

    const valid = await verifySignature(
      parts[0],
      parts[1],
      env.SESSION_SECRET
    );

    if (!valid) {
      return Response.json({ success: false }, { headers });
    }

    const session = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(parts[0]))
    );

    if (
      !session ||
      !Number.isFinite(session.exp) ||
      session.exp <= Math.floor(Date.now() / 1000) ||
      !session.user ||
      typeof session.user.sub !== "string" ||
      !session.user.sub ||
      typeof session.user.email !== "string"
    ) {
      return Response.json({ success: false }, { headers });
    }

    // جلب أحدث ملف شخصي من قاعدة D1.
    const dbUser = await env.DB.prepare(`
      SELECT id, google_sub, email, display_name, username, avatar_url
      FROM users
      WHERE google_sub = ?
      LIMIT 1
    `).bind(session.user.sub).first();

    if (!dbUser) {
      return Response.json({ success: false }, { headers });
    }

    const user = {
      id: dbUser.id,
      sub: dbUser.google_sub,
      email: dbUser.email || "",
      name: dbUser.display_name,
      username: dbUser.username || "",
      picture: dbUser.avatar_url || ""
    };

    return Response.json(
      { success: true, user },
      { headers }
    );
  } catch {
    return Response.json({ success: false }, { headers });
  }
}

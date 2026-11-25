const J=(o,s=200)=>Response.json(o,{status:s,headers:{"Cache-Control":"no-store"}});

export async function onRequestGet({request, env}) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) return J({success: false, message: "الرمز مطلوب"}, 400);

    // إنشاء الجدول إذا لم يكن موجوداً
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS invites (
      code TEXT PRIMARY KEY,
      owner_sub TEXT,
      used_by_sub TEXT,
      created_at INTEGER,
      expires_at INTEGER,
      is_used INTEGER DEFAULT 0
    )`).run();

    const invite = await env.DB.prepare(
      "SELECT * FROM invites WHERE code = ? AND is_used = 0 AND expires_at > ?"
    ).bind(code, Date.now()).first();

    if (invite) {
      return J({success: true, valid: true, message: "رمز صالح"});
    } else {
      return J({success: true, valid: false, message: "رمز غير صالح أو منتهي الصلاحية"});
    }
  } catch (e) {
    return J({success: false, message: e.message}, 500);
  }
}

export async function onRequestPost({request, env}) {
  try {
    const body = await request.json();
    const ownerSub = body.ownerSub || "admin";
    
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS invites (
      code TEXT PRIMARY KEY,
      owner_sub TEXT,
      used_by_sub TEXT,
      created_at INTEGER,
      expires_at INTEGER,
      is_used INTEGER DEFAULT 0
    )`).run();

    // توليد رمز عشوائي من 8 أحرف
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];

    // صلاحية 7 أيام (بدل 10 دقائق)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);

    await env.DB.prepare(
      "INSERT INTO invites (code, owner_sub, created_at, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(code, ownerSub, Date.now(), expiresAt).run();

    return J({success: true, code: code, message: "تم إنشاء رمز الدعوة بنجاح"});
  } catch (e) {
    return J({success: false, message: e.message}, 500);
  }
}

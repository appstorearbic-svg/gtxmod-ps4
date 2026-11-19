const enc=new TextEncoder(),dec=new TextDecoder();
function b64d(v){const n=v.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(n+"=".repeat((4-n.length%4)%4)),c=>c.charCodeAt(0));}
async function verify(p,s,sec){const k=await crypto.subtle.importKey("raw",enc.encode(sec),{name:"HMAC",hash:"SHA-256"},false,["verify"]);return crypto.subtle.verify("HMAC",k,b64d(s),enc.encode(p));}
export async function onRequestPost({request,env}){
 const H={"Cache-Control":"no-store"};
 const bad=(m,c)=>Response.json({success:false,message:m},{status:c,headers:H});
 try{
  if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32||!env.DB) return bad("إعدادات الخادم غير مكتملة.",503);
  if(request.headers.get("Origin")!==new URL(request.url).origin) return bad("طلب غير مسموح.",403);
  if(!(request.headers.get("Content-Type")||"").includes("application/json")) return bad("نوع الطلب غير صالح.",415);
  const m=(request.headers.get("Cookie")||"").match(/(?:^|;\s*)gtx_google_session=([^;]+)/);
  if(!m) return bad("سجل دخول أولاً.",401);
  const parts=m[1].split(".");
  if(parts.length!==2||!parts[0]||!parts[1]||!await verify(parts[0],parts[1],env.SESSION_SECRET)) return bad("الجلسة غير صالحة.",401);
  const s=JSON.parse(dec.decode(b64d(parts[0])));
  if(!s||!s.user||typeof s.user.sub!=="string"||!s.user.sub||!Number.isFinite(s.exp)||s.exp<=Math.floor(Date.now()/1000)) return bad("انتهت الجلسة، سجل دخول من جديد.",401);
  const body=await request.json();
  const name=String(body.name||"").trim();
  const username=String(body.username||"").trim().toLowerCase();
  const avatar=body.avatar===undefined?"":String(body.avatar||"");
  if(name.length<2||name.length>40) return bad("الاسم لازم بين 2 و 40 حرف.",400);
  if(username&&!/^[a-z0-9_]{3,20}$/.test(username)) return bad("اليوزر: 3-20 حرف إنجليزي صغير أو رقم أو _ فقط.",400);
  if(avatar&&(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar)||avatar.length>400000)) return bad("الصورة غير صالحة أو كبيرة زيادة.",400);
  if(username){
   const taken=await env.DB.prepare("SELECT id FROM users WHERE username=? AND google_sub<>? LIMIT 1").bind(username,s.user.sub).first();
   if(taken) return bad("هذا اليوزر محجوز، جرّب غيره.",409);
  }
  await env.DB.prepare("UPDATE users SET display_name=?,username=?,updated_at=CURRENT_TIMESTAMP WHERE google_sub=?").bind(name,username||null,s.user.sub).run();
  if(avatar) await env.DB.prepare("UPDATE users SET avatar_url=?,updated_at=CURRENT_TIMESTAMP WHERE google_sub=?").bind(avatar,s.user.sub).run();
  const u=await env.DB.prepare("SELECT id,google_sub,email,display_name,username,avatar_url FROM users WHERE google_sub=? LIMIT 1").bind(s.user.sub).first();
  if(!u) return bad("الحساب غير موجود.",404);
  return Response.json({success:true,user:{id:u.id,sub:u.google_sub,email:u.email||"",name:u.display_name,username:u.username||"",picture:u.avatar_url||""}},{headers:H});
 }catch{
  return bad("صار خطأ بالخادم، حاول مرة ثانية.",500);
 }
}

// GTXMOD — أكواد فريدة ثابتة: حروف كبيرة + أرقام 2-9 (2 إلى 15)
const H={"Cache-Control":"no-store"},J=(d,s=200)=>Response.json(d,{status:s,headers:H});
const CH="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",OK=/^[A-HJ-NP-Z2-9]{2,15}$/;
async function ensure(env){await env.DB.prepare("CREATE TABLE IF NOT EXISTS mod_codes (code TEXT PRIMARY KEY COLLATE BINARY,post_key TEXT NOT NULL UNIQUE,source TEXT NOT NULL,post_id TEXT NOT NULL)").run();}
function mk(n){const b=new Uint8Array(n);crypto.getRandomValues(b);let s="";for(let i=0;i<n;i++)s+=CH[b[i]%32];return s;}
function len(a){return a<30?2+Math.floor(Math.random()*6):a<70?8+Math.floor(Math.random()*4):12+Math.floor(Math.random()*4);}
async function byKey(env,k){return await env.DB.prepare("SELECT code FROM mod_codes WHERE post_key=?").bind(k).first();}
async function put(env,c,k,s,id){await env.DB.prepare("INSERT OR IGNORE INTO mod_codes (code,post_key,source,post_id) VALUES (?,?,?,?)").bind(c,k,s,id).run();}
async function getCode(env,k,s,id){
 const e=await byKey(env,k);if(e)return e.code;
 for(let a=0;a<400;a++){await put(env,mk(len(a)),k,s,id);const f=await byKey(env,k);if(f)return f.code;}
 throw new Error("تعذر إنشاء كود فريد.");
}
async function normalize(env){
 const rs=await env.DB.prepare("SELECT code,post_key,source,post_id FROM mod_codes").all();
 for(const r of rs.results||[]){
  const up=String(r.code||"").toUpperCase();
  if(up===r.code&&OK.test(up))continue;
  await env.DB.prepare("DELETE FROM mod_codes WHERE post_key=?").bind(r.post_key).run();
  if(OK.test(up)){await put(env,up,r.post_key,r.source,r.post_id);if(await byKey(env,r.post_key))continue;}
  await getCode(env,r.post_key,r.source,r.post_id);
 }
}
export async function onRequestGet({env}){
 try{
  if(!env.DB)return J({success:false,message:"قاعدة البيانات غير مربوطة."},503);
  await ensure(env);await normalize(env);
  const r=await fetch("https://raw.githubusercontent.com/appstorearbic-svg/gtxmod-ps4/main/mods.json",{cache:"no-store"});
  if(!r.ok)throw new Error("تعذر قراءة قائمة المنشورات.");
  const list=await r.json();if(!Array.isArray(list))throw new Error("القائمة غير صالحة.");
  let cm=[];try{cm=(await env.DB.prepare("SELECT id FROM user_mods").all()).results||[];}catch(e){}
  const active=new Set(),codes={static:{},community:{}};
  for(const m of list){if(!m||m.id==null)continue;const id=String(m.id),k="static:"+id;active.add(k);codes.static[id]=await getCode(env,k,"static",id);}
  for(const m of cm){if(!m||m.id==null)continue;const id=String(m.id),k="community:"+id;active.add(k);codes.community[id]=await getCode(env,k,"community",id);}
  const saved=await env.DB.prepare("SELECT post_key FROM mod_codes").all();
  for(const row of saved.results||[])if(!active.has(row.post_key))await env.DB.prepare("DELETE FROM mod_codes WHERE post_key=?").bind(row.post_key).run();
  return J({success:true,codes});
 }catch(e){return J({success:false,message:e.message||"خطأ بالأكواد."},500);}
}

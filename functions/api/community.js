const enc=new TextEncoder(),dec=new TextDecoder();
function b64d(v){const n=v.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(n+"=".repeat((4-n.length%4)%4)),c=>c.charCodeAt(0));}
function toB64(buf){const u=new Uint8Array(buf);let s="";for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);}
async function verify(p,s,sec){const k=await crypto.subtle.importKey("raw",enc.encode(sec),{name:"HMAC",hash:"SHA-256"},false,["verify"]);return crypto.subtle.verify("HMAC",k,b64d(s),enc.encode(p));}
async function getSession(request,env){
 if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32||!env.DB)return null;
 const m=(request.headers.get("Cookie")||"").match(/(?:^|;\s*)gtx_google_session=([^;]+)/);
 if(!m)return null;
 const p=m[1].split(".");
 if(p.length!==2||!p[0]||!p[1]||!await verify(p[0],p[1],env.SESSION_SECRET))return null;
 const s=JSON.parse(dec.decode(b64d(p[0])));
 if(!s||!s.user||!s.user.sub||!Number.isFinite(s.exp)||s.exp<=Math.floor(Date.now()/1000))return null;
 return s.user;
}
const H={"Cache-Control":"no-store"};
const bad=(m,c)=>Response.json({success:false,message:m},{status:c,headers:H});
const CATS=["سيارات","طيارات","موطورات","قوارب","شخصيات","مابات","الاخرى"];
async function ensureTable(env){await env.DB.prepare("CREATE TABLE IF NOT EXISTS user_mods (id TEXT PRIMARY KEY,owner_sub TEXT NOT NULL,owner_name TEXT,name TEXT NOT NULL,category TEXT NOT NULL,description TEXT,image TEXT,thumb TEXT,download TEXT,size TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();await env.DB.prepare("UPDATE user_mods SET category='الاخرى' WHERE category='سكربتات'").run();}
const STORAGE_LIMIT_BYTES=5*1024*1024*1024;
const SECONDARY_REPO="ALAM3ABOAT/GTXMOD-MODS";

async function getRepoSizeBytes(repo,token){
 const r=await fetch("https://api.github.com/repos/"+repo,{
  headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","User-Agent":"GTXMOD","Cache-Control":"no-cache"}
 });
 if(!r.ok)throw new Error("تعذر فحص حجم مستودع "+repo+" ("+r.status+"). لم يتم تحويل الرفع.");
 const data=await r.json();
 if(!Number.isFinite(Number(data.size)))throw new Error("تعذر قراءة حجم المستودع "+repo+".");
 return Number(data.size)*1024;
}

async function chooseStorage(env,incomingBytes){
 const primaryToken=env.GITHUB_TOKEN||env.GH_TOKEN||env.GITHUB_PAT||env.GIT_TOKEN;
 if(!primaryToken)throw new Error("توكن GitHub الأول غير مضبوط.");
 const primaryRepo=env.GITHUB_REPO||"appstorearbic-svg/gtxmod-ps4";
 const primaryBranch=env.GITHUB_BRANCH||"main";

 const primarySize=await getRepoSizeBytes(primaryRepo,primaryToken);
 if(primarySize+incomingBytes<=STORAGE_LIMIT_BYTES){
  return {repo:primaryRepo,branch:primaryBranch,token:primaryToken,external:false};
 }

 const secondaryToken=env.GITHUB_TOKEN_2;
 if(!secondaryToken)throw new Error("المستودع الأول تجاوز حد التخزين المحدد، وGITHUB_TOKEN_2 غير مضبوط.");

 const secondarySize=await getRepoSizeBytes(SECONDARY_REPO,secondaryToken);
 if(secondarySize+incomingBytes>STORAGE_LIMIT_BYTES){
  throw new Error("المستودعان تجاوزا حد التخزين المحدد. أضف مستودعاً آخر.");
 }

 return {repo:SECONDARY_REPO,branch:"main",token:secondaryToken,external:true};
}

async function ghPut(storage,path,buf,msg){
 const r=await fetch("https://api.github.com/repos/"+storage.repo+"/contents/"+path,{
  method:"PUT",
  headers:{Authorization:"Bearer "+storage.token,Accept:"application/vnd.github+json","User-Agent":"GTXMOD","Content-Type":"application/json"},
  body:JSON.stringify({message:msg,content:toB64(buf),branch:storage.branch})
 });
 if(!r.ok){
  let detail="";
  try{const j=await r.json();detail=j.message||"";}catch(e){}
  throw new Error("فشل رفع الملف إلى "+storage.repo+" ("+r.status+")"+(detail?": "+detail:""));
 }
}

function storageUrl(storage,path){
 return storage.external
  ?"https://raw.githubusercontent.com/"+storage.repo+"/"+storage.branch+"/"+path.split("/").map(encodeURIComponent).join("/")
  :path;
}
function rowToMod(r){return{id:r.id,name:r.name,category:r.category,description:r.description||"",image:r.thumb||r.image||"",cover:r.image||"",download:r.download||"",size:r.size||"",owner:r.odm||r.owner_name||"",ownerAvatar:r.oav||"",ownerUsername:r.oun||"",date:(r.created_at||"").slice(0,10),fileType:"ZIP"};}
export async function onRequestGet({request,env}){
 try{
  if(!env.DB)return bad("قاعدة البيانات غير مربوطة.",503);
  await ensureTable(env);
  if(new URL(request.url).searchParams.get("mine")==="1"){
   const u=await getSession(request,env);
   if(!u)return bad("سجل دخول أولاً.",401);
   const rs=await env.DB.prepare("SELECT m.*, u.avatar_url AS oav, u.username AS oun, u.display_name AS odm FROM user_mods m LEFT JOIN users u ON u.google_sub=m.owner_sub WHERE m.owner_sub=? ORDER BY m.created_at DESC").bind(u.sub).all();
   return Response.json({success:true,mods:(rs.results||[]).map(rowToMod)},{headers:H});
  }
  const rs=await env.DB.prepare("SELECT m.*, u.avatar_url AS oav, u.username AS oun, u.display_name AS odm FROM user_mods m LEFT JOIN users u ON u.google_sub=m.owner_sub ORDER BY m.created_at DESC LIMIT 200").all();
  return Response.json({success:true,mods:(rs.results||[]).map(rowToMod)},{headers:H});
 }catch(e){return bad("صار خطأ بالخادم.",500);}
}
export async function onRequestPost({request,env}){
 try{
  if(!env.DB)return bad("قاعدة البيانات غير مربوطة.",503);
  const origin=request.headers.get("Origin");
  if(origin&&origin!==new URL(request.url).origin)return bad("طلب غير مسموح.",403);
  const u=await getSession(request,env);
  if(!u)return bad("سجل دخول أولاً.",401);
  try{const bu=await env.DB.prepare("SELECT banned_until FROM users WHERE google_sub=?").bind(u.sub).first();if(bu&&Number(bu.banned_until||0)>Date.now())return bad("🚫 موقوف عن النشر مؤقتاً، يفتح تلقائياً بعد "+Math.ceil((Number(bu.banned_until)-Date.now())/3600000)+" ساعة.",403);}catch(e){}
  await ensureTable(env);
  const ct=request.headers.get("Content-Type")||"";
  if(ct.includes("application/json")){
   const b=await request.json();
   if(b.action!=="delete")return bad("أمر غير معروف.",400);
   const r=await env.DB.prepare("DELETE FROM user_mods WHERE id=? AND owner_sub=?").bind(String(b.id||""),u.sub).run();
   if(!r.meta.changes)return bad("المنشور مو إلك أو محذوف.",404);
   return Response.json({success:true},{headers:H});
  }
  if(!ct.includes("multipart/form-data"))return bad("نوع الطلب غير صالح.",415);
  const f=await request.formData();
  const name=String(f.get("name")||"").trim(),category=String(f.get("category")||"").trim();
  const description=String(f.get("description")||"").trim().slice(0,600),thumb=String(f.get("thumb")||"");
  const image=f.get("image"),download=String(f.get("download")||"").trim();
  if(name.length<2||name.length>60)return bad("اسم المود لازم بين 2 و 60 حرف.",400);
  if(!CATS.includes(category))return bad("اختار تصنيف صحيح.",400);
  if(!image||!image.size)return bad("اختار صورة للمود.",400);
  if(image.size>4194304)return bad("الصورة أكبر من 4MB.",400);
  if(download.length>2048)return bad("رابط التحميل طويل جداً.",400);
  let downloadUrl;
  try{const parsed=new URL(download);if(!["http:","https:"].includes(parsed.protocol))throw new Error();downloadUrl=parsed.href;}
  catch(e){return bad("رابط التحميل غير صالح. استخدم رابط http أو https.",400);}
  if(thumb&&(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(thumb)||thumb.length>300000))return bad("صورة المعاينة غير صالحة.",400);
  const id="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const ext=(String(image.name||"jpg").split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
  const ipath="assets/mods/community/"+id+"."+ext;
  const imageBuffer=await image.arrayBuffer();
  const storage=await chooseStorage(env,image.size);
  await ghPut(storage,ipath,imageBuffer,"Community image: "+name);
  const imageUrl=storageUrl(storage,ipath);
  const size="رابط خارجي";
  await env.DB.prepare("INSERT INTO user_mods (id,owner_sub,owner_name,name,category,description,image,thumb,download,size) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id,u.sub,u.name||"",name,category,description,imageUrl,thumb||"",downloadUrl,size).run();
  try{await genModCode(env,id);}catch(e){}
  const r=await env.DB.prepare("SELECT * FROM user_mods WHERE id=?").bind(id).first();
  return Response.json({success:true,mod:rowToMod(r),message:"تم النشر! التحميل يصير متاح خلال دقيقة تقريباً."},{headers:H});
 }catch(e){return bad(e.message||"صار خطأ بالخادم.",500);}
}

// ===== كود ثابت فريد لكل منشور (2-7 أحرف، حساس لحالة الأحرف) =====
async function genModCode(env,id){
 await env.DB.prepare("CREATE TABLE IF NOT EXISTS mod_codes (code TEXT PRIMARY KEY COLLATE BINARY,post_key TEXT NOT NULL UNIQUE,source TEXT NOT NULL,post_id TEXT NOT NULL)").run();
 const key="community:"+id;
 const old=await env.DB.prepare("SELECT code FROM mod_codes WHERE post_key=?").bind(key).first();
 if(old)return old.code;
 const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
 for(let i=0;i<300;i++){
  const b=new Uint8Array(8);crypto.getRandomValues(b);
  const len=2+b[0]%6;let c="";
  for(let j=0;j<len;j++)c+=chars[b[j+1]%chars.length];
  await env.DB.prepare("INSERT OR IGNORE INTO mod_codes (code,post_key,source,post_id) VALUES (?,?,?,?)").bind(c,key,"community",id).run();
  const f=await env.DB.prepare("SELECT code FROM mod_codes WHERE post_key=?").bind(key).first();
  if(f)return f.code;
 }
 return null;
}

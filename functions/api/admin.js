const J=(o,s=200)=>Response.json(o,{status:s,headers:{"Cache-Control":"no-store"}});
const GH=env=>({t:env.GITHUB_TOKEN||env.GH_TOKEN||env.GITHUB_PAT||env.GIT_TOKEN,repo:env.GITHUB_REPO||"appstorearbic-svg/gtxmod-ps4",br:env.GITHUB_BRANCH||"main"});
const MB=s=>{const m=String(s||"").match(/[\d.]+/);return m?parseFloat(m[0]):0;};
async function ghDel(env,path){
 const{t,repo,br}=GH(env);
 if(!t||!path||!/^assets\//.test(path))return;
 try{
  const h={Authorization:"Bearer "+t,Accept:"application/vnd.github+json","User-Agent":"GTXMOD"};
  const g=await fetch("https://api.github.com/repos/"+repo+"/contents/"+path+"?ref="+br,{headers:h});
  if(!g.ok)return;
  const j=await g.json();
  await fetch("https://api.github.com/repos/"+repo+"/contents/"+path,{method:"DELETE",headers:Object.assign({},h,{"Content-Type":"application/json"}),body:JSON.stringify({message:"Admin delete "+path,sha:j.sha,branch:br})});
 }catch(e){}
}
async function auth(request,env,b){
 const u=String(b.username||""),p=String(b.password||"");
 if(!p)return null;
 const names=[env.ADMIN_USER,env.ADMIN_USERNAME,env.ADMIN,env.ADMIN_NAME,"Messi","admin"].filter(Boolean);
 const pass=env.ADMIN_PASS||env.ADMIN_PASSWORD||env.ADMIN_PASSWD;
 if(pass)return (p===pass&&(u==="Messi"||names.includes(u)))?(env.ADMIN_USER||env.ADMIN_USERNAME||"Messi"):null;
 for(const n of new Set([u].concat(names))){
  try{
   const r=await fetch(new URL("/api/login",request.url),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:n,password:p})});
   const d=await r.json();
   if(d.success)return n;
  }catch(e){}
 }
 return null;
}
async function schema(env){
 try{await env.DB.prepare("ALTER TABLE users ADD COLUMN banned_until INTEGER DEFAULT 0").run();}catch(e){}
 try{await env.DB.prepare("ALTER TABLE user_mods ADD COLUMN pinned INTEGER DEFAULT 0").run();}catch(e){}
 await env.DB.prepare("CREATE TABLE IF NOT EXISTS site_ads (id INTEGER PRIMARY KEY, target_sub TEXT, target_name TEXT, body TEXT, sticker TEXT, created_at INTEGER, expires_at INTEGER)").run();
}
async function adRow(env){
 const a=await env.DB.prepare("SELECT * FROM site_ads WHERE id=1").first();
 if(!a||a.expires_at<=Date.now())return null;
 const u=await env.DB.prepare("SELECT * FROM users WHERE google_sub=?").bind(a.target_sub).first();
 return{sub:a.target_sub,name:u?u.display_name:a.target_name,username:(u&&u.username)||"",avatar:(u&&u.avatar_url)||"",body:a.body||"",sticker:a.sticker||"🔥",created:a.created_at,expires:a.expires_at};
}
export async function onRequestGet({request,env}){
 try{
  if(new URL(request.url).searchParams.get("ad")!=="1")return J({success:false},404);
  await schema(env);
  return J({success:true,ad:await adRow(env)});
 }catch(e){return J({success:true,ad:null});}
}
export async function onRequestPost({request,env}){
 try{
  if(!env.DB)return J({success:false,message:"قاعدة البيانات غير مربوطة."},503);
  const b=await request.json(),action=String(b.action||"");
  const who=await auth(request,env,b);
  if(!who)return J({success:false,message:"بيانات المدير غير صحيحة."},401);
  await schema(env);
  if(action==="login")return J({success:true,user:who});
  if(action==="pin"){
   const id=String(b.id||""),v=b.pinned?1:0;
   const r=await env.DB.prepare("UPDATE user_mods SET pinned=? WHERE id=?").bind(v,id).run();
   if(!r.meta.changes)return J({success:false,message:"المنشور غير موجود."},404);
   return J({success:true,pinned:v,message:v?"📌 تم تثبيت المنشور":"تم إلغاء التثبيت"});
  }
  if(action==="overview"){
   const us=(await env.DB.prepare("SELECT * FROM users ORDER BY rowid DESC").all()).results||[];
   const ms=(await env.DB.prepare("SELECT * FROM user_mods ORDER BY pinned DESC, created_at DESC LIMIT 1000").all()).results||[];
   const accounts=us.map(u=>{
    const p=ms.filter(m=>m.owner_sub===u.google_sub);
    return{sub:u.google_sub,name:u.display_name||"مستخدم",username:u.username||"",email:u.email||"",avatar:u.avatar_url||"",joined:u.created_at||"",banned:Number(u.banned_until||0),posts:p.length,mb:+p.reduce((a,m)=>a+MB(m.size),0).toFixed(1)};
   });
   const mods=ms.map(m=>({id:m.id,sub:m.owner_sub,name:m.name,category:m.category,size:m.size,thumb:m.thumb||m.image||"",date:m.created_at||"",pinned:Number(m.pinned)||0}));
   return J({success:true,accounts,mods,ad:await adRow(env)});
  }
  if(action==="storage"){
   const{t,repo,br}=GH(env);
   let repoKB=0,files=0;
   const h={Authorization:"Bearer "+t,Accept:"application/vnd.github+json","User-Agent":"GTXMOD"};
   if(t){
    try{const r=await fetch("https://api.github.com/repos/"+repo,{headers:h});if(r.ok)repoKB=(await r.json()).size||0;}catch(e){}
    try{const r=await fetch("https://api.github.com/repos/"+repo+"/git/trees/"+br+"?recursive=1",{headers:h});if(r.ok)files=((await r.json()).tree||[]).filter(x=>x.type==="blob").length;}catch(e){}
   }
   let adminMB=0,adminCount=0;
   try{const j=await (await fetch(new URL("/mods.json",request.url))).json();if(Array.isArray(j)){adminCount=j.length;adminMB=j.reduce((a,m)=>a+MB(m.size),0);}}catch(e){}
   const ms=(await env.DB.prepare("SELECT size FROM user_mods").all()).results||[];
   const userMB=ms.reduce((a,m)=>a+MB(m.size),0);
   const accounts=(await env.DB.prepare("SELECT COUNT(*) c FROM users").first()).c||0;
   const limitKB=1048576,freeKB=Math.max(0,limitKB-repoKB),totalMB=adminMB+userMB,cnt=ms.length+adminCount,avg=cnt?totalMB/cnt:15;
   return J({success:true,storage:{repoKB,limitKB,freeKB,pct:Math.min(100,repoKB/limitKB*100),files,adminCount,adminMB:+adminMB.toFixed(1),userCount:ms.length,userMB:+userMB.toFixed(1),totalMB:+totalMB.toFixed(1),accounts,avgMB:+avg.toFixed(1),slots:Math.floor(freeKB/1024/Math.max(1,avg)),repo}});
  }
  if(action==="deletePost"){
   const m=await env.DB.prepare("SELECT * FROM user_mods WHERE id=?").bind(String(b.id||"")).first();
   if(!m)return J({success:false,message:"المنشور غير موجود."},404);
   await ghDel(env,m.image);await ghDel(env,m.download);
   await env.DB.prepare("DELETE FROM user_mods WHERE id=?").bind(m.id).run();
   return J({success:true,message:"تم حذف المنشور وملفاته."});
  }
  if(action==="deleteUser"){
   const sub=String(b.sub||"");
   if(!sub)return J({success:false,message:"حساب غير محدد."},400);
   const ms=(await env.DB.prepare("SELECT image,download FROM user_mods WHERE owner_sub=?").bind(sub).all()).results||[];
   for(const m of ms){await ghDel(env,m.image);await ghDel(env,m.download);}
   await env.DB.prepare("DELETE FROM user_mods WHERE owner_sub=?").bind(sub).run();
   await env.DB.prepare("DELETE FROM site_ads WHERE target_sub=?").bind(sub).run();
   const r=await env.DB.prepare("DELETE FROM users WHERE google_sub=?").bind(sub).run();
   if(!r.meta.changes)return J({success:false,message:"الحساب غير موجود."},404);
   return J({success:true,message:"تم حذف الحساب وكل ما يخصه."});
  }
  if(action==="ban"){
   const d=Math.max(1,Math.min(365,parseInt(b.days||1)));
   const until=Date.now()+d*86400000;
   const r=await env.DB.prepare("UPDATE users SET banned_until=? WHERE google_sub=?").bind(until,String(b.sub||"")).run();
   if(!r.meta.changes)return J({success:false,message:"الحساب غير موجود."},404);
   return J({success:true,banned:until,message:"تم إيقاف النشر "+d+" يوم."});
  }
  if(action==="unban"){
   const r=await env.DB.prepare("UPDATE users SET banned_until=0 WHERE google_sub=?").bind(String(b.sub||"")).run();
   if(!r.meta.changes)return J({success:false,message:"الحساب غير موجود."},404);
   return J({success:true,message:"تم رفع الإيقاف."});
  }
  if(action==="adSet"){
   const sub=String(b.sub||""),body=String(b.body||"").trim().slice(0,300),sticker=String(b.sticker||"🔥").slice(0,16),days=Math.max(1,Math.min(30,parseInt(b.days||2)));
   if(!sub)return J({success:false,message:"اختار حساب."},400);
   if(body.length<3)return J({success:false,message:"اكتب وصف الإعلان."},400);
   const u=await env.DB.prepare("SELECT display_name FROM users WHERE google_sub=?").bind(sub).first();
   if(!u)return J({success:false,message:"الحساب غير موجود."},404);
   const now=Date.now();
   await env.DB.prepare("INSERT OR REPLACE INTO site_ads (id,target_sub,target_name,body,sticker,created_at,expires_at) VALUES (1,?,?,?,?,?,?)").bind(sub,u.display_name,body,sticker,now,now+days*86400000).run();
   return J({success:true,ad:await adRow(env),message:"تم نشر الإعلان لمدة "+days+" يوم."});
  }
  if(action==="adDelete"){
   await env.DB.prepare("DELETE FROM site_ads WHERE id=1").run();
   return J({success:true,message:"تم حذف الإعلان."});
  }
  return J({success:false,message:"أمر غير معروف."},400);
 }catch(e){return J({success:false,message:e.message||"صار خطأ بالخادم."},500);}
}

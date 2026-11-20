const H = {"Cache-Control":"no-store"};
const J = (data,status=200)=>Response.json(data,{status,headers:H});

async function ensure(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS mod_codes (
    code TEXT PRIMARY KEY COLLATE BINARY,
    post_key TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    post_id TEXT NOT NULL
  )`).run();
}

function randomCode(){
  const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes=new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const len=2+bytes[0]%6;
  let out="";
  for(let i=0;i<len;i++) out+=chars[bytes[i+1]%chars.length];
  return out;
}

async function getCode(env,key,source,id){
  for(let i=0;i<100;i++){
    const code=randomCode();
    await env.DB.prepare(
      "INSERT OR IGNORE INTO mod_codes (code,post_key,source,post_id) VALUES (?,?,?,?)"
    ).bind(code,key,source,id).run();

    const found=await env.DB.prepare(
      "SELECT code FROM mod_codes WHERE post_key=?"
    ).bind(key).first();

    if(found) return found.code;
  }
  throw new Error("تعذر إنشاء كود فريد للمنشور.");
}

export async function onRequestGet({env}){
  try{
    if(!env.DB) return J({success:false,message:"قاعدة البيانات غير مربوطة."},503);
    await ensure(env);

    const response=await fetch(
      "https://raw.githubusercontent.com/appstorearbic-svg/gtxmod-ps4/main/mods.json",
      {cache:"no-store",headers:{"Cache-Control":"no-cache"}}
    );
    if(!response.ok) throw new Error("تعذر قراءة قائمة منشورات المدير.");

    const staticMods=await response.json();
    if(!Array.isArray(staticMods)) throw new Error("قائمة منشورات المدير غير صالحة.");

    const communityResult=await env.DB.prepare("SELECT id FROM user_mods").all();
    const communityMods=communityResult.results||[];

    const active=new Set();
    const codes={static:{},community:{}};

    for(const mod of staticMods){
      if(!mod || mod.id==null) continue;
      const id=String(mod.id),key="static:"+id;
      active.add(key);
      codes.static[id]=await getCode(env,key,"static",id);
    }

    for(const mod of communityMods){
      if(!mod || mod.id==null) continue;
      const id=String(mod.id),key="community:"+id;
      active.add(key);
      codes.community[id]=await getCode(env,key,"community",id);
    }

    const saved=await env.DB.prepare("SELECT post_key FROM mod_codes").all();
    for(const row of saved.results||[]){
      if(!active.has(row.post_key)){
        await env.DB.prepare("DELETE FROM mod_codes WHERE post_key=?")
          .bind(row.post_key).run();
      }
    }

    return J({success:true,codes});
  }catch(e){
    return J({success:false,message:e.message||"حدث خطأ أثناء تجهيز الأكواد."},500);
  }
}

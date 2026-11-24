const REPO = "appstorearbic-svg/gtxmod-ps4";
const BRANCH = "main";
const CATEGORIES = ["سيارات", "طيارات", "موطورات", "قوارب", "شخصيات", "مابات", "الاخرى"];

function authorized(data, env) {
  return data.get("username") === env.ADMIN_USERNAME &&
         data.get("password") === env.ADMIN_PASSWORD &&
         !!env.GITHUB_TOKEN;
}

function headers(env) {
  return {
    Authorization: "Bearer " + env.GITHUB_TOKEN,
    Accept: "application/vnd.github+json",
    "User-Agent": "GTXMOD-PS4-Manager",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function readMods(env) {
  const h = headers(env);
  const url = `https://api.github.com/repos/${REPO}/contents/mods.json?ref=${BRANCH}`;
  const r = await fetch(url, {headers:h});
  if (!r.ok) throw new Error("تعذر قراءة mods.json: " + await r.text());
  const file = await r.json();
  const raw = atob(file.content.replace(/\n/g, ""));
  const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
  return {mods:JSON.parse(new TextDecoder().decode(bytes)), sha:file.sha};
}

async function saveMods(env, mods, sha, message) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(mods,null,2)+"\n")));
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/mods.json`, {
    method:"PUT",
    headers:headers(env),
    body:JSON.stringify({message,content,sha,branch:BRANCH})
  });
  if (!r.ok) throw new Error("فشل حفظ المنشورات: " + await r.text());
}

async function uploadAsset(env, file, path, message) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i=0; i<bytes.length; i+=8192)
    binary += String.fromCharCode(...bytes.subarray(i,i+8192));

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method:"PUT",
    headers:headers(env),
    body:JSON.stringify({
      message,
      content:btoa(binary),
      branch:BRANCH
    })
  });
  if (!r.ok) throw new Error("فشل رفع الملف: " + await r.text());
}

export async function onRequestGet({request,env}) {
  try {
    const u = new URL(request.url);
    const data = new FormData();
    data.set("username",u.searchParams.get("username") || "");
    data.set("password",u.searchParams.get("password") || "");
    if (!authorized(data,env))
      return Response.json({success:false,message:"غير مصرح"}, {status:401});

    const result = await readMods(env);
    return Response.json({success:true,mods:result.mods});
  } catch(e) {
    return Response.json({success:false,message:e.message}, {status:500});
  }
}

export async function onRequestPost({request,env}) {
  try {
    const data = await request.formData();
    if (!authorized(data,env))
      return Response.json({success:false,message:"غير مصرح"}, {status:401});

    const action = String(data.get("action") || "");
    const {mods,sha} = await readMods(env);

    if (action === "list") {
      return Response.json({success:true,mods});
    }

    const id = String(data.get("id") || "");
    const index = mods.findIndex(m => String(m.id) === id);
    if (index < 0)
      return Response.json({success:false,message:"المنشور غير موجود"}, {status:404});

    if (action === "pin") {
      mods[index].pinned = data.has("pinned") ? (String(data.get("pinned"))==="1") : !mods[index].pinned;
      await saveMods(env,mods,sha,"Pin mod: " + id);
      return Response.json({success:true,pinned:!!mods[index].pinned,message:mods[index].pinned?"📌 تم تثبيت المنشور":"تم إلغاء التثبيت"});
    }

    if (action === "delete") {
      mods.splice(index,1);
      await saveMods(env,mods,sha,"Delete mod: " + id);
      return Response.json({success:true,message:"تم حذف المنشور"});
    }

    if (action !== "update")
      return Response.json({success:false,message:"طلب غير معروف"}, {status:400});

    const mod = mods[index];
    const name = String(data.get("name") || "").trim();
    const category = String(data.get("category") || "");
    const description = String(data.get("description") || "").trim();
    if (!name || !CATEGORIES.includes(category))
      return Response.json({success:false,message:"الاسم أو التصنيف غير صحيح"}, {status:400});

    mod.name = name;
    mod.category = category;
    mod.description = "";
    try{const sp=JSON.parse(String(data.get("spawn")||"[]"));if(Array.isArray(sp))mod.spawn=sp.map(x=>String(x||"").trim().slice(0,24)).filter(Boolean).slice(0,15);}catch(e){}

    const image = data.get("image");
    const zip = data.get("zip");
    const base = "assets/mods/" + id + "/";

    if (image && typeof image !== "string" && image.size) {
      if (image.size > 10*1024*1024)
        return Response.json({success:false,message:"الصورة أكبر من 10MB"}, {status:400});
      const ext = (image.name.split(".").pop() || "jpg").toLowerCase();
      mod.image = base + "cover-" + Date.now() + "." + ext;
      await uploadAsset(env,image,mod.image,"Update mod image: " + name);
    }

    if (zip && typeof zip !== "string" && zip.size) {
      if (zip.size > 25*1024*1024)
        return Response.json({success:false,message:"ملف ZIP أكبر من 25MB"}, {status:400});
      mod.download = base + "mod-" + Date.now() + ".zip";
      mod.size = (zip.size/1048576).toFixed(1) + " MB";
      await uploadAsset(env,zip,mod.download,"Update mod ZIP: " + name);
    }

    await saveMods(env,mods,sha,"Edit mod: " + name);
    return Response.json({success:true,message:"تم تعديل المنشور بنجاح"});
  } catch(e) {
    return Response.json({success:false,message:e.message || "حدث خطأ"}, {status:500});
  }
}

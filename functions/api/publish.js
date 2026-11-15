const REPO = "appstorearbic-svg/gtxmod-ps4";
const BRANCH = "main";
const CATEGORIES = ["سيارات", "طيارات", "موطورات", "قوارب", "شخصيات", "مابات", "سكربتات"];

export async function onRequestPost({request, env}) {
  try {
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");

    if (username !== env.ADMIN_USERNAME ||
        password !== env.ADMIN_PASSWORD ||
        !env.GITHUB_TOKEN) {
      return Response.json({success:false,message:"غير مصرح"}, {status:401});
    }

    const name = String(form.get("name") || "").trim();
    const category = String(form.get("category") || "");
    const description = String(form.get("description") || "").trim();
    const image = form.get("image");
    const zip = form.get("zip");
    const video = form.get("video");

    if (!name || !CATEGORIES.includes(category) ||
        !image || !zip || typeof image === "string" ||
        typeof zip === "string") {
      return Response.json({success:false,message:"أكمل البيانات والملفات"}, {status:400});
    }

    if (image.size > 10*1024*1024 || zip.size > 25*1024*1024 ||
        (video && typeof video !== "string" && video.size > 20*1024*1024)) {
      return Response.json({success:false,message:"حجم أحد الملفات أكبر من المسموح"}, {status:400});
    }

    const headers = {
      Authorization: "Bearer " + env.GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "User-Agent": "GTXMOD-PS4-Publisher",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    const api = "https://api.github.com/repos/" + REPO + "/contents/";

    async function putFile(path, file, message) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i=0; i<bytes.length; i+=8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i+8192));
      }
      const res = await fetch(api + path, {
        method:"PUT",
        headers,
        body:JSON.stringify({
          message,
          content:btoa(binary),
          branch:BRANCH
        })
      });
      if (!res.ok) throw new Error("GitHub upload failed: " + await res.text());
      return res.json();
    }

    const slug = "mod-" + Date.now();
    const base = "assets/mods/" + slug + "/";
    const ext = (image.name.split(".").pop() || "jpg").toLowerCase();
    const imagePath = base + "cover." + ext;
    const zipPath = base + "mod.zip";

    await putFile(imagePath, image, "Upload mod image: " + name);
    await putFile(zipPath, zip, "Upload mod ZIP: " + name);

    let videoPath = "";
    if (video && typeof video !== "string" && video.size) {
      const vext = (video.name.split(".").pop() || "mp4").toLowerCase();
      videoPath = base + "preview." + vext;
      await putFile(videoPath, video, "Upload mod video: " + name);
    }

    const listRes = await fetch(api + "mods.json?ref=" + BRANCH, {headers});
    if (!listRes.ok) throw new Error("Cannot read mods.json");
    const current = await listRes.json();
    const decoded = atob(current.content.replace(/\n/g, ""));
    const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
    const mods = JSON.parse(new TextDecoder().decode(bytes));

    mods.unshift({
      id:slug,
      name,
      category,
      fileType:"ZIP",
      description:description || ("مود " + name + " للعبة GTA V على PS4."),
      image:imagePath,
      download:zipPath,
      video:videoPath,
      size:(zip.size/1048576).toFixed(1) + " MB"
    });

    const updated = await fetch(api + "mods.json", {
      method:"PUT",
      headers,
      body:JSON.stringify({
        message:"Publish mod: " + name,
        content:btoa(unescape(encodeURIComponent(JSON.stringify(mods,null,2)+"\n"))),
        sha:current.sha,
        branch:BRANCH
      })
    });

    if (!updated.ok) throw new Error("Could not update mods.json: " + await updated.text());

    return Response.json({success:true,message:"تم نشر المود بنجاح"});
  } catch(e) {
    return Response.json({success:false,message:e.message || "حدث خطأ"}, {status:500});
  }
}

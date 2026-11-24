// GTXMOD — Publisher API (Link + Image Support)
export async function onRequestPost(context) {
    const { request, env } = context;
    
    if (!env.GITHUB_TOKEN) {
        return Response.json({ error: "Server Config Error: Missing GitHub Token" }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const downloadUrl = formData.get('downloadUrl');
        const title = formData.get('title');
        const category = formData.get('category');
        const description = formData.get('description') || '';
        const size = formData.get('size') || 'Unknown';
        const imageUrl = formData.get('imageUrl') || ''; // <-- رابط الصورة الجديدة
        try{const h=new URL(downloadUrl).hostname;if(!/(^|\.)mediafire\.com$/i.test(h))return Response.json({error:"❌ خطأ: هذا ليس رابط ميديا فاير"},{status:400});}catch(e){return Response.json({error:"رابط غير صالح"},{status:400});}
        
        if (!downloadUrl || !title || !category) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        // قراءة mods.json
        const OWNER = "appstorearbic-svg";
        const REPO = "gtxmod-ps4";
        const FILE_PATH = "mods.json";
        const BRANCH = "main";
        
        const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
        
        const getRes = await fetch(apiUrl, {
            headers: {
                "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });

        let currentMods = [];
        let sha = null;

        if (getRes.ok) {
            const data = await getRes.json();
            if (data.content) {
                const decoded = atob(data.content.replace(/\n/g, ''));
                currentMods = JSON.parse(decoded);
                sha = data.sha;
            }
        } else if (getRes.status !== 404) {
            throw new Error(`Failed to read mods.json`);
        }

        // إضافة المود
        const newMod = {
            id: Date.now().toString(),
            title: title,
            category: category,
            description: "",
            spawn: (()=>{try{const a=JSON.parse(String(formData.get("spawn")||"[]"));return Array.isArray(a)?a.map(x=>String(x||"").trim().slice(0,24)).filter(Boolean).slice(0,15):[]}catch(e){return[]}})(),
            url: downloadUrl,
            image: imageUrl, // <-- حفظ رابط الصورة
            size: size,
            date: new Date().toISOString().split('T')[0]
        };
        
        currentMods.push(newMod);

        // تحديث GitHub
        const updateUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
        const body = {
            message: `Publish mod via Web: ${title}`,
            content: btoa(JSON.stringify(currentMods, null, 2)),
            branch: BRANCH,
            sha: sha
        };

        const putRes = await fetch(updateUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (putRes.ok) {
            return Response.json({ success: true });
        } else {
            const errData = await putRes.text();
            return Response.json({ error: "Update Failed", details: errData }, { status: 500 });
        }

    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

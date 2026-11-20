// GTXMOD — Publisher API (Link Based)
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
        
        if (!downloadUrl || !title || !category) {
            return Response.json({ error: "Missing required fields (URL, Title, Category)" }, { status: 400 });
        }

        // 1. قراءة mods.json الحالي من GitHub
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
            throw new Error(`Failed to read mods.json: ${getRes.statusText}`);
        }

        // 2. إضافة المود الجديد
        const newMod = {
            id: Date.now().toString(),
            title: title,
            category: category,
            description: description,
            url: downloadUrl, // <-- الرابط الخارجي مباشرة
            image: "", // يمكن إضافته لاحقاً
            size: size,
            date: new Date().toISOString().split('T')[0]
        };
        
        currentMods.push(newMod);

        // 3. تحديث الملف في GitHub
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
            return Response.json({ success: true, message: "Mod published successfully!" });
        } else {
            const errData = await putRes.text();
            console.error("GitHub Update Failed:", errData);
            return Response.json({ error: "Failed to update GitHub repo", details: errData }, { status: 500 });
        }

    } catch (e) {
        console.error(e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// GTXMOD — Dynamic Multi-Repo Aggregator
export async function onRequestGet(context) {
    // قائمة المستودعات النشطة (يمكن زيادتها مستقبلاً)
    const ACTIVE_REPOS = [
        {
            name: "Main",
            rawUrl: "https://raw.githubusercontent.com/appstorearbic-svg/gtxmod-ps4/main/mods.json"
        },
        {
            name: "Mods2",
            rawUrl: "https://raw.githubusercontent.com/appstorearbic-svg/gtxmod-ps4-mods-2/main/mods.json"
        }
        // أضف مستودعات أخرى هنا مستقبلاً بنفس الشكل
    ];

    let allMods = [];
    let errors = [];

    try {
        // جلب البيانات من جميع المستودعات بالتوازي
        const promises = ACTIVE_REPOS.map(async (repo) => {
            try {
                const res = await fetch(repo.rawUrl, { cf: { cacheTtl: 60 } });
                if (!res.ok) throw new Error(`Status ${res.status}`);
                
                const data = await res.json();
                const modsArray = Array.isArray(data) ? data : (data.mods || []);
                
                // تمييز المصدر
                modsArray.forEach(m => m._source = repo.name);
                return modsArray;
            } catch (err) {
                errors.push(`${repo.name}: ${err.message}`);
                return [];
            }
        });

        const results = await Promise.all(promises);
        
        // دمج النتائج
        results.forEach(arr => allMods.push(...arr));

        // إزالة التكرارات (إذا كان نفس الـ ID موجود في أكثر من مكان)
        const uniqueMap = new Map();
        allMods.forEach(mod => {
            const id = mod.id || mod.title;
            if (id && !uniqueMap.has(id)) {
                uniqueMap.set(id, mod);
            }
        });

        const finalMods = Array.from(uniqueMap.values());

        return Response.json({
            success: true,
            count: finalMods.length,
            mods: finalMods,
            debug_errors: errors.length > 0 ? errors : undefined
        }, {
            headers: {
                "Cache-Control": "public, max-age=60",
                "Content-Type": "application/json"
            }
        });

    } catch (e) {
        return Response.json({ success: false, message: e.message, mods: [] }, { status: 500 });
    }
}

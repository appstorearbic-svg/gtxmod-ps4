// GTXMOD — كود أحمر ثابت أسفل يسار صورة المنشور
(function(){
    const LS_CODE_MAP = "gtx_code_map_final"; // خريطة لتخزين الأكواد

    // --- أدوات مساعدة ---
    function getMap() { 
        try { return JSON.parse(localStorage.getItem(LS_CODE_MAP)||"{}"); } 
        catch(e){ return {}; } 
    }
    
    function saveMap(map) { 
        localStorage.setItem(LS_CODE_MAP, JSON.stringify(map)); 
    }

    // توليد كود عشوائي (2-7 أحرف، بدون رموز لبس مثل O/I/L/0/1)
    function generateRandomCode(len) {
        const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for(let i=0; i<len; i++) {
            code += chars[Math.floor(Math.random()*chars.length)];
        }
        return code;
    }

    // الحصول على كود فريد أو مستخدم مسبقاَ
    function getCodeForId(id) {
        const map = getMap();
        
        // إذا كان هناك كود محفوظ لهذا الـ ID، نرجعه
        if(map[id]) return map[id];

        // محاولة إيجاد كود غير مستخدم حالياً
        let len = 2 + Math.floor(Math.random() * 6); // 2 to 7
        let code = "";
        let attempts = 0;
        const existingCodes = Object.values(map);

        while(attempts < 50) {
            code = generateRandomCode(len);
            // التأكد أن الكود غير مستخدم لـ ID آخر موجود في الخريطة
            // ملاحظة: بما أننا نحذف المفقودين لاحقاً، فهذا الفحص كافٍ للجلسة الحالية
            if(!existingCodes.includes(code)) break;
            
            attempts++;
            if(attempts % 10 === 0) len++; // زيادة الطول إذا فشلنا كثيراً
        }
        
        // حفظ الكود الجديد
        map[id] = code;
        saveMap(map);
        return code;
    }

    // تنظيف الخرائط: حذف الأكواد التي لم يعد لها منشور في الصفحة
    function cleanupOrphanedCodes(currentIds) {
        const map = getMap();
        let changed = false;
        for(const id in map) {
            if(!currentIds.has(id)) {
                delete map[id]; // حذف الكود لأنه لا يوجد له منشور
                changed = true;
            }
        }
        if(changed) saveMap(map);
    }

    // --- المنطق الرئيسي للعرض ---
    function applyBadges() {
        const cards = document.querySelectorAll('.mod-card, .post-card');
        const currentValidIds = new Set();

        cards.forEach(card => {
            // استخراج ID المنشور
            let id = card.dataset.id || card.getAttribute('data-id');
            if(!id) {
                const link = card.querySelector('a.download, a[href$=".zip"]');
                if(link) {
                    const match = link.href.match(/\/([^\/]+)\.(zip|rar)$/i);
                    if(match) id = match[1];
                }
            }
            
            if(!id) return;
            currentValidIds.add(id);

            // منع التكرار البصري
            if(card.querySelector('.gtx-red-code')) return;

            // الحصول على الكود
            const code = getCodeForId(id);

            // البحث عن حاوية الصورة
            const imgContainer = card.querySelector('.mod-image, .image-wrapper, img')?.parentElement || card.querySelector('.mod-image');
            
            if(imgContainer) {
                // التأكد من أن الحاوية تسمح بالوضع المطلق
                if(getComputedStyle(imgContainer).position === 'static') {
                    imgContainer.style.position = 'relative';
                }

                // إنشاء عنصر الكود
                const badge = document.createElement('span');
                badge.className = 'gtx-red-code';
                badge.textContent = code;
                
                // التصميم: أسفل يسار الصورة، خلفية حمراء شفافة قليلاً، نص أبيض عريض
                badge.style.cssText = `
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    background: rgba(239, 68, 68, 0.9); /* أحمر شبه شفاف */
                    color: white;
                    font-family: monospace;
                    font-weight: 900;
                    font-size: 12px;
                    padding: 3px 8px;
                    border-radius: 4px;
                    z-index: 10;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,.3);
                    direction: ltr; /* لضمان قراءة الكود بشكل صحيح */
                    user-select: none;
                `;
                
                // حدث النقر لنسخ الكود
                badge.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(code).then(() => {
                        showToast("✅ تم نسخ الكود: " + code);
                    });
                };

                imgContainer.appendChild(badge);
            }
        });

        // تنظيف الأكواد القديمة التي لم تعد موجودة في الصفحة
        cleanupOrphanedCodes(currentValidIds);
    }

    // --- إشعار Toast ---
    function showToast(msg) {
        let t = document.getElementById('gtx-toast-code');
        if(!t) {
            t = document.createElement('div');
            t.id = 'gtx-toast-code';
            t.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:10px 20px;border-radius:8px;z-index:9999;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:.3s;opacity:0;pointer-events:none;direction:rtl;";
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        setTimeout(() => { t.style.opacity = '0'; }, 2000);
    }

    // --- بدء التشغيل والمراقبة ---
    window.addEventListener('load', () => {
        setTimeout(applyBadges, 500);
        
        // مراقبة التغييرات في الـ DOM (مثلاً عند تصفية التصنيفات أو تحميل صفحات جديدة)
        const observer = new MutationObserver((mutations) => {
            clearTimeout(window._codeTimer);
            window._codeTimer = setTimeout(() => {
                applyBadges();
            }, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();

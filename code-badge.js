// GTXMOD — كود أحمر في وسط المنشور (تحت الصورة)
(function(){
    const LS_CODE_MAP = "gtx_code_map_center"; // مفتاح جديد لتجنب تعارض مع السابق

    function getMap() { 
        try { return JSON.parse(localStorage.getItem(LS_CODE_MAP)||"{}"); } 
        catch(e){ return {}; } 
    }
    
    function saveMap(map) { 
        localStorage.setItem(LS_CODE_MAP, JSON.stringify(map)); 
    }

    function generateRandomCode(len) {
        const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for(let i=0; i<len; i++) {
            code += chars[Math.floor(Math.random()*chars.length)];
        }
        return code;
    }

    function getCodeForId(id) {
        const map = getMap();
        if(map[id]) return map[id];

        let len = 2 + Math.floor(Math.random() * 6); 
        let code = "";
        let attempts = 0;
        const existingCodes = Object.values(map);

        while(attempts < 50) {
            code = generateRandomCode(len);
            if(!existingCodes.includes(code)) break;
            attempts++;
            if(attempts % 10 === 0) len++;
        }
        
        map[id] = code;
        saveMap(map);
        return code;
    }

    function cleanupOrphanedCodes(currentIds) {
        const map = getMap();
        let changed = false;
        for(const id in map) {
            if(!currentIds.has(id)) {
                delete map[id];
                changed = true;
            }
        }
        if(changed) saveMap(map);
    }

    function applyBadges() {
        const cards = document.querySelectorAll('.mod-card, .post-card');
        const currentValidIds = new Set();

        cards.forEach(card => {
            // استخراج ID
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

            // منع التكرار
            if(card.querySelector('.gtx-center-code')) return;

            const code = getCodeForId(id);

            // إنشاء عنصر الكود
            const badge = document.createElement('div');
            badge.className = 'gtx-center-code';
            badge.textContent = code;
            
            // التصميم: في منتصف عرض البطاقة، تحت الصورة مباشرة
            // نستخدم margin auto للتوسيط الأفقي
            badge.style.cssText = `
                display: block;
                width: fit-content;
                margin: 10px auto; /* توسيط أفقي ومسافة من الأعلى والأسفل */
                background: #ef4444; /* أحمر واضح */
                color: white;
                font-family: monospace;
                font-weight: 900;
                font-size: 14px;
                padding: 4px 12px;
                border-radius: 6px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                text-align: center;
                letter-spacing: 1px;
                transition: transform .2s, box-shadow .2s;
                z-index: 5;
                direction: ltr;
            `;
            
            // تأثير عند المرور عليه
            badge.onmouseover = () => {
                badge.style.transform = "scale(1.05)";
                badge.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.6)";
            };
            badge.onmouseout = () => {
                badge.style.transform = "scale(1)";
                badge.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.4)";
            };

            // حدث النقر لنسخ الكود
            badge.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(code).then(() => {
                    showToast("✅ تم نسخ الكود: " + code);
                });
            };

            // تحديد مكان الإدراج: بعد الصورة مباشرة
            const imgEl = card.querySelector('img, .mod-image, .image-wrapper');
            if(imgEl) {
                // إذا كانت الصورة داخل حاوية، نضيف الكود بعد الحاوية
                const parentOfImg = imgEl.parentElement;
                if(parentOfImg && parentOfImg.classList.contains('image-container')) {
                    parentOfImg.after(badge);
                } else {
                    imgEl.after(badge);
                }
            } else {
                // احتياطي: نضيفه في بداية المحتوى النصي أو نهاية البطاقة
                const firstChild = card.firstElementChild;
                if(firstChild) firstChild.before(badge);
                else card.appendChild(badge);
            }
        });

        cleanupOrphanedCodes(currentValidIds);
    }

    function showToast(msg) {
        let t = document.getElementById('gtx-toast-code-center');
        if(!t) {
            t = document.createElement('div');
            t.id = 'gtx-toast-code-center';
            t.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#16a34a;color:white;padding:10px 20px;border-radius:8px;z-index:9999;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:.3s;opacity:0;pointer-events:none;direction:rtl;";
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        setTimeout(() => { t.style.opacity = '0'; }, 2000);
    }

    window.addEventListener('load', () => {
        setTimeout(applyBadges, 500);
        
        const observer = new MutationObserver((mutations) => {
            clearTimeout(window._codeCenterTimer);
            window._codeCenterTimer = setTimeout(() => {
                applyBadges();
            }, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();

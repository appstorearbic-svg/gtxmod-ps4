// GTXMOD — كود أحمر أسفل الصورة وعلى اليسار
(function(){
    const LS_CODE_MAP = "gtx_code_map_bl"; // bottom-left

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
            if(card.querySelector('.gtx-bl-code')) return;

            const code = getCodeForId(id);

            // إنشاء عنصر الكود
            const badge = document.createElement('div');
            badge.className = 'gtx-bl-code';
            badge.textContent = code;
            
            // التصميم: تحت الصورة، محاذاة لليسار
            // نستخدم display:block و margin-right:auto لدفعه لليمين؟ لا، نحن نريد اليسار.
            // في RTL، اليسار هو النهاية. لكننا نريد أن يظهر في الجهة اليسرى من الشاشة.
            // الحل: نضعه داخل حاوية أو نستخدم position relative للأب ونضعه absolute أسفل يسار الصورة.
            
            // الطريقة الأكثر أماناً دون كسر الـ CSS الأصلي:
            // نجعل الحاوية الأب (الصورة) position:relative إذا لم تكن كذلك، ثم نضع الكود absolute.
            
            const imgContainer = card.querySelector('.mod-image, .image-wrapper, img')?.parentElement || card.querySelector('.mod-image');
            
            if(imgContainer) {
                // التأكد من أن الحاوية تسمح بالوضع المطلق
                if(getComputedStyle(imgContainer).position === 'static') {
                    imgContainer.style.position = 'relative';
                }

                badge.style.cssText = `
                    position: absolute;
                    bottom: 8px; /* أسفل الصورة بـ 8 بكسل */
                    left: 8px;   /* على اليسار بـ 8 بكسل */
                    background: #ef4444; /* أحمر واضح */
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
                    line-height: 1;
                `;
                
                badge.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(code).then(() => {
                        showToast("✅ تم نسخ الكود: " + code);
                    });
                };

                imgContainer.appendChild(badge);
            } else {
                // احتياطي إذا لم نجد حاوية صورة مناسبة: نضيفه بعد الصورة مباشرة بمحاذاة يسار
                const imgEl = card.querySelector('img');
                if(imgEl) {
                    badge.style.cssText = `
                        display: block;
                        width: fit-content;
                        margin-top: 5px;
                        margin-left: 0; /* يبدأ من اليسار */
                        background: #ef4444;
                        color: white;
                        font-family: monospace;
                        font-weight: bold;
                        font-size: 12px;
                        padding: 3px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        direction: ltr;
                    `;
                    imgEl.after(badge);
                    
                    badge.onclick = (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(code).then(() => {
                            showToast("✅ تم نسخ الكود: " + code);
                        });
                    };
                }
            }
        });

        cleanupOrphanedCodes(currentValidIds);
    }

    function showToast(msg) {
        let t = document.getElementById('gtx-toast-code-bl');
        if(!t) {
            t = document.createElement('div');
            t.id = 'gtx-toast-code-bl';
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
            clearTimeout(window._codeBLTimer);
            window._codeBLTimer = setTimeout(() => {
                applyBadges();
            }, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();

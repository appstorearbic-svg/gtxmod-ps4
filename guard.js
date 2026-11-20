// GTXMOD — حارس الدخول الآمن (فحص خادمي + اعتراض نقرة)
(function(){
    const LS_INVITES = "gtx_invites_v1";
    const LS_PENDING = "gtx_pending_code";
    let isCheckingSession = false; // لمنع تكرار الطلبات أثناء النقر

    // --- أدوات الرموز ---
    function getInvites() { try { return JSON.parse(localStorage.getItem(LS_INVITES)||"[]"); } catch(e){ return []; } }
    function saveInvites(l) { localStorage.setItem(LS_INVITES, JSON.stringify(l)); }
    
    function genCode() {
        const c="ABCDEFGHJKLMNPQRSTUVWXYZ234156789"; // بدون O,I,L,0 لتجنب اللبس
        let s=""; for(let i=0;i<8;i++) s+=c[Math.floor(Math.random()*c.length)];
        return s;
    }
    
    function createInvite() {
        const l=getInvites();
        const code=genCode();
        if(l.some(x=>x.code===code)) return createInvite();
        l.push({code, exp: Date.now()+10*60*1000, used:false});
        saveInvites(l);
        return code;
    }
    
    function checkAndUse(code) {
        const l=getInvites();
        const item=l.find(x=>x.code.toUpperCase()===code.toUpperCase());
        if(!item || item.used || Date.now()>item.exp) return false;
        item.used=true;
        saveInvites(l);
        return true;
    }

    // --- واجهة النافذة ---
    function showInviteModal() {
        if(document.getElementById("gtxInvModal")) return;
        
        const m=document.createElement("div");
        m.id="gtxInvModal";
        m.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:#000d;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:sans-serif";
        m.innerHTML=`
            <div style="background:#0f172a;color:white;padding:20px;border-radius:12px;max-width:300px;text-align:center;border:1px solid #3b82f6">
                <h3 style="margin:0 0 10px;color:#3b82f6">🔑 رمز الدخول</h3>
                <p style="font-size:12px;color:#94a3b8;margin-bottom:10px">أدخل الرمز للمتابعة</p>
                <input id="gtxInput" type="text" placeholder="XXXXXXXX" maxlength="8" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#020617;color:white;text-align:center;font-family:monospace;letter-spacing:2px;outline:none" />
                <button id="gtxSubmit" style="width:100%;padding:10px;margin-top:10px;background:#2563eb;color:white;border:0;border-radius:8px;font-weight:bold;cursor:pointer">دخول</button>
                <p id="gtxMsg" style="color:#ef4444;font-size:11px;margin-top:5px;height:14px"></p>
                <button id="gtxClose" style="background:none;border:0;color:#64748b;font-size:11px;margin-top:5px;cursor:pointer">إلغاء</button>
            </div>`;
        document.body.appendChild(m);
        
        const inp=m.querySelector("#gtxInput");
        const btn=m.querySelector("#gtxSubmit");
        const msg=m.querySelector("#gtxMsg");
        const cls=m.querySelector("#gtxClose");
        
        inp.focus();
        
        btn.onclick=()=>{
            const code=inp.value.trim().toUpperCase();
            if(code.length<8) { msg.textContent="الرمز قصير."; return; }
            
            if(checkAndUse(code)) {
                localStorage.setItem(LS_PENDING, code);
                m.remove();
                // فتح جوجل بعد لحظة
                setTimeout(()=>{
                    const gBtn=document.getElementById("googleLoginOpen");
                    if(gBtn) gBtn.click();
                }, 100);
            } else {
                msg.textContent="رمز غير صحيح أو منتهي.";
            }
        };
        
        cls.onclick=()=>m.remove();
        m.onclick=e=>{if(e.target===m)m.remove();};
    }

    // --- دالة فحص الجلسة الحقيقية من الخادم ---
    async function hasActiveSession() {
        try {
            const res = await fetch('/api/google-session', {
                method: 'GET',
                credentials: 'include', // يرسل الـ Cookies تلقائياً
                cache: 'no-store'
            });
            const data = await res.json();
            return data.success === true && !!data.user;
        } catch (e) {
            console.error("Session check failed:", e);
            return false; // في حال الخطأ، نفترض عدم وجود جلسة للأمان
        }
    }

    // --- الاعتراض الذكي للنقر ---
    document.addEventListener("click", async function(e) {
        // 1. هل النقرة كانت على صورة الحساب؟
        const accBtn = e.target.closest("#accountBtn");
        if (!accBtn) return;

        // منع التكرار أثناء الفحص
        if (isCheckingSession) {
            e.preventDefault();
            return;
        }

        // 2. نوقف الحدث الافتراضي مؤقتاً حتى نتأكد
        e.preventDefault();
        e.stopImmediatePropagation();
        
        isCheckingSession = true;
        
        // 3. فحص الخادم: هل يوجد جلسة نشطة؟
        const loggedIn = await hasActiveSession();
        
        isCheckingSession = false;

        if (loggedIn) {
            // ✅ مسجل دخول: نحاكي الضغط الأصلي لفتح القائمة (دون إعادة تحميل الصفحة)
            // نستدعي الدالة التي تفتح القائمة في app.js إذا كانت معروفة، أو نطلق حدث click جديد
            accBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
            // ❌ غير مسجل: نعرض نافذة الرمز إجبارياً
            showInviteModal();
        }
    }, true); // capture phase لضمان الوقف قبل أي handler آخر

    // --- تنظيف الرمز المعلق بعد نجاح الدخول ---
    window.addEventListener("load", () => {
        setInterval(() => {
            const pending = localStorage.getItem(LS_PENDING);
            if(pending) {
                // نتحقق مرة أخرى من الخادم للتأكد أن الدخول تم فعلاً
                hasActiveSession().then(loggedIn => {
                    if(loggedIn) localStorage.removeItem(LS_PENDING);
                });
            }
        }, 2000);
    });

})();

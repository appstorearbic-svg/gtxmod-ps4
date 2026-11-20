// GTXMOD — حارس الدخول القوي (Global Interceptor)
(function(){
    const LS_INVITES = "gtx_invites_v1";
    const LS_PENDING = "gtx_pending_code";

    // --- أدوات الرموز ---
    function getInvites() { try { return JSON.parse(localStorage.getItem(LS_INVITES)||"[]"); } catch(e){ return []; } }
    function saveInvites(l) { localStorage.setItem(LS_INVITES, JSON.stringify(l)); }
    
    function genCode() {
        const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

    // --- المنطق الرئيسي: اعتراض النقر عالمياً ---
    document.addEventListener("click", function(e) {
        // 1. هل النقرة كانت على صورة الحساب؟
        // نبحث عن أقرب أب يحمل ID accountBtn
        const accBtn = e.target.closest("#accountBtn");
        if (!accBtn) return; // ليست نقرة على الصورة، نتجاهلها

        // 2. هل المستخدم مسجل دخول؟
        const initial = document.getElementById("accountInitial");
        const avatar = document.getElementById("accountAvatar");
        const name = document.getElementById("userNameDisplay");
        
        const isLogged = 
            (initial && initial.textContent !== "👤") || 
            (avatar && avatar.style.display !== "none") ||
            (name && name.textContent.trim() !== "");

        if (isLogged) {
            // ✅ مسجل: لا نفعل شيئاَ، ونترك app.js يتعامل مع النقر (فتح القائمة)
            return;
        } else {
            // ❌ غير مسجل: نمنع النقر الافتراضي ونعرض نافذة الرمز
            e.preventDefault();
            e.stopImmediatePropagation(); // نوقف انتشار الحدث لمنع app.js من العمل
            showInviteModal();
        }
    }, true); // capture phase لضمان الوقف قبل أي handler آخر

    // --- تنظيف الرمز المعلق بعد نجاح الدخول ---
    window.addEventListener("load", () => {
        setInterval(() => {
            const pending = localStorage.getItem(LS_PENDING);
            if(pending) {
                const initial = document.getElementById("accountInitial");
                if(initial && initial.textContent !== "👤") {
                    localStorage.removeItem(LS_PENDING);
                }
            }
        }, 1000);
    });

})();

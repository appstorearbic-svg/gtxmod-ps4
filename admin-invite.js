// GTXMOD — تبويب الدعوات في لوحة المدير
(function(){
    const observer=new MutationObserver(()=>{
        const tabsNav=document.querySelector(".as-tabs");
        if(!tabsNav || document.getElementById("gtxInviteTab")) return;
        
        // إضافة الزر
        const btn=document.createElement("button");
        btn.className="as-tab";
        btn.dataset.t="invite";
        btn.innerHTML="🔑 دعوات";
        btn.id="gtxInviteTab";
        tabsNav.appendChild(btn);
        
        // إضافة القسم
        const viewsContainer=document.querySelector(".as-main");
        if(viewsContainer && !document.getElementById("asInviteView")){
            const sec=document.createElement("section");
            sec.className="as-view";
            sec.id="asInviteView";
            sec.hidden=true;
            sec.innerHTML=`
             <div class="as-box live">
              <div class="as-bt">توليد رمز دعوة</div>
              <button class="as-btn" id="genInvBtn" style="margin-top:10px">✨ توليد</button>
              <div id="invResult" style="margin-top:15px;display:none;text-align:center">
               <div style="font-size:20px;font-weight:bold;color:#38bdf8;background:#071a30;padding:10px;border-radius:8px;border:1px dashed #38bdf8" id="invCodeDisp"></div>
               <button class="as-ghost" onclick="navigator.clipboard.writeText(document.getElementById('invCodeDisp').textContent)" style="margin-top:10px">نسخ</button>
              </div>
             </div>
            `;
            viewsContainer.appendChild(sec);
            
            btn.onclick=()=>{
                document.querySelectorAll(".as-view").forEach(v=>v.hidden=true);
                sec.hidden=false;
                document.querySelectorAll(".as-tab").forEach(t=>t.classList.remove("on"));
                btn.classList.add("on");
            };
            
            sec.querySelector("#genInvBtn").onclick=()=>{
                // نستدعي دالة التوليد من guard.js عبر window إذا أمكن، أو نعيد تعريفها هنا للبساطة
                const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                let code="";for(let i=0;i<8;i++)code+=chars[Math.floor(Math.random()*chars.length)];
                
                const list=JSON.parse(localStorage.getItem("gtx_invites_v1")||"[]");
                list.push({code, exp:Date.now()+10*60*1000, used:false});
                localStorage.setItem("gtx_invites_v1",JSON.stringify(list));
                
                sec.querySelector("#invResult").style.display="block";
                sec.querySelector("#invCodeDisp").textContent=code;
            };
        }
    });
    observer.observe(document.body,{childList:true,subtree:true});
})();

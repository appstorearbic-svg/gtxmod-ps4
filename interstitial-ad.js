// GTXMOD — إعلان بيني عند تغيير التصنيف/الصفحة (قابل للإغلاق فوراً)
(function(){
const AD_SRC="https://bicea.org/14/ada7d27f6b24462f49d56999033be3ff";
const COOLDOWN=45000, MAX_SESSION=6;
let last=0,count=0;
const st=document.createElement("style");
st.textContent=`#gtxIst{position:fixed;inset:0;z-index:10060;display:none;align-items:center;justify-content:center;background:#02060ed9;backdrop-filter:blur(4px);padding:16px;direction:rtl}
#gtxIst.on{display:flex}
.gtx-ist-card{width:100%;max-width:420px;background:linear-gradient(170deg,#0e1e38,#0a1628);border:1px solid #2874bd;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px #000c;animation:gtxIstIn .25s ease both}
@keyframes gtxIstIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.gtx-ist-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #1e3a5f}
.gtx-ist-t{font-size:15px;font-weight:800;color:#60a5fa}
.gtx-ist-x{margin-inline-start:auto;width:40px;height:40px;border-radius:50%;background:#2a1119;border:1px solid #7f1d1d;color:#f87171;font-size:18px}
.gtx-ist-body{background:#071327;min-height:320px}
.gtx-ist-body iframe{width:100%;height:360px;border:0;display:block}
.gtx-ist-foot{padding:12px 14px}
.gtx-ist-go{width:100%;padding:13px;border:0;border-radius:12px;background:linear-gradient(90deg,#087bd0,#2563eb);color:#fff;font-size:15px;font-weight:800}`;
document.head.appendChild(st);
const ov=document.createElement("div");ov.id="gtxIst";
ov.innerHTML='<div class="gtx-ist-card"><div class="gtx-ist-head"><span class="gtx-ist-t">📢 إعلان</span><button class="gtx-ist-x" id="gtxIstX">✕</button></div><div class="gtx-ist-body" id="gtxIstBody"></div><div class="gtx-ist-foot"><button class="gtx-ist-go" id="gtxIstGo">✕ إغلاق ومتابعة التصفح</button></div></div>';
document.body.appendChild(ov);
function close(){ov.classList.remove("on");document.getElementById("gtxIstBody").innerHTML="";}
document.getElementById("gtxIstX").onclick=close;
document.getElementById("gtxIstGo").onclick=close;
ov.onclick=e=>{if(e.target===ov)close()};
function show(){
 const now=Date.now();
 if(now-last<COOLDOWN||count>=MAX_SESSION)return;
 last=now;count++;
 const b=document.getElementById("gtxIstBody");
 b.innerHTML="";
 const f=document.createElement("iframe");
 f.sandbox="allow-scripts allow-same-origin allow-popups allow-forms";
 f.srcdoc='<script src="'+AD_SRC+'"><\/script>';
 b.appendChild(f);
 ov.classList.add("on");
}
document.addEventListener("click",e=>{
 if(e.target.closest(".category")||e.target.closest("[data-p]")||e.target.closest("#applyFilters"))setTimeout(show,250);
},true);
document.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&e.target&&e.target.id==="pgJump")setTimeout(show,250);
});
})();

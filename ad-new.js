// GTXMOD — Adsterra (وحدة جديدة نظيفة) عرض ثابت + تحديث عند التنقل
(function(){
const AD_SRC="https://afders.org/1/159fcd365f3c058fc10a1776daa00801";
const MAX=20, GAP=15000;
let count=0,last=0;

// حاوية ثابتة قبل footer
const box=document.createElement("div");
box.id="gtxAdBox";
box.style.cssText="width:100%;max-width:980px;margin:18px auto;padding:0 12px;min-height:90px;display:flex;align-items:center;justify-content:center";
const f=document.querySelector("footer");
if(f)f.parentNode.insertBefore(box,f);else document.body.appendChild(box);

function load(){
  const s=document.createElement("script");
  s.src=AD_SRC+"?r="+Date.now();
  s.async=true;
  s.setAttribute("data-cfasync","false");
  box.appendChild(s);
}
load(); // أول ظهور

// تحديث عند تغيير التصنيف/الصفحة
function refresh(){
  const now=Date.now();
  if(count>=MAX||now-last<GAP)return;
  last=now;count++;
  const s=document.createElement("script");
  s.src=AD_SRC+"?r="+now;
  s.async=true;
  s.setAttribute("data-cfasync","false");
  document.body.appendChild(s);
}
document.addEventListener("click",e=>{
  if(e.target.closest(".category")||e.target.closest("[data-p]")||e.target.closest("#applyFilters"))setTimeout(refresh,300);
},true);
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target&&e.target.id==="pgJump")setTimeout(refresh,300);
});
window.addEventListener("pageshow",()=>{count=0;last=0;});
})();

(function(){
if(window.__gtxAdV2)return;window.__gtxAdV2=1;
const AD_SRC="https://afders.org/1/159fcd365f3c058fc10a1776daa00801";
const MAX=20,GAP=15000;
let count=0,last=0,initial=true;
const wrap=document.createElement("div");
wrap.style.cssText="width:100%;max-width:980px;margin:18px auto;padding:0 12px";
wrap.innerHTML='<div style="color:#4b7bb5;font-size:11px;text-align:center;margin-bottom:6px;letter-spacing:2px">إعلان</div><div id="gtxAdBox" style="min-height:90px;display:flex;align-items:center;justify-content:center"></div>';
const f=document.querySelector("footer");if(f)f.parentNode.insertBefore(wrap,f);else document.body.appendChild(wrap);
const box=wrap.querySelector("#gtxAdBox");
const mk=()=>{const s=document.createElement("script");s.src=AD_SRC+"?r="+Date.now()+"."+Math.random().toString(36).slice(2,8);s.async=true;s.setAttribute("data-cfasync","false");s.dataset.gtxad="1";return s;};
function reset(){count=0;last=0;box.querySelectorAll("script[data-gtxad]").forEach(n=>n.remove());box.appendChild(mk());}
reset();
window.addEventListener("pageshow",e=>{if(initial){initial=false;count=0;last=0;return;}reset();});
function refresh(){const now=Date.now();if(count>=MAX||now-last<GAP)return;last=now;count++;document.body.appendChild(mk());}
document.addEventListener("click",e=>{if(e.target.closest(".category")||e.target.closest("[data-p]")||e.target.closest("#applyFilters")||e.target.closest("#gtxSearchIn"))setTimeout(refresh,300);},true);
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&(e.target.id==="pgJump"||e.target.id==="gtxSearchIn"))setTimeout(refresh,300);});
})();

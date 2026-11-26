(function(){
if(window.__gtxAdV3)return;window.__gtxAdV3=1;
const SRC="https://afders.org/1/159fcd365f3c058fc10a1776daa00801";
const MAX=20,GAP=8000,META="__gtxAdKeys";
let count=0,last=0,initial=true;
const own=k=>k.startsWith("gtx")||k.startsWith("__gtx");
function snap(){const m={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);m["L:"+k]=localStorage.getItem(k);}for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);m["S:"+k]=sessionStorage.getItem(k);}m["C:"]=document.cookie;}catch(e){}return m;}
function learn(before){setTimeout(()=>{try{const keys=JSON.parse(localStorage.getItem(META)||"[]");const add=[];
for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(own(k)||k===META)continue;if(before["L:"+k]!==localStorage.getItem(k))add.push("L:"+k);}
for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(own(k))continue;if(before["S:"+k]!==sessionStorage.getItem(k))add.push("S:"+k);}
const bc=before["C:"]||"";document.cookie.split(";").forEach(c=>{const n=c.split("=")[0].trim();if(n&&!bc.includes(n+"="))add.push("C:"+n);});
localStorage.setItem(META,JSON.stringify([...new Set([...keys,...add])]));}catch(e){}},2500);}
function clearCap(){try{JSON.parse(localStorage.getItem(META)||"[]").forEach(k=>{const t=k.slice(0,2),n=k.slice(2);
if(t==="L:")localStorage.removeItem(n);else if(t==="S:")sessionStorage.removeItem(n);else if(t==="C:")document.cookie=n+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";});}catch(e){}}
function inject(){clearCap();const before=snap();const s=document.createElement("script");
s.src=SRC+"?r="+Date.now()+"."+Math.random().toString(36).slice(2,8);s.async=true;s.setAttribute("data-cfasync","false");
document.body.appendChild(s);learn(before);}
function reset(){count=0;last=0;inject();}
reset();
window.addEventListener("pageshow",e=>{if(initial){initial=false;count=0;last=0;return;}reset();});
function refresh(){const now=Date.now();if(count>=MAX||now-last<GAP)return;last=now;count++;inject();}
document.addEventListener("click",e=>{if(e.target.closest(".category")||e.target.closest("[data-p]")||e.target.closest("#applyFilters")||e.target.closest("#gtxSearchIn")||e.target.closest(".download"))setTimeout(refresh,250);},true);
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&(e.target.id==="pgJump"||e.target.id==="gtxSearchIn"))setTimeout(refresh,250);});
})();

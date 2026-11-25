// GTXMOD — Adsterra فقط: تحديث الإعلان عند كل تصنيف/صفحة (20 مرة كحد أقصى بالزيارة)
(function(){
const AD_SRC="https://bicea.org/14/ada7d27f6b24462f49d56999033be3ff";
const MAX=20, GAP=15000;
let count=0,last=0;
function boost(){
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
 if(e.target.closest(".category")||e.target.closest("[data-p]")||e.target.closest("#applyFilters"))setTimeout(boost,300);
},true);
document.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&e.target&&e.target.id==="pgJump")setTimeout(boost,300);
});
})();

(function(){
document.getElementById("gtxSearchBar")?.remove();
const st=document.createElement("style");
st.textContent="#gtxSearchBar{display:flex;max-width:980px;margin:16px auto 6px;padding:0 12px;direction:rtl}.gtx-sw{position:relative;flex:1}#gtxSearchIn{width:100%;padding:14px 18px;padding-left:50px;border-radius:14px;border:1px solid #1e406e;background:linear-gradient(160deg,#0a1e3a,#071a30);color:#fff;font:15px system-ui;box-sizing:border-box;transition:border-color .2s,box-shadow .2s}#gtxSearchIn::placeholder{color:#5d84ad}#gtxSearchIn:focus{outline:none;border-color:#38bdf8;box-shadow:0 0 0 3px #087bd033,0 8px 26px #087bd022}#gtxSearchClr{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:30px;height:30px;border:0;border-radius:50%;background:#1e3a5f;color:#cfe3ff;font-size:14px;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s}#gtxSearchClr.on{display:flex}#gtxSearchClr:hover{background:#a51d48;color:#fff}.gtx-spin{width:46px;height:46px;margin:26px auto 10px;border:4px solid #1e406e;border-top-color:#38bdf8;border-radius:50%;animation:gtxrot .8s linear infinite}@keyframes gtxrot{to{transform:rotate(360deg)}}#gtxLoadBox{text-align:center;color:#8bbce8;padding:10px 0 26px;font-size:15px}";
document.head.appendChild(st);
const head=document.querySelector(".section-heading");
const bar=document.createElement("div");bar.id="gtxSearchBar";
bar.innerHTML='<div class="gtx-sw"><input id="gtxSearchIn" placeholder="🔎 ابحث باسم المود أو الكود..." autocomplete="off"><button id="gtxSearchClr" aria-label="مسح البحث">✕</button></div>';
head.parentNode.insertBefore(bar,head);
const inp=document.getElementById("gtxSearchIn"),clr=document.getElementById("gtxSearchClr");
const norm=s=>String(s||"").toLowerCase().replace(/[\u064B-\u0652\u0670]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/[ىی]/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/\s+/g," ").trim();
const subseq=(q,t)=>{let i=0;for(const ch of t){if(ch===q[i])i++;if(i===q.length)return true}return q.length===0};
window.gtxSearch="";
window.gtxMatch=m=>{const q=norm(window.gtxSearch);if(!q)return true;const f=[m.name,m.id,m.code,m.category,m.description,(m.spawn||[]).join(" ")].map(norm);return f.some(x=>x.includes(q))||f.some(x=>subseq(q,x.replace(/ /g,"")));};
const grid=document.getElementById("modGrid");
if(typeof mods!=="undefined"&&mods.length===0)grid.innerHTML='<div id="gtxLoadBox"><div class="gtx-spin"></div>جاري تحميل المودات...</div>';
let prev=null,timer=null;const H=()=>document.querySelector(".section-heading h2");
const savePrev=()=>{if(prev===null)prev={sel:selected,type:gtxType,fav:gtxFavoritesOnly,head:H().textContent};};
function restore(){if(prev){selected=prev.sel;gtxType=prev.type;gtxFavoritesOnly=prev.fav;H().textContent=prev.head;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x.dataset.category===selected));prev=null;}}
function emptyMsg(){const e=document.getElementById("emptyState"),n=grid.querySelectorAll(".mod-card").length;if(window.gtxSearch&&n===0){e.textContent="ماكو نتائج مطابقة للبحث.";e.classList.remove("hidden");}else if(!window.gtxSearch&&mods.length===0){e.textContent="لا يوجد مودات";e.classList.remove("hidden");}}
function apply(){const q=inp.value.trim();clr.classList.toggle("on",q.length>0);window.gtxSearch=q;
 if(q){savePrev();selected="";gtxType="";gtxFavoritesOnly=false;H().textContent="🔎 نتائج البحث: "+q;}else restore();
 try{render()}catch(e){} setTimeout(emptyMsg,60);}
inp.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(apply,90);});
inp.addEventListener("keydown",e=>{if(e.key==="Enter"){clearTimeout(timer);apply();}if(e.key==="Escape"){inp.value="";apply();}});
clr.onclick=()=>{inp.value="";apply();inp.focus();};
})();

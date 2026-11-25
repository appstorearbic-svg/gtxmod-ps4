// GTXMOD — بحث ذكي + مؤشر تحميل
(function(){
const st=document.createElement("style");
st.textContent="#gtxSearchBar{display:flex;gap:8px;max-width:980px;margin:14px auto 4px;padding:0 12px;direction:rtl}#gtxSearchIn{flex:1;padding:12px 14px;border-radius:12px;border:1px solid #1e406e;background:#071a30;color:#fff;font:15px system-ui}#gtxSearchIn:focus{outline:none;border-color:#38bdf8;box-shadow:0 0 0 3px #087bd033}#gtxSearchBtn{padding:12px 18px;border:0;border-radius:12px;background:linear-gradient(90deg,#087bd0,#2563eb);color:#fff;font-weight:800;font-size:15px}#gtxSearchClr{padding:12px 14px;border:1px solid #1e406e;border-radius:12px;background:#0b1c33;color:#8bbce8}.gtx-spin{width:46px;height:46px;margin:26px auto 10px;border:4px solid #1e406e;border-top-color:#38bdf8;border-radius:50%;animation:gtxrot .8s linear infinite}@keyframes gtxrot{to{transform:rotate(360deg)}}#gtxLoadBox{text-align:center;color:#8bbce8;padding:10px 0 26px;font-size:15px}";
document.head.appendChild(st);
const head=document.querySelector(".section-heading");
const bar=document.createElement("div");bar.id="gtxSearchBar";
bar.innerHTML='<input id="gtxSearchIn" placeholder="🔎 ابحث باسم المود أو الكود..."><button id="gtxSearchBtn">بحث</button><button id="gtxSearchClr">✕</button>';
head.parentNode.insertBefore(bar,head);
const norm=s=>String(s||"").toLowerCase().replace(/[\u064B-\u0652\u0670]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/[ىی]/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/\s+/g," ").trim();
const subseq=(q,t)=>{let i=0;for(const ch of t){if(ch===q[i])i++;if(i===q.length)return true}return q.length===0};
window.gtxSearch="";
window.gtxMatch=m=>{const q=norm(window.gtxSearch);if(!q)return true;
 const f=[m.name,m.id,m.code,m.category,m.description,(m.spawn||[]).join(" ")].map(norm);
 return f.some(x=>x.includes(q))||f.some(x=>subseq(q,x.replace(/ /g,"")));};
const grid=document.getElementById("modGrid");
if(typeof mods!=="undefined"&&mods.length===0)grid.innerHTML='<div id="gtxLoadBox"><div class="gtx-spin"></div>جاري تحميل المودات...</div>';
function doSearch(){
 window.gtxSearch=document.getElementById("gtxSearchIn").value.trim();
 try{selected="";gtxType="";gtxFavoritesOnly=false;}catch(e){}
 document.querySelector(".section-heading h2").textContent=window.gtxSearch?("🔎 نتائج البحث: "+window.gtxSearch):"🔥 أحدث المنشورات";
 try{render()}catch(e){}
 setTimeout(()=>{const empty=document.getElementById("emptyState"),n=grid.querySelectorAll(".mod-card").length;
  if(window.gtxSearch&&n===0){empty.textContent="ماكو نتائج مطابقة للبحث.";empty.classList.remove("hidden");}
  else if(!window.gtxSearch&&mods.length===0){empty.textContent="لا يوجد مودات";empty.classList.remove("hidden");}},60);
}
document.getElementById("gtxSearchBtn").onclick=doSearch;
document.getElementById("gtxSearchIn").addEventListener("keydown",e=>{if(e.key==="Enter")doSearch()});
document.getElementById("gtxSearchClr").onclick=()=>{document.getElementById("gtxSearchIn").value="";doSearch()};
})();

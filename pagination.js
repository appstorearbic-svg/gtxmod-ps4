// GTXMOD — ترقيم المنشورات: 7 لكل صفحة + نافذة 3 أرقام + قفز بالرقم
(function(){
const PER=7,grid=document.getElementById("modGrid"),empty=document.getElementById("emptyState");
if(!grid||!empty)return;
let page=1,sig=null;
const st=document.createElement("style");st.textContent=`#pgBar{display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;margin:20px 0 8px;direction:ltr}
.pg-b{min-width:42px;height:42px;padding:0 11px;border-radius:12px;background:#0b1c33;border:1px solid #1e406e;color:#8bbce8;font:700 15px system-ui;cursor:pointer;transition:.18s}
.pg-b:hover{border-color:#38bdf8;color:#e8f0ff;transform:translateY(-1px)}
.pg-b.on{background:linear-gradient(90deg,#087bd0,#2563eb);border-color:transparent;color:#fff;box-shadow:0 8px 20px #087bd055}
.pg-d{color:#4b7bb5;font-size:17px;padding:0 3px}
.pg-j{width:54px;height:42px;text-align:center;border-radius:12px;background:#071a30;border:1px dashed #2874bd;color:#7dd3fc;font:700 15px system-ui}
.pg-j:focus{outline:none;border-style:solid;border-color:#38bdf8;box-shadow:0 0 0 3px #38bdf826}
.pg-j::-webkit-outer-spin-button,.pg-j::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}`;document.head.appendChild(st);
const bar=document.createElement("div");bar.id="pgBar";empty.after(bar);
function go(n){page=Math.max(1,parseInt(n,10)||1);apply();grid.scrollIntoView({behavior:"smooth",block:"start"})}
function draw(pages){
 const start=pages<=3?1:Math.min(Math.max(page-1,1),pages-2);
 let h="";
 for(let i=start;i<start+3&&i<=pages;i++)h+='<button class="pg-b'+(i===page?" on":"")+'" data-p="'+i+'">'+i+'</button>';
 if(page>pages)h+='<button class="pg-b on">'+page+'</button>';
 h+='<span class="pg-d">…</span><input class="pg-j" id="pgJump" type="number" min="1" inputmode="numeric" placeholder="؟">';
 bar.innerHTML=h;
 bar.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>go(b.dataset.p));
 const j=document.getElementById("pgJump");
 j.onkeydown=e=>{if(e.key==="Enter")go(j.value)};
 j.onblur=()=>{if(j.value)go(j.value)};
}
function apply(){
 const cards=[...grid.querySelectorAll(".mod-card")];
 const s=cards.map(c=>c.dataset.id||c.querySelector(".mod-title")?.textContent||"").join("|");
 if(s!==sig){sig=s;page=1}
 const total=cards.length,pages=Math.ceil(total/PER);
 if(!total){bar.style.display="none";return}
 const from=(page-1)*PER,to=from+PER;
 cards.forEach((c,i)=>{c.style.display=(i>=from&&i<to)?"":"none"});
 if(page>pages){empty.textContent="لا توجد منشورات بهذا الرقم.";empty.classList.remove("hidden")}
 else{empty.textContent="لا يوجد مودات";empty.classList.add("hidden")}
 bar.style.display="flex";draw(pages);
}
const base=window.render;
if(typeof base==="function")window.render=function(){const r=base.apply(this,arguments);apply();return r};
window.addEventListener("load",apply);
})();

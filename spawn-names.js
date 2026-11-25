// GTXMOD — اسماء الاستدعاء (بديل وصف المود)
(function(){
const MAX=15,LEN=24,E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const st=document.createElement("style");st.textContent=`.mod-desc{display:none!important}
.sn-wrap{margin:6px 0 12px}.sn-lab{display:block;color:#8bbce8;font-size:13px;margin-bottom:6px}
.sn-sel{width:100%;padding:11px;background:#071a30;border:1px solid #1e406e;border-radius:10px;color:#fff;font-family:inherit}
.sn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:7px;margin-top:9px}
.sn-cell{position:relative}.sn-cell i{position:absolute;top:50%;right:8px;transform:translateY(-50%);font-style:normal;font-size:10px;color:#4b7bb5}
.sn-in{width:100%;padding:9px 24px 9px 8px;background:#071a30;border:1px solid #1e406e;border-radius:9px;color:#fff;box-sizing:border-box;font-family:monospace;font-size:12px;text-transform:uppercase}
.sn-in:focus{outline:none;border-color:#38bdf8;box-shadow:0 0 0 3px #38bdf826}
.sn-btn{padding:9px 13px;border:0;border-radius:8px;background:#153a5c;color:#7dd3fc;font-weight:700}
#snPop{position:fixed;inset:0;z-index:10040;display:none;align-items:center;justify-content:center;background:#02060ed9;padding:18px;direction:rtl}#snPop.on{display:flex}
.sn-card{width:100%;max-width:430px;max-height:82vh;overflow:auto;background:linear-gradient(170deg,#0e1e38,#0a1628);border:1px solid #2874bd;border-radius:18px;padding:18px;box-sizing:border-box}
.sn-head{display:flex;align-items:center;gap:10px;border-bottom:1px solid #1e3a5f;padding-bottom:10px;margin-bottom:12px}
.sn-h{font-size:17px;font-weight:800;color:#60a5fa}.sn-n{background:#0d2547;border:1px solid #2874bd;color:#8bbce8;padding:3px 10px;border-radius:20px;font-size:12px}
.sn-x{margin-inline-start:auto;width:32px;height:32px;border-radius:50%;background:#0b1c33;border:1px solid #1e3a5f;color:#cfe4ff}
.sn-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sn-item{display:flex;align-items:center;gap:7px;background:#0b1c33;border:1px solid #1e406e;border-radius:11px;padding:9px 10px;cursor:pointer}
.sn-num{min-width:22px;height:22px;display:grid;place-items:center;background:linear-gradient(90deg,#087bd0,#2563eb);color:#fff;border-radius:7px;font-size:11px;font-weight:800}
.sn-nm{font-family:monospace;font-size:13px;color:#e8f0ff;overflow-wrap:anywhere;direction:ltr}
.sn-tip{text-align:center;color:#5d84ad;font-size:11px;margin-top:11px}
@media(max-width:360px){.sn-list{grid-template-columns:1fr}}`;document.head.appendChild(st);
const pop=document.createElement("div");pop.id="snPop";
pop.innerHTML='<div class="sn-card"><div class="sn-head"><span class="sn-h">📋 اسماء الاستدعاء</span><span class="sn-n" id="snCount"></span><button class="sn-x" id="snX">✕</button></div><div class="sn-list" id="snList"></div><div class="sn-tip">اضغط على الاسم حتى ينسخ</div></div>';
document.body.appendChild(pop);
document.getElementById("snX").onclick=()=>pop.classList.remove("on");
pop.onclick=e=>{if(e.target===pop)pop.classList.remove("on")};
function open(ns){document.getElementById("snCount").textContent=ns.length+" اسم";
 const L=document.getElementById("snList");
 L.innerHTML=ns.map((n,i)=>'<div class="sn-item" data-n="'+E(n)+'"><span class="sn-num">'+(i+1)+'</span><span class="sn-nm">'+E(n)+'</span></div>').join("");
 L.querySelectorAll(".sn-item").forEach(el=>el.onclick=()=>{try{navigator.clipboard.writeText(el.dataset.n)}catch(e){}el.style.borderColor="#22c55e";setTimeout(()=>el.style.borderColor="",600)});
 pop.classList.add("on")}
function mount(d){
 if(!d||d.dataset.snDone)return;d.dataset.snDone="1";
 const lab=d.previousElementSibling;if(lab&&lab.tagName==="LABEL")lab.style.display="none";
 d.style.display="none";d.value="";d.removeAttribute("required");
 const w=document.createElement("div");w.className="sn-wrap";
 w.innerHTML='<label class="sn-lab">عدد الاسماء ↓</label><select class="sn-sel"><option value="0">بدون اسماء</option>'+Array.from({length:MAX},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join("")+'</select><div class="sn-grid"></div>';
 d.after(w);
 const sel=w.querySelector("select"),g=w.querySelector(".sn-grid");
 sel.onchange=()=>{const n=+sel.value,old=[...g.querySelectorAll("input")].map(i=>i.value);
  g.innerHTML=Array.from({length:n},(_,i)=>'<div class="sn-cell"><i>'+(i+1)+'</i><input class="sn-in" maxlength="'+LEN+'" placeholder="اسم" value="'+E(old[i]||"")+'"></div>').join("")};
 d._snGrid=g}
function scan(){mount(document.getElementById("mpDesc"));mount(document.querySelector('#publishForm textarea[name="description"]'))}
function attach(fd){try{
 if(!(fd instanceof FormData))return;let d=null;
 if(fd.has("download")&&fd.has("name"))d=document.getElementById("mpDesc");
 else if(fd.has("username")&&fd.has("name"))d=document.querySelector('#publishForm textarea[name="description"]');
 if(!d||!d._snGrid)return;
 const ns=[...d._snGrid.querySelectorAll("input")].map(i=>i.value.trim()).filter(Boolean).slice(0,MAX);
 fd.set("description","");fd.set("spawn",JSON.stringify(ns))}catch(e){}}
const xs=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(b){attach(b);return xs.call(this,b)};
const of=window.fetch;window.fetch=function(u,o){if(o&&o.body)attach(o.body);return of.apply(this,arguments)};
function cards(){let L=[];try{L=mods}catch(e){}
 document.querySelectorAll(".mod-card[data-id]").forEach(c=>{
  const fav=(c.querySelector(".gtx-like")||c.querySelector(".gtx-fav"));if(!fav)return;
  const m=L.find(x=>String(x.id)===c.dataset.id),ns=m&&Array.isArray(m.spawn)?m.spawn.filter(Boolean):[],has=c.querySelector(".sn-btn");
  if(!ns.length){if(has)has.remove();return}
  if(has)return;
  const b=document.createElement("button");b.type="button";b.className="sn-btn";b.textContent="📋 اسماء استدعاء";
  b.onclick=e=>{e.stopPropagation();open(ns)};fav.after(b)})}
let t=null;function tick(){clearTimeout(t);t=setTimeout(()=>{scan();cards()},250)}
window.addEventListener("load",()=>{scan();cards();new MutationObserver(tick).observe(document.body,{childList:true,subtree:true})});
})();

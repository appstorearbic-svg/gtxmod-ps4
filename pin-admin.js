// GTXMOD — تثبيت المنشورات للمدير
(function(){
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let comm=new Set(),ready=false;
const st=document.createElement("style");st.textContent=`.pin-row{display:flex;align-items:center;gap:10px;background:#0b1c33;border:1px solid #1e406e;border-radius:12px;padding:9px;margin-bottom:8px}
.pin-row img{width:44px;height:44px;border-radius:9px;object-fit:cover;background:#12233d}
.pin-i{flex:1;min-width:0}.pin-i b{display:block;font-size:14px;overflow-wrap:anywhere}.pin-i span{color:#7fa8d4;font-size:11.5px}
.pin-t{padding:9px 13px;border-radius:9px;border:1px solid #1e406e;background:#0d2547;color:#8bbce8;font-size:13px;white-space:nowrap}
.pin-t.on{background:#3a2a08;border-color:#f59e0b;color:#fbbf24;font-weight:700}
.gtx-pinmark{position:absolute;top:8px;right:8px;z-index:6;background:#f59e0b;color:#231703;font:900 11px/1 system-ui;padding:5px 9px;border-radius:7px;box-shadow:0 4px 12px #f59e0b66;pointer-events:none}
.gtx-pinbtn{padding:9px 12px;border:0;border-radius:8px;background:#3a2a08;color:#fbbf24;font-weight:700}`;document.head.appendChild(st);
function creds(){try{return adminCredentials}catch(e){return null}}
async function loadComm(){try{const d=await (await fetch("/api/community",{cache:"no-store"})).json();if(d.success){comm=new Set(d.mods.map(m=>String(m.id)));ready=true}}catch(e){}}
async function setPin(id,on){
 const c=creds();if(!c)throw new Error("سجل دخول المدير أولاً");
 if(!ready)await loadComm();
 let d;
 if(comm.has(String(id))){
  const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"pin",id:String(id),pinned:on?1:0,username:c.username,password:c.password})});
  d=await r.json();if(!r.ok||!d.success)throw new Error(d.message||"فشل التثبيت");
 }else{
  const f=new FormData();f.set("username",c.username);f.set("password",c.password);f.set("action","pin");f.set("id",String(id));f.set("pinned",on?"1":"0");
  const r=await fetch("/api/manage",{method:"POST",body:f});d=await r.json();if(!r.ok||!d.success)throw new Error(d.message||"فشل التثبيت");
 }
 try{const m=mods.find(x=>String(x.id)===String(id));if(m)m.pinned=on}catch(e){}
 try{render()}catch(e){}
 return d;
}
function mount(){
 const tabs=document.getElementById("showManage");
 if(!tabs||document.getElementById("showPin"))return;
 const b=document.createElement("button");b.id="showPin";b.type="button";b.textContent="📌 التثبيت";
 b.style.cssText="flex:1;padding:11px;background:#8a5a12;color:#fff;border:0;border-radius:8px";
 tabs.parentElement.appendChild(b);
 const sec=document.createElement("section");sec.id="pinArea";
 sec.style.cssText="display:none;margin-top:18px;padding:15px;background:#071a30;border:1px solid #b45309;border-radius:12px";
 document.getElementById("managerArea").after(sec);
 b.onclick=()=>{sec.style.display="block";document.getElementById("managerArea").style.display="none";document.getElementById("publishForm").style.display="none";list()};
 ["showManage","showPublish"].forEach(i=>{const e=document.getElementById(i);if(e)e.addEventListener("click",()=>sec.style.display="none")});
}
async function list(){
 const sec=document.getElementById("pinArea");if(!sec)return;
 sec.innerHTML='<div style="color:#8bbce8">جاري التحميل…</div>';
 await loadComm();let all=[];
 try{const j=await (await fetch("./mods.json?t="+Date.now())).json();if(Array.isArray(j))all=all.concat(j)}catch(e){}
 try{const d=await (await fetch("/api/community")).json();if(d.success)all=all.concat(d.mods)}catch(e){}
 all.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
 sec.innerHTML='<h3 style="margin:0 0 8px">📌 تثبيت المنشورات</h3><div style="color:#8bbce8;font-size:12px;margin-bottom:12px">المثبّت يظهر أول القائمة لكل الزوار.</div>'+
 (all.length?all.map(m=>'<div class="pin-row"><img src="'+E(m.image||"logo.jpg")+'"><div class="pin-i"><b>'+E(m.name)+'</b><span>#'+E(m.category)+'</span></div><button class="pin-t'+(m.pinned?" on":"")+'" data-id="'+E(m.id)+'">'+(m.pinned?"📌 مثبّت":"📍 تثبيت")+'</button></div>').join(""):'<div style="color:#8bbce8">ماكو منشورات</div>');
 sec.querySelectorAll(".pin-t").forEach(b=>b.onclick=async()=>{
  const on=!b.classList.contains("on");b.textContent="…";
  try{await setPin(b.dataset.id,on);b.classList.toggle("on",on);b.textContent=on?"📌 مثبّت":"📍 تثبيت"}
  catch(e){b.textContent=on?"📍 تثبيت":"📌 مثبّت";alert("❌ "+e.message)}
 });
}
function cards(){
 let L=[];try{L=mods}catch(e){}
 const admin=!!creds();
 document.querySelectorAll(".mod-card[data-id]").forEach(c=>{
  const m=L.find(x=>String(x.id)===c.dataset.id),on=!!(m&&m.pinned);
  const box=c.querySelector(".mod-image")||c.querySelector(".gtx-media");
  if(box){let k=box.querySelector(".gtx-pinmark");
   if(on&&!k){k=document.createElement("span");k.className="gtx-pinmark";k.textContent="📌 مثبّت";box.appendChild(k)}
   if(!on&&k)k.remove()}
  const row=c.querySelector(".gtx-fav");if(!row)return;
  let b=c.querySelector(".gtx-pinbtn");
  if(!admin){if(b)b.remove();return}
  if(!b){b=document.createElement("button");b.type="button";b.className="gtx-pinbtn";row.after(b);
   b.onclick=async e=>{e.stopPropagation();const cur=b.dataset.on==="1";b.textContent="…";
    try{await setPin(c.dataset.id,!cur)}catch(err){alert("❌ "+err.message)}}}
  b.dataset.on=on?"1":"0";b.textContent=on?"📌 إلغاء التثبيت":"📍 تثبيت";
 });
}
let t=null;function tick(){clearTimeout(t);t=setTimeout(()=>{mount();cards()},250)}
window.addEventListener("load",()=>{loadComm();mount();cards();new MutationObserver(tick).observe(document.body,{childList:true,subtree:true})});
})();

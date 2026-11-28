// GTXMOD — النشر مقصور على روابط MediaFire
(function(){
const MSG="❌ خطأ: هذا ليس رابط ميديا فاير. النشر مسموح فقط بروابط MediaFire.";
const ok=v=>{try{const u=new URL(String(v||"").trim());return /^https?:$/.test(u.protocol)&&/(^|\.)mediafire\.com$/i.test(u.hostname)}catch(e){return false}};
const st=document.createElement("style");st.textContent=`.mf-hint{display:block;font-size:11.5px;margin:-4px 0 10px;line-height:1.6}
.mf-ok{color:#4ade80}.mf-bad{color:#f87171}
.mf-b{border-color:#ef4444!important;box-shadow:0 0 0 3px #ef444433!important}
.mf-g{border-color:#22c55e!important}`;document.head.appendChild(st);
function check(inp){
 let h=inp.nextElementSibling;
 if(!h||!h.classList||!h.classList.contains("mf-hint")){h=document.createElement("small");h.className="mf-hint";inp.after(h)}
 const v=inp.value.trim();
 if(!v){h.textContent="";inp.classList.remove("mf-b","mf-g");return}
 if(ok(v)){h.textContent="✅ رابط ميديا فاير مقبول";h.className="mf-hint mf-ok";inp.classList.add("mf-g");inp.classList.remove("mf-b")}
 else{h.textContent=MSG;h.className="mf-hint mf-bad";inp.classList.add("mf-b");inp.classList.remove("mf-g")}
}
function scan(){
 const a=document.getElementById("mpDownload");
 if(a&&!a.dataset.mf){a.dataset.mf="1";a.placeholder="https://www.mediafire.com/file/....../file";a.addEventListener("input",()=>check(a))}
}
function fail(kind){
 if(kind==="mp"){
  const m=document.getElementById("mpMsg"),b=document.getElementById("mpGo"),bar=document.getElementById("mpBar");
  if(m){m.textContent=MSG;m.style.color="#f87171"}if(b)b.disabled=false;if(bar)bar.style.display="none";
 }else{
  const m=document.getElementById("publishMessage"),b=document.querySelector('#publishForm button[type="submit"]');
  if(m){m.textContent=MSG;m.style.color="#f87171"}if(b)b.disabled=false;
 }
}
function block(fd){
 let url=null,kind=null;
 if(fd.has("download")&&fd.has("name")){url=fd.get("download");kind="mp"}
 else if(fd.has("downloadUrl")){url=fd.get("downloadUrl");kind="pub"}
 if(url===null||ok(url))return false;
 fail(kind);return true;
}
const xs=XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send=function(b){try{if(b instanceof FormData&&block(b))return}catch(e){}return xs.apply(this,arguments)};
const of=window.fetch;
window.fetch=function(u,o){
 try{if(o&&o.body instanceof FormData&&block(o.body))return Promise.resolve(new Response(JSON.stringify({success:false,message:MSG}),{status:400,headers:{"Content-Type":"application/json"}}))}catch(e){}
 return of.apply(this,arguments);
};
let t=null;
window.addEventListener("load",()=>{scan();new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,250)}).observe(document.body,{childList:true,subtree:true})});
})();

// GTXMOD — كود المنشور الثابت (من السيرفر لكل الزوار)
(function(){
 let map=null,busy=false,t=null;
 function toast(m){let e=document.getElementById("gtxCodeToast");if(!e){e=document.createElement("div");e.id="gtxCodeToast";e.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:10px 20px;border-radius:9px;z-index:99999;font-weight:bold;direction:rtl;transition:.3s";document.body.appendChild(e);}e.textContent=m;e.style.opacity="1";clearTimeout(e._t);e._t=setTimeout(()=>e.style.opacity="0",2000);}
 function paint(){
  if(!map)return;
  document.querySelectorAll(".mod-card").forEach(card=>{
   const id=card.dataset.id||card.querySelector(".gtx-like,.gtx-fav")?.dataset.id;
   if(!id)return;
   card.dataset.id=id;
   const code=(map.static&&map.static[id])||(map.community&&map.community[id]);
   if(!code)return;
   let b=card.querySelector(".gtx-below-code");
   if(b){if(b.textContent!==code)b.textContent=code;return;}
   b=document.createElement("div");
   b.className="gtx-below-code";b.textContent=code;b.title="اضغط لنسخ الكود";
   b.style.cssText="display:block;width:max-content;margin:4px auto 8px;background:#ef4444;color:#fff;font:900 13px monospace;padding:4px 12px;border-radius:6px;letter-spacing:1px;direction:ltr;cursor:pointer;box-shadow:0 2px 6px #ef444466";
   b.onclick=async ev=>{ev.stopPropagation();try{await navigator.clipboard.writeText(code);toast("تم نسخ الكود: "+code);}catch(x){toast("الكود: "+code);}};
   const img=card.querySelector(".mod-image");
   if(img)img.after(b);else card.prepend(b);
  });
 }
 async function load(){
  if(busy)return;busy=true;
  try{const r=await fetch("/api/mod-codes",{cache:"no-store"}),d=await r.json();if(r.ok&&d.success){map=d.codes||{};paint();}}catch(e){}
  busy=false;
 }
 function tick(){clearTimeout(t);t=setTimeout(()=>{
  const miss=[...document.querySelectorAll(".mod-card")].some(c=>!c.querySelector(".gtx-below-code"));
  if(!map||miss)load();else paint();
 },350);}
 window.addEventListener("load",()=>{load();new MutationObserver(tick).observe(document.body,{childList:true,subtree:true});});
})();

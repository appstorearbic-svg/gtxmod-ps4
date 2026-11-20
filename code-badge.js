// GTXMOD — أكواد المنشورات الثابتة من قاعدة البيانات
(function(){
  let codeMap=null;
  let loading=false;
  let timer=null;

  function toast(msg){
    let t=document.getElementById("gtx-toast-code-cb");
    if(!t){
      t=document.createElement("div");
      t.id="gtx-toast-code-cb";
      t.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#16a34a;color:white;padding:10px 20px;border-radius:8px;z-index:99999;font-weight:bold;direction:rtl";
      document.body.appendChild(t);
    }
    t.textContent=msg;
    t.style.opacity="1";
    clearTimeout(t._timer);
    t._timer=setTimeout(()=>t.style.opacity="0",2200);
  }

  function apply(){
    if(!codeMap)return;
    document.querySelectorAll(".mod-card[data-id],.post-card[data-id]").forEach(card=>{
      if(card.querySelector(".gtx-below-code"))return;
      const id=card.dataset.id;
      const code=codeMap.static?.[id]||codeMap.community?.[id];
      if(!code)return;

      const badge=document.createElement("div");
      badge.className="gtx-below-code";
      badge.textContent=code;
      badge.title="اضغط لنسخ كود المنشور";
      badge.style.cssText="display:block;width:max-content;margin:5px auto 9px;background:#ef4444;color:#fff;font:900 13px monospace;padding:5px 13px;border-radius:6px;letter-spacing:1px;direction:ltr;cursor:pointer;box-shadow:0 2px 6px #ef444466";
      badge.onclick=async e=>{
        e.stopPropagation();
        try{
          await navigator.clipboard.writeText(code);
          toast("تم نسخ الكود: "+code);
        }catch(err){toast("الكود: "+code);}
      };

      const image=card.querySelector(".mod-image");
      if(image) image.after(badge);
      else card.prepend(badge);
    });
  }

  async function loadCodes(){
    if(loading)return;
    loading=true;
    try{
      const r=await fetch("/api/mod-codes",{cache:"no-store"});
      const d=await r.json();
      if(r.ok&&d.success){
        codeMap=d.codes||{};
        apply();
      }
    }catch(e){
      console.warn("GTXMOD codes unavailable",e);
    }finally{loading=false;}
  }

  function check(){
    const cards=[...document.querySelectorAll(".mod-card[data-id],.post-card[data-id]")];
    const missing=cards.some(card=>!card.querySelector(".gtx-below-code")&&
      !(codeMap?.static?.[card.dataset.id]||codeMap?.community?.[card.dataset.id]));
    if(!codeMap||missing)loadCodes();
    else apply();
  }

  window.addEventListener("load",()=>{
    loadCodes();
    const observer=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(check,350);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();

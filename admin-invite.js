// GTXMOD — خانة رموز الدعوة داخل لوحة المدير (توليد/نسخ/فحص من السيرفر)
(function(){
const API="/api/invite";
function modal(){
  let m=document.getElementById("gtxInvAdmin");
  if(m) return m;
  m=document.createElement("div");m.id="gtxInvAdmin";
  m.style.cssText="position:fixed;inset:0;background:#000c;z-index:10070;display:none;align-items:center;justify-content:center;padding:16px;direction:rtl";
  m.innerHTML='<div style="background:#0f172a;border:1px solid #2874bd;border-radius:16px;max-width:360px;width:100%;padding:18px;color:#fff"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><b style="color:#60a5fa;font-size:16px">🔑 رموز الدعوة</b><button id="giaClose" style="margin-inline-start:auto;background:#2a1119;border:1px solid #7f1d1d;color:#f87171;border-radius:50%;width:34px;height:34px">✕</button></div><button id="giaGen" style="width:100%;padding:12px;border:0;border-radius:10px;background:linear-gradient(90deg,#087bd0,#2563eb);color:#fff;font-weight:800;font-size:15px">➕ توليد رمز جديد</button><div id="giaCode" style="margin-top:12px;text-align:center;font-family:monospace;font-size:24px;letter-spacing:3px;color:#34d399;background:#071327;border:1px dashed #1e3a5f;border-radius:10px;padding:12px;display:none"></div><button id="giaCopy" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#052e1c;border:1px solid #14532d;color:#34d399;font-weight:700;display:none">📋 نسخ الرمز</button><p id="giaMsg" style="font-size:12px;color:#94a3b8;margin-top:8px;min-height:16px"></p><hr style="border:0;border-top:1px solid #1e3a5f;margin:12px 0"><input id="giaCheck" placeholder="فحص رمز موجود" maxlength="8" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#020617;color:#fff;text-align:center;font-family:monospace;letter-spacing:2px"><button id="giaCheckBtn" style="width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#1e3a5f;color:#cfe3ff;font-weight:700">🔍 فحص</button></div>';
  document.body.appendChild(m);
  m.querySelector("#giaClose").onclick=()=>m.style.display="none";
  m.onclick=e=>{if(e.target===m)m.style.display="none";};
  m.querySelector("#giaGen").onclick=async()=>{
    const msg=m.querySelector("#giaMsg");msg.textContent="جاري التوليد...";
    try{const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ownerSub:"admin"})});
    const d=await r.json();
    if(d.success){const c=m.querySelector("#giaCode");c.textContent=d.code;c.style.display="block";m.querySelector("#giaCopy").style.display="block";msg.textContent="✅ رمز صالح لمدة 7 أيام";}
    else msg.textContent="❌ "+(d.message||"فشل");}catch(e){msg.textContent="❌ خطأ اتصال";}
  };
  m.querySelector("#giaCopy").onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(m.querySelector("#giaCode").textContent);m.querySelector("#giaMsg").textContent="✅ اننسخ الرمز";};
  m.querySelector("#giaCheckBtn").onclick=async()=>{
    const code=m.querySelector("#giaCheck").value.trim().toUpperCase();const msg=m.querySelector("#giaMsg");
    if(code.length<8){msg.textContent="الرمز قصير";return;}
    try{const r=await fetch(API+"?code="+encodeURIComponent(code));const d=await r.json();msg.textContent=d.valid?"✅ رمز صالح":"❌ غير صالح أو منتهي";}catch(e){msg.textContent="❌ خطأ اتصال";}
  };
  return m;
}
function inject(){
  if(document.getElementById("giaTabBtn")) return;
  const tab=document.querySelector("[data-t]"); if(!tab||!tab.parentElement) return;
  const b=document.createElement("button");b.id="giaTabBtn";b.textContent="🔑 رموز الدعوة";
  b.style.cssText="padding:8px 12px;border:0;border-radius:8px;background:#1e3a5f;color:#cfe3ff;font-weight:700;margin:2px";
  b.onclick=()=>{modal().style.display="flex";};
  tab.parentElement.appendChild(b);
}
setInterval(inject,800);
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
})();

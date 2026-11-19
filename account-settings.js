// GTXMOD — إعدادات الحساب
(function(){
const box=document.createElement("div");box.id="accountSettingsBox";
box.style.cssText="display:none;position:fixed;inset:0;background:#000d;z-index:10003;align-items:center;justify-content:center;padding:20px;overflow:auto";
box.innerHTML=`<div style="background:#101d32;color:white;padding:22px;border-radius:16px;width:100%;max-width:360px;border:1px solid #2874bd;direction:rtl;box-sizing:border-box">
<h2 style="margin:0 0 14px">⚙️ إعدادات الحساب</h2>
<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
<img id="setAvatar" alt="صورتك" style="width:60px;height:60px;border-radius:50%;object-fit:cover;background:#263d59">
<div id="setEmail" style="color:#8bbce8;font-size:13px;overflow-wrap:anywhere"></div></div>
<label>الاسم المعروض</label>
<input id="setName" maxlength="40" style="width:100%;padding:12px;margin:7px 0;box-sizing:border-box;border-radius:8px;border:1px solid #2874bd;background:#071a30;color:white">
<label>اليوزر (اختياري)</label>
<input id="setUsername" maxlength="20" placeholder="gtx_yahia" style="width:100%;padding:12px;margin:7px 0;box-sizing:border-box;border-radius:8px;border:1px solid #2874bd;background:#071a30;color:white;direction:ltr;text-align:left">
<p style="color:#8bbce8;font-size:12px;margin:4px 0">حروف إنجليزية صغيرة وأرقام و _ فقط (3-20)</p>
<button id="setSave" style="width:100%;padding:13px;background:#087bd0;color:white;border:0;border-radius:9px;font-size:16px;margin-top:10px">💾 حفظ التغييرات</button>
<button id="setClose" style="width:100%;padding:11px;margin-top:8px;background:#263d59;color:white;border:0;border-radius:9px">إغلاق</button>
<p id="setMsg" role="status" style="min-height:20px;margin:10px 0 0"></p></div>`;
document.body.appendChild(box);
const $=id=>document.getElementById(id);
async function openSettings(){
 $("accountPanel").style.display="none";box.style.display="flex";
 $("setMsg").textContent="جاري تحميل حسابك...";
 try{
  const r=await fetch("/api/google-session",{credentials:"same-origin"});
  const d=await r.json();
  if(!d.success||!d.user) throw new Error("سجل دخول أولاً.");
  if(d.user.picture) $("setAvatar").src=d.user.picture; else $("setAvatar").removeAttribute("src");
  $("setEmail").textContent=d.user.email||"";
  $("setName").value=d.user.name||"";$("setUsername").value=d.user.username||"";
  $("setMsg").textContent="";
 }catch(e){$("setMsg").textContent=e.message;}
}
$("setClose").onclick=()=>box.style.display="none";
$("setSave").onclick=async()=>{
 $("setMsg").textContent="جاري الحفظ...";
 try{
  const r=await fetch("/api/account-update",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$("setName").value,username:$("setUsername").value})});
  const d=await r.json();
  if(!r.ok||!d.success) throw new Error(d.message||"فشل الحفظ");
  paintGoogleAccount(d.user);
  $("setMsg").textContent="✅ تم حفظ حسابك!";
  setTimeout(()=>box.style.display="none",1200);
 }catch(e){$("setMsg").textContent=e.message;}
};
$("accountSettingsOpen").onclick=openSettings;
})();

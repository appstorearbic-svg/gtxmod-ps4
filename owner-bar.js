// GTXMOD — صاحب المنشور فوق الصورة
(function(){
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const st=document.createElement("style");
st.textContent=".gtx-owner{display:flex;align-items:center;gap:9px;padding:10px 12px;background:linear-gradient(90deg,#0d1f38,#0a1628);border-bottom:1px solid #17395f}.gtx-owner-av{width:34px;height:34px;border-radius:50%;object-fit:cover;background:#12233d;border:2px solid #2874bd;box-shadow:0 0 12px #087bd055;flex:0 0 auto}.gtx-owner-i{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.35}.gtx-owner-i b{font-size:13.5px;color:#eaf2ff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gtx-owner-i span{font-size:11px;color:#a78bfa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gtx-owner-tag{font-size:10.5px;padding:3px 9px;border-radius:20px;background:#087bd022;border:1px solid #2874bd;color:#60a5fa;white-space:nowrap}.gtx-owner-tag.adm{background:#fbbf2418;border-color:#fbbf2466;color:#fbbf24}";
document.head.appendChild(st);
window.gtxOwnerBar=function(m){
 const adm=(m.owner===undefined);
 const name=adm?"GTXMOD PS4":(m.owner||"مستخدم GTXMOD");
 const av=adm?"logo.jpg":(m.ownerAvatar||"logo.jpg");
 const un=adm?"إدارة الموقع":(m.ownerUsername?"@"+m.ownerUsername:"ناشر بالموقع");
 const tag=adm?'<span class="gtx-owner-tag adm">👑 الإدارة</span>':'<span class="gtx-owner-tag">🚀 ناشر</span>';
 return '<div class="gtx-owner"><img class="gtx-owner-av" src="'+E(av)+'" alt=""><div class="gtx-owner-i"><b>'+E(name)+'</b><span>'+E(un)+'</span></div>'+tag+'</div>';
};
})();

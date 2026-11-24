// GTXMOD — شارة NEW على المنشورات الجديدة (24 ساعة)
(function(){
const DAY=864e5;
const st=document.createElement("style");
st.textContent=`@keyframes gtxFloatNew{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-7px) rotate(2deg)}}
.gtx-new{position:absolute;top:8px;left:8px;z-index:6;background:#1d4ed8;color:#ef4444;font:900 12px/1 system-ui;padding:5px 9px;border-radius:7px;letter-spacing:1px;box-shadow:0 4px 12px #1d4ed866;animation:gtxFloatNew 2.2s ease-in-out infinite;pointer-events:none;direction:ltr}`;
document.head.appendChild(st);
function ts(m){if(m&&m.created){const t=Date.parse(String(m.created).replace(" ","T")+"Z");if(!isNaN(t))return t}
 if(m&&m.date){const t=Date.parse(m.date+"T00:00:00");if(!isNaN(t))return t}return 0}
function paint(){let L=[];try{L=mods}catch(e){}
 document.querySelectorAll(".mod-card[data-id]").forEach(c=>{
  const m=L.find(x=>String(x.id)===c.dataset.id);
  const box=c.querySelector(".mod-image")||c.querySelector(".gtx-media");
  if(!box)return;
  const t=ts(m),fresh=t>0&&(Date.now()-t)<DAY;
  let b=box.querySelector(".gtx-new");
  if(fresh&&!b){b=document.createElement("span");b.className="gtx-new";b.textContent="NEW";box.appendChild(b)}
  if(!fresh&&b)b.remove();
 })}
let t=null;function tick(){clearTimeout(t);t=setTimeout(paint,300)}
window.addEventListener("load",()=>{paint();new MutationObserver(tick).observe(document.body,{childList:true,subtree:true})});
})();

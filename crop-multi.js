(function(){
if(window.gtxCrop)return;
const cs=document.createElement("style");
cs.textContent="#gxCrop{position:fixed;inset:0;z-index:10010;display:none;align-items:center;justify-content:center;background:#000d;padding:16px;direction:rtl}#gxCrop.on{display:flex}.gx-box{background:#0e1e38;border:1px solid #2874bd;border-radius:16px;padding:16px;width:100%;max-width:360px;color:#fff}.gx-vp{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:12px;background:#0f172a;touch-action:none}.gx-vp>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}.gx-rect{position:absolute;border:2px solid #38d9f5;box-shadow:0 0 0 999px #0009;cursor:move}.gx-h{position:absolute;width:22px;height:22px;background:#38d9f5;border:2px solid #fff;border-radius:6px}.gx-h[data-h=nw]{left:-11px;top:-11px;cursor:nwse-resize}.gx-h[data-h=ne]{right:-11px;top:-11px;cursor:nesw-resize}.gx-h[data-h=sw]{left:-11px;bottom:-11px;cursor:nesw-resize}.gx-h[data-h=se]{right:-11px;bottom:-11px;cursor:nwse-resize}.gx-row{display:flex;gap:8px;margin-top:12px}.gx-b{flex:1;padding:11px;border:0;border-radius:10px;font-weight:700;color:#fff}.gx-ok{background:linear-gradient(90deg,#087bd0,#2563eb)}.gx-cancel{background:#263d59}";
document.head.appendChild(cs);
const cr=document.createElement("div");cr.id="gxCrop";
cr.innerHTML='<div class="gx-box"><b style="color:#60a5fa" id="gxTitle">✂️ قص الصورة</b><div class="gx-vp" id="gxVp"><img id="gxImg" alt=""><div class="gx-rect" id="gxR"><i class="gx-h" data-h="nw"></i><i class="gx-h" data-h="ne"></i><i class="gx-h" data-h="sw"></i><i class="gx-h" data-h="se"></i></div></div><div class="gx-row"><button class="gx-b gx-ok" id="gxOk">✅ اعتماد</button><button class="gx-b gx-cancel" id="gxCancel">تخطي</button></div></div>';
document.body.appendChild(cr);
const vp=cr.querySelector("#gxVp"),img=cr.querySelector("#gxImg"),R=cr.querySelector("#gxR");
let imgEl=null,iw=0,ih=0,b=1,ox=0,oy=0,Vw=0,rect={x:0,y:0,w:0,h:0},mode=null,sx=0,sy=0,sr=null,cb=null;
const draw=()=>{R.style.left=rect.x+"px";R.style.top=rect.y+"px";R.style.width=rect.w+"px";R.style.height=rect.h+"px";};
vp.addEventListener("pointerdown",e=>{mode=(e.target.dataset&&e.target.dataset.h)||"move";sx=e.clientX;sy=e.clientY;sr={...rect};vp.setPointerCapture(e.pointerId);e.preventDefault();});
vp.addEventListener("pointermove",e=>{if(!mode)return;const dx=e.clientX-sx,dy=e.clientY-sy,M=40;let{x,y,w,h}=sr;
 if(mode==="move"){x=Math.min(Math.max(0,sr.x+dx),Vw-w);y=Math.min(Math.max(0,sr.y+dy),Vw-h);}
 else{if(mode.includes("w")){const nx=Math.min(Math.max(0,sr.x+dx),sr.x+sr.w-M);w=sr.x+sr.w-nx;x=nx;}
 if(mode.includes("e"))w=Math.min(Math.max(M,sr.w+dx),Vw-sr.x);
 if(mode.includes("n")){const ny=Math.min(Math.max(0,sr.y+dy),sr.y+sr.h-M);h=sr.y+sr.h-ny;y=ny;}
 if(mode.includes("s"))h=Math.min(Math.max(M,sr.h+dy),Vw-sr.y);
 x=Math.max(0,x);y=Math.max(0,y);}
 rect={x,y,w,h};draw();});
vp.addEventListener("pointerup",()=>mode=null);
vp.addEventListener("pointercancel",()=>mode=null);
cr.querySelector("#gxCancel").onclick=()=>{cr.classList.remove("on");cb&&cb(null);};
cr.querySelector("#gxOk").onclick=()=>{
 let ix=Math.max(0,Math.min(iw,(rect.x-ox)/b)),iy=Math.max(0,Math.min(ih,(rect.y-oy)/b));
 let cw=Math.max(1,Math.min(iw-ix,rect.w/b)),ch=Math.max(1,Math.min(ih-iy,rect.h/b));
 const sc=Math.min(800,Math.max(cw,ch))/Math.max(cw,ch);
 const c=document.createElement("canvas");c.width=Math.round(cw*sc);c.height=Math.round(ch*sc);
 c.getContext("2d").drawImage(imgEl,ix,iy,cw,ch,0,0,c.width,c.height);
 cr.classList.remove("on");cb&&cb(c.toDataURL("image/jpeg",.85));};
window.gtxCrop=(file,done)=>{cb=done;const u=URL.createObjectURL(file);imgEl=new Image();
 imgEl.onload=()=>{iw=imgEl.width;ih=imgEl.height;cr.classList.add("on");Vw=vp.clientWidth;b=Math.min(Vw/iw,Vw/ih);ox=(Vw-iw*b)/2;oy=(Vw-ih*b)/2;img.src=u;rect={x:ox,y:oy,w:iw*b,h:ih*b};draw();};
 imgEl.src=u;};
})();

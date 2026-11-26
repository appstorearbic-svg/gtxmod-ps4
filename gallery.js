(function(){
if(window.__gtxGal)return;window.__gtxGal=1;
const st=document.createElement("style");
st.textContent=".gtx-media .gtx-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.4,0,.2,1);will-change:transform}.gtx-gal-dots{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:4}.gtx-gal-dots i{width:7px;height:7px;border-radius:50%;background:#ffffff66;transition:.2s;cursor:pointer}.gtx-gal-dots i.on{background:#38bdf8;transform:scale(1.3)}.gtx-gal-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:4;width:30px;height:30px;border:0;border-radius:50%;background:#050505b0;color:#fff;font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:.2s}.gtx-media:hover .gtx-gal-nav{opacity:1}.gtx-gal-prev{right:8px}.gtx-gal-next{left:8px}";
document.head.appendChild(st);
const timers=new Map();
function init(el){
 if(el.dataset.galDone)return;el.dataset.galDone="1";
 let imgs=[];try{imgs=JSON.parse(el.dataset.images||"[]")}catch(e){}
 imgs=imgs.filter(Boolean);
 if(imgs.length<2||el.querySelector("video"))return;
 const first=el.querySelector("img");if(!first)return;
 const slides=[first];first.classList.add("gtx-slide");first.style.transform="translateX(0)";
 for(let i=1;i<imgs.length;i++){const im=document.createElement("img");im.className="gtx-slide";im.src=imgs[i];im.loading="lazy";im.style.transform="translateX(-100%)";el.appendChild(im);slides.push(im);}
 const dots=document.createElement("div");dots.className="gtx-gal-dots";dots.innerHTML=imgs.map((_,i)=>'<i class="'+(i===0?"on":"")+'"></i>').join("");el.appendChild(dots);
 const prev=document.createElement("button");prev.className="gtx-gal-nav gtx-gal-prev";prev.textContent="›";
 const next=document.createElement("button");next.className="gtx-gal-nav gtx-gal-next";next.textContent="‹";
 el.appendChild(prev);el.appendChild(next);
 let idx=0;const wait=5000+Math.random()*2000;
 function show(n){
  const old=slides[idx];idx=(n+slides.length)%slides.length;const nw=slides[idx];
  nw.style.transition="none";nw.style.transform="translateX(-100%)";void nw.offsetWidth;
  nw.style.transition="";old.style.transform="translateX(100%)";nw.style.transform="translateX(0)";
  setTimeout(()=>{old.style.transition="none";old.style.transform="translateX(-100%)";},650);
  dots.querySelectorAll("i").forEach((d,i)=>d.classList.toggle("on",i===idx));
  schedule();
 }
 function schedule(){clearTimeout(timers.get(el));timers.set(el,setTimeout(()=>show(idx+1),wait));}
 prev.onclick=e=>{e.stopPropagation();show(idx-1);};
 next.onclick=e=>{e.stopPropagation();show(idx+1);};
 dots.querySelectorAll("i").forEach((d,i)=>d.onclick=e=>{e.stopPropagation();show(i);});
 schedule();
}
function scan(){document.querySelectorAll(".gtx-media[data-images]").forEach(init);}
scan();
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
document.addEventListener("visibilitychange",()=>{if(document.hidden)timers.forEach(t=>clearTimeout(t));else scan();});
})();

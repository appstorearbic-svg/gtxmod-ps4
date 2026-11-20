// GTXMOD — زر تلكرام طائر بسيط
(function(){
    const btn=document.createElement("a");
    btn.href="https://t.me/GTXMOD";
    btn.target="_blank";
    btn.rel="noopener noreferrer";
    btn.id="gtxTgFloat";
    btn.title="قناة GTX MOD";
    
    // تصميم الدائرة الزرقاء
    btn.style.cssText=`
        position:fixed;
        bottom:20px;
        left:20px;
        z-index:9998;
        width:56px;
        height:56px;
        border-radius:50%;
        background:#2AABEE;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 4px 12px rgba(0,0,0,.4);
        text-decoration:none;
        animation:gtxFloat 3s ease-in-out infinite;
    `;
    
    // أيقونة تلكرام SVG
    btn.innerHTML=`<svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.76 12.82c-.18.83-.68 1.03-1.36.64l-3.74-2.77-1.8 1.74c-.2.2-.37.37-.74.37z"/></svg>`;
    
    document.body.appendChild(btn);
    
    // حركة الطفو
    const st=document.createElement("style");
    st.textContent=`@keyframes gtxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`;
    document.head.appendChild(st);
})();

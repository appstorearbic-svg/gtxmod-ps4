// GTXMOD — Ad Banner (Adsterra/MediaFire)
(function(){
  const SCRIPT_URL = "https://bicea.org/14/ada7d27f6b24462f49d56999033be3ff";
  
  // إنشاء حاوية الإعلان
  const container = document.createElement("div");
  container.id = "gtx-ad-banner";
  container.style.cssText = "width:100%;max-width:980px;margin:18px auto;padding:0 12px;min-height:90px;display:flex;align-items:center;justify-content:center";
  
  // إدخال الحاوية قبل footer مباشرة
  const footer = document.querySelector("footer");
  if (footer) {
    footer.parentNode.insertBefore(container, footer);
  } else {
    document.body.appendChild(container);
  }
  
  // تحميل سكربت الإعلان بطريقة آمنة
  const script = document.createElement("script");
  script.src = SCRIPT_URL;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  container.appendChild(script);
})();

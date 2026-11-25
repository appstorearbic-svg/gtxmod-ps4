(function(){
try{const c=JSON.parse(localStorage.getItem("gtx_mods_cache")||"null");if(Array.isArray(c)&&c.length)mods=c;}catch(e){}
const base=window.render;
if(typeof base==="function")window.render=function(){const r=base.apply(this,arguments);try{localStorage.setItem("gtx_mods_cache",JSON.stringify(mods))}catch(e){}return r};
try{render()}catch(e){}
})();

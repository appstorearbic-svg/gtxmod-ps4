
// --- دالة مزامنة اللايك مع المفضلة ---
async function syncLikeAndFav(postId, isNowLiked) {
    try {
        // 1. تحديث حالة اللايك
        await fetch('/api/like', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ postId, action: isNowLiked ? 'like' : 'unlike' })
        });
        // 2. تحديث حالة المفضلة (نفس منطق اللايك)
        await fetch('/api/favorites', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ postId, action: isNowLiked ? 'add' : 'remove' })
        });
    } catch(e) { console.error("خطأ في المزامنة:", e); }
}

const grid = document.getElementById('modGrid');
const empty = document.getElementById('emptyState');
const count = document.getElementById('resultCount');

let mods = [];
let selected = 'سيارات';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;',
  '"':'&quot;', "'":'&#39;'
}[c]));

const isViking = u => /(^|\.)vikingfile\.com$|(^|\.)vik1ngfile\.site$/i.test((()=>{try{return new URL(String(u||"")).hostname}catch(e){return ""}})());
const safeUrl = s => {
  const v = String(s || '');
  return /^(https?:\/\/|assets\/|\.\/|data:image\/)/i.test(v) ? esc(v) : '#';
};
try{const _c=JSON.parse(localStorage.getItem("gtx_mods_cache")||"null");if(Array.isArray(_c)&&_c.length){mods=_c;render();}}catch(e){}

function render() {
  const shown = mods.filter(m =>
    !selected || m.category === selected
  );

  count.textContent = shown.length + ' مود';
  empty.classList.toggle('hidden', shown.length > 0);

  grid.innerHTML = shown.map(m => `
    <article class="mod-card" data-id="${esc(m.id)}">

      <div class="mod-image">
        <img src="${safeUrl(m.image)}"
             alt="${esc(m.name)}"
             loading="lazy">
        <span class="file-badge">
          ${esc(m.fileType || 'MOD')}
        </span>
      </div>

      <div class="mod-content">

        <h3 class="mod-title">
          ${esc(m.name)}
        </h3>

        <div style="
          display:inline-block;
          color:#60a5fa;
          font-weight:bold;
          margin:5px 0 10px;
          direction:rtl;">
          #${esc(m.category || 'غير مصنف')}
        </div>

        <p class="mod-desc">
          ${esc(m.description || 'مود GTA V لجهاز PS4')}
        </p>

        <div class="meta">
          <span>🎮 GTA V (PS4)</span>
          <span>▣ ${esc(m.fileType || 'ZIP')}</span>
          <span>⇩ ${esc(m.size || '')}</span>
        </div>

        

        <a class="download"
           href="${safeUrl(m.download)}"
           download>
          ⬇ تحميل المود
        </a>

      </div>
    </article>
  `).join('');
}

fetch('./mods.json')
  .then(r => {
    if (!r.ok) throw new Error('mods.json not found');
    return r.json();
  })
  .then(data => {
    mods = Array.isArray(data) ? data : [];
    render();
    if (window.gtxLoadCommunity) window.gtxLoadCommunity();
  })
  .catch(err => {
    console.error(err);
    mods = [];
    render();
  });

document.querySelectorAll('.category').forEach(btn => {
  btn.onclick = () => {
    selected = btn.dataset.category; gtxFavoritesOnly=false; gtxType="";
    document.querySelector(".section-heading h2").textContent="🔥 أحدث المنشورات";
    setTimeout(()=>{try{render()}catch(e){}},250);

    document.querySelectorAll('.category').forEach(x =>
      x.classList.toggle('active', x === btn)
    );

    render();
  };
});

document.getElementById('filterBtn').onclick = () => {
  selected = '';

  document.querySelectorAll('.category').forEach(x =>
    x.classList.remove('active')
  );

  render();
};


const menuPanel = document.createElement('div');
menuPanel.id = 'gtxMenu';
menuPanel.style.cssText = 'display:none;position:fixed;top:65px;right:12px;z-index:9999;background:#101d32;border:1px solid #2874bd;border-radius:14px;padding:15px;min-width:190px;box-shadow:0 10px 35px #000a;color:white';

menuPanel.innerHTML = `
  <h3 style="margin:5px 0 15px">GTXMOD PS4</h3>
  <button id="googleLoginOpen" style="width:100%;padding:13px;background:#087bd0;color:white;border:0;border-radius:9px;font-size:16px">🔐 تسجيل دخول</button>
  <button id="googleLogout" style="display:none;width:100%;padding:13px;margin-top:8px;background:#263d59;color:white;border:0;border-radius:9px;font-size:16px">تسجيل الخروج</button>
  <button id="adminOpen" style="width:100%;padding:13px;margin-top:8px;background:#1769aa;color:white;border:0;border-radius:9px;font-size:16px">👤 المدير</button>
`;


document.body.appendChild(menuPanel);

// قائمة حساب المستخدم
const accountPanel = document.createElement("div");
accountPanel.id = "accountPanel";
accountPanel.style.cssText = "display:none;position:fixed;top:65px;left:12px;z-index:10001;background:#101d32;border:1px solid #2874bd;border-radius:14px;padding:16px;width:260px;max-width:calc(100vw - 48px);box-shadow:0 10px 35px #000a;color:white;direction:rtl";
accountPanel.innerHTML = `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:15px">
    <img id="accountMenuAvatar" alt="الصورة الشخصية" style="width:52px;height:52px;border-radius:50%;object-fit:cover;background:#263d59">
    <div style="min-width:0">
      <div id="accountMenuName" style="font-weight:bold;overflow-wrap:anywhere">حسابي</div>
      <div id="accountMenuUsername" style="color:#8bbce8;font-size:13px;overflow-wrap:anywhere"></div>
    </div>
  </div>
  <button id="accountSettingsOpen" style="width:100%;padding:12px;background:#1769aa;color:white;border:0;border-radius:9px;font-size:15px">⚙️ إعدادات الحساب</button>
  <button id="accountMenuLogout" style="width:100%;padding:12px;margin-top:8px;background:#263d59;color:white;border:0;border-radius:9px;font-size:15px">🚪 تسجيل الخروج</button>
`;
document.body.appendChild(accountPanel);


// Google account sign-in (Google Identity Services)
const googleLoginBox = document.createElement("div");
googleLoginBox.id = "googleLoginBox";
googleLoginBox.style.cssText = "display:none;position:fixed;inset:0;background:#000d;z-index:10002;align-items:center;justify-content:center;padding:20px";
googleLoginBox.innerHTML = `<div class="google-login-card">
  <h2>تسجيل الدخول إلى GTXMOD</h2>
  <p>اختر حساب Google للدخول وحفظ حسابك على هذا الجهاز.</p>
  <div id="googleButtonHost" style="display:flex;justify-content:center;min-height:45px"></div>
  <p id="googleLoginMessage" role="status"></p>
  <button class="google-close" id="googleLoginClose">إغلاق</button>
</div>`;
document.body.appendChild(googleLoginBox);

const accountAvatar = document.getElementById("accountAvatar");
const accountInitial = document.getElementById("accountInitial");
const accountBtn = document.getElementById("accountBtn");
const googleLoginOpen = document.getElementById("googleLoginOpen");
const googleLogout = document.getElementById("googleLogout");
let gtxGoogleUser = null;

function paintGoogleAccount(user) {
  gtxGoogleUser = user || null;

  if (user) {
    if (user.picture) {
      accountAvatar.src = user.picture;
      accountAvatar.hidden = false;
      accountInitial.hidden = true;
      document.getElementById("accountMenuAvatar").src = user.picture;
    } else {
      accountAvatar.hidden = true;
      accountInitial.hidden = false;
      accountInitial.textContent = "👤";
      document.getElementById("accountMenuAvatar").removeAttribute("src");
    }

    const displayName = user.name || user.email || "مستخدم GTXMOD";
    document.getElementById("accountMenuName").textContent = displayName;
    document.getElementById("accountMenuUsername").textContent =
      user.username ? "@" + user.username : "لم يتم تعيين يوزر";

    accountBtn.title = displayName;
    googleLoginOpen.textContent = "👤 " + displayName;
    googleLogout.style.display = "block";
  } else {
    accountAvatar.hidden = true;
    accountAvatar.removeAttribute("src");
    accountInitial.hidden = false;
    accountInitial.textContent = "👤";
    accountBtn.title = "تسجيل الدخول";
    googleLoginOpen.textContent = "🔐 تسجيل دخول";
    googleLogout.style.display = "none";
    accountPanel.style.display = "none";
  }
}

async function loadGoogleSession() {
  try {
    const r = await fetch("/api/google-session", {credentials:"same-origin"});
    const data = await r.json();
    if (r.ok && data.success && data.user) paintGoogleAccount(data.user);
  } catch (e) { console.warn("Google session unavailable", e); }
}
loadGoogleSession();

function showGoogleLogin() {
  menuPanel.style.display = "none";
  googleLoginBox.style.display = "flex";
  const host = document.getElementById("googleButtonHost");
  const msg = document.getElementById("googleLoginMessage");
  host.innerHTML = "";
  msg.textContent = "";
  const clientId = document.querySelector('meta[name="google-client-id"]')?.content?.trim();
  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
    msg.textContent = "يلزم إعداد Google Client ID للموقع أولاً.";
    return;
  }
  const draw = () => {
    if (!window.google?.accounts?.id) {
      msg.textContent = "تعذر تحميل خدمة Google. حدّث الصفحة وحاول مجدداً.";
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async response => {
        msg.textContent = "جاري التحقق من الحساب...";
        try {
          const result = await fetch("/api/google-auth", {
            method:"POST", credentials:"same-origin",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({credential:response.credential})
          });
          const payload = await result.json();
          if (!result.ok || !payload.success) throw new Error(payload.message || "فشل تسجيل الدخول");
          paintGoogleAccount(payload.user);
          googleLoginBox.style.display = "none";
        } catch (err) { msg.textContent = err.message; }
      }
    });
    google.accounts.id.renderButton(host, {theme:"filled_blue",size:"large",shape:"pill",text:"continue_with",locale:"ar"});
  };
  if (window.google?.accounts?.id) draw();
  else {
    let attempts = 0;
    const wait = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id || attempts > 30) {
        clearInterval(wait);
        draw();
      }
    }, 200);
  }
}
googleLoginOpen.onclick = showGoogleLogin;
accountBtn.onclick = () => {
  if (gtxGoogleUser) {
    menuPanel.style.display = "none";
    accountPanel.style.display =
      accountPanel.style.display === "block" ? "none" : "block";
  } else {
    showGoogleLogin();
  }
};

document.getElementById("accountMenuLogout").onclick = () => googleLogout.click();

document.getElementById("accountSettingsOpen").onclick = () => {
  alert("سنضيف شاشة إعدادات الحساب في الخطوة التالية.");
};

document.addEventListener("click", event => {
  if (!accountPanel.contains(event.target) && !accountBtn.contains(event.target)) {
    accountPanel.style.display = "none";
  }
});
document.getElementById("googleLoginClose").onclick = () => googleLoginBox.style.display = "none";
googleLogout.onclick = async () => {
  try {
    await fetch("/api/google-logout", {method:"POST",credentials:"same-origin"});
    paintGoogleAccount(null);
    menuPanel.style.display = "none";
  } catch (e) { alert("تعذر تسجيل الخروج"); }
};


const loginBox = document.createElement('div');
loginBox.id = 'adminLogin';
loginBox.style.cssText = 'display:none;position:fixed;inset:0;background:#000c;z-index:10000;align-items:center;justify-content:center;padding:20px';

loginBox.innerHTML = `
<div style="background:#101d32;color:white;padding:24px;border-radius:16px;width:100%;max-width:350px">
<h2>دخول المدير</h2>
<input id="adminUser" placeholder="اسم المستخدم" style="width:100%;padding:13px;margin:8px 0;box-sizing:border-box">
<input id="adminPass" type="password" placeholder="كلمة المرور" style="width:100%;padding:13px;margin:8px 0;box-sizing:border-box">
<button id="adminLoginBtn" style="width:100%;padding:13px;background:#1676c5;color:white;border:0;border-radius:8px">تسجيل الدخول</button>
<button id="adminClose" style="width:100%;padding:10px;margin-top:8px">إغلاق</button>
<p id="adminMessage"></p>
</div>`;

document.body.appendChild(loginBox);

document.getElementById('menuBtn').onclick = () => {
  menuPanel.style.display =
    menuPanel.style.display === 'none' ? 'block' : 'none';
};

document.getElementById('adminOpen').onclick = () => {
  menuPanel.style.display = 'none';
  loginBox.style.display = 'flex';
};

document.getElementById('adminClose').onclick = () => {
  loginBox.style.display = 'none';
};

document.getElementById('adminLoginBtn').onclick = async () => {
  const msg = document.getElementById('adminMessage');
  msg.textContent = 'جاري التحقق...';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        username: document.getElementById('adminUser').value,
        password: document.getElementById('adminPass').value
      })
    });

    const result = await response.json();
    msg.textContent = result.success
      ? 'تم تسجيل الدخول بنجاح'
      : (result.message || 'فشل تسجيل الدخول');
  } catch {
    msg.textContent = 'تعذر الاتصال بالخادم';
  }
};


// GTXMOD ADMIN PUBLISH PANEL
let adminCredentials = null;

const adminPanel = document.createElement("div");
adminPanel.id = "adminPanel";
adminPanel.style.cssText = "display:none;position:fixed;inset:0;z-index:10001;background:#000e;overflow:auto;padding:18px;box-sizing:border-box";
adminPanel.innerHTML = `
<div style="max-width:430px;margin:25px auto;background:#101d32;color:white;padding:22px;border-radius:16px">
<h2>لوحة المدير - GTXMOD</h2>
<form id="publishForm">
<label>اسم المود</label>
<input name="name" required placeholder="اسم المود" style="width:100%;padding:12px;box-sizing:border-box;margin:7px 0">
<label>التصنيف</label>
<select name="category" required style="width:100%;padding:12px;margin:7px 0">
<option value="سيارات">سيارات</option>
<option value="شخصيات">شخصيات</option>
<option value="مابات">مابات</option>
<option value="الاخرى">الاخرى</option>
</select>
<label>تفاصيل المود</label>
<textarea name="description" placeholder="اكتب تفاصيل المود" style="width:100%;padding:12px;box-sizing:border-box;margin:7px 0"></textarea>
<label>صورة الغلاف</label>
<input name="image" type="file" accept="image/*" required style="width:100%;margin:10px 0">
<label>ملف ZIP</label>
<input name="zip" type="file" accept=".zip" required style="width:100%;margin:10px 0">
<label>فيديو اختياري</label>
<input name="video" type="file" accept="video/*" style="width:100%;margin:10px 0">
<button type="submit" style="width:100%;padding:14px;background:#087bd0;color:white;border:0;border-radius:9px;margin-top:15px">🚀 نشر المود</button>
</form>
<p id="publishMessage"></p>
<button id="adminPanelClose" style="width:100%;padding:12px">إغلاق</button>
</div>`;
document.body.appendChild(adminPanel);

document.getElementById("adminPanelClose").onclick = () => {
  adminPanel.style.display = "none";
};

document.getElementById("adminLoginBtn").onclick = async () => {
  const msg = document.getElementById("adminMessage");
  const username = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;
  msg.textContent = "جاري التحقق...";
  try {
    const response = await fetch("/api/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username,password})
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      msg.textContent = result.message || "بيانات الدخول غير صحيحة";
      return;
    }
    adminCredentials = {username,password};
    loginBox.style.display = "none";
    adminPanel.style.display = "block";
    msg.textContent = "";
  } catch(e) {
    msg.textContent = "تعذر الاتصال بالخادم";
  }
};

document.getElementById("publishForm").onsubmit = async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const msg = document.getElementById("publishMessage");
  if (!adminCredentials) {
    msg.textContent = "سجل دخول المدير من جديد";
    return;
  }
  const data = new FormData(form);
  data.append("username", adminCredentials.username);
  data.append("password", adminCredentials.password);
  msg.textContent = "جاري رفع الملفات والنشر...";
  try {
    const response = await fetch("/api/publish", {
      method:"POST",
      body:data
    });
    const result = await response.json();
    msg.textContent = result.message || "انتهت العملية";
    if (response.ok && result.success) {
      form.reset();
      setTimeout(() => location.reload(), 2500);
    }
  } catch(err) {
    msg.textContent = "فشل الاتصال: " + err.message;
  }
};

// ===== GTXMOD ADMIN MANAGEMENT =====
const managerArea = document.createElement("section");
managerArea.id = "managerArea";
managerArea.style.cssText = "margin-top:18px;padding:15px;background:#071a30;border:1px solid #1760a0;border-radius:12px";
managerArea.innerHTML = `
<h3>الإدارة</h3>
<div id="managerList">اضغط تحديث المنشورات لعرضها</div>
<button id="refreshMods" type="button" style="width:100%;padding:12px;margin:8px 0;background:#1769aa;color:white;border:0;border-radius:8px">🔄 تحديث المنشورات</button>
`;
adminPanel.querySelector("div").appendChild(managerArea);

const adminTabs = document.createElement("div");
adminTabs.style.cssText = "display:flex;gap:8px;margin:12px 0";
adminTabs.innerHTML = `
<button id="showManage" type="button" style="flex:1;padding:11px;background:#1769aa;color:white;border:0;border-radius:8px">الإدارة</button>
<button id="showPublish" type="button" style="flex:1;padding:11px;background:#087bd0;color:white;border:0;border-radius:8px">الرفع</button>`;
adminPanel.querySelector("h2").after(adminTabs);

const publishForm = document.getElementById("publishForm");
document.getElementById("showManage").onclick = () => {
  managerArea.style.display = "block";
  publishForm.style.display = "none";
};
document.getElementById("showPublish").onclick = () => {
  managerArea.style.display = "none";
  publishForm.style.display = "block";
};

async function managerRequest(action, values={}) {
  const data = new FormData();
  data.set("username",adminCredentials.username);
  data.set("password",adminCredentials.password);
  if (action) data.set("action",action);
  Object.entries(values).forEach(([k,v]) => {
    if (v !== undefined && v !== null) data.set(k,v);
  });
  const response = await fetch("/api/manage",{
    method:"POST",body:data
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error(result.message || "فشلت العملية");
  return result;
}

async function loadManagerMods() {
  const box = document.getElementById("managerList");
  box.textContent = "جاري تحميل المنشورات...";
  try {
    const requestData = new FormData();
    requestData.set("username",adminCredentials.username);
    requestData.set("password",adminCredentials.password);
    requestData.set("action","list");
    const response = await fetch("/api/manage",{method:"POST",body:requestData});
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "فشل التحميل");

    box.innerHTML = "";
    if (!result.mods.length) {
      box.textContent = "لا توجد منشورات";
      return;
    }

    result.mods.forEach(mod => {
      const item = document.createElement("div");
      item.style.cssText = "padding:12px;margin:9px 0;background:#102b49;border-radius:9px";
      const title = document.createElement("b");
      title.textContent = mod.name + " — " + mod.category;
      const edit = document.createElement("button");
      edit.textContent = "✏️ تعديل";
      edit.style.cssText = "padding:9px;margin:8px 5px;background:#087bd0;color:white;border:0;border-radius:7px";
      const del = document.createElement("button");
      del.textContent = "🗑 حذف";
      del.style.cssText = "padding:9px;margin:8px 5px;background:#a52b38;color:white;border:0;border-radius:7px";
      edit.onclick = () => editMod(mod);
      del.onclick = async () => {
        if (!confirm("متأكد تريد حذف المنشور: " + mod.name + " ؟")) return;
        try {
          await managerRequest("delete",{id:mod.id});
          alert("تم حذف المنشور");
          await loadManagerMods();
          await refreshPublicMods();
        } catch(e) { alert(e.message); }
      };
      item.append(title,document.createElement("br"),edit,del);
      box.appendChild(item);
    });
  } catch(e) {
    box.textContent = "خطأ: " + e.message;
  }
}

async function editMod(mod) {
  const name = prompt("اسم المنشور:",mod.name);
  if (name === null) return;
  const category = prompt("التصنيف: سيارات أو شخصيات أو مابات أو الاخرى",mod.category);
  if (category === null) return;
  const description = prompt("وصف المنشور:",mod.description || "");
  if (description === null) return;
  if (!["سيارات","شخصيات","مابات","الاخرى"].includes(category)) {
    alert("التصنيف غير صحيح");
    return;
  }

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  const zipInput = document.createElement("input");
  zipInput.type = "file";
  zipInput.accept = ".zip,application/zip";

  const choose = confirm("هل تريد تغيير صورة المنشور؟");
  let image = null, zip = null;
  if (choose) {
    image = await new Promise(resolve => {
      imageInput.onchange = () => resolve(imageInput.files[0] || null);
      imageInput.click();
    });
  }
  if (confirm("هل تريد تغيير ملف ZIP؟")) {
    zip = await new Promise(resolve => {
      zipInput.onchange = () => resolve(zipInput.files[0] || null);
      zipInput.click();
    });
  }

  try {
    const data = new FormData();
    data.set("username",adminCredentials.username);
    data.set("password",adminCredentials.password);
    data.set("action","update");
    data.set("id",mod.id);
    data.set("name",name);
    data.set("category",category);
    data.set("description",description);
    if (image) data.set("image",image);
    if (zip) data.set("zip",zip);
    const response = await fetch("/api/manage",{method:"POST",body:data});
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "فشل التعديل");
    alert(result.message);
    await loadManagerMods();
    await refreshPublicMods();
  } catch(e) { alert(e.message); }
}

document.getElementById("refreshMods").onclick = loadManagerMods;

async function refreshPublicMods() {
  try {
    const r = await fetch("./mods.json?time=" + Date.now());
    mods = await r.json();
    render();
    if (window.gtxLoadCommunity) window.gtxLoadCommunity();
  } catch(e) { console.error(e); }
}

// استبدال معالج الدخول القديم بمعالج واحد
document.getElementById("adminLoginBtn").onclick = async () => {
  const msg = document.getElementById("adminMessage");
  const username = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value;
  msg.textContent = "جاري التحقق...";
  try {
    const response = await fetch("/api/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username,password})
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      msg.textContent = result.message || "بيانات الدخول غير صحيحة";
      return;
    }
    adminCredentials = {username,password};
    loginBox.style.display = "none";
    adminPanel.style.display = "block";
    managerArea.style.display = "block";
    publishForm.style.display = "none";
    await loadManagerMods();
  } catch(e) {
    msg.textContent = "تعذر الاتصال بالخادم";
  }
};

// ===== DOWNLOAD PROGRESS =====
grid.addEventListener("click", async e => {
  const link = e.target.closest("a.download");
  if(link && isViking(link.href)) return; // VikingFile: افتح الصفحة مباشرة
  if (!link) return;
  e.preventDefault();
  const url = link.href;
  if (new URL(url,window.location.href).origin !== window.location.origin) {
    const opened = window.open(url,"_blank","noopener,noreferrer");
    if (!opened) window.location.href = url;
    return;
  }
  const oldText = link.textContent;
  link.style.pointerEvents = "none";
  link.textContent = "جاري التحميل 0%";

  const xhr = new XMLHttpRequest();
  xhr.open("GET",url);
  xhr.responseType = "blob";
  xhr.onprogress = ev => {
    if (ev.lengthComputable) {
      const percent = Math.round(ev.loaded / ev.total * 100);
      link.textContent = "جاري التحميل " + percent + "%";
      link.style.background = `linear-gradient(to left,#079b60 ${percent}%,#087df1 ${percent}%)`;
    } else {
      link.textContent = "جاري تحميل الملف...";
    }
  };
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const blobUrl = URL.createObjectURL(xhr.response);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop() || "mod.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl),60000);
      link.textContent = "اكتمل التحميل 100% ✓";
    } else {
      link.textContent = "فشل التحميل - حاول مجدداً";
    }
    link.style.pointerEvents = "";
  };
  xhr.onerror = () => {
    link.textContent = "تعذر التحميل - حاول مجدداً";
    link.style.pointerEvents = "";
  };
  xhr.send();
});

// ===== CATEGORIES, FILTERS, LIKES & FAVORITES =====
const GTX_LIKES_KEY = "gtxmod_likes_v1";
const GTX_FAV_KEY = "gtxmod_favorites_v1";

function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch { return {}; }
}
let gtxLikes = readStore(GTX_LIKES_KEY);
let gtxFavorites = readStore(GTX_FAV_KEY);
let gtxFavoritesOnly = false;
let gtxSort = "high";
let gtxType = "";
let gtxMinSize = 0;
let gtxMaxSize = Infinity;

function saveGTXStore() {
  localStorage.setItem(GTX_LIKES_KEY,JSON.stringify(gtxLikes));
  localStorage.setItem(GTX_FAV_KEY,JSON.stringify(gtxFavorites));
}
function modSizeMB(m) {
  const match = String(m.size || "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

// التصنيفات قابلة للسحب أفقياً
const categoryNav = document.getElementById("categoryNav");
categoryNav.style.cssText += ";overflow-x:auto;flex-wrap:nowrap;justify-content:flex-start;white-space:nowrap;scrollbar-width:none;touch-action:pan-x;cursor:grab";
categoryNav.querySelectorAll(".category").forEach(b => {
  b.style.flex = "0 0 auto";
});
let navDown = false, navStart = 0, navScroll = 0;
categoryNav.addEventListener("pointerdown",e => {
  navDown = true;
  navStart = e.clientX;
  navScroll = categoryNav.scrollLeft;
  categoryNav.style.cursor = "grabbing";
});
categoryNav.addEventListener("pointermove",e => {
  if (!navDown) return;
  categoryNav.scrollLeft = navScroll - (e.clientX-navStart);
});
["pointerup","pointercancel","pointerleave"].forEach(ev =>
  categoryNav.addEventListener(ev,() => {
    navDown = false;
    categoryNav.style.cursor = "grab";
  })
);

// لوحة التصفية
const filterPanel = document.createElement("div");
filterPanel.id = "gtxFilters";
filterPanel.style.cssText = "display:none;position:fixed;inset:0;z-index:10002;background:#000c;overflow:auto;padding:18px;box-sizing:border-box";
filterPanel.innerHTML = `
<div style="max-width:420px;margin:35px auto;background:#101d32;color:white;padding:20px;border:1px solid #1760a0;border-radius:15px">
<h2>⚑ تصفية المنشورات</h2>
<label>اللعبة</label>
<select id="filterGame" style="width:100%;padding:12px;margin:8px 0">
<option value="GTAV">GTA V</option>
</select>
<label>المود</label>
<select id="filterType" style="width:100%;padding:12px;margin:8px 0">
<option value="">الكل</option>
<option>سيارات</option><option>طيارات</option><option>موطورات</option>
<option>قوارب</option><option>شخصيات</option><option>مابات</option><option>الاخرى</option>
</select>
<label>حجم الملف</label>
<select id="filterSize" style="width:100%;padding:12px;margin:8px 0">
<option value="all">كل الأحجام</option>
<option value="1-10">1-10 MB</option>
<option value="10-30">10-30 MB</option>
<option value="30-60">30-60 MB</option>
<option value="60-1000">60-1000 MB</option>
</select>
<label>ترتيب التفاعل</label>
<select id="filterSort" style="width:100%;padding:12px;margin:8px 0">
<option value="high">الأكثر تفاعلاً ← الأقل تفاعلاً</option>
<option value="low">الأقل تفاعلاً ← الأكثر تفاعلاً</option>
</select>
<button id="applyFilters" style="width:100%;padding:13px;background:#087bd0;color:white;border:0;border-radius:9px;margin-top:12px">تطبيق التصفية</button>
<button id="closeFilters" style="width:100%;padding:12px;margin-top:8px">إغلاق</button>
</div>`;
document.body.appendChild(filterPanel);

document.getElementById("filterBtn").onclick = () => {
  filterPanel.style.display = "block";
};
document.getElementById("closeFilters").onclick = () => {
  filterPanel.style.display = "none";
};
document.getElementById("applyFilters").onclick = () => {
  gtxType = document.getElementById("filterType").value;
  gtxSort = document.getElementById("filterSort").value;
  const range = document.getElementById("filterSize").value;
  if (range === "all") {
    gtxMinSize = 0; gtxMaxSize = Infinity;
  } else {
    [gtxMinSize,gtxMaxSize] = range.split("-").map(Number);
  }
  selected = gtxType;
  categoryNav.querySelectorAll(".category").forEach(b =>
    b.classList.toggle("active",b.dataset.category === selected)
  );
  filterPanel.style.display = "none";
  render();
};

// المفضلات داخل قائمة ☰
const favoritesButton = document.createElement("button");
favoritesButton.textContent = "⭐ المفضلات";
favoritesButton.style.cssText = "width:100%;padding:13px;margin-top:9px;background:#8e2450;color:white;border:0;border-radius:9px;font-size:16px";
menuPanel.appendChild(favoritesButton);
favoritesButton.onclick = () => {
  gtxFavoritesOnly = true;
  menuPanel.style.display = "none";
  selected = "";
  categoryNav.querySelectorAll(".category").forEach(b =>
    b.classList.toggle("active",b.dataset.category === "")
  );
  render();
  document.querySelector(".section-heading h2").textContent = "⭐ منشوراتي المفضلة";
  window.scrollTo({top:0,behavior:"smooth"});
};

// زر العودة من المفضلات
const allBack = document.createElement("button");
allBack.textContent = "عرض كل المنشورات";
allBack.style.cssText = "display:none;margin:10px 0;padding:10px 15px;background:#1769aa;color:white;border:0;border-radius:8px";
document.querySelector(".section-heading").after(allBack);
allBack.onclick = () => {
  gtxFavoritesOnly = false;
  document.querySelector(".section-heading h2").textContent = "🔥 أحدث المنشورات";
  allBack.style.display = "none";
  render();
};

// إعادة بناء عرض المنشورات مع القلوب والتصفية
render = function() {
  let shown = mods.filter(m => { if(window.gtxSearch && !window.gtxMatch(m))return false;
    if (selected && m.category !== selected) return false;
    if (gtxType && m.category !== gtxType) return false;
    if (gtxFavoritesOnly && !gtxFavorites[m.id]) return false;
    const size = modSizeMB(m);
    if (size && (size < gtxMinSize || size > gtxMaxSize)) return false;
    return true;
  });

  shown.sort((a,b) => {
    const pa=a.pinned?1:0,pb=b.pinned?1:0;
    if(pa!==pb)return pb-pa;
    const diff = (Number(gtxLikes[b.id]) || 0) - (Number(gtxLikes[a.id]) || 0);
    return gtxSort === "high" ? diff : -diff;
  });

  count.textContent = shown.length + " مود";
  empty.classList.toggle("hidden",shown.length > 0);
  allBack.style.display = gtxFavoritesOnly ? "inline-block" : "none";

  grid.innerHTML = shown.map(m => {try{
    const liked = !!gtxLikes["liked_" + m.id];
    const likes = Number(gtxLikes[m.id]) || 0;
    return `
    <article class="mod-card" data-id="${esc(m.id)}">${(()=>{try{return window.gtxOwnerBar?window.gtxOwnerBar(m):""}catch(e){return ""}})()}
      <div class="mod-image gtx-media" data-media="0" data-images="${esc(JSON.stringify(m.images&&m.images.length?m.images:[m.image]))}"
           style="position:relative;overflow:hidden;touch-action:pan-y">
        <img class="gtx-media-image" src="${safeUrl(m.image)}"
             alt="${esc(m.name)}" loading="lazy"
             style="width:100%;height:100%;object-fit:cover;display:block">
        ${m.video ? `
          <video class="gtx-media-video" controls playsinline
                 preload="none" poster="${safeUrl(m.image)}"
                 style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:2">
            <source src="${safeUrl(m.video)}" type="video/mp4">
          </video>
          <span class="gtx-media-count"
                style="position:absolute;top:10px;left:10px;background:#050505;color:white;padding:5px 10px;border-radius:7px;font-size:12px;z-index:3">1/2</span>
          <span class="gtx-media-hint"
                style="position:absolute;bottom:10px;right:10px;background:#050505c9;color:white;padding:5px 9px;border-radius:7px;font-size:11px;pointer-events:none">اسحب لمشاهدة الفيديو ⇆</span>
        ` : ""}
        <span class="file-badge">${esc(m.fileType || "MOD")}</span>
      </div>
      <div class="mod-content">
        <h3 class="mod-title">${esc(m.name)}</h3>
        <div style="color:#60a5fa;font-weight:bold;margin:5px 0 10px">#${esc(m.category || "غير مصنف")}</div>
        <p class="mod-desc">${esc(m.description || "مود GTA V لجهاز PS4")}</p>
        <div class="meta">
          <span>🎮 GTA V (PS4)</span>
          <span>▣ ${esc(m.fileType || "ZIP")}</span>
          <span>⇩ ${esc(m.size || "")}</span>
        </div>

        <div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:12px">
          <button class="gtx-like" data-id="${esc(m.id)}" style="padding:9px 13px;border:0;border-radius:8px;background:${liked ? "#a51d48" : "#243c59"};color:white">
            ${liked ? "❤️" : "🤍"} ${likes}
          </button>
          
          <a class="download" href="${safeUrl(m.download)}" ${isViking(m.download)?'target="_blank" rel="noopener noreferrer"':'download'}>⬇ تحميل المود</a>
        </div>
      </div>
    </article>`;
  }catch(e){console.error("card skip:",e);return ""}}).join("");
};

// النقر على القلب والمفضلات
grid.addEventListener("click",e => {
  const like = e.target.closest(".gtx-like");
  const fav = e.target.closest(".gtx-fav");
  if (like) {
    const id = like.dataset.id;
    const key = "liked_" + id;
    if (gtxLikes[key]) {
      delete gtxLikes[key];
      gtxLikes[id] = Math.max(0,(Number(gtxLikes[id]) || 0)-1);
    } else {
      gtxLikes[key] = true;
      gtxLikes[id] = (Number(gtxLikes[id]) || 0)+1;
    }
    saveGTXStore();
    render();
  }
  if (fav) {
    const id = fav.dataset.id;
    if (gtxFavorites[id]) delete gtxFavorites[id];
    else gtxFavorites[id] = true;
    saveGTXStore();
    render();
  }
});

// تحديث خيارات التصنيف في لوحة النشر والإدارة
const categoryOptions = ["سيارات","طيارات","موطورات","قوارب","شخصيات","مابات","الاخرى"];
const publishCategory = publishForm.querySelector('[name="category"]');
if (publishCategory) {
  publishCategory.innerHTML = categoryOptions.map(c =>
    `<option value="${c}">${c}</option>`
  ).join("");
}


/* GTXMOD image/video swipe viewer */
(function(){
  let startX = 0;
  let startY = 0;

  grid.addEventListener("touchstart", e => {
    const media = e.target.closest(".gtx-media");
    if (!media || !media.querySelector(".gtx-media-video")) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, {passive:true});

  grid.addEventListener("touchend", e => {
    const media = e.target.closest(".gtx-media");
    if (!media || !media.querySelector(".gtx-media-video")) return;

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;

    const img = media.querySelector(".gtx-media-image");
    const video = media.querySelector(".gtx-media-video");
    const badge = media.querySelector(".gtx-media-count");
    const hint = media.querySelector(".gtx-media-hint");

    if (media.dataset.media === "0") {
      media.dataset.media = "1";
      img.style.display = "none";
      video.style.display = "block";
      badge.textContent = "2/2";
      hint.textContent = "اسحب للرجوع للصورة ⇆";
      video.load();
    } else {
      video.pause();
      video.currentTime = 0;
      video.style.display = "none";
      img.style.display = "block";
      media.dataset.media = "0";
      badge.textContent = "1/2";
      hint.textContent = "اسحب لمشاهدة الفيديو ⇆";
    }
  }, {passive:true});
})();

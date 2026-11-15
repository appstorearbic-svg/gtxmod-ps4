const grid = document.getElementById('modGrid');
const empty = document.getElementById('emptyState');
const count = document.getElementById('resultCount');

let mods = [];
let selected = 'سيارات';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;',
  '"':'&quot;', "'":'&#39;'
}[c]));

const safeUrl = s => {
  const v = String(s || '');
  return /^(https?:\/\/|assets\/|\.\/)/i.test(v) ? esc(v) : '#';
};

function render() {
  const shown = mods.filter(m =>
    !selected || m.category === selected
  );

  count.textContent = shown.length + ' مود';
  empty.classList.toggle('hidden', shown.length > 0);

  grid.innerHTML = shown.map(m => `
    <article class="mod-card">

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

        ${m.video ? `
          <video class="mod-video"
                 controls
                 playsinline
                 preload="metadata"
                 poster="${safeUrl(m.image)}">
            <source src="${safeUrl(m.video)}">
          </video>
        ` : ''}

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
  })
  .catch(err => {
    console.error(err);
    mods = [];
    render();
  });

document.querySelectorAll('.category').forEach(btn => {
  btn.onclick = () => {
    selected = btn.dataset.category;

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
  <button id="adminOpen" style="width:100%;padding:13px;background:#1769aa;color:white;border:0;border-radius:9px;font-size:16px">👤 المدير</button>
`;

document.body.appendChild(menuPanel);

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
<option value="سكربتات">سكربتات</option>
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
  const category = prompt("التصنيف: سيارات أو شخصيات أو مابات أو سكربتات",mod.category);
  if (category === null) return;
  const description = prompt("وصف المنشور:",mod.description || "");
  if (description === null) return;
  if (!["سيارات","شخصيات","مابات","سكربتات"].includes(category)) {
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
  if (!link) return;
  e.preventDefault();
  const url = link.href;
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

// ===== TELEGRAM MOVING CREDIT =====
const credit = document.createElement("a");
credit.href = "https://t.me/h_y_88";
credit.target = "_blank";
credit.rel = "noopener";
credit.innerHTML = "✈️ Telegram&nbsp; @h_y_88";
credit.style.cssText = "position:fixed;z-index:9998;padding:8px 13px;background:#087ebc;color:white;border:1px solid #69caff;border-radius:22px;text-decoration:none;font-weight:bold;box-shadow:0 4px 18px #0009;transition:top 1s,left 1s,right 1s,bottom 1s";
document.body.appendChild(credit);

function moveTelegramCredit() {
  const positions = [
    {top:"12px",left:"12px",right:"auto",bottom:"auto"},
    {top:"12px",left:"auto",right:"12px",bottom:"auto"},
    {top:"50%",left:"12px",right:"auto",bottom:"auto"},
    {top:"50%",left:"auto",right:"12px",bottom:"auto"},
    {top:"auto",left:"12px",right:"auto",bottom:"12px"},
    {top:"auto",left:"auto",right:"12px",bottom:"12px"}
  ];
  const p = positions[Math.floor(Math.random()*positions.length)];
  Object.assign(credit.style,p);
  credit.style.transform = "translateY(-50%)";
  credit.style.direction = Math.random() > .5 ? "ltr" : "rtl";
}
moveTelegramCredit();
setInterval(moveTelegramCredit,60000);

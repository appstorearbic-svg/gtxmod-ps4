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

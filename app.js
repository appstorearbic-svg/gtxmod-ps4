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

document.getElementById('menuBtn').onclick = () =>
  alert('GTXMOD PS4');

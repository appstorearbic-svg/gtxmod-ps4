let mods = [];
let selectedCategory = "all";

const list = document.getElementById("modList");
const search = document.getElementById("search");

document.getElementById("menuBtn").onclick = () =>
  document.getElementById("nav").classList.toggle("show");

document.getElementById("filterBtn").onclick = () =>
  document.querySelector(".categories").scrollIntoView({behavior:"smooth"});

document.querySelectorAll(".categories button").forEach(button => {
  button.onclick = () => {
    document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    renderMods();
  };
});

search.addEventListener("input", renderMods);

async function loadMods() {
  try {
    const response = await fetch("mods.json");
    if (!response.ok) throw new Error("تعذر تحميل البيانات");
    mods = await response.json();
    renderMods();
  } catch (error) {
    list.innerHTML = '<p class="empty">تعذر تحميل المودات حالياً.</p>';
  }
}

function renderMods() {
  const term = search.value.trim().toLowerCase();
  const filtered = mods.filter(mod => {
    const categoryMatch = selectedCategory === "all" || mod.category === selectedCategory;
    const text = `${mod.title || ""} ${mod.description || ""}`.toLowerCase();
    return categoryMatch && text.includes(term);
  });

  if (!filtered.length) {
    list.innerHTML = '<p class="empty">لا توجد مودات حالياً في هذا التصنيف.</p>';
    return;
  }

  list.innerHTML = filtered.map(mod => `
    <article class="modCard">
      <img src="${safe(mod.image)}" alt="">
      <div class="modInfo">
        <small class="modType">${safe(mod.type || "مود PS4")}</small>
        <h3>${safe(mod.title)}</h3>
        <p>${safe(mod.description)}</p>
        <a class="download" href="${safe(mod.download)}" target="_blank" rel="noopener">تحميل المود</a>
      </div>
    </article>
  `).join("");
}

function safe(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}

loadMods();

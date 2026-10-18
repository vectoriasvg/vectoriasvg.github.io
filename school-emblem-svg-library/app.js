const DATA_URL = "./data/schools.json";
const PAGE_SIZE = 12;

const els = {
  search: document.querySelector("#search-input"),
  clearSearch: document.querySelector("#clear-search"),
  region: document.querySelector("#region-filter"),
  province: document.querySelector("#province-filter"),
  district: document.querySelector("#district-filter"),
  sort: document.querySelector("#sort-filter"),
  reset: document.querySelector("#reset-filters"),
  emptyReset: document.querySelector("#empty-reset"),
  grid: document.querySelector("#school-grid"),
  empty: document.querySelector("#empty-state"),
  loadMore: document.querySelector("#load-more"),
  total: document.querySelector("#total-count"),
  shown: document.querySelector("#shown-count"),
  summary: document.querySelector("#result-summary"),
  dialog: document.querySelector("#detail-dialog"),
  dialogContent: document.querySelector("#dialog-content")
};

let schools = [];
let visibleLimit = PAGE_SIZE;

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));
}

function setOptions(select, placeholder, values) {
  const previous = select.value;
  select.replaceChildren(new Option(placeholder, ""));
  uniqueSorted(values).forEach(value => select.add(new Option(value, value)));
  if ([...select.options].some(option => option.value === previous)) select.value = previous;
}

function updateLocationFilters() {
  const region = els.region.value;
  const province = els.province.value;
  const regionRows = schools.filter(s => !region || s.region === region);
  setOptions(els.province, "ทุกจังหวัด", regionRows.map(s => s.province));
  els.province.disabled = !region;
  if (province && [...els.province.options].some(o => o.value === province)) els.province.value = province;

  const provinceRows = regionRows.filter(s => !els.province.value || s.province === els.province.value);
  setOptions(els.district, "ทุกอำเภอ", provinceRows.map(s => s.district));
  els.district.disabled = !els.province.value;
}

function filteredSchools() {
  const q = els.search.value.trim().toLocaleLowerCase("th");
  const region = els.region.value;
  const province = els.province.value;
  const district = els.district.value;
  const sort = els.sort.value;
  const results = schools.filter(s => {
    const searchable = [s.name, s.province, s.district, s.region, s.alternateName || ""].join(" ").toLocaleLowerCase("th");
    return (!q || searchable.includes(q)) &&
      (!region || s.region === region) &&
      (!province || s.province === province) &&
      (!district || s.district === district);
  });
  results.sort((a, b) => {
    if (sort === "province") return a.province.localeCompare(b.province, "th") || a.name.localeCompare(b.name, "th");
    if (sort === "newest") return (b.addedAt || "").localeCompare(a.addedAt || "");
    return a.name.localeCompare(b.name, "th");
  });
  return results;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeAssetPath(path = "") {
  // Only allow local relative paths, preventing unexpected external URLs.
  if (!path || path.startsWith("/") || path.includes("..") || /^[a-z]+:/i.test(path)) return "";
  return path;
}

function cardHTML(school) {
  const path = safeAssetPath(school.file);
  const location = [school.district, school.province].filter(Boolean).join(" · ");
  const preview = path
    ? `<img src="${escapeHTML(path)}" alt="ตรา${escapeHTML(school.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'emblem-fallback',textContent:'ยังไม่มีภาพ'}))">`
    : `<div class="emblem-fallback">ยังไม่มีภาพ</div>`;
  const download = path
    ? `<a class="download-button" href="${escapeHTML(path)}" download>↓ ดาวน์โหลด SVG</a>`
    : `<button class="download-button" disabled title="ยังไม่มีไฟล์">ยังไม่มีไฟล์</button>`;
  return `<article class="school-card">
    <div class="emblem-preview">${preview}</div>
    <div class="card-body">
      <h2 class="school-name">${escapeHTML(school.name)}</h2>
      <div class="location">${escapeHTML(location || "ยังไม่ระบุที่ตั้ง")}</div>
      <div class="tag-row"><span class="tag">${escapeHTML(school.region || "ไม่ระบุภาค")}</span>${school.file ? '<span class="tag">SVG</span>' : '<span class="tag">รอไฟล์</span>'}</div>
    </div>
    <div class="card-actions"><button class="preview-button" type="button" data-preview="${escapeHTML(school.id)}">ดูรายละเอียด</button>${download}</div>
  </article>`;
}

function render() {
  const results = filteredSchools();
  const shown = results.slice(0, visibleLimit);
  els.total.textContent = schools.length.toLocaleString("th-TH");
  els.shown.textContent = shown.length.toLocaleString("th-TH");
  els.summary.textContent = `พบ ${results.length.toLocaleString("th-TH")} รายการ`;
  els.clearSearch.hidden = !els.search.value;
  els.grid.innerHTML = shown.map(cardHTML).join("");
  els.empty.hidden = results.length !== 0;
  els.grid.hidden = results.length === 0;
  els.loadMore.hidden = shown.length >= results.length || results.length === 0;
}

function resetFilters() {
  els.search.value = "";
  els.region.value = "";
  els.province.value = "";
  els.district.value = "";
  els.sort.value = "name";
  updateLocationFilters();
  els.province.value = "";
  els.district.value = "";
  visibleLimit = PAGE_SIZE;
  render();
}

function showDetails(id) {
  const school = schools.find(s => s.id === id);
  if (!school) return;
  const path = safeAssetPath(school.file);
  const image = path
    ? `<div class="dialog-image"><img src="${escapeHTML(path)}" alt="ตรา${escapeHTML(school.name)}"></div>`
    : `<div class="dialog-image"><div class="emblem-fallback">ยังไม่มีภาพ</div></div>`;
  const location = [school.district, school.province, school.region].filter(Boolean).join(" · ");
  els.dialogContent.innerHTML = `<div class="dialog-inner">${image}
    <h2>${escapeHTML(school.name)}</h2>
    <p>${escapeHTML(location || "ยังไม่ระบุที่ตั้ง")}</p>
    ${school.notes ? `<p>${escapeHTML(school.notes)}</p>` : ""}
    ${path ? `<a class="dialog-download" href="${escapeHTML(path)}" download>↓ ดาวน์โหลดไฟล์ SVG</a>` : ""}
    ${school.source ? `<p>แหล่งที่มา: <a href="${escapeHTML(school.source)}" target="_blank" rel="noreferrer">เปิดแหล่งที่มา ↗</a></p>` : ""}
  </div>`;
  els.dialog.showModal();
}

async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    schools = Array.isArray(data) ? data : [];
    setOptions(els.region, "ทุกภาค", schools.map(s => s.region));
    updateLocationFilters();
    render();
  } catch (error) {
    els.total.textContent = "—";
    els.shown.textContent = "—";
    els.summary.textContent = "โหลดข้อมูลไม่สำเร็จ";
    els.grid.innerHTML = `<div class="empty-state"><h2>ไม่สามารถโหลดข้อมูลได้</h2><p>ตรวจสอบว่าไฟล์ data/schools.json มีอยู่และเปิดเว็บผ่าน GitHub Pages หรือ local server</p></div>`;
    console.error("Could not load school data:", error);
  }
}

els.search.addEventListener("input", () => { visibleLimit = PAGE_SIZE; render(); });
els.clearSearch.addEventListener("click", () => { els.search.value = ""; visibleLimit = PAGE_SIZE; render(); els.search.focus(); });
els.region.addEventListener("change", () => {
  els.province.value = "";
  els.district.value = "";
  updateLocationFilters();
  visibleLimit = PAGE_SIZE;
  render();
});
els.province.addEventListener("change", () => {
  els.district.value = "";
  updateLocationFilters();
  visibleLimit = PAGE_SIZE;
  render();
});
els.district.addEventListener("change", () => { visibleLimit = PAGE_SIZE; render(); });
els.sort.addEventListener("change", render);
els.reset.addEventListener("click", resetFilters);
els.emptyReset.addEventListener("click", resetFilters);
els.loadMore.addEventListener("click", () => { visibleLimit += PAGE_SIZE; render(); });
els.grid.addEventListener("click", event => {
  const button = event.target.closest("[data-preview]");
  if (button) showDetails(button.dataset.preview);
});

init();

const $ = (id) => document.getElementById(id);
let token = sessionStorage.getItem("tok") || "", data, tab = "site";
// Each section: object (single form) or list (repeatable items). Field types: text, area, lines, image.
const SCHEMA = {
  site: { label: "Profile", type: "object", fields: [["name", "Name", "text"], ["photo", "Head-shot photo (shown next to your name)", "image"], ["role", "Role", "text"], ["tagline", "Hero tagline", "area"], ["about", "About (one paragraph per line)", "lines"], ["email", "Email", "text"], ["cvLink", "CV link", "text"], ["contactText", "Contact text", "area"]] },
  socials: { label: "Social links", type: "list", path: ["site", "socials"], blank: { label: "", url: "" }, fields: [["label", "Label", "text"], ["url", "URL", "text"]] },
  skills: { label: "Skills", type: "strings", hint: "One skill per line" },
  experience: { label: "Experience", type: "list", blank: { company: "", role: "", period: "", points: [] }, fields: [["company", "Company", "text"], ["role", "Role", "text"], ["period", "Period", "text"], ["points", "Bullet points (one per line)", "lines"]] },
  projects: { label: "Work / Banners", type: "list", blank: { title: "", category: "Banners", description: "", tags: [], image: "" }, fields: [["title", "Title", "text"], ["category", "Category (used for filter buttons)", "text"], ["description", "Description", "area"], ["tags", "Tags (one per line)", "lines"], ["image", "Banner image", "image"]] },
  reviews: { label: "Reviews", type: "list", blank: { name: "", source: "", text: "" }, fields: [["name", "Client name", "text"], ["source", "Platform", "text"], ["text", "Review", "area"]] },
  certifications: { label: "Certificates", type: "list", blank: { title: "", issuer: "", date: "" }, fields: [["title", "Title", "text"], ["issuer", "Issuer", "text"], ["date", "Date", "text"]] },
};
const get = (k) => { const s = SCHEMA[k]; return s.path ? data[s.path[0]][s.path[1]] : data[k]; };
const api = (url, opt = {}) => fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: "Bearer " + token } });
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const say = (m) => { $("status").textContent = m; setTimeout(() => ($("status").textContent = ""), 3000); };

async function login() {
  $("err").textContent = "";
  const r = await fetch("/api/login", { method: "POST", body: JSON.stringify({ password: $("pw").value }) });
  if (!r.ok) return ($("err").textContent = "Wrong password. Default is tahir123 (or the ADMIN_PASSWORD you set).");
  token = (await r.json()).token; sessionStorage.setItem("tok", token); start();
}
async function start() {
  data = await (await fetch("/api/content")).json();
  $("login").hidden = true; $("app").hidden = false; drawTabs(); draw();
}
function drawTabs() {
  $("tabs").innerHTML = Object.entries(SCHEMA).map(([k, s]) => `<button data-k="${k}" class="${k === tab ? "on" : ""}">${s.label}</button>`).join("");
}
function field([key, label, type], val, idx) {
  const a = `data-i="${idx}" data-f="${key}"`;
  if (type === "area") return `<label>${label}</label><textarea ${a}>${esc(val)}</textarea>`;
  if (type === "lines") return `<label>${label}</label><textarea ${a} data-lines="1">${esc((val || []).join("\n"))}</textarea>`;
  if (type === "image") return `<label>${label}</label>${val ? `<img class="thumb" src="${esc(val)}">` : ""}<input ${a} value="${esc(val)}" placeholder="/uploads/your-image.png"><input type="file" accept="image/*" data-up="${key}" data-i="${idx}">`;
  return `<label>${label}</label><input ${a} value="${esc(val)}">`;
}
function draw() {
  const s = SCHEMA[tab], v = get(tab); let h = `<h2>${s.label}</h2>`;
  if (s.type === "object") h += s.fields.map((f) => field(f, v[f[0]], -1)).join("");
  else if (s.type === "strings") h += `<p class="hint">${s.hint}</p><textarea data-i="-2" style="min-height:260px">${esc(v.join("\n"))}</textarea>`;
  else h += v.map((it, i) => `<div class="item"><div class="bar"><button data-mv="${i}:-1">Up</button><button data-mv="${i}:1">Down</button><button class="danger" data-rm="${i}">Delete</button></div>${s.fields.map((f) => field(f, it[f[0]], i)).join("")}</div>`).join("") + `<button class="p" id="add">+ Add new</button>`;
  $("panel").innerHTML = h;
}
const lines = (t) => t.split("\n").map((x) => x.trim()).filter(Boolean);
$("panel").addEventListener("input", (e) => {
  const t = e.target, i = +t.dataset.i, f = t.dataset.f, v = t.dataset.lines ? lines(t.value) : t.value, s = SCHEMA[tab];
  if (i === -2) data.skills = lines(t.value);
  else if (i === -1) data.site[f] = v;
  else if (f) get(tab)[i][f] = v;
});
$("panel").addEventListener("change", async (e) => {
  const t = e.target; if (!t.dataset.up) return;
  const file = t.files[0]; if (!file) return; say("Uploading...");
  const r = await api("/api/upload", { method: "POST", headers: { "x-filename": file.name }, body: file });
  const j = await r.json(); if (!r.ok) return alert(j.error);
  if (+t.dataset.i === -1) data.site[t.dataset.up] = j.url; else get(tab)[+t.dataset.i][t.dataset.up] = j.url; draw(); say("Uploaded. Press Save changes.");
});
$("panel").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return; const list = get(tab);
  if (b.id === "add") { list.push(JSON.parse(JSON.stringify(SCHEMA[tab].blank))); draw(); }
  else if (b.dataset.rm) { if (confirm("Delete this item?")) { list.splice(+b.dataset.rm, 1); draw(); } }
  else if (b.dataset.mv) { const [i, d] = b.dataset.mv.split(":").map(Number), j = i + d; if (j >= 0 && j < list.length) { [list[i], list[j]] = [list[j], list[i]]; draw(); } }
});
$("tabs").onclick = (e) => { const b = e.target.closest("button"); if (b) { tab = b.dataset.k; drawTabs(); draw(); } };
$("save").onclick = async () => {
  const r = await api("/api/content", { method: "PUT", body: JSON.stringify(data) });
  say(r.ok ? "Saved. Site updated." : "Save failed. Log in again.");
  if (r.status === 401) { sessionStorage.removeItem("tok"); location.reload(); }
};
$("go").onclick = login; $("pw").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
if (token) start().catch(() => {});

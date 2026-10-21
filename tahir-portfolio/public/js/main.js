const $ = (id) => document.getElementById(id);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Social logos (inline SVG, work offline). Matched by label or URL.
const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>',
  behance: '<svg viewBox="0 0 24 24" fill="currentColor"><text x="12" y="17" text-anchor="middle" font-family="Sora,Arial,sans-serif" font-weight="800" font-size="14">B\u0113</text></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4v11H4zM6 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM10 9h3.8v1.6c.6-1 1.9-1.9 3.8-1.9 3.6 0 4.4 2.3 4.4 5.4V20h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20h-4z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
};
const icon = (x) => { const t = (x.label + " " + x.url).toLowerCase(); return ICONS[Object.keys(ICONS).find((k) => t.includes(k)) || "link"]; };

fetch("/api/content").then((r) => r.json()).then(render).catch(() => ($("heroTagline").textContent = "Run the site with: node server.js"));

function render(d) {
  const s = d.site;
  document.title = `${s.name} | ${s.role}`;
  $("logo").textContent = s.name[0];
  $("heroName").innerHTML = [...s.name.toUpperCase()].map((c, i) => `<span style="animation-delay:${i * 80}ms,${800 + i * 300}ms">${esc(c)}</span>`).join("");
  if (s.photo) $("photo").src = s.photo;
  $("heroRole").textContent = s.role; $("heroTagline").textContent = s.tagline;
  $("cv").href = s.cvLink || "#"; $("mail").href = "mailto:" + s.email;
  $("aboutText").innerHTML = s.about.map((p) => `<p>${esc(p)}</p>`).join("");
  $("skills").innerHTML = d.skills.map((k) => `<li>${esc(k)}</li>`).join("");
  const m = d.skills.map((k) => `<span>${esc(k)}</span>`).join(""); $("marquee").innerHTML = m + m;
  $("exp").innerHTML = d.experience.map((j) => `<div class="job"><h3>${esc(j.role)} @ ${esc(j.company)}</h3><div class="meta">${esc(j.period)}</div><ul>${(j.points || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("");
  $("quotes").innerHTML = d.reviews.map((r) => `<blockquote class="glass"><p>"${esc(r.text)}"</p><cite>${esc(r.name)} via ${esc(r.source)}</cite></blockquote>`).join("");
  $("certList").innerHTML = d.certifications.map((c) => `<li><b>${esc(c.title)}</b><span>${esc(c.issuer)} - ${esc(c.date)}</span></li>`).join("");
  $("contactText").textContent = s.contactText;
  $("socials").innerHTML = s.socials.map((x) => `<a class="glass" href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="${esc(x.label)}" title="${esc(x.label)}">${icon(x)}</a>`).join("");
  $("foot").textContent = s.name;
  const cats = ["All", ...new Set(d.projects.map((p) => p.category).filter(Boolean))];
  $("filters").innerHTML = cats.map((c, i) => `<button class="${i ? "" : "on"}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  const draw = (c) => { $("grid").innerHTML = d.projects.filter((p) => c === "All" || p.category === c).map((p) =>
    `<article class="card glass rv" data-img="${esc(p.image)}"><div class="imgbox"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div><div class="info"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><small>${esc((p.tags || []).join(" | "))}</small></div></article>`).join(""); reveal(); };
  draw("All");
  $("filters").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; document.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b)); draw(b.dataset.c); };
  $("grid").onclick = (e) => { const c = e.target.closest(".card"); if (c) { $("lb").querySelector("img").src = c.dataset.img; $("lb").classList.add("open"); } };
  $("lb").onclick = () => $("lb").classList.remove("open");
  document.querySelectorAll(".wrap").forEach((w) => w.classList.add("glass", "rv"));
  document.querySelectorAll(".contact .socials a, .job, blockquote").forEach((x) => x.classList.add("rv"));
  reveal();
}

// scroll-reveal with a small stagger
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
function reveal() { document.querySelectorAll(".rv:not(.in)").forEach((el, i) => { el.style.transitionDelay = Math.min(i % 6, 5) * 80 + "ms"; io.observe(el); }); }

// glass light follows the cursor
document.addEventListener("pointermove", (e) => {
  const g = e.target.closest && e.target.closest(".glass"); if (!g) return;
  const r = g.getBoundingClientRect(); g.style.setProperty("--mx", e.clientX - r.left + "px"); g.style.setProperty("--my", e.clientY - r.top + "px");
});

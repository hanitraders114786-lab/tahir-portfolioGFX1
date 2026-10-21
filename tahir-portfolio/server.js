// Zero-dependency server: serves the site, a JSON API and the admin CMS.
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.ADMIN_PASSWORD || "tahir123"; // change this!
const PUB = path.join(__dirname, "public");
const DATA = path.join(__dirname, "data", "content.json");
const sessions = new Set();
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon" };
const UPLOAD_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];

const send = (res, code, body, type = "application/json") => { res.writeHead(code, { "Content-Type": type }); res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
const authed = (req) => sessions.has((req.headers.authorization || "").replace("Bearer ", ""));
const readBody = (req, max = 10e6) => new Promise((ok, no) => { const c = []; let n = 0; req.on("data", (d) => { n += d.length; if (n > max) { no(new Error("too large")); req.destroy(); } else c.push(d); }); req.on("end", () => ok(Buffer.concat(c))); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x"); const p = decodeURIComponent(url.pathname);
  try {
    if (p === "/api/content" && req.method === "GET") return send(res, 200, fs.readFileSync(DATA, "utf8"));
    if (p === "/api/login" && req.method === "POST") {
      const { password } = JSON.parse((await readBody(req, 1e4)).toString() || "{}");
      if (password !== PASSWORD) return send(res, 401, { error: "Wrong password" });
      const t = crypto.randomBytes(24).toString("hex"); sessions.add(t); return send(res, 200, { token: t });
    }
    if (p === "/api/content" && req.method === "PUT") {
      if (!authed(req)) return send(res, 401, { error: "Not logged in" });
      const body = JSON.parse((await readBody(req)).toString());
      fs.writeFileSync(DATA, JSON.stringify(body, null, 2)); return send(res, 200, { ok: true });
    }
    if (p === "/api/upload" && req.method === "POST") {
      if (!authed(req)) return send(res, 401, { error: "Not logged in" });
      const name = path.basename(req.headers["x-filename"] || "file").replace(/[^\w.\-]/g, "_");
      const ext = path.extname(name).toLowerCase();
      if (!UPLOAD_EXT.includes(ext)) return send(res, 400, { error: "Images only (png, jpg, webp, gif, svg)" });
      const final = Date.now() + "-" + name;
      fs.writeFileSync(path.join(PUB, "uploads", final), await readBody(req));
      return send(res, 200, { url: "/uploads/" + final });
    }
    // static files
    let file = p === "/" ? "/index.html" : p === "/admin" ? "/admin/index.html" : p;
    file = path.normalize(path.join(PUB, file));
    if (!file.startsWith(PUB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, "Not found", "text/plain");
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file).toLowerCase()] || "application/octet-stream");
  } catch (e) { send(res, 500, { error: e.message }); }
}).listen(PORT, () => console.log(`Site:  http://localhost:${PORT}\nAdmin: http://localhost:${PORT}/admin  (password: ${PASSWORD})`));

# Tahir Portfolio (with editable CMS)

Black + cyan graphic design portfolio. Fonts: Sora (headings), Montserrat (body). No dependencies, just Node.js 16+.

## Run
```
node server.js
```
- Site:  http://localhost:3000
- Admin: http://localhost:3000/admin  (default password: `tahir123`)

Change the password: `ADMIN_PASSWORD=yourpass node server.js`

## Structure
```
server.js              server + API (login, content, image upload)
data/content.json      ALL site content (edited by the admin panel)
public/index.html      site markup
public/css/style.css   site styles
public/js/main.js      renders content.json into the page
public/admin/          CMS (index.html, admin.css, admin.js)
public/assets/banners/ sample clothing banners (SVG)
public/uploads/        images you upload from the admin
scripts/make_banners.py regenerates the sample banners
```

## Editing
Open /admin, pick a section, edit, press **Save changes**. For banners, use the file picker on any Work item to upload your own image. Reorder or delete items with the buttons on each card.

## Notes
- Needs a Node host to keep the CMS working (Render, Railway, a VPS). GitHub Pages or Netlify static hosting will show the site but not the admin.
- Replace the sample reviews, links, email and CV link with your real details.

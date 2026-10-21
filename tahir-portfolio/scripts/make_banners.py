# Generates the sample clothing banners (SVG). Run: python3 scripts/make_banners.py
import os
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "banners")
TEE = "M330 140 L470 100 Q600 170 730 100 L870 140 L980 280 L860 340 L830 300 L830 700 L370 700 L370 300 L340 340 L220 280 Z"
HOOD = "M340 150 Q600 40 860 150 L990 300 L880 360 L840 320 L840 700 L360 700 L360 320 L320 360 L210 300 Z"
items = [
 ("streetwear-drop", "STREETWEAR DROP", "Vol. 01 / Oversized tees", "#000", "#00E5FF", "#000", TEE),
 ("summer-collection", "SUMMER COLLECTION", "Light fits, loud colour", "#00E5FF", "#000", "#00E5FF", TEE),
 ("hoodie-season", "HOODIE SEASON", "Heavyweight fleece", "#000", "#fff", "#000", HOOD),
 ("denim-week", "DENIM WEEK", "Up to 40% off", "#06222a", "#00E5FF", "#06222a", TEE),
 ("minimal-basics", "MINIMAL BASICS", "Essentials, restocked", "#fff", "#000", "#00E5FF", TEE),
 ("winter-sale", "WINTER SALE", "Layers for the cold", "#000", "#00E5FF", "#000", HOOD),
]
for slug, title, sub, bg, garment, ink, path in items:
    txt = "#00E5FF" if bg in ("#000", "#06222a") else "#000"
    w = title.split()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
<rect width="1200" height="800" fill="{bg}"/>
<text x="-20" y="360" font-family="Sora,Arial,sans-serif" font-weight="800" font-size="230" fill="none" stroke="{txt}" stroke-opacity=".35" stroke-width="2">{w[0]}</text>
<text x="-20" y="620" font-family="Sora,Arial,sans-serif" font-weight="800" font-size="230" fill="none" stroke="{txt}" stroke-opacity=".35" stroke-width="2">{w[-1]}</text>
<path d="{path}" fill="{garment}"/>
<path d="{path}" fill="none" stroke="{txt}" stroke-width="3" transform="translate(14 14)"/>
<text x="600" y="460" text-anchor="middle" font-family="Sora,Arial,sans-serif" font-weight="800" font-size="54" fill="{ink}">{title}</text>
<text x="600" y="510" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-size="26" fill="{ink}" fill-opacity=".8">{sub}</text>
</svg>'''
    open(os.path.join(out, slug + ".svg"), "w").write(svg)
print("banners written")

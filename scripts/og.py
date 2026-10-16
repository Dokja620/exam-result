"""
Images Open Graph (1200 × 630) dans le style v1 du site : fond fumée blanche, confettis du
drapeau, carte blanche à onglets rouge / vert, marque « 20 », Poppins.

    bun run og:generate          # = python3 scripts/og.py

Rendu par Playwright (Chromium) à partir d'un gabarit HTML ; écrit static/og/{home,liste,lycees}.png.
L'année affichée est la plus récente de src/lib/data/*.json.
"""

import base64
import pathlib
import re

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "static" / "og"
FONTS = ROOT / "node_modules" / "@fontsource" / "poppins" / "files"
SPRINKLES = ROOT / "src" / "lib" / "assets" / "images" / "sprinkles.svg"

year = max(int(p.stem) for p in (ROOT / "src" / "lib" / "data").glob("*.json") if re.fullmatch(r"\d{4}", p.stem))

VARIANTS = {
    "home": ("Résultats du BAC " + str(year), "Consultez votre résultat"),
    "liste": ("Tous les résultats", f"BAC {year} : recherche par nom, numéro, série"),
    "lycees": ("Classement des lycées", f"Taux de réussite au BAC {year}"),
}


def font_face(weight: int) -> str:
    data = base64.b64encode((FONTS / f"poppins-latin-{weight}-normal.woff2").read_bytes()).decode()
    return (
        "@font-face{font-family:Poppins;font-weight:%d;font-display:block;"
        "src:url(data:font/woff2;base64,%s) format('woff2')}" % (weight, data)
    )


sprinkles = "data:image/svg+xml;base64," + base64.b64encode(SPRINKLES.read_bytes()).decode()
TAB_TL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 50'%3E%3Cpath d='M24 0H66a4 4 0 0 1 4 4V46a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V24A24 24 0 0 1 24 0Z'/%3E%3C/svg%3E"
TAB_BR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 50'%3E%3Cpath d='M4 0H66a4 4 0 0 1 4 4V26A24 24 0 0 1 46 50H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z'/%3E%3C/svg%3E"

TEMPLATE = """<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
%(fonts)s
:root{--ink:#020b12;--ink2:#4a5257;--bg:#faf9f9;--blue:#5abfdd;--red:#ed1d27;--green:#018945}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;background:var(--bg);font-family:Poppins,sans-serif;color:var(--ink);overflow:hidden}
body{position:relative;isolation:isolate;display:grid;place-items:center}
body::before{content:'';position:absolute;inset:0;z-index:-1;background:url("%(sprinkles)s") center top/cover no-repeat;
  -webkit-mask-image:radial-gradient(ellipse 80%% 90%% at 50%% 20%%,#000 40%%,transparent 100%%)}
.card{position:relative;isolation:isolate;width:940px;padding:64px 72px 56px;border-radius:28px}
.card::before{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:#fff;
  box-shadow:0 0 0 1px hsl(206 30%% 20%% / .04),0 6px 10px hsl(0 0%% 0%% / .08),0 12px 36px hsl(0 0%% 0%% / .12)}
.card::after{content:'';position:absolute;inset:-20px;z-index:-2;
  background:linear-gradient(var(--red),var(--red)) top left/140px 100px no-repeat,linear-gradient(var(--green),var(--green)) bottom right/140px 100px no-repeat;
  -webkit-mask:url("%(tl)s") top left/140px 100px no-repeat,url("%(br)s") bottom right/140px 100px no-repeat}
.brand{display:flex;align-items:center;gap:16px;font-weight:700;font-size:30px;letter-spacing:-.01em}
.mark{display:inline-grid;place-items:center;width:56px;height:56px;border-radius:16px;background:var(--blue);font-size:26px;font-weight:700;letter-spacing:-.04em}
h1{margin-top:40px;font-size:76px;line-height:1.05;font-weight:700;letter-spacing:-.035em}
p{margin-top:22px;font-size:34px;font-weight:500;color:var(--ink2)}
p b{font-weight:600;color:var(--ink);background:linear-gradient(transparent 54%%,hsl(194 66%% 61%% / .55) 54%%,hsl(194 66%% 61%% / .55) 80%%,transparent 80%%)}
.foot{margin-top:40px;display:flex;justify-content:space-between;align-items:center;font-size:20px;color:var(--ink2)}
.tag{padding:6px 16px;border:2px solid var(--ink);border-radius:999px;font-weight:600;font-size:17px;letter-spacing:.04em;color:var(--ink)}
</style></head><body><div class="card">
<div class="brand"><span class="mark">20</span>Résultats du BAC</div>
<h1>%(title)s</h1>
<p><b>%(sub)s</b></p>
<div class="foot"><span>Madagascar</span><span class="tag">DONNÉES FICTIVES</span></div>
</div></body></html>"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fonts = "".join(font_face(w) for w in (500, 600, 700))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        for name, (title, sub) in VARIANTS.items():
            page.set_content(
                TEMPLATE
                % {"fonts": fonts, "sprinkles": sprinkles, "tl": TAB_TL, "br": TAB_BR, "title": title, "sub": sub}
            )
            page.evaluate("document.fonts.ready")
            out = OUT / f"{name}.png"
            page.screenshot(path=str(out))
            print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} Ko")
        browser.close()


if __name__ == "__main__":
    main()

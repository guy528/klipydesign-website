#!/usr/bin/env python3
"""
Builds the five category pages. The project cards on each page are NOT set here: they come
automatically from the project files in the _projects folder (see ADDING-PROJECTS.md).

Builds the five category pages (kitchen/, lighting/, ...) from the data below.

Edit the CATEGORIES list (names, text, products), then run from the repository root:

    python3 tools/build_categories.py

Each page is written to <slug>/index.html. You can also edit those HTML files directly,
but running this script again will overwrite them.
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CATEGORIES = [
    {
        "slug": "kitchen", "num": "01", "name": "Kitchen products", "short": "Kitchen",
        "color": "red", "ink": "#fff", "art": "light",
        "intro": "Appliances and tools that live on the counter and survive heat, steam, water and daily cleaning — designed to look calm and built to last.",
        "types": ["Espresso & coffee machines", "Kettles", "Blenders & mixers", "Cookware accessories", "Food storage"],
        "points": [
            ("Food-safe by design", "Materials, finishes and seals specified for food contact from the first CAD model."),
            ("Heat, steam and water", "Thermal breaks, venting paths and sealing details that hold up to daily use."),
            ("Easy to clean", "Fewer seams, reachable surfaces and removable parts that go in the dishwasher."),
        ],
    },
    {
        "slug": "lighting", "num": "02", "name": "Lighting", "short": "Lighting",
        "color": "yellow", "ink": "#111111", "art": "dark",
        "intro": "Desk, floor and portable lights where the form, the optics and the heat path are designed together.",
        "types": ["Desk & task lamps", "Floor lamps", "Portable & rechargeable lights", "Smart lighting", "Outdoor fixtures"],
        "points": [
            ("Light first", "Beam shape, glare and colour temperature decided alongside the form, not after it."),
            ("Thermal paths", "Housings that move LED heat away quietly — no fans, no hot spots."),
            ("Joints that hold", "Friction hinges and balanced arms that stay where you put them."),
        ],
    },
    {
        "slug": "defense", "num": "03", "name": "Defense", "short": "Defense",
        "color": "navy", "ink": "#fff", "art": "light",
        "intro": "Rugged equipment for defense and security users — designed to work in the field, in gloves and under stress, and to pass the environmental tests it is built for.",
        "types": ["Rugged enclosures & cases", "Field & soldier-worn equipment", "Protective equipment", "Communication devices", "Sensor & optics housings"],
        "points": [
            ("Built for the field", "Sealing, drop protection and materials planned around environmental test requirements from day one."),
            ("Usable under stress", "Controls, grips and interfaces sized for gloved hands, low light and fast, error-free use."),
            ("Ready for the supply chain", "Documentation, tolerances and manufacturing files prepared for qualified suppliers and long production runs."),
        ],
    },
    {
        "slug": "packaging", "num": "04", "name": "Packaging", "short": "Packaging",
        "color": "teal", "ink": "#111111", "art": "dark",
        "intro": "Packaging and dispensers that protect the product, sell it on the shelf and run fast on the production line.",
        "types": ["Bottles & closures", "Dispensers & pumps", "Cosmetic packaging", "Retail & display packaging", "Sustainable packaging"],
        "points": [
            ("Shelf impact", "Shapes and branding surfaces that stand out at arm's length."),
            ("Line-ready", "Designed for filling lines, stacking and transport, with tooling cost in mind."),
            ("Less material", "Mono-materials, lighter walls and recyclable choices without losing strength."),
        ],
    },
    {
        "slug": "consumer-electronics", "num": "05", "name": "Consumer electronics", "short": "Electronics",
        "color": "steel", "ink": "#fff", "art": "light",
        "intro": "Devices people hold every day — enclosures, buttons and mechanisms engineered around the electronics inside.",
        "types": ["Audio devices", "Remote controls & wearables", "Smart home devices", "Chargers & accessories", "Handheld tools"],
        "points": [
            ("Built around the PCB", "Housing, battery and boards packaged together so nothing is an afterthought."),
            ("Feel of quality", "Button travel, click and surface finish tuned to feel precise."),
            ("Assembly that scales", "Snap-fits, screws and seals planned for fast, repeatable assembly."),
        ],
    },
]

SHAPES = ["0 0 0 50%", "50% 50% 0 0", "0 50% 0 0", "50%", "0 0 50% 0"]
CARD_SHAPES = ["0 0 140px 0", "140px 140px 0 0", "24px", "0 140px 0 0", "50% 50% 24px 24px", "140px 0 0 0"]

HEADER = '''<a class="skip" href="#main">Skip to content</a>
<header class="header" id="header">
  <div class="wrap header__inner">
    <a class="logo" href="/" aria-label="KLIPYDESIGN — home">
      <img class="logo__img" src="/assets/img/logo/klipy-logo-128.png" alt="" width="40" height="40">
      <span class="logo__word">KLIPY<b>DESIGN</b></span>
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="/projects/">Projects</a>
      <a href="/#capabilities">Capabilities</a>
      <a href="/#studio">Studio</a>
      <a href="/#contact" class="nav__contact">Contact</a>
    </nav>
    <a class="btn btn--dark btn--sm header__cta magnetic" href="/#contact"><span class="dot" aria-hidden="true"></span>Let's talk</a>
    <button class="burger" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span></button>
  </div>
  <span class="header__progress" aria-hidden="true"></span>
</header>'''

FOOTER = '''<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <img class="footer__logo" src="/assets/img/logo/klipy-logo-128.png" alt="KLIPYDESIGN" width="64" height="64" loading="lazy">
      <p class="label label--accent">Industrial design studio</p>
      <p class="footer__pitch">Complete idea-to-product support for brands and founders.</p>
      <a class="link" href="mailto:studio@klipydesign.com">studio@klipydesign.com</a>
    </div>
    <nav aria-label="Footer">
      <p class="label">Categories</p>
{cats}
    </nav>
    <div>
      <p class="label">Studio</p>
      <a href="/projects/">All projects</a><a href="/#capabilities">Capabilities</a><a href="/#studio">Studio</a><a href="/#contact">Inquiry</a>
    </div>
  </div>
  <div class="wrap footer__bottom label">
    <span>© <span id="year">2026</span> KLIPYDESIGN.COM</span>
    <span>Tel Aviv, Israel — working worldwide</span>
  </div>
</footer>'''


def page(i, c):
    e = escape
    nxt = CATEGORIES[(i + 1) % len(CATEGORIES)]
    footer_cats = "\n".join(f'      <a href="/{x["slug"]}/">{e(x["name"])}</a>' for x in CATEGORIES)
    cur_attr = ' aria-current="page"'
    others = "\n".join(
        f'      <a class="pill-link{" is-current" if x is c else ""}" href="/{x["slug"]}/" style="--c:var(--{x["color"]});--ink:{x["ink"]}"'
        f'{cur_attr if x is c else ""}><span>{x["num"]}</span>{e(x["name"])}</a>'
        for x in CATEGORIES)
    types = "\n".join(f'          <li>{e(t)}</li>' for t in c["types"])
    points = "\n".join(
        f'        <article><span class="label">0{j + 1}</span><h3>{e(h)}</h3><p>{e(p)}</p></article>'
        for j, (h, p) in enumerate(c["points"]))
    # Project cards are filled in by GitHub's site builder from the _projects folder.
    products = (
        '        {% assign items = site.projects | where: "category", "' + c["slug"] + '" | sort: "order" %}\n'
        '        {% for p in items %}{% include project-card.html p=p %}{% endfor %}\n'
        '        <article class="pcard pcard--next">\n'
        '          <a class="pcard__panel pcard__panel--cta" href="/#contact">\n'
        '            <span>Your ' + e(c["short"].lower()) + ' product, next.</span>\n'
        '            <span class="btn btn--dark btn--sm">Start a project →</span>\n'
        '          </a>\n'
        '        </article>'
    )
    title = f'{c["name"]} Design | KLIPYDESIGN Industrial Design Studio'
    desc = f'{c["name"]} designed by KLIPYDESIGN.COM: {c["intro"]}'
    return "---\nlayout: null\n---\n" + f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- Generated by tools/build_categories.py — edit the data there and re-run -->
<title>{e(title)}</title>
<meta name="description" content="{e(desc[:300])}">
<link rel="canonical" href="https://klipydesign.com/{c["slug"]}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="KLIPYDESIGN.COM">
<meta property="og:url" content="https://klipydesign.com/{c["slug"]}/">
<meta property="og:title" content="{e(c["name"])} — KLIPYDESIGN">
<meta property="og:description" content="{e(c["intro"])}">
<meta property="og:image" content="https://klipydesign.com/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"Service","name":"{e(c["name"])} industrial design","serviceType":"Industrial design","provider":{{"@type":"ProfessionalService","name":"KLIPYDESIGN","url":"https://klipydesign.com/","logo":"https://klipydesign.com/assets/img/logo/klipy-logo-512.png"}},"areaServed":"Worldwide","description":"{e(c["intro"])}"}}
</script>
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="catpage" style="--c:var(--{c["color"]});--ink:{c["ink"]}">
{HEADER}

<main id="main">
  <section class="cat-hero">
    <div class="wrap cat-hero__grid">
      <div class="cat-hero__text">
        <p class="label label--accent"><a class="link" href="/">Home</a> <span>/</span> Category {c["num"]} of 0{len(CATEGORIES)}</p>
        <h1 class="cat-hero__title">{e(c["name"])}<span style="color:var(--c)">.</span></h1>
        <p class="hero__sub">{e(c["intro"])}</p>
        <div class="hero__ctas">
          <a class="btn btn--dark magnetic" href="/#contact">Start a {e(c["short"].lower())} project <span class="arrow" aria-hidden="true">→</span></a>
          <a class="btn btn--ghost magnetic" href="#products">See the work</a>
        </div>
      </div>
      <div class="cat-hero__shape" style="border-radius:{SHAPES[i]}">
        <img src="/assets/img/categories/{c["slug"]}-{c["art"]}.svg" alt="" aria-hidden="true" width="400" height="400">
        <span class="label cat-hero__num">{c["num"]}</span>
      </div>
    </div>
  </section>

  <section class="section section--line">
    <div class="wrap">
      <div class="sec-head">
        <p class="label label--accent"><span>01 /</span> What we design</p>
        <div>
          <h2 class="h2 reveal">From first sketch to the production line.</h2>
          <ul class="type-list stagger">
{types}
          </ul>
        </div>
      </div>
      <div class="points stagger">
{points}
      </div>
    </div>
  </section>

  <section class="section section--line" id="products">
    <div class="wrap">
      <div class="sec-head">
        <p class="label label--accent"><span>02 /</span> Selected {e(c["short"].lower())} work</p>
        <h2 class="h2 reveal">Products in this category.</h2>
      </div>
      <div class="pgrid stagger">
{products}
      </div>
    </div>
  </section>

  <section class="cat-cta">
    <div class="wrap cat-cta__inner">
      <h2>Have a {e(c["short"].lower())} product in mind?</h2>
      <a class="btn btn--dark magnetic" href="/#contact">Let's talk about your project <span class="arrow" aria-hidden="true">→</span></a>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <p class="label" style="margin-bottom:20px">All categories</p>
      <nav class="pill-row" aria-label="Product categories">
{others}
      </nav>
      <a class="cat-next" href="/{nxt["slug"]}/" style="--c:var(--{nxt["color"]})">
        <span class="label">Next category</span>
        <span class="cat-next__name">{e(nxt["name"])} <span aria-hidden="true">→</span></span>
      </a>
    </div>
  </section>
</main>

{FOOTER.format(cats=footer_cats)}

<script src="/assets/js/main.js" defer></script>
</body>
</html>
'''


def main():
    for i, c in enumerate(CATEGORIES):
        out = ROOT / c["slug"] / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(page(i, c), encoding="utf-8")
        print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()

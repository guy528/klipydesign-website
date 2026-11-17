# KLIPYDESIGN.COM

Website for KLIPYDESIGN, an industrial design studio in Tel Aviv. Plain HTML, CSS and JavaScript — no build step — hosted free on GitHub Pages.

## Files

| File | What it holds |
|---|---|
| `index.html` | All page content: text, projects, services, contact details |
| `assets/css/style.css` | Colours, fonts and layout (colours are at the top, in `:root`) |
| `assets/js/main.js` | Interactions and the contact-form settings (top of the file) |
| `assets/img/` | Images — the `.svg` files are placeholders to replace |
| `sitemap.xml`, `robots.txt` | For Google |

## Before launch

1. **Photos** — replace `assets/img/project-*.svg`, `cap-*.svg` and `studio.svg` with real photos (product cut-outs as PNG/WebP work best on the coloured pills) and update the `src` in `index.html`.
2. **Text in [brackets]** — project types, descriptions, specs and the client testimonial in `index.html`.
3. **Check facts** — founding year (2009), stats, phone number, social links.
4. **Contact form** — create a free form at formspree.io and paste its ID into `FORM_ENDPOINT` in `assets/js/main.js`. Until then the form opens the visitor's email app.

## Product categories

The coloured shapes in the hero are the five product categories. Each links to its own page
(`kitchen/`, `lighting/`, `defense/`, `packaging/`, `consumer-electronics/`).

- **Category text and products** live in `tools/build_categories.py`. Edit the `CATEGORIES` list and run
  `python3 tools/build_categories.py` to rebuild the five pages.
- **Hover images**: `assets/img/categories/*-light.svg` / `*-dark.svg` are line-drawing placeholders.
  Replace them with real product photos (JPG/WebP) and update the `src` in `index.html` and in the build script.
- **Shapes and timing**: the four mosaic layouts and the speed (`MORPH_EVERY_MS`) are at the top of the
  mosaic section in `assets/js/main.js`.

## Preview locally

Run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Publish (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

### Custom domain (klipydesign.com)

1. Settings → Pages → Custom domain: `klipydesign.com` → Save (this adds a `CNAME` file).
2. At your domain registrar add DNS records:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `<user>.github.io`
3. When the certificate is ready, tick **Enforce HTTPS**.

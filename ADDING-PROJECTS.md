# Adding a project to klipydesign.com

Every project is **one text file** in the `_projects` folder plus **its photos** in
`assets/img/projects/<project-name>/`. When you commit them on GitHub, the site rebuilds by
itself in about a minute, and the project appears:

- on its own page — `klipydesign.com/projects/<project-name>/`
- on its category page (Kitchen, Lighting, Defense, Packaging or Consumer electronics)
- on the Projects page — `klipydesign.com/projects/`
- in "Selected works" on the homepage, if `featured: true`
- in the sitemap for Google (unless `placeholder: true`)

## Step 1 — Upload the photos

1. On your computer, make a folder named after the project — lower case with dashes,
   e.g. `smart-kettle` — and put the photos in it.
2. On github.com, open the repository → `assets` → `img` → `projects`.
3. Click **Add file → Upload files**.
4. Drag the **whole folder** (not just the photos) into the upload area. GitHub keeps the
   folder, so the photos land in `assets/img/projects/smart-kettle/`.
5. Click **Commit changes**.

To add photos to a project that already has a folder (e.g. `aurelis`), open that folder
first, then **Add file → Upload files** and drag in just the photos.

Photo tips:
- **Cover**: a clean product shot. A cut-out on a transparent background (PNG/WebP) looks best on the coloured panels.
- Use simple file names: `cover.jpg`, `sketch.jpg`, `prototype.jpg`.
- Keep each photo under about 500 KB (1600–2000 px wide is plenty). Squoosh.app shrinks them for free.

## Step 2 — Add the project file

1. Open `PROJECT-TEMPLATE.md` in the repository and copy all of its text.
2. Go into the `_projects` folder → **Add file → Create new file**.
3. Name it `smart-kettle.md` (lower case, dashes, ending in `.md`).
4. Paste the template and change the details:
   - `category` must be one of: `kitchen`, `lighting`, `defense`, `packaging`, `consumer-electronics`.
   - `cover` and `gallery` paths must match the photos you uploaded in Step 1.
   - Keep the `---` lines at the top and bottom of the details block exactly as they are.
5. Below the second `---`, write the story. Lines starting with `## ` become headings.
6. Click **Commit changes**.

## Step 3 — Check it

After about a minute open `klipydesign.com/projects/` (refresh with Ctrl+Shift+R).
If the project doesn't appear, open the **Actions** tab in the repository: a red ✗ means the
build failed — click it to see which line has a mistake (usually a missing quote or a
misspelt category).

## Editing an existing project

Open its file in `_projects`, click the pencil icon, change the text and commit.
The five starter projects (Aurelis, Nova Sense, Atlas, Kinetic, Vital) have
`placeholder: true` — they're hidden from Google until you replace the text in [brackets]
and change it to `placeholder: false`.

## Removing a project

Open its file in `_projects` → **⋯ → Delete file** → commit.

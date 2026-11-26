# Add a p5 sketch to the garden

Keep developing the sketch in your local sketch folder. When you're ready to share a version, copy its browser files into this repo. Edit the accompanying garden note in Obsidian so your next Digital Garden publish includes your changes.

## 1. Give the sketch a permanent URL

Each sketch gets a folder under `src/site/scripts/creativecoding/`. Eleventy publishes that folder at `https://brianscorner.net/scripts/creativecoding/<folder>/`. Keep the folder name stable once you've linked to it.

For example, to add a sketch called **Sketch 2 — Ripples**, run these commands from the garden repo root. Replace the source path and folder name with yours.

```sh
source_dir="/path/to/your/sketch"
sketch_dir="src/site/scripts/creativecoding/sketch2_ripples"

mkdir -p "$sketch_dir"
cp src/site/scripts/creativecoding/sketch1_bubbles/index.html "$sketch_dir/"
cp "$source_dir/sketch.js" "$sketch_dir/"
cp -R "$source_dir/css" "$sketch_dir/"
```

Open the copied `index.html` and update its `<title>`. The [Bubbles example](src/site/scripts/creativecoding/sketch1_bubbles/index.html) loads p5 from jsDelivr before loading the local `sketch.js`. Set the CDN version to the one you developed with. The example uses:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.min.js"></script>
```

Copy any images, fonts, shaders, or extra scripts the sketch uses, preserving their relative paths. If your sketch has different CSS or needs an add-on such as p5.sound, update the HTML to match and load the add-on from a versioned CDN URL. Leave local p5 library files and `node_modules/` in the development folder.

## 2. Preview and deploy

Run `npm start` from the garden repo root. Open `/scripts/creativecoding/sketch2_ripples/` on the local server it prints. Check that the sketch runs and its assets load, then stop the server with Ctrl+C.

On `main`, commit the new sketch folder, pull any commits Obsidian has published, and push:

```sh
git add -- "$sketch_dir"
git commit -m "Add ripples sketch"
git pull --rebase origin main
git push origin main
```

When the GitHub Pages workflow finishes, open `https://brianscorner.net/scripts/creativecoding/sketch2_ripples/` to check the deployed sketch.

## 3. Embed it from Obsidian

Open **Creations → Creative Coding** in your vault, or create a note under **Projects** and enable the `dg-publish` property. Paste this iframe on its own line, then publish the note with the Digital Garden plugin.

```html
<iframe src="https://brianscorner.net/scripts/creativecoding/sketch2_ripples/" title="Sketch 2 — Ripples" loading="lazy" style="display:block; width:100%; max-width:800px; aspect-ratio:4/3; border:0;"></iframe>
```

Use your sketch's folder name and title. The example dimensions suit an 800 × 600 canvas. Adjust the width and aspect ratio for other sizes, and check the embed at phone width.

For later updates, copy the changed sketch files into the same garden folder and repeat the preview and deploy step. The existing Obsidian embed will pick up the new version at the same URL.

---
{"dg-publish":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"]}
---

# This is the beginning

of my digital garden / blog thing.

Hi.

<button id="random-note-button">🎲 Go to Random Note</button>

<script>
let notes = null;

async function loadNotes() {
  if (notes) return notes;
  const res = await fetch("/searchIndex.json");
  const data = await res.json();
  notes = data.map(e => e.url);
  return notes;
}

async function goToRandomNote() {
  const notes = await loadNotes();
  const random = notes[Math.floor(Math.random() * notes.length)];
  if (random == "/") {
	  await goToRandomNote();
  }
  window.location.href = random;
}

document.getElementById("random-note-button")
  .addEventListener("click", goToRandomNote);
</script>

<h2>Most recently published</h2>
<div id="recent-notes">

</div>

<script>
  const RECENT_COUNT = 7; // <-- "x"
  const INDEX_URL = "/searchIndex.json";

  function pickTitle(e) {
    return e.title || e.name || e.heading || e.fileName || e.url || "(untitled)";
  }

  function pickCreated(e) {
    // Try a handful of common field names.
    // Once you inspect searchIndex.json, replace this with the exact key you have.
    return (
      e.created ||
      e.createdAt ||
      e.ctime ||
      e.creationTime ||
      e.date ||
      e.published ||
      e.publishedAt ||
      null
    );
  }

  function toTime(value) {
    if (!value) return null;
    // Accept ISO strings, epoch ms, or anything Date() can parse.
    const n = (typeof value === "number") ? value : Date.parse(value);
    return Number.isFinite(n) ? n : null;
  }

  async function renderRecent() {
    const mount = document.getElementById("recent-notes");

    const res = await fetch(INDEX_URL, { cache: "no-store" });
    const data = await res.json();

    const notes = (Array.isArray(data) ? data : [])
      .filter(e => e && e.url && e.url !== "/")
      .map(e => {
        const createdRaw = pickCreated(e);
        const createdTime = toTime(createdRaw);
        return { ...e, _createdTime: createdTime };
      })
      // Put “unknown date” items at the end
      .sort((a, b) => (b._createdTime ?? -Infinity) - (a._createdTime ?? -Infinity))
      .slice(0, RECENT_COUNT);

    if (!notes.length) {
      mount.innerHTML = "<em>No notes found.</em>";
      return;
    }

    const items = notes.map(e => {
      const title = pickTitle(e);
      const date = e._createdTime ? new Date(e._createdTime).toLocaleDateString() : "";
      const dateHtml = date ? ` <small style="opacity:0.7">(${date})</small>` : "";
      return `<li><a href="${e.url}">${title}</a>${dateHtml}</li>`;
    }).join("");

    mount.innerHTML = `<ol>${items}</ol>`;
  }

  renderRecent().catch(err => {
    console.error(err);
    const mount = document.getElementById("recent-notes");
    mount.innerHTML = "<em>Couldn’t load recent notes.</em>";
  });
</script>

_____________
[Send me a comment!](https://forms.gle/B5rkQCYMBTHrR6fDA)
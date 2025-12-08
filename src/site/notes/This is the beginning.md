---
{"dg-publish":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"]}
---

# This is the beginning

of my digital garden / blog thing.

Hi.

Here are my best articles:
[[My first page\|My first page]]
[[My second page\|My second page]]

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
  window.location.href = random;
}

document.getElementById("random-note-button")
  .addEventListener("click", goToRandomNote);
</script>


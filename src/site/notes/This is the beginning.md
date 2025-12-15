---
{"dg-publish":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"],"created":"2025-12-07T16:43:50.597-05:00","updated":"2025-12-15T18:28:49.233-05:00"}
---

# This is the beginning

of my digital garden / blog thing.

Hi.

A starting point:
- [[Meta/On Blogging/What Is This\|What Is This]]


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

_____________
[Send me a comment!](https://forms.gle/B5rkQCYMBTHrR6fDA)
---
{"dg-publish":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"],"created":"2025-12-07T16:43:50.597-05:00","updated":"2025-12-13T13:13:20.567-05:00"}
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

- [[Meta/On Blogging/My Past Self Telling Me To Start a Blog\|My Past Self Telling Me To Start a Blog]]: — \-
- [[Meta/On Blogging/Blogging Inspiration\|Blogging Inspiration]]: — \-
- [[Meta/On Blogging/Reasons to Write (Here)\|Reasons to Write (Here)]]: — \-
- [[Meta/On Blogging/Please Don't Spearphish Me (Creating an Obsidian Plugin)\|Please Don't Spearphish Me (Creating an Obsidian Plugin)]]: — \-
- [[Meta/Garden Improvements\|Garden Improvements]]: — \-
- [[Meta/Obsidian Setup\|Obsidian Setup]]: — \-
- [[Media I Have Consumed/Movies/The Chef of South Polar (2009)\|The Chef of South Polar (2009)]]: — \-

{ .block-language-dataview}

_____________
[Send me a comment!](https://forms.gle/B5rkQCYMBTHrR6fDA)
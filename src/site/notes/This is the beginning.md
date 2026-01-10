---
{"dg-publish":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"],"created":"2025-12-07T16:43:50.597-05:00","updated":"2026-01-09T16:39:03.799-05:00"}
---

# This is the beginning

of my digital garden / blog thing. 

Hi.

This is a mix of a blog and personal wiki. It's a place for me to:
- Comment on media I've consumed
- Share about my interests and personal projects
- Document viewpoints or aspects of my life that I want to share with the world

For more explanation: [[Meta/On Blogging/What Is This\|What Is This]]

I recommend looking at the hierarchy of topics and seeing what catches your interest, or use the Random Note button below, or pick from the list of recently updated posts.

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

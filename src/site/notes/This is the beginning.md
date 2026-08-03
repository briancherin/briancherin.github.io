---
{"dg-publish":true,"dg-home":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"],"dgPassFrontmatter":true}
---

# Welcome

to my little corner of the Internet. 

Hi.

This is a mix of a blog and personal wiki. It's a place for me to:
- Comment on media I've consumed
- Share about my interests and personal projects
- Document viewpoints or aspects of my life that I want to share with the world

Pages here come in different flavors:
- Some are more polished, traditional blog posts or reviews
- Some are smaller notes, lists, or quick thoughts
- Some are placeholder pages that I'll expand on later. Generally any page might be in-progress and subject to change or be added to.

Suggested starting points:
- For more explanation: [[Meta/On Blogging/What Is This\|What Is This]]
- For monthly musings / what I've been up to: [[Misc/Whats Up\|What's Up]]

I recommend looking at the hierarchy of topics and seeing what catches your interest, or use the Random Note button below, or pick from the list of recently updated posts.

You can also [[Meta/Subscribe For Email Updates\|Subscribe For Email Updates]] if you'd like to stay tuned.

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

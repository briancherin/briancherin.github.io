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


| File                                                                                                                                       | Date |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| [[Meta/Garden Improvements\|Garden Improvements]]                                                                                       | \-   |
| [[Meta/On Blogging/Blogging Inspiration\|Blogging Inspiration]]                                                                         | \-   |
| [[Meta/On Blogging/Please Don't Spearphish Me (Creating an Obsidian Plugin)\|Please Don't Spearphish Me (Creating an Obsidian Plugin)]] | \-   |
| [[Meta/On Blogging/My Past Self Telling Me To Start a Blog\|My Past Self Telling Me To Start a Blog]]                                   | \-   |
| [[Meta/On Blogging/Reasons to Write (Here)\|Reasons to Write (Here)]]                                                                   | \-   |
| [[Meta/Obsidian Setup\|Obsidian Setup]]                                                                                                 | \-   |
| [[Projects/Software/Game Development/Game Dev Inspiration\|Game Dev Inspiration]]                                                       | \-   |

{ .block-language-dataview}


_____________
[Send me a comment!](https://forms.gle/B5rkQCYMBTHrR6fDA)
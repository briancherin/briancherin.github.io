---
{"dg-publish":true,"permalink":"/this-is-the-beginning/","tags":["gardenEntry"]}
---

# This is the beginning

of my digital garden / blog thing.

Hi.

Here are my best articles:
[[My first page\|My first page]]
[[My second page\|My second page]]


<div id="random-note">Loading…</div>
<script>
(async () => {
  const res = await fetch("/searchIndex.json");
  const entries = await res.json();
  const pages = entries.map(e => e.href);
  const random = pages[Math.floor(Math.random() * pages.length)];
  document.getElementById("random-note").innerHTML =
    `<a href="${random}">🎲 Random Note</a>`;
})();
</script>


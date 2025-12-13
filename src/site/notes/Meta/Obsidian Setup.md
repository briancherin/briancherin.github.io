---
{"dg-publish":true,"permalink":"/meta/obsidian-setup/"}
---

#obsidian 

Most of the setup for this blog is handled by the  [Obsidian Digital Garden plugin](https://github.com/oleeskild/Obsidian-Digital-Garden).

My current theme from the Obsidian Digital Garden theme library is "Blue Topaz".

#### Webpage footer
Following the [custom components](https://dg-docs.ole.dev/advanced/adding-custom-components) guide for the DG plugin, I added the link to my feedback form using a footer component which I manually added in `src/site/_includes/components/user/notes/footer/feedback-form.njk` ([github link](https://github.com/briancherin/briancherin.github.io/blob/main/src/site/_includes/components/user/notes/footer/feedback-form.njk))


#### Feed.xml fix
The Obsidian Digital Garden plugin automatically generates an RSS feed at the /feed.xml route at the root of the site. But when I navigated there, I saw this error:
`error on line 48 at column 17: Opening and ending tag mismatch: link line 47 and entry`
https://github.com/oleeskild/obsidian-digital-garden/issues/493
I found this [Github issue]() that helped resolve this. The solution was to manually go into the site's Github repo and edit `src/site/feed.njk` so that all of the \<link\> tags have a closing tag with five backslashes instead of four (yes this is a weird error/workaround).


#### Setting custom domain name
I added garden.briancher.in as my domain in Github Pages settings, but it got cleared any time I published a note from Obsidian. Thankfully I quickly found a note in the repo's readme which said I needed to add the domain also to .github/workflows/build.yml.
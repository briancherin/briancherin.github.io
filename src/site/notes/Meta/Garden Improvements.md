---
{"dg-publish":true,"permalink":"/meta/garden-improvements/","created":"2025-12-07T17:13:34.190-05:00","updated":"2026-01-21T18:33:15.880-05:00"}
---

#digitalgarden 

Things to do:
- [x] (Done 12/13/2025) Set my own favicon instead of the default
- [x] add a commenting system
	- [x] (Done, 12/8/2025) Or at least an (optionally-anonymous) feedback/contact form in the mean time
- [x] make it so the date published and date last updated appears on pages
- [ ] make a list of my hobbies/interests (and then eventually link pages/folders from them)
- [x] be able to see page view count (analytics) (possibly some good guidance [here](https://tjpalanca.com/2023/05/20/nerfing-google-analytics.html)) (Done, 1/21/2026, and followed some of the privacy suggestions from the link, specifically the four privacy settings it described about disabling ad-based tracking, though I didn't implement the consent dialogue it described.)
- [x] (Done, 12/8/2025) Fix /feed.xml so it can generate RSS feed. There's an issue with the html snippet on the homepage for the 'random note' button
- [ ] Post this site to Kagi Small Web
- [ ] Make a visualization to see frequency of posts over time 
- [ ] May want to eventually setup Obsidian to host images/other_assets on S3 instead of on Github. The Digital Garden plugin mentioned that the site may slow down if the assets pile up since you can't store that much on Github. I found this Obsidian [plugin](https://github.com/biubiubiu35/image-paste-to-cloud) which might be the solution for an auto-S3 upload of images. ChatGPT is also suggesting Cloudfront R2 may be a better image hosting option to reduce retrieval costs (but still minimal storage costs) but also have a backup to S3 for peace of mind. Makes plugin setup a bit more complicated though.
- [x] Add on-hover preview to footnotes so you can preview content without jumping to bottom of page

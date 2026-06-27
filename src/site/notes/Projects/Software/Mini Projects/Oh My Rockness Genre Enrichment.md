---
{"dg-publish":true,"permalink":"/projects/software/mini-projects/oh-my-rockness-genre-enrichment/"}
---

[Oh My Rockness](https://www.ohmyrockness.com/) is a website that lists music shows in NYC. It also lets you filter by shows that are free to attend. I've never actually attended a show through the site, but I've wanted to. 

![ohmyrockness.png](/img/user/Projects/Software/Mini%20Projects/Assets/ohmyrockness.png)

My one qualm with it is that it does not easily show the genre of the bands or a description of the kind of music they play. There are so many event listings that it's hard to make a choice of which I might be interested in.

For a while, I've had an idea floating in my mind to create some way to easily tell what the genres of the bands are.

Today I decided to have an AI coding session to come up with a solution. And it worked out pretty well!

![ohmyrocknessenrichment.png](/img/user/Projects/Software/Mini%20Projects/Assets/ohmyrocknessenrichment.png)

It scrapes from ohmyrockness as you flip through the dates, and pulls genre data from Spotify and Last.fm. Also includes a convenient link to the artist in Spotify. It took about an hour to spin this up.

It's locally only, and currently I don't plan to host it anywhere, but we'll see. For one thing, I'd worry that ohmyrockness would not be happy about a mirror of their site. Maybe a browser extension to augment the existing ohmyrockness site with genre data would be better than hosting a standaline webapp. But for now, this tool perhaps will be useful to me. (I do sense there is a flaw for my local setup in that it must be run on my laptop, and there may be times when I want to know about current music events from my phone while I'm on-the-go. Maybe I'll be motivated to host this somewhere small just for my own use.)

Anyone can set this up locally if desired -- you just need a Spotify and/or Last.FM API key. Note that Spotify API requires a premium account, but Last.FM is free and it should work with just that.

Note - this may be buggy and imperfect. Haven't tested it thoroughly.

Code is on Github: https://github.com/briancherin/ohmyrockness-genre-enrichment
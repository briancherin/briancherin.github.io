---
{"dg-publish":true,"permalink":"/meta/on-blogging/please-don-t-spearphish-me-creating-an-obsidian-plugin/","created":"2025-12-08T18:16:54.756-05:00","updated":"2025-12-09T18:28:11.160-05:00"}
---

#digitalgarden #obsidian #cybersecurity #privacy #project #coding #miniproject

Anytime I make a new public appearance (like making a new social media account, or this blog) I ask myself: am I revealing too much about myself to the Internet? I have some background in cybersecurity (meaning: a handful of classes at university), so I have some mental framework that lets me contemplate the consequences of having information about myself online.

There's a little voice in my head saying not to publish an article with this title ("please don't spearphish me") because it might act as reverse psychology and give someone the idea to do it just because I mentioned it. Please don't be that person.

Anyway, my point here is that I'm building some level of a safeguard for myself. A tool that might help me catch myself before revealing too much.

Is this a perfect solution? No.

Am I overthinking this? Maybe.

But just like my footnote in my [[Media I Have Consumed/Podcasts/1 Second Everyday - Indie Hackers Podcast\|1 Second Everyday - Indie Hackers Podcast]] post ("It's scary sometimes how easy it might be to ruin your own life"), I feel that exposing some little piece of information about yourself in public could cause some mess for you. At best? Someone being creepy and sending you weird messages. At worst? Someone identifying a routine that you have and stalking you in real life. Or just hacking you via a spearphishing email that contains a link or download you mindlessly click.

So what's my little solution for this? An Obsidian plugin that will audit the current note I've written and tell me if I'm revealing too much information in the post. (Obsidian is the text editor I use to write these blog posts, and I use the [Obsidian Digital Garden plugin](https://github.com/oleeskild/Obsidian-Digital-Garden) for help building+publishing to this site.)

## How it works
This is the workflow:
1. Install the plugin (see instructions on the Github repo, linked below) and set your OpenAI API key in the plugin settings. You can also modify the system prompt that tells the AI how to interpret your note and what the output should look like.
2. You write a note in Obsidian.
3. Open the command palette (ctrl/cmd + P) and run "Privacy Audit".
4. The request will be processed by the OpenAI API and the result will be opened in a side panel.

## More details
I used ChatGPT to help me code this up. It didn't take long to set it up locally and test it out in Obsidian.

The plugin uses the OpenAI API to ask GPT to review the note and make any suggestions.

I've published the code to my Github [here](https://github.com/briancherin/obsidian-ai-privacy-audit) and I've made a [Pull Request](https://github.com/obsidianmd/obsidian-releases/pull/8887) on the Obsidian repo to get this added to the community plugin list so that anyone can access it. A fun little open-source contribution that I hope someone might find helpful! I'm pretty new to the Obsidian and Digital Gardening scene, so I hope the universe will forgive me if something like this already exists (I swear, I don't mean to flood the plugin list with slop).

## Examples
The command:
![dontspearpishme-command-palette.png](/img/user/Meta/On%20Blogging/Assets/Images/dontspearpishme-command-palette.png)

The plugin catches my reveal of a routine:
![dontspearphishme-example1.png](/img/user/Meta/On%20Blogging/Assets/Images/dontspearphishme-example1.png)

The plugin catches my reveal of corporate information:
![dontspearphishme-example2.png](/img/user/Meta/On%20Blogging/Assets/Images/dontspearphishme-example2.png)

No issues with this one! It gives some extraneous suggestions about my clearly engaging content:
![dontspearphishme-example3.png](/img/user/Meta/On%20Blogging/Assets/Images/dontspearphishme-example3.png)


## Areas for improvement
- Add a command to run an audit for every file in the vault individually and get a summary of suggested fixes for each
- Add a command to do a comprehensive audit across the whole vault, in case little bits of information in each file add up to a bigger picture (violating your privacy) which wouldn't be revealed within just one file. (This may be complicated since all the files won't fit in one GPT context window. There'd have to be some processing.)
- Add a similar audit to the Github pipeline that actually gets triggered when I publish a note, so I don't have to remember to manually run the audit within Obsidian. If there is a critical warning, maybe fail the job, or maybe just alert me somehow.


## Concluding words

I have a feeling I might think of other AI-related Obsidian plugins in the future.


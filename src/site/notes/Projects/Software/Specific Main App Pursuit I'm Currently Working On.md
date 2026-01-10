---
{"dg-publish":true,"permalink":"/projects/software/specific-main-app-pursuit-i-m-currently-working-on/","created":"2025-12-09T18:08:11.941-05:00","updated":"2026-01-10T15:28:57.577-05:00"}
---

#project 

### Slowness
I started writing down ideas related to this project in July of 2024. It's taken me a really long time to make progress. There are several factors that have caused this.
- General life stuff - changing priorities, other pursuits capturing my interest (like piano and learning Japanese)
- Coding/focusing at work makes it difficult to want to code outside of work
- I got stuck on some infrastructure aspects that took me a while to figure out

Specifically on that last point (stalled infrastructure), now that I've gotten past those hurdles, development of my prototype (writing this as of January 2026) has been speeding along and I'm making a lot of progress. 

I've also decided to use AI to help me code - at this point, if it gets me to work on this project, I want to leverage AI because I just want to have my prototype ready. I've started using OpenAI's codex in my command line (previously I was just occasionally using ChatGPT and copy/pasting relevant code back and forth) and it's made things so much easier.


### The infrastructure troubles
I have a backend API and a frontend (mobile) for this project. I knew from the start that ideally the backend would be hosted on AWS EC2. However, I've done this for a few projects in the past, and realized that since my AWS free tier is expired, having a new EC2 instance running would cost around $10 per month. I didn't want to have that running for the indeterminate amount of time I would spend developing this. 

So I opted to try a different solution, which was to wrap the API in an AWS Lambda function and have the frontend make requests through that. Lambda is much cheaper because it only runs when the call is being executed - as opposed to EC2, which is essentially a sever that is always running, waiting for requests. The main drawback of the Lambda approach was that it takes longer for requests to be processed, since Lambda has to do a "cold start" - it takes extra time to warm up for accepting requests if it hasn't been triggered in a certain amount of time. I was willing to deal with this in the short term.

So I started working on this approach. I developed the first major endpoint of the API. At that point, I had only been testing it locally. Once I was satisfied with the implementation, it was time to deploy it to Lambda in AWS. Unfortunately, I simply could not get it to work. It seemed like everything was set up correctly, but when I would make API requests to the Lambda function (via AWS API Gateway), the requests would fail. I spent a lot of time trying to debug this, but eventually I gave up. 

I decided that I was better off switching to the EC2 approach, which is what I would do in the long term anyway. It didn't take too long to set it up, and I'm really glad I did. Development became so much more manageable after that. This was only a few months ago, at the time of writing this (Jan 2026). I've been shutting off the EC2 instance when I'm not actively working on it so that it doesn't incur unnecessary cost. At this point, however, I have an in-progress prototype frontend and I'm in a phase of actively working on this, so I'm just leaving the instance on.


### Using AI Code Assistance
At the moment, "code assistance" is more like, it's writing all the code for me, given my prompting.

At the beginning of this project, I was intending to do more of the coding on my own and to rely less on AI. However, as mentioned, I've gotten to the point where using AI is what's helping me to stop procrastinating and to actually get results. After sitting on this project for over a year with not much progress, I'm kind of thrilled at how much I've accomplished while using AI. It speeds up development so much, and doesn't force me to expend the mental effort which, if I knew I needed to expend, would probably make me want to avoid the effort. 

I could argue that coding more of it on my own would make me a better programmer, increase my experience, help me learn -- I generally agree with points like those, but in this case, I just want to have my app prototype. 

I am a little bit wary, though. I'll have to see how AI usage impacts codebase maintainability. I am also more distanced from the specific implementation details, which could make it more challenging to debug things that come up. Yes, I could ask AI to debug as well, but there are some things that it couldn't handle, I'm sure. I want to say that I'd be confident in digging through and understanding the code in a debugging situation - and I would be. But would I really do a better job than AI? Well, given my experience of actually doing this for my job, I'd say that yes, there are issues that I can solve that current AI tools can not. Especially when it comes to understanding interactions between different systems and overall architecture. For smaller, self-contained problems, AI is pretty good.

Using AI kind of feels like cheating. But this may just be the future of software development. I don't think I should feel like I'm "cheating". Instead, I'm directing my skills in a different way. I'm performing something closer to a product management and design role. I am defining the specifications of what features and user experience I want, and still thinking through the technical needs in order to implement them. I augment my overall implementation plan with AI input, and then have the AI implement it. But the product specifications aspect is essential. Without it, AI wouldn't have much direction - it might be able to create something like what I want, but it wouldn't be exactly how I want it. So I'm still thinking through the engineering aspects of it -- the AI is just handling the tedious details of actually coding it.


### Not telling people about this project
For a while, I wasn't telling people what my idea was. (*cough*, at the time of writing this, I still haven't described what the actual project is on this blog. I'll get there eventually.)

The reason for this was NOT that I was scared someone would copy the idea.

The reason for not telling people was because I was protecting the fragility of the idea in my own mind. I was scared that I would lose motivation to work on it if someone gave a certain reaction. For example, they might point out that something like this already exists. Even if I still felt my version had value, this person's pointing this out might be enough to deflate my motivation. I was scared of other similar well-meaning but perceived-negatively comments as well. Even someone displaying not as much interest as I might hope them to, could be something that deflated my motivation.

I do believe there is merit in being cautious like this. However, I admit that I dragged that period on for too long. It certainly has to do with how long it took me to make good progress on the project in general. I was telling myself, once I hit a basic prototype, and am certain that there's no turning back from at least that point, I would tell people about it. But it just took so long to get there.

Looking back now, I was losing something by not talking about the idea. It would give me a better sense of whether it's a product people would actually use. I could shift certain priorities in terms of features based on what people find useful. Telling people could also actually *increase* my motivation.

Now that I've got an actual frontend, something I can show people wherever I am (since it's on my phone), which has the basics of what my MVP was supposed to be, I'm starting to talk to more people in my life about it. I can mention that I've been working on a side project, and then show them what it is. 

Maybe it took me too long to get to this point, but it also kind of makes sense that now is the time -- I actually have something to show. I can still reap the benefits of having people give input on the idea. But the idea is less fragile now. My own internal resolve for this particular idea is strong enough that even if someone doesn't think it's useful, I'm confident in giving it the chance that I think it deserves.

Maybe I shouldn't have that fragility in the first place. But given how many ideas for projects I have floating around in my head, I can sometimes be tempted to hop from project to project. It's fine if I decide an idea isn't worth pursuing - I can move onto a different idea. This project in particular felt like it deserved to be pushed through to the end. I just decided I wasn't taking chances. But sure, perhaps I should be less private in the future at the earlier stages of an idea.
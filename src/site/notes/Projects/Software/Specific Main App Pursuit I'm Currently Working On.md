---
{"dg-publish":true,"permalink":"/projects/software/specific-main-app-pursuit-i-m-currently-working-on/","created":"2025-12-09T18:08:11.941-05:00","updated":"2026-01-10T14:18:06.795-05:00"}
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
---
{"dg-publish":true,"permalink":"/random-topics/interactive-narrative/","dgPassFrontmatter":true}
---

- Concept from Ready Player One -- you enter a movie in VR and you have to play along as one of the characters in the movie, say the right lines, etc. 
- Rick and Morty S8E7 ("Ricker Than Fiction") reminded me of this too (though they mess with the plot)

It has occasionally crossed my mind that LLM-based AI could probably get us to something similar. I asked ChatGPT if there are any current research/projects around this.

Pasting ChatGPT's answer in the meantime before I explore the specific links further.

>[!INFO]- ChatGPT
>(ME): "are there any projects/research about: "ai to put yourself into a movie"
like, ai re-enacts a movie script and you take over the role of a character and if you make changes, the plot changes? or reenacting in VR like in ready player one?"
>(CHATGPT:) 
> Yes. The field is usually described as **LLM-based interactive drama**, **generative interactive narrative**, **playable television**, or **interactive generative video**.
> 
> No polished system yet fully combines:
> 
> 1. an existing feature film;
>     
> 2. you physically or vocally performing one character;
>     
> 3. AI actors performing everyone else;
>     
> 4. unrestricted deviations from the script;
>     
> 5. a coherent newly generated plot; and
>     
> 6. real-time cinematic VR.
>     
> 
> Several projects are surprisingly close to individual parts of that idea.
> 
> ## Closest direct research
> 
> ### 1. _From Role-Play to Drama-Interaction_
> 
> This is probably the closest academic match to what you described. The player enters a known story, assumes the role of one character, speaks or takes actions, and interacts with characters controlled by an LLM.
> 
> The researchers built demonstrations based on **Detective Conan, Harry Potter, and Romeo and Juliet**.
> 
> Their “Narrative Chain” system tries to keep the original dramatic progression intact while still responding to the player—a central problem in your idea: what happens when Harry refuses to go somewhere, warns someone early, or otherwise breaks the screenplay?
> 
> - [From Role-Play to Drama-Interaction: An LLM Solution](https://aclanthology.org/2024.findings-acl.196/)
>     
> 
> A 2025 follow-up studies:
> 
> - **immersion**: feeling present inside the story;
>     
> - **agency**: genuinely influencing the story rather than merely choosing dialogue;
>     
> - adapting NPC reactions to the player’s intentions while retaining dramatic structure.
>     
> - [Follow-up paper on immersion and agency in drama interaction](https://aclanthology.org/2025.acl-long.546/)
>     
> 
> These experiments are primarily dialogue-driven rather than photorealistic movies or VR, but conceptually they are almost exactly your proposal.
> 
> ### 2. IBSEN
> 
> IBSEN divides the AI into a **director agent** and multiple **actor agents**.
> 
> The director maintains the overall plot, while the actor agents portray individual characters. When a human enters and changes events, the director can revise the plan and redirect the actors toward a new dramatic objective.
> 
> That “AI director repairs the movie after you disrupt it” architecture is likely how a practical version would work.
> 
> - [IBSEN: Director-Actor Agent Collaboration for Interactive Narrative](https://aclanthology.org/2024.acl-long.88/)
>     
> 
> ### 3. StoryVerse and WhatELSE
> 
> Autodesk Research’s **StoryVerse** generates “living stories” from high-level plot outlines, character simulations, and the changing state of the story world.
> 
> The plot is co-created by the author, simulated characters, and player rather than selected from a fixed branching tree.
> 
> - [StoryVerse](https://www.research.autodesk.com/publications/storyverse/)
>     
> 
> Its successor, **WhatELSE**, lets an author establish a range of permissible alternate plots.
> 
> For example, a studio might decide:
> 
> “The detective may accuse different suspects, lose evidence, or become allied with the villain—but the story must remain a murder mystery and eventually reveal the conspiracy.”
> 
> The system then produces playable events inside those boundaries.
> 
> This is particularly relevant to adapting films because it provides something between a completely fixed script and unrestricted AI improvisation.
> 
> - [WhatELSE](https://www.research.autodesk.com/publications/whatelse/)
>     
> 
> ### 4. NarrativePlay and Open-Theatre
> 
> **NarrativePlay** converts existing narratives into environments where the user selects a fictional character, explores the story, and converses with AI-controlled characters.
> 
> It extracts personalities and major events from the source narrative and adds generated settings and character portraits.
> 
> - [NarrativePlay: Interactive Narrative Understanding](https://arxiv.org/abs/2310.01459)
>     
> 
> **Open-Theatre**, published in 2025, is an open-source toolkit specifically for constructing LLM-based interactive dramas.
> 
> It is a more practical starting point for experimentation than most research-only systems.
> 
> - [Open-Theatre: An Open-Source Toolkit for LLM-Based Interactive Drama](https://aclanthology.org/2025.emnlp-demos.31/)
>     
> 
> ### 5. STAGE
> 
> The 2026 **STAGE** benchmark focuses on whether AI can understand entire movie screenplays well enough to construct character relationships, track events, and perform **in-script character role-playing**.
> 
> It contains structured material covering 150 English- and Chinese-language films.
> 
> It is not itself an interactive movie, but it addresses a prerequisite: the AI needs a reliable internal model of what everyone knows, where they are, what has happened, and how each character should behave at every point in the film.
> 
> - [STAGE: Screenplay Understanding and Character Role-Playing](https://arxiv.org/abs/2601.08510)
>     
> 
> ## The closest actual consumer product: Showrunner
> 
> Fable Studio’s **Showrunner** is currently one of the most direct visual implementations.
> 
> Users can:
> 
> - create or remix animated television scenes;
>     
> - upload themselves or friends as characters;
>     
> - place those characters into a show’s world;
>     
> - provide instructions for what happens next;
>     
> - generate scenes or episodes rather than merely receiving text.
>     
> 
> The app describes itself as serialized AI storytelling and explicitly offers the ability to “put yourself in the show.”
> 
> - [Showrunner app](https://apps.apple.com/ca/app/showrunner-ai-video-generator/id6754945404)
>     
> - [Showrunner Agents research](https://fablestudio.github.io/showrunner-agents/)
>     
> 
> Showrunner is not yet “act continuously inside the movie.” You prompt or remix a scene and then wait for it to be generated.
> 
> It currently works best for relatively self-contained animated episodes, especially formats where characters can reset between installments, rather than a causally complex two-hour movie that continually branches.
> 
> Its creators nevertheless frame the eventual concept as making films and television **playable**, including putting yourself into an existing fictional world and generating alternate continuations.
> 
> ## The visual technology is beginning to catch up
> 
> Runway’s 2026 **Characters** system can generate a responsive, expressive video character in real time from a single reference image.
> 
> A language model and voice system control the conversation while Runway generates the character’s visible performance.
> 
> That could eventually supply the AI “actors” in this kind of experience.
> 
> - [Runway Characters](https://runwayml.com/research/how-real-time-video-generation-is-changing-online-interaction)
>     
> 
> Runway’s **Game Worlds** research is more directly aimed at nonlinear experiences where users explore characters, stories, and environments generated with AI.
> 
> It is still an experimental hybrid rather than a convincing cinematic world.
> 
> - [Runway Game Worlds](https://runwayml.com/research/runway-game-worlds)
>     
> 
> **CinemaWorld**, a 2026 mixed-reality research system, extracts objects and effects from a film and extends them spatially into the viewer’s physical surroundings on a Quest 3.
> 
> It does not alter the story, but it shows how an ordinary 2D movie could be converted into a spatial experience.
> 
> - [CinemaWorld](https://arxiv.org/abs/2603.08060)
>     
> 
> ## What is still missing
> 
> The main obstacle is no longer merely generating dialogue. A complete system must simultaneously maintain:
> 
> - **Narrative causality:** If you prevent an early death, every later scene dependent on that death must be reconsidered.
>     
> - **Character knowledge:** Someone cannot react to information they have not learned in the altered timeline.
>     
> - **Character arcs:** Characters should evolve according to what has happened rather than act like static chatbots.
>     
> - **Long-term visual continuity:** Faces, clothing, rooms, props, injuries, and spatial arrangements must remain consistent.
>     
> - **Real-time generation:** VR generally cannot pause several minutes whenever you speak.
>     
> - **Dramatic quality:** Total freedom often produces shapeless role-play rather than something satisfying as a movie.
>     
> - **Rights and consent:** Commercially inserting users into recognizable films would require licenses covering the story world, characters, performances, voices, likenesses, and generated variations.
>     
> 
> Researchers in interactive generative video still identify real-time rendering, persistent memory, long-horizon coherence, physics, and causal reasoning as major unsolved problems.
> 
> - [Interactive Generative Video survey](https://arxiv.org/abs/2504.21853)
>     
> 
> ## What a plausible near-term version would look like
> 
> The first convincing version probably would not generate photorealistic video from scratch.
> 
> It would likely use:
> 
> 1. a licensed movie screenplay converted into a scene and causal graph;
>     
> 2. a game-engine reconstruction of the sets;
>     
> 3. AI-controlled character agents;
>     
> 4. an AI “director” that maintains dramatic goals;
>     
> 5. voice input and VR body tracking for the player;
>     
> 6. fixed or motion-captured animation augmented by generative facial performance;
>     
> 7. dynamic dialogue and moderately flexible alternate scenes.
>     
> 
> In other words, it would initially resemble **immersive theater inside a video game**, not a perfectly regenerated Hollywood movie.
> 
> Fully generated video could gradually replace the game-engine layer as interactive world models become more stable.
> 
> The research phrase most likely to produce useful results is:
> 
> **“LLM-based interactive drama with player agency and embodied virtual characters”**
> 
> Closely related searches include:
> 
> - **generative drama management**
>     
> - **interactive narrative planning**
>     
> - **story-world simulation**
>     
> - **playable television**
>     
> - **interactive generative video**
>

High level points from ChatGPT i'm curious to explore more about:
- "Their “Narrative Chain” system tries to keep the original dramatic progression intact while still responding to the player—a central problem in your idea: what happens when Harry refuses to go somewhere, warns someone early, or otherwise breaks the screenplay?"
- "IBSEN divides the AI into a director agent and multiple actor agents. The director maintains the overall plot; the actor agents portray individual characters. When a human enters and changes events, the director can revise the plan and redirect the actors toward a new dramatic objective."
- "WhatELSE, lets an author establish a range of permissible alternate plots"
- "The 2026 STAGE benchmark focuses on whether AI can understand entire movie screenplays well enough to construct character relationships, track events and perform in-script character role-playing."
- "Runway’s Game Worlds research is more directly aimed at nonlinear experiences where users explore characters, stories and environments generated with AI"
	- Sounds similar to the [[Random Topics/Ender's Infinite Game\|Ender's Game VR world simulation]]
- 
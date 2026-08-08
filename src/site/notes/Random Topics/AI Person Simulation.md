---
{"dg-publish":true,"permalink":"/random-topics/ai-person-simulation/","dgPassFrontmatter":true}
---

- **Generative Agents: Interactive Simulacra of Human Behavior — Park et al. (2023)**
	- https://arxiv.org/abs/2304.03442
	- https://www.youtube.com/watch?v=XY5Wncq5vAE
	- Experiment - simulated a small town called "Smallville" with a bunch (couple dozen?) of characters - only input from the start is small character bios. Agents then live out their day to day lives and have interactions with each other. There is some emerging social behavior in the agents, like dissemination of information through the community, and collective gathering.
	- Important components
		- Memory - each agent has a list of actions/observations representing what it's done, said, etc
		- Reflections - to help the AI to make decisions without the huge context of full list of memories. Series of observations are turned into a tree of 'reflections': e.g. "Character A is reading a book" + "Character A visits the library" --> reflection: "Character A likes to read".
		- Planning - agents show more believable behavior if they follow long-term plans which guide their actions/decisions. e.g. could be at the scale of one day (plan is what they'll do that day), then they break it down into more granular chunks, for every hour and then every 5-15 minutes. They also give the option for editing plan if circumstances change, e.g. someone else has a conversation with them in the middle of the day.
		- In the simulation, the human can intervene and ask the characters questions (acting as the 'reporter'), they can influence the character's actions by acting as the 'inner voice', and they can also directly take control over the character.
- **Agentopia: Long-Term Life Simulation and Learning in Agent Societies — Wang et al. (June 2026)**
	- https://arxiv.org/abs/2606.07513
	- html https://arxiv.org/html/2606.07513v1
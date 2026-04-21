---
{"dg-publish":true,"permalink":"/projects/software/mini-projects/gpt-meal-planner/","created":"2026-04-21T00:11:56.442-04:00","updated":"2026-04-21T00:31:33.593-04:00"}
---

The idea: An AI-driven Discord bot that would prompt me once on the weekend to ask me what kind of recipes I wanted to make during the week, and then prompt me each weekday morning if I wanted to work on preparing one of the recipes that day. Since I work from home, the goal was for the AI to break up a recipe into small chunks that I could slowly prep during breaks from work (since I work from home).

I implemented pretty much the above, but I didn't end up using it like I thought I would. Perhaps it wasn't feeling as useful as I thought it would be, perhaps it just wasn't the right solution for me, or perhaps I was too lazy to interact with it how I thought I might've. 

I decommissioned it because I stopped using it / wanting to use it.

There were also some flaws. The breakdown of a recipe into chunks didn't always make sense. I made this in mid-2024. Probably GPT was up to v3. I bet if I used today's models, the chunking would be better. Could eventually explore this or revisit the idea. 

I also found myself using it mainly to generate recipes, rather than really using it for the time-based prep chunking. I obviously could have just used the ChatGPT UI to accomplish the same thing, which would save me AWS costs from having to keep the bot server running (and OpenAI API costs, but at my usage it would be miniscule). That being said, I did like having essentially one Discord thread acting as a log of what I was cooking. Though, I also felt friction because I would have a recipe generated in Discord but wouldn't have it copied over to OneNote where I kept other recipes saved. 

Here's an example interaction with the bot. 

> [!note]- Example conversation with the bot
>
>**GPT Meal Planner — 3/10/2024 10:00 AM**  
>Hi there! I'd love to help you plan your meals for the week. Could you tell me two dishes you're thinking about cooking?
>
>**{{me}} — 3/10/2024 10:09 AM**  
>Vegan Sweet potato brownies. I dont want to specify a recipe. Give me more vegan meal ideas
>
>**GPT Meal Planner — 3/10/2024 10:09 AM**  
>Vegan Sweet Potato Brownies sound delicious and healthy! I'll provide you with a recipe for that shortly. To give you another vegan meal idea, how about trying a Chickpea Spinach Curry? It's flavorful and quite satisfying. Would you like to include that in your meal plan, or is there another type of cuisine you're craving?
>
>**{{me}} — 3/10/2024 10:09 AM**  
>No list 10 ideas
>
>**GPT Meal Planner — 3/10/2024 10:09 AM**  
>Absolutely, here are ten vegan meal ideas you might enjoy:  
>Quinoa and Black Bean Chili  
>Lentil Sloppy Joes  
>Stuffed Bell Peppers with Rice and Vegetables  
>Vegan Pad Thai with Tofu  
>Butternut Squash Soup  
>Cauliflower Tacos with Avocado Lime Crema  
>Mushroom Stroganoff  
>Thai Green Curry with Vegetables  
>Roasted Vegetable Quinoa Bowl  
>Eggplant and Chickpea Stew  
>
>Do any of these dishes pique your interest for your second meal choice this week?
>
>**{{me}} — 3/10/2024 10:10 AM**  
>More ideas, specific dishes from diverse cuisines
>
>**GPT Meal Planner — 3/10/2024 10:10 AM**  
>Certainly! Let's explore a variety of cuisines with these vegan dishes:  
>Ethiopian Red Lentil Stew (Misir Wot)  
>Italian Eggplant Parmesan (made with vegan cheese)  
>Indian Vegetable Biryani  
>Mexican Vegan Ceviche with Hearts of Palm  
>Korean Bibimbap with Tofu and Gochujang Sauce  
>Moroccan Chickpea and Apricot Tagine  
>Lebanese Mujadara (Lentils and Rice with Caramelized Onions)  
>Greek Vegan Moussaka  
>Japanese Vegan Ramen with Shiitake Mushrooms  
>Cuban Black Beans and Rice (Moros y Cristianos)  
>
>These are just a few examples of the amazing variety you can experience with vegan cuisine around the world. Feel free to let me know which one you'd like to try, and I can provide you with a recipe!
>
>**{{me}} — 3/10/2024 10:11 AM**  
>Let's do num 7
>
>**GPT Meal Planner — 3/10/2024 10:11 AM**  
>Great choice! Lebanese Mujadara is a wonderful dish that combines comforting lentils and rice with the sweetness of caramelized onions. I can come up with a tasty vegan recipe for you. Once I provide the recipe, let me know if everything looks good or if you'd like any modifications!
>
>**{{me}} — 3/10/2024 10:11 AM**  
>Ok
>
>**GPT Meal Planner — 3/10/2024 10:11 AM**  
>Here is your Vegan Sweet Potato Brownies recipe:  
>
>Ingredients:  
>2 medium sweet potatoes (about 2 cups when mashed)  
>1/2 cup smooth almond butter  
>1/4 cup maple syrup  
>1/2 cup unsweetened cocoa powder  
>1/2 cup oat flour  
>1 tsp vanilla extract  
>1 tsp baking powder  
>1/2 tsp sea salt  
>1/2 cup vegan chocolate chips  
>
>Instructions:  
>Preheat your oven to 350°F (175°C) and line an 8x8 inch baking pan with parchment paper.  
>Steam or boil the sweet potatoes until soft, let them cool, and then mash them until smooth.  
>In a large bowl, mix the mashed sweet potato with the almond butter and maple syrup until well combined. Stir in the vanilla extract.  
>Sift in the cocoa powder, oat flour, baking powder, and salt, and mix until well combined.  
>Fold in the vegan chocolate chips.  
>Pour the mixture into the prepared pan and spread it out evenly.  
>Bake for 25-30 minutes or until a toothpick inserted in the center comes out mostly clean.  
>Allow the brownies to cool completely in the pan before cutting into squares.  
>
>Would you like to make any adjustments to this recipe or does it look perfect for you?
>
>**{{me}} — 3/10/2024 10:12 AM**  
>Use this instead  
>
>Ingredients  
>• 2 8- ounce packages Straight From The Root Organic Sweet Potatoes  
>• 1 cup smooth almond butter  
>• 1/4 cup maple syrup  
>• 1/2 cup cocoa powder  
>• 1/4 cup aquafaba if needed  
>• 1 cup chocolate chips or chocolate chunks  
>
>Instructions  
>• Preheat oven to 350 degrees. Spray an 8x8 pan with non-stick spray and set aside.  
>• Puree sweet potatoes in a high speed blender. Add almond butter, maple syrup, and cocoa powder and process until smooth. Add aquafaba to blender if needed until batter is smooth.  
>• Mix in chocolate chips by hand and pour into prepared pan. Bake for 40 minutes or until done.  
>• Allow brownies to cool before slicing. Refrigerate any leftovers.  
>
>**GPT Meal Planner — 3/10/2024 10:13 AM**  
>Your Vegan Sweet Potato Brownies recipe has been updated with the one you've provided. It sounds absolutely scrumptious! I'll hold on to this recipe for you. Now, let me provide you with a recipe for the Lebanese Mujadara.
>
>**{{me}} — 3/10/2024 10:13 AM**  
>Actually adjust the sweet potato recipe with these notes  
>
>Cook sweet potato in microwave. I used ~3/4 of a large one (at the rest lolllll). Blend dates and some plant milk. Then add sweet potato, a bunch of almond butter, and some cocoa powder. added more almond milk to assist blending. Blend. Spread on tray/whatever (I did pretty thin because just one sweet potato doesn’t make much batter). Then baked 350 degrees for ~30 min.
>
>**GPT Meal Planner — 3/10/2024 10:13 AM**  
>I've updated the recipe for your Vegan Sweet Potato Brownies with the specific notes you've provided. It's great to see how you've tailored the recipe to suit your tastes and preferences! Now that we have your personalized brownie recipe, shall we proceed with the Lebanese Mujadara recipe?
>
>**{{me}} — 3/10/2024 10:13 AM**  
>Yes
>
>**GPT Meal Planner — 3/10/2024 10:13 AM**  
>Here is a simple recipe for Lebanese Mujadara:
>
>Ingredients:  
>1 cup brown or green lentils  
>1 cup long-grain white rice  
>3 large onions, thinly sliced  
>1/4 cup olive oil  
>1 tsp cumin  
>1 tsp cinnamon  
>Salt and pepper to taste  
>
>Instructions:  
>Rinse the lentils and place them in a large saucepan with enough water to cover by several inches. Bring to a boil, then reduce heat and simmer until lentils are tender, about 20 minutes.  
>In a separate saucepan, cook the rice according to package instructions.  
>While the lentils and rice are cooking, heat the olive oil in a large frying pan over medium heat. Add the onions and cook, stirring frequently, until they are caramelized and deeply browned, about 30 minutes.  
>Once the lentils are cooked, drain any excess water. Combine the cooked lentils and rice in a large bowl, and stir in the cumin, cinnamon, salt, and pepper.  
>Serve the lentils and rice topped with the caramelized onions.  
>
>Let me know if this recipe works for you or if you'd like to change anything!
>
>**{{me}} — 3/10/2024 10:14 AM**  
>Brown rice today. Let's fully use instant pot if possible
>
>**GPT Meal Planner — 3/10/2024 10:14 AM**  
>I've adapted the Lebanese Mujadara recipe to be prepared with brown rice and fully utilize the Instant Pot for convenience. Not only does it simplify the process, but it also provides a deliciously satisfying vegan meal. Let me know if you're happy with this Instant Pot version or if you have any additional tweaks in mind!
>
>**{{me}} — 3/10/2024 10:14 AM**  
>Show recipe
>
>**GPT Meal Planner — 3/10/2024 10:14 AM**  
>Here's the Instant Pot recipe for Lebanese Mujadara with brown rice that we've tailored for you:
>
>Ingredients:  
>1 cup brown or green lentils, rinsed  
>1 cup brown rice  
>3 large onions, thinly sliced  
>1/4 cup olive oil  
>1 tsp cumin  
>1 tsp cinnamon  
>Salt and pepper to taste  
>4 cups of water or vegetable broth  
>
>Instructions for the Instant Pot:  
>Set the Instant Pot to 'Sauté' mode and heat the olive oil. Add the onions and cook until they are caramelized, stirring occasionally (this may take about 15-20 minutes for a deep caramelization).  
>Once the onions are caramelized, remove about half to use for garnish later.  
>To the remaining onions in the Instant Pot, add the lentils, brown rice, cumin, cinnamon, salt, pepper, and water or vegetable broth.  
>Secure the lid on the Instant Pot and set to 'Manual' or 'Pressure Cook' on High for 22 minutes.  
>After the cooking time is complete, allow the pressure to release naturally for 10 minutes, then do a quick release for any remaining pressure.  
>Fluff the lentil and rice mixture with a fork, then serve hot, topped with the reserved caramelized onions.  
>
>Does this recipe look good to you, or would you like to make any changes before you start cooking?
>
>**{{me}} — 3/10/2024 10:15 AM**  
>Would it come out better to cook the rice and lentils separately
>
>**GPT Meal Planner — 3/10/2024 10:15 AM**  
>Cooking the rice and lentils separately can indeed provide optimal texture control for both, ensuring that neither one becomes overcooked. Using the Instant Pot, you can first cook the lentils to desired tenderness and then cook the brown rice. However, cooking them together as described in the initial recipe can be more convenient and still yield delicious results. It really depends on your preference. Would you like the recipe adjusted for separate cooking, or would you like to proceed with the combined cooking method?
>
>**{{me}} — 3/10/2024 10:16 AM**  
>Let's do them separate, rice in instant pot, and lentils on stove. Also include a step to make veg broth from buillion paste
>
>**GPT Meal Planner — 3/10/2024 10:17 AM**  
>I have updated the Lebanese Mujadara recipe to cook the brown rice in the Instant Pot and the lentils on the stove separately to ensure both are cooked perfectly. Additionally, I've included instructions on how to make vegetable broth from bouillon paste. Please review the updated recipe and let me know if you're ready to get cooking or if there's anything you'd like to change!
>
>**{{me}} — 3/10/2024 10:17 AM**  
>Show recipe
>
>**GPT Meal Planner — 3/10/2024 10:17 AM**  
>Here's the updated recipe for Lebanese Mujadara, with separated cooking instructions for the rice and lentils, and including making fresh vegetable broth from bouillon paste:
>
>Ingredients:  
>1 cup brown or green lentils, rinsed  
>1 cup brown rice  
>3 large onions, thinly sliced  
>1/4 cup olive oil  
>1 tsp cumin  
>1 tsp cinnamon  
>Salt and pepper to taste  
>Vegetable bouillon paste (enough for 4 cups of broth)  
>4 cups of water (for broth)  
>
>Instructions:  
>Prepare the vegetable broth by dissolving the required amount of vegetable bouillon paste in 4 cups of hot water. Stir until the bouillon is fully dissolved and set the broth aside.  
>In a pot on the stove, combine the lentils and half of the prepared vegetable broth. Bring to a boil, then reduce the heat, cover, and simmer until the lentils are tender, about 20-25 minutes. Drain any excess liquid, and set the cooked lentils aside.  
>While the lentils are simmering, set the Instant Pot to 'Sauté' mode and heat the olive oil. Add the onions and cook, stirring occasionally, until caramelized, about 15-20 minutes. Once caramelized, remove about half the onions for garnish and set them aside.  
>Add the brown rice to the remaining onions in the Instant Pot, along with the rest of the vegetable broth. Secure the lid, set to 'Manual' or 'Pressure Cook' on High for 22 minutes.  
>After the cooking is complete, allow the pressure to release naturally for 10 minutes before doing a quick pressure release.  
>Fluff the cooked rice with a fork, then in a large bowl (or in the Instant Pot), gently combine the cooked rice with the cooked lentils. Stir in the cumin, cinnamon, salt, and pepper.  
>Serve hot, topped with the set-aside caramelized onions.  
>
>This recipe should provide a delicious meal with perfectly cooked lentils and rice. If everything looks good to you, you're all set to start cooking, or if you have any other preferences, just let me know!
>
>**{{me}} — 3/10/2024 10:18 AM**  
>Looks good
>
>**GPT Meal Planner — 3/10/2024 10:19 AM**  
>Fantastic! I'm glad the recipe looks good to you. You now have two wonderful vegan recipes to enjoy: the Vegan Sweet Potato Brownies and Lebanese Mujadara. Enjoy your cooking, and if you have any more questions or need further assistance in the future, don't hesitate to ask. Happy eating!
>
>**GPT Meal Planner — 3/11/2024 8:45 AM**  
>Hello! Are you looking to do some cooking today? I remember over the weekend you looked at recipes for 'Vegan Sweet Potato Brownies' and 'Lebanese Mujadara'. Would you like to make one of those today, or is there something else you'd like to whip up? Just let me know what you're in the mood for!
>
>**{{me}} — 3/11/2024 10:21 AM**  
>Lets do mujadara
>
>**GPT Meal Planner — 3/11/2024 10:21 AM**  
>Great choice! The Mujadara is a delicious dish. Would you like to follow one of the lentil and rice recipes you selected over the weekend, or would you prefer a new one? Here's the recipe you provided for Lebanese Mujadara:
>
>Ingredients:  
>1 cup brown or green lentils, rinsed  
>1 cup brown rice  
>3 large onions, thinly sliced  
>1/4 cup olive oil  
>1 tsp cumin  
>1 tsp cinnamon  
>Salt and pepper to taste  
>4 cups of water or vegetable broth  
>
>Instructions for the Instant Pot:  
>Set the Instant Pot to 'Sauté' mode and heat the olive oil. Add the onions and cook until they are caramelized, stirring occasionally (this may take about 15-20 minutes for a deep caramelization).  
>Once the onions are caramelized, remove about half to use for garnish later.  
>To the remaining onions in the Instant Pot, add the lentils, brown rice, cumin, cinnamon, salt, pepper, and water or vegetable broth.  
>Secure the lid on the Instant Pot and set to 'Manual' or 'Pressure Cook' on High for 22 minutes.  
>After the cooking time is complete, allow the pressure to release naturally for 10 minutes, then do a quick release for any remaining pressure.  
>Fluff the lentil and rice mixture with a fork, then serve hot, topped with the reserved caramelized onions.  
>
>Would you like to proceed with this recipe, or modify it in any way?
>
>**{{me}} — 3/11/2024 10:22 AM**  
>Looks good
>
>**GPT Meal Planner — 3/11/2024 10:22 AM**  
>Great, you're all set to make Mujadara! Could you let me know by what time today you'd like to finish cooking? This way, I can help you break down the recipe into manageable chunks.
>
>**{{me}} — 3/11/2024 10:23 AM**  
>5pm. Please make 5 chunks. Earlier chunks should focus on doing as much food prep as possible first before doing any cooking
>
>**GPT Meal Planner — 3/11/2024 10:23 AM**  
>We'll plan to finish cooking by 5:00 PM, so here are the 5 chunks of work we'll do, with time for breaks in between:
>
>At 10:45 AM, you'll gather and prepare all the ingredients.  
>At 11:30 AM, get those onions sliced so they're ready to caramelise.  
>By 12:30 PM, start caramelising the onions in the Instant Pot.  
>At 2:45 PM, finish up with the onions and add the rest of the ingredients to the Instant Pot.  
>Finally, at 3:30 PM, set the Instant Pot to cook everything. This will give us a buffer for the natural pressure release and any final touches before your meal is ready right on time!  
>
>Remember, you can take a breather between these chunks, and we'll have your delicious Mujadara ready for dinner. Enjoy your cooking!
>
>**{{me}} — 3/11/2024 10:25 AM**  
>Actually i need to cook the lentils separate from the rice. Rice in instant pot and lentils in separate pot. Update chunks to reflect this as separate steps
>
>**GPT Meal Planner — 3/11/2024 10:27 AM**  
>Okay, I've updated the cooking plan to cook the lentils and rice separately, which should suit your needs better! Here are your updated chunks:
>
>At 10:45 AM, prepare all the ingredients. Soak the lentils to reduce cooking time.  
>At 11:30 AM, slice the onions and measure out the brown rice.  
>By 12:30 PM, start cooking the lentils on the stove; you'll want them to be nice and tender.  
>At 1:15 PM, begin caramelizing the onions in the Instant Pot.  
>At 2:00 PM, remove half the onions for garnish and start cooking the brown rice in the Instant Pot with spices, ensuring the lentils are simmering away too.  
>Finally, at 3:30 PM, check both the lentils and rice. Finish up and get ready to serve your Mujadara by 5:00 PM, perfectly for dinner.  
>
>Have a pleasant cooking session!
>
>**{{me}} — 3/11/2024 10:31 AM**  
>What sides go well with this dish
>
>**GPT Meal Planner — 3/11/2024 10:31 AM**  
>Mujadara is a flavorful dish that pairs well with a variety of sides. Here are some suggestions that complement its taste and texture:
>
>A fresh salad: A simple green salad or a tomato, cucumber, and herb salad with a lemony vinaigrette can add a refreshing contrast.  
>Yogurt or a yogurt-based sauce: A cooling side of plain or seasoned yogurt, such as a cucumber mint yogurt, balances the warm spices of mujadara.  
>Pickled vegetables: Pickles or a pickle relish can add a tangy kick that cuts through the richness of the dish.  
>Roasted vegetables: Roasted carrots, cauliflower, or Brussels sprouts can provide a delightful caramelized edge.  
>Flatbread or pita: This is great for scooping up the lentils and rice, providing a satisfying textural component.  
>
>Feel free to choose any of these to serve alongside your mujadara for a complete and satisfying meal!
>
>**GPT Meal Planner — 3/11/2024 10:45 AM**  
>Hello! It's time to get started on your meal prep. Please gather all your ingredients and begin by rinsing 1 cup of lentils. After that, start soaking the lentils in water to reduce their cooking time. Once you've done this, you'll be all set for the next step when you're ready. Happy cooking!
>
>**GPT Meal Planner — 3/11/2024 11:30 AM**  
>Hello there! It's time to thinly slice the 3 large onions and measure out the brown rice. This is a great task to fit into a short break and will set you up nicely for the next steps. Let me know if you need any assistance or guidance!
>
>**GPT Meal Planner — 3/11/2024 12:30 PM**  
>It's time to start cooking the lentils. Please put them in a pot and cover them with water. Bring the water to a boil, then lower the heat to let the lentils simmer. They should become tender in about 20 minutes, so you'll want to check on them around that time.
>
>**GPT Meal Planner — 3/11/2024 1:15 PM**  
>It's time to heat the olive oil in the 'Sauté' mode of your Instant Pot. Once hot, start caramelizing the onions by stirring them occasionally until they are deeply golden and soft.
>
>**GPT Meal Planner — 3/11/2024 2:00 PM**  
>It's time to proceed with the next step in your Lebanese Mujadara recipe. Please remove about half of the caramelized onions for garnish later. Then, add the brown rice, cumin, cinnamon, salt, pepper, and 2 cups of the vegetable broth or water into the Instant Pot with the remaining onions. After adding these ingredients, secure the lid of the Instant Pot and set it to 'Manual' or 'Pressure Cook' on High for 22 minutes. Let me know if you need further assistance!
>
>**{{me}} — 3/11/2024 3:08 PM**  
>Image
>
>**GPT Meal Planner — 3/11/2024 3:08 PM**  
>If you need any help or have any questions about the recipe, feel free to ask. Enjoy your cooking break!
>
>**GPT Meal Planner — 3/11/2024 3:30 PM**  
>It's time to check on both the lentils and the rice. The lentils should be tender by now, and the Instant Pot will soon finish cooking the rice. Once the pot indicates it's done, allow it to release pressure naturally for about 10 minutes. Then, you can release any remaining pressure and fluff the rice with a fork. You may choose to mix the lentils and rice together or serve them separately, but don't forget to top your dish with the delicious caramelized onions you set aside earlier.
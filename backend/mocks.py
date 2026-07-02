# backend/mocks.py

MOCK_INGREDIENTS = [
    "chicken breast",
    "eggs",
    "cherry tomatoes",
    "baby spinach",
    "bell peppers",
    "greek yogurt",
    "garlic",
    "avocado"
]

def get_mock_ingredients():
    return MOCK_INGREDIENTS

def get_mock_recipes(pantry_ingredients, restrictions):
    # Standardize restrictions to lowercase
    rest_list = [r.lower() for r in restrictions]
    
    # Generate recipes based on restrictions
    recipes = []
    
    # Recipe 1: Mediterranean Chicken Scramble (Default or High-Protein or Gluten-Free/Keto)
    # If vegan/vegetarian, we substitute chicken with extra avocado or a veggie hash
    is_vegan = "vegan" in rest_list
    is_vegetarian = "vegetarian" in rest_list or is_vegan
    
    if not is_vegetarian:
        recipes.append({
            "title": "Mediterranean Chicken Scramble",
            "description": "A delicious, high-protein skillet scramble with juicy chicken breast, sautéed bell peppers, spinach, and cherry tomatoes, topped with fresh avocado.",
            "prep_time": "15 mins",
            "difficulty": "Easy",
            "macros": {
                "calories": 420,
                "protein": "38g",
                "carbs": "8g",
                "fat": "24g"
            },
            "ingredients": [
                {"name": "chicken breast", "amount": "150g", "is_staple": False, "in_pantry": "chicken breast" in pantry_ingredients},
                {"name": "eggs", "amount": "2 large", "is_staple": False, "in_pantry": "eggs" in pantry_ingredients},
                {"name": "cherry tomatoes", "amount": "1/2 cup", "is_staple": False, "in_pantry": "cherry tomatoes" in pantry_ingredients},
                {"name": "baby spinach", "amount": "1 cup", "is_staple": False, "in_pantry": "baby spinach" in pantry_ingredients},
                {"name": "bell peppers", "amount": "1/2 cup", "is_staple": False, "in_pantry": "bell peppers" in pantry_ingredients},
                {"name": "garlic", "amount": "1 clove", "is_staple": False, "in_pantry": "garlic" in pantry_ingredients},
                {"name": "avocado", "amount": "1/2", "is_staple": False, "in_pantry": "avocado" in pantry_ingredients},
                {"name": "olive oil", "amount": "1 tbsp", "is_staple": True, "in_pantry": True}
            ],
            "instructions": [
                "Dice the chicken breast and bell peppers into bite-sized pieces. Halve the cherry tomatoes.",
                "Heat olive oil in a skillet over medium-high heat. Add garlic and chicken, cooking until golden brown (about 6 mins).",
                "Toss in the bell peppers and cook for 3 more minutes until slightly softened.",
                "Whisk eggs in a bowl and pour into the skillet, stirring gently to scramble with the chicken and peppers.",
                "Fold in the baby spinach and cherry tomatoes, cooking just until the spinach wilts (1-2 mins).",
                "Serve hot, topped with sliced avocado and a dollop of greek yogurt if desired."
            ]
        })
    else:
        recipes.append({
            "title": "Sautéed Veggie & Tofu Scramble" if is_vegan else "Sautéed Veggie & Egg Scramble",
            "description": f"A vibrant breakfast scramble with bell peppers, spinach, and cherry tomatoes, topped with sliced avocado. {'Vegan' if is_vegan else 'Vegetarian'} friendly.",
            "prep_time": "12 mins",
            "difficulty": "Easy",
            "macros": {
                "calories": 290,
                "protein": "16g" if is_vegan else "18g",
                "carbs": "10g",
                "fat": "19g"
            },
            "ingredients": [
                {"name": "tofu" if is_vegan else "eggs", "amount": "150g" if is_vegan else "3 large", "is_staple": False, "in_pantry": ("tofu" if is_vegan else "eggs") in pantry_ingredients},
                {"name": "cherry tomatoes", "amount": "1/2 cup", "is_staple": False, "in_pantry": "cherry tomatoes" in pantry_ingredients},
                {"name": "baby spinach", "amount": "1 cup", "is_staple": False, "in_pantry": "baby spinach" in pantry_ingredients},
                {"name": "bell peppers", "amount": "1/2 cup", "is_staple": False, "in_pantry": "bell peppers" in pantry_ingredients},
                {"name": "garlic", "amount": "1 clove", "is_staple": False, "in_pantry": "garlic" in pantry_ingredients},
                {"name": "avocado", "amount": "1/2", "is_staple": False, "in_pantry": "avocado" in pantry_ingredients},
                {"name": "olive oil", "amount": "1 tbsp", "is_staple": True, "in_pantry": True}
            ],
            "instructions": [
                "Dice the bell peppers and crumble the tofu (or whisk the eggs in a bowl). Halve the cherry tomatoes.",
                "Heat olive oil in a skillet over medium heat. Sauté minced garlic and diced bell peppers for 3 minutes.",
                f"Add the {'crumbled tofu' if is_vegan else 'whisked eggs'} to the skillet. Cook, stirring occasionally, for 4-5 minutes.",
                "Toss in the cherry tomatoes and baby spinach, cooking for 2 more minutes until spinach is wilted.",
                "Season with salt and pepper, transfer to a plate, and top with sliced avocado."
            ]
        })

    # Recipe 2: Creamy Garlic Spinach Salad
    if not is_vegan:
        recipes.append({
            "title": "Creamy Garlic Salad with Chicken" if not is_vegetarian else "Creamy Garlic Salad with Avocado",
            "description": "A crisp, nutrient-dense spinach salad loaded with cherry tomatoes, seasoned chicken breast, and sliced avocado, drizzled with a high-protein garlic yogurt dressing.",
            "prep_time": "15 mins",
            "difficulty": "Easy",
            "macros": {
                "calories": 390 if not is_vegetarian else 280,
                "protein": "34g" if not is_vegetarian else "8g",
                "carbs": "9g",
                "fat": "22g" if not is_vegetarian else "18g"
            },
            "ingredients": [
                {"name": "chicken breast", "amount": "120g", "is_staple": False, "in_pantry": "chicken breast" in pantry_ingredients, "hide": is_vegetarian},
                {"name": "greek yogurt", "amount": "1/3 cup", "is_staple": False, "in_pantry": "greek yogurt" in pantry_ingredients},
                {"name": "baby spinach", "amount": "2 cups", "is_staple": False, "in_pantry": "baby spinach" in pantry_ingredients},
                {"name": "cherry tomatoes", "amount": "1/2 cup", "is_staple": False, "in_pantry": "cherry tomatoes" in pantry_ingredients},
                {"name": "avocado", "amount": "1/2", "is_staple": False, "in_pantry": "avocado" in pantry_ingredients},
                {"name": "garlic", "amount": "1 clove", "is_staple": False, "in_pantry": "garlic" in pantry_ingredients},
                {"name": "lemon juice", "amount": "1 tsp", "is_staple": True, "in_pantry": True},
                {"name": "olive oil", "amount": "1 tsp", "is_staple": True, "in_pantry": True}
            ],
            "instructions": [
                "If using chicken: Season chicken breast with salt and pepper. Sauté in olive oil until fully cooked (6-8 mins), then slice.",
                "To make the dressing: Whisk greek yogurt, minced garlic, lemon juice, salt, and pepper in a small bowl until smooth.",
                "Wash spinach and place in a large serving bowl. Add halved cherry tomatoes.",
                "Toss spinach and tomatoes with the garlic-yogurt dressing.",
                "Top with sliced avocado and the sliced warm chicken breast (if using). Serve immediately."
            ]
        })
    else:
        # Vegan option: Avocado spinach salad with Lemon-Herb vinaigrette
        recipes.append({
            "title": "Zesty Avocado & Tomato Spinach Salad",
            "description": "A simple and refreshing plant-based salad combining crisp baby spinach, sweet cherry tomatoes, and rich avocado tossed in a garlic lemon vinaigrette.",
            "prep_time": "10 mins",
            "difficulty": "Easy",
            "macros": {
                "calories": 210,
                "protein": "4g",
                "carbs": "12g",
                "fat": "18g"
            },
            "ingredients": [
                {"name": "baby spinach", "amount": "2 cups", "is_staple": False, "in_pantry": "baby spinach" in pantry_ingredients},
                {"name": "cherry tomatoes", "amount": "3/4 cup", "is_staple": False, "in_pantry": "cherry tomatoes" in pantry_ingredients},
                {"name": "avocado", "amount": "1 whole", "is_staple": False, "in_pantry": "avocado" in pantry_ingredients},
                {"name": "garlic", "amount": "1 clove", "is_staple": False, "in_pantry": "garlic" in pantry_ingredients},
                {"name": "lemon juice", "amount": "1 tbsp", "is_staple": True, "in_pantry": True},
                {"name": "olive oil", "amount": "1.5 tbsp", "is_staple": True, "in_pantry": True}
            ],
            "instructions": [
                "Halve the cherry tomatoes and slice the avocado.",
                "In a small jar, shake olive oil, lemon juice, minced garlic, salt, and pepper until emulsified.",
                "In a large salad bowl, combine the fresh baby spinach and halved cherry tomatoes.",
                "Add the sliced avocado to the salad bowl.",
                "Pour the dressing over the ingredients, toss gently to avoid crushing the avocado, and serve."
            ]
        })

    # Recipe 3: Spinach & Tomato Egg Muffins (Vegetarian) or Creamy Tomato Spinach Avocado Toast
    # If high-protein is checked, we customize
    if "high-protein" in rest_list and not is_vegan:
        recipes.append({
            "title": "Spinach & Pepper Egg Cups",
            "description": "High-protein, low-carb baked egg muffins packed with chopped spinach, red bell peppers, and garlic. Perfect for meal prep.",
            "prep_time": "20 mins",
            "difficulty": "Easy",
            "macros": {
                "calories": 220,
                "protein": "19g",
                "carbs": "4g",
                "fat": "14g"
            },
            "ingredients": [
                {"name": "eggs", "amount": "4 large", "is_staple": False, "in_pantry": "eggs" in pantry_ingredients},
                {"name": "baby spinach", "amount": "1 cup", "is_staple": False, "in_pantry": "baby spinach" in pantry_ingredients},
                {"name": "bell peppers", "amount": "1/2 cup", "is_staple": False, "in_pantry": "bell peppers" in pantry_ingredients},
                {"name": "garlic", "amount": "1 clove", "is_staple": False, "in_pantry": "garlic" in pantry_ingredients},
                {"name": "salt & pepper", "amount": "to taste", "is_staple": True, "in_pantry": True}
            ],
            "instructions": [
                "Preheat oven to 375°F (190°C) and grease a muffin tin with olive oil spray.",
                "Finely chop the baby spinach, bell peppers, and mince the garlic.",
                "Whisk the eggs in a large bowl. Stir in the chopped spinach, peppers, garlic, salt, and pepper.",
                "Divide the egg mixture evenly among 4 muffin cups.",
                "Bake for 15-18 minutes, or until the center of the egg cups is set and slightly golden.",
                "Let cool for 2 minutes, then pop them out and serve."
            ]
        })
    else:
        # Standard: Garlic Tomato Sauté with Avocado
        recipes.append({
            "title": "Garlic Tomato & Spinach Warm Sauté",
            "description": "A quick, warm side dish or light main. Tomatoes and spinach are blistered with garlic and olive oil, then served warm with fresh, creamy avocado slices.",
            "prep_time": "10 mins",
            "difficulty": "Easy",
            "macros": {
                "calories": 240,
                "protein": "3g",
                "carbs": "11g",
                "fat": "21g"
            },
            "ingredients": [
                {"name": "cherry tomatoes", "amount": "1 cup", "is_staple": False, "in_pantry": "cherry tomatoes" in pantry_ingredients},
                {"name": "baby spinach", "amount": "2 cups", "is_staple": False, "in_pantry": "baby spinach" in pantry_ingredients},
                {"name": "garlic", "amount": "2 cloves", "is_staple": False, "in_pantry": "garlic" in pantry_ingredients},
                {"name": "avocado", "amount": "1/2", "is_staple": False, "in_pantry": "avocado" in pantry_ingredients},
                {"name": "olive oil", "amount": "1.5 tbsp", "is_staple": True, "in_pantry": True}
            ],
            "instructions": [
                "Mince the garlic, halve the cherry tomatoes, and slice the avocado.",
                "Heat olive oil in a pan over medium heat. Sauté the minced garlic for 1 minute until fragrant.",
                "Add cherry tomatoes to the pan and cook for 4-5 minutes until they begin to blister and burst.",
                "Add baby spinach and toss gently, cooking for just 1 minute until the spinach is wilted.",
                "Remove from heat, transfer to a plate, and lay avocado slices on top. Season with cracked black pepper."
            ]
        })
        
    return {"recipes": recipes}

def adapt_mock_recipe(recipe_title, current_step, missing_ingredient):
    # Clean inputs
    missing_ingredient = missing_ingredient.lower()
    
    # Generic, clever substitutions based on common ingredients
    substitutions = {
        "eggs": "1/4 cup greek yogurt (for binding/creaminess) or skip them and increase the other ingredients by 30%",
        "greek yogurt": "mashed avocado (to maintain creaminess and healthy fats) or a drizzle of olive oil and squeeze of lemon",
        "avocado": "greek yogurt (to add richness) or a light drizzle of olive oil",
        "baby spinach": "chopped bell peppers or skip it entirely, adding some chopped parsley or celery if you have it",
        "chicken breast": "scrambled eggs or tofu (for protein), or sautéed bell peppers and tomatoes as a hearty vegetable base",
        "cherry tomatoes": "a splash of lemon juice or tomato paste, or skip them and add a pinch of paprika for color and warmth",
        "bell peppers": "diced tomatoes or onions, or just omit them and double the spinach",
        "garlic": "onion powder, a tiny bit of chopped chives, or skip it entirely and add a pinch of black pepper"
    }
    
    sub = substitutions.get(missing_ingredient, "a splash of lemon juice, olive oil, or any similar condiment you have available")
    
    msg = f"No problem! Since you ran out of **{missing_ingredient}**, we can substitute it with **{sub}**."
    
    # Return adapted messages
    return {
        "substitution_message": msg,
        "adapted_instructions": [
            f"Step {current_step}: Proceed with the step, using the recommended substitute ({sub}) instead of {missing_ingredient}.",
            "Step [Modified]: Cook for 1-2 minutes less if the substitute cooks faster, checking seasoning carefully.",
            "Final Step: Garnish and enjoy your adapted RecipeCraft creation!"
        ]
    }

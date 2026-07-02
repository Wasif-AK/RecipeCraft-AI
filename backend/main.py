# backend/main.py

import os
import re
import json
import base64
import httpx
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.mocks import get_mock_ingredients, get_mock_recipes, adapt_mock_recipe

# Load environment variables
load_dotenv()

app = FastAPI(title="RecipeCraft AI Backend")

# Models
class RecognizeRequest(BaseModel):
    image: str  # Base64 string (optionally containing "data:image/..." prefix)
    api_key: Optional[str] = None
    demo_mode: bool = False

class RecipesRequest(BaseModel):
    ingredients: List[str]
    restrictions: List[str]
    api_key: Optional[str] = None
    demo_mode: bool = False

class AdaptRequest(BaseModel):
    recipe_title: str
    current_step: str
    missing_ingredient: str
    api_key: Optional[str] = None
    demo_mode: bool = False

# Utility function for resilient JSON parsing
def clean_and_parse_json(text: str):
    text = text.strip()
    # Strip markdown block if present
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL | re.IGNORECASE)
    if match:
        text = match.group(1).strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Fallback parsing: try to extract JSON block by finding first [ or { and last ] or }
        try:
            bracket_match = re.search(r'([\[{].*[\]}])', text, re.DOTALL)
            if bracket_match:
                return json.loads(bracket_match.group(1))
        except Exception:
            pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse Gemini response as JSON. Raw response was: {text[:200]}..."
        )

# Helper to get the correct API key based on precedence
def resolve_api_key(custom_key: Optional[str]) -> Optional[str]:
    # 1. Custom UI settings key
    if custom_key and custom_key.strip():
        return custom_key.strip()
    # 2. Server Environment / .env
    env_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if env_key and env_key.strip():
        return env_key.strip()
    return None

# General HTTP Client call to Gemini
async def call_gemini_api(prompt: str, api_key: str, image_bytes: Optional[bytes] = None, mime_type: str = "image/jpeg"):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    parts = [{"text": prompt}]
    
    if image_bytes:
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        parts.append({
            "inlineData": {
                "mimeType": mime_type,
                "data": image_b64
            }
        })
        
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=45.0)
            if response.status_code != 200:
                # Provide a descriptive error message from the Gemini API
                error_detail = response.text
                try:
                    error_json = response.json()
                    error_detail = error_json.get("error", {}).get("message", response.text)
                except Exception:
                    pass
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Gemini API Error: {error_detail}"
                )
            
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Network error connecting to Gemini API: {str(exc)}"
            )

# Endpoints
@app.post("/api/recognize")
async def recognize_ingredients(req: RecognizeRequest):
    api_key = resolve_api_key(req.api_key)
    
    # Trigger Demo Mode if requested, or if no API key is set
    if req.demo_mode or not api_key:
        return {"ingredients": get_mock_ingredients()}
        
    # Extract base64 image data
    image_str = req.image
    mime_type = "image/jpeg"
    
    if "," in image_str:
        header, image_str = image_str.split(",", 1)
        mime_match = re.search(r"data:(.*?);base64", header)
        if mime_match:
            mime_type = mime_match.group(1)
            
    try:
        image_bytes = base64.b64decode(image_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image format")
        
    prompt = (
        "Analyze the provided image of a refrigerator, pantry, or food ingredients. "
        "List all visible edible items, raw ingredients, vegetables, fruits, condiments, and proteins. "
        "Return ONLY a JSON list of strings representing the item names in lowercase, for example: "
        "[\"chicken breast\", \"eggs\", \"spinach\"]. Do not add any conversational text or explanation."
    )
    
    response_text = await call_gemini_api(prompt, api_key, image_bytes, mime_type)
    ingredients_list = clean_and_parse_json(response_text)
    
    if not isinstance(ingredients_list, list):
        # Fallback if AI output is not a list
        if isinstance(ingredients_list, dict):
            # Sometimes model outputs {"ingredients": [...]}
            if "ingredients" in ingredients_list:
                return {"ingredients": ingredients_list["ingredients"]}
        raise HTTPException(status_code=500, detail="Gemini did not return a valid list of ingredients.")
        
    return {"ingredients": ingredients_list}

@app.post("/api/recipes")
async def generate_recipes(req: RecipesRequest):
    api_key = resolve_api_key(req.api_key)
    
    if req.demo_mode or not api_key:
        return get_mock_recipes(req.ingredients, req.restrictions)
        
    prompt = (
        f"You are a master culinary chef and dietary expert. Given these pantry ingredients: {req.ingredients} "
        f"and these dietary restrictions/preferences: {req.restrictions}, formulate exactly 3 custom recipes "
        f"that maximize the use of the pantry ingredients and adhere strictly to the restrictions. "
        "You can assume basic kitchen staples (water, salt, pepper, oil, vinegar) are available. "
        "Return the response in a strict JSON format matching the following schema exactly:\n"
        "{\n"
        "  \"recipes\": [\n"
        "    {\n"
        "      \"title\": \"Recipe Name\",\n"
        "      \"description\": \"A mouth-watering, descriptive summary of the dish\",\n"
        "      \"prep_time\": \"e.g. 20 mins\",\n"
        "      \"difficulty\": \"Easy\" | \"Medium\" | \"Hard\",\n"
        "      \"macros\": {\n"
        "        \"calories\": 450,\n"
        "        \"protein\": \"e.g. 30g\",\n"
        "        \"carbs\": \"e.g. 40g\",\n"
        "        \"fat\": \"e.g. 15g\"\n"
        "      },\n"
        "      \"ingredients\": [\n"
        "        {\"name\": \"ingredient name\", \"amount\": \"e.g. 100g\", \"is_staple\": false, \"in_pantry\": true}\n"
        "      ],\n"
        "      \"instructions\": [\n"
        "        \"Step 1: Description\",\n"
        "        \"Step 2: Description\"\n"
        "      ]\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Identify which ingredients are staples (is_staple: true) and which are from the user's pantry (in_pantry: true). "
        "Ensure all keys are double-quoted and the output contains no extra explanatory text outside the JSON."
    )
    
    response_text = await call_gemini_api(prompt, api_key)
    recipes_data = clean_and_parse_json(response_text)
    
    if "recipes" not in recipes_data or not isinstance(recipes_data["recipes"], list):
        raise HTTPException(status_code=500, detail="Gemini output did not contain a valid list of recipes.")
        
    return recipes_data

@app.post("/api/adapt")
async def adapt_recipe(req: AdaptRequest):
    api_key = resolve_api_key(req.api_key)
    
    if req.demo_mode or not api_key:
        return adapt_mock_recipe(req.recipe_title, req.current_step, req.missing_ingredient)
        
    prompt = (
        f"The user is cooking the recipe '{req.recipe_title}' and is currently at the step: '{req.current_step}'. "
        f"However, they just ran out of the secondary ingredient: '{req.missing_ingredient}'. "
        f"Formulate a safe culinary substitution or recipe modification for the remaining steps. "
        "Return the response in a strict JSON format matching this schema:\n"
        "{\n"
        "  \"substitution_message\": \"Friendly explanation of what substitute to use or how to adapt the dish (e.g. 'No worries! Squeeze some lemon juice in place of yogurt...')\",\n"
        "  \"adapted_instructions\": [\n"
        "     \"Revised Step A\",\n"
        "     \"Revised Step B\"\n"
        "  ]\n"
        "}\n"
        "Only output the JSON object, with no markdown wrappers or additional text."
    )
    
    response_text = await call_gemini_api(prompt, api_key)
    adapted_data = clean_and_parse_json(response_text)
    
    if "substitution_message" not in adapted_data or "adapted_instructions" not in adapted_data:
        raise HTTPException(status_code=500, detail="Gemini did not return a valid adapted recipe structure.")
        
    return adapted_data

# Serve frontend files
# Mount the frontend assets
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

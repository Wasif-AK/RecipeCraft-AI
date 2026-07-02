# 🍲 RecipeCraft AI — Smart Pantry & Dietary Optimizer

> **Turn what's in your fridge into personalized, healthy recipes — reduce food waste and eliminate the "what should I cook?" dilemma.**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📖 Overview

**RecipeCraft AI** is a web app that turns whatever's sitting in your fridge or pantry into personalized, healthy recipes — reducing food waste and taking the guesswork out of "what should I cook tonight?"

---

## ✨ Core Features

### 🔍 Multi-Modal Ingredient Recognition
Users add pantry ingredients manually or upload a photo of their fridge/pantry, and **Gemini's multi-modal vision model** identifies the items automatically.

### 🧠 Smart Recipe Generation
Gemini generates **3 tailored recipes** based on:

- ✅ **User's actual available ingredients**
- 🥩 **Dietary restrictions**: High-Protein, Gluten-Free, Keto, Vegan, Vegetarian
- 📊 **Nutritional macros**: Calories, Protein, Carbs, Fat
- ⏱️ **Prep time** and difficulty ratings
- 📋 **Ingredient coverage** against what's on hand

### 👨‍🍳 Interactive AI Chef Companion
The standout feature — **step-by-step cooking that adapts in real time**:

> If the user runs out of a secondary ingredient mid-recipe, they flag it and Gemini dynamically rewrites the remaining steps with a smart substitution, so the dish still comes together instead of failing halfway through.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | FastAPI (Python) | API server & request handling |
| **Frontend** | Vanilla HTML/CSS/JS | Single-page application UI |
| **AI Intelligence** | Gemini API | Multi-modal image recognition + structured JSON generation |
| **Fallback** | Demo Mode | High-fidelity mocked responses for offline testing |

---

## 🎨 UI/UX Design

A polished **"Dark Sage & Warm Copper"** glassmorphism design featuring:

- 🥘 **Pantry Inventory Manager** — Add, remove, and organize ingredients
- 📊 **Visual Recipe Cards** — With CSS/SVG macro ring charts
- 🔍 **Scanning-Laser Animation** — Visual feedback on photo upload
- 👨‍🍳 **Chef Companion Modal** — Dedicated cooking interface
- 🗣️ **Text-to-Speech** — Voice-guided cooking instructions
- 💎 **Glassmorphism Effects** — Frosted glass panels

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Gemini API key (optional — Demo Mode works without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/Wasif-AK/RecipeCraft-AI.git

# Navigate to project
cd RecipeCraft-AI

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
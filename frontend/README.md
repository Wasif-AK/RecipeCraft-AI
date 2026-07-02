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

## ✨ Core AI-Powered Features

### 🔍 Multi-Modal Ingredient Recognition
Users add pantry ingredients manually or upload a photo of their fridge/pantry, and **Gemini's multi-modal vision model** identifies the items automatically. No more tedious manual entry of every single ingredient!

### 🧠 Smart Recipe Generation
From the identified ingredients, Gemini generates **3 tailored recipes** based on:

- ✅ **User's actual available ingredients**
- 🥩 **Dietary restrictions**: High-Protein, Gluten-Free, Keto, Vegan, Vegetarian
- 📊 **Nutritional macros**: Calories, Protein, Carbs, Fat
- ⏱️ **Prep time estimates** and difficulty ratings
- 📋 **Ingredient coverage**: Shows what you have vs. what you need

### 👨‍🍳 Interactive AI Chef Companion
The standout feature — **step-by-step guided cooking that adapts in real time**:

> If the user runs out of a secondary ingredient mid-recipe, they flag it and Gemini dynamically rewrites the remaining steps with a smart substitution, so the dish still comes together instead of failing halfway through.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | FastAPI (Python) | API server & request handling |
| **Frontend** | Vanilla HTML/CSS/JS | Single-page application UI |
| **AI Intelligence** | Gemini API | Multi-modal image recognition + structured JSON generation |
| **Fallback** | Demo Mode | High-fidelity mocked responses for flawless operation without live API key |

---

## 🎨 UI/UX Design System

A polished **"Dark Sage & Warm Copper"** glassmorphism design featuring:

- 🥘 **Pantry Inventory Manager** — Add, remove, and organize ingredients
- 📊 **Visual Recipe Cards** — With CSS/SVG macro ring charts (Protein/Carbs/Fat)
- 🔍 **Scanning-Laser Animation** — Visual feedback on photo upload
- 👨‍🍳 **Chef Companion Modal** — Dedicated cooking interface with text-to-speech step readout
- 💎 **Glassmorphism Effects** — Frosted glass panels with backdrop blur
- 📱 **Responsive Layout** — Works seamlessly on desktop and tablet

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8 or higher**
- **Gemini API key** (optional — Demo Mode works without it)

### Installation Steps

#### 1. Navigate to Project Directory
```bash
cd D:\hackathon
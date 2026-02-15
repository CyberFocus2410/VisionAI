# 🥗 NutriSafe  
### Medically-Aware Food Recommendation System  
**Team Name:** VisionAI  
**Hackathon:** Foodoscope Fork It Challenge 2K25  

> *Eating right shouldn’t be a guessing game.*

---

## 📌 Overview

**NutriSafe** is a medically-aware nutrition recommendation system that helps users discover **safe and personalized recipes** based on their health conditions, allergies, dietary preferences, nutrient requirements, and available ingredients.

Unlike traditional recipe or calorie-tracking apps, NutriSafe prioritizes **medical safety first**, using **Foodoscope’s research-grade food databases** to ensure reliable and explainable recommendations.

---

## ❓ Problem Statement

- People with chronic diseases (diabetes, BP, thyroid, etc.) struggle to identify safe foods.
- Existing food apps focus on calories, not medical conditions.
- Allergies, intolerances, and nutrient deficiencies are often ignored.
- Users rely on trial-and-error or generic diet advice.

**There is a lack of a system that connects medical constraints with verified food data.**

---

## 💡 Our Solution

NutriSafe bridges this gap by:
- Collecting user health and food constraints
- Applying medical and nutritional safety rules
- Fetching verified recipes from Foodoscope RecipeDB
- Validating ingredient compatibility using FlavorDB
- Presenting safe recipes with full nutritional transparency

---

## ✨ Key Features

- ✅ Disease-based recipe filtering (21 common conditions)
- ✅ Allergy & avoid-ingredient exclusion
- ✅ Veg / Non-Veg / Eggitarian selection
- ✅ Nutrient-focused recommendations (calories, protein, carbs, fats)
- ✅ Ingredient availability matching
- ✅ Low-oil preference handling
- ✅ Transparent nutrition and recipe details

---

## 🧠 How It Works (High-Level Flow)

1. User enters health conditions & food preferences  
2. Backend applies rule-based medical safety logic  
3. Recipes are fetched from **Foodoscope RecipeDB**  
4. Ingredient compatibility is refined using **FlavorDB**  
5. Safe recipes are displayed with nutrition & instructions  

---

## 🔌 Foodoscope API Usage

### 📦 RecipeDB API
Used for:
- Fetching verified recipes
- Nutrition data (calories, protein, carbs, fats)
- Ingredients & cooking instructions

**Key Endpoints Used:**
- `/recipesinfo`
- `/recipeByTitle`
- `/recipe-diet`
- `/calories`
- `/protein-range`
- `/instructions/{recipe_id}`
- `/ingredients-categories`

---

### 🌿 FlavorDB API
Used for:
- Ingredient compatibility & pairing
- Flavor compound validation
- Ingredient substitution support

**Key Endpoints Used:**
- `/ingredients/flavor/{flavor}`
- `/by-naturalOccurrence`
- `/by-description`
- `/by-energy`
- `/by-aromaThresholdValues`
- `/by-tradeAssociationGuidelines`

---

## 🔐 API Key Handling

- All Foodoscope API keys are handled **server-side**
- Keys are stored securely as **environment variables**
- No API keys are exposed on the frontend
- No data is hardcoded or mocked

---

## 🛠️ Tech Stack

- **Frontend:** React
- **Backend:** Node.js / Express
- **APIs:** Foodoscope RecipeDB, Foodoscope FlavorDB
- **Deployment:** Replit (prototype)
- **Version Control:** GitHub

---

## 🧪 Demo & Prototype

The prototype demonstrates:
- Health condition selection
- Dietary preferences
- Ingredient availability input
- Safe recipe recommendations
- Nutrition breakdown per recipe

> This MVP focuses on **logic clarity, safety, and explainability**.

---

## 🚀 Future Scope

- Voice-based interaction
- Health report analysis
- Wearable device integration
- Smart meal planning
- Mobile application


---

## 🏁 Conclusion

NutriSafe transforms food data into **medically safe, personalized decisions** by combining:
- Research-grade food databases
- Transparent rule-based logic
- User-centric design

> *Food should heal, not harm.*

---

## 👥 Team VisionAI

Built with a focus on:
- Health safety
- Data transparency
- Responsible AI usage

---

## 📜 License

This project was developed as part of the **Foodoscope Fork It Challenge 2K25** and is intended for educational and prototype demonstration purposes.

---

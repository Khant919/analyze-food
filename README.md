# ?? FoodScan AI • Smart Food & Calorie Tracker

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Gemini%20AI-Vision-orange?logo=google)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-emerald?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, AI-powered food nutrition and calorie tracking Progressive Web Application (PWA). Upload or snap a photo of any meal to instantly receive a detailed macronutrient breakdown, health score, and personalized dietary coaching powered by **Google Gemini Vision AI**.

---

## ?? Core Features

- ?? **Smart Food Scanner**: Instant camera capture or photo gallery upload with automatic client-side image compression.
- ?? **Gemini AI Vision Analysis**: Accurate visual portion recognition, ingredient identification, and macro estimation.
- ?? **Daily Nutrition Dashboard**: Real-time caloric progress bar against personalized daily goals (e.g. 2,000 kcal target).
- ?? **7-Day Trend Analytics**: Interactive multi-day chart with day-by-day meal logs, calorie averages, and macro summaries.
- ?? **User Authentication & Cloud Storage**: Secure email/password login and sync powered by Supabase.
- ?? **Installable Progressive Web App (PWA)**: Works seamlessly across desktop and mobile devices (iOS Safari, Android Chrome).

---

## ?? How It Works & Scientific Calculations

### 1. Vision & Image Preprocessing Pipeline
`
[User Camera / Gallery] 
       ? (Client-Side Canvas Compression to max 1280px JPEG)
[Express API Gateway (/api/analyze)] 
       ? (Base64 Inline Data + Structured System Prompt)
[Google Gemini Flash Vision Model]
       ? (Deterministic Parsing & Validation)
[Nutrition Card & Supabase Database]
`

1. **Client-side Compression**: High-resolution mobile camera photos (12MP–48MP) are downscaled in browser memory via <canvas> to max 1280px, producing lightweight ~150KB payloads for sub-second uploads.
2. **Vision Analysis**: The image is streamed to Gemini Flash models (gemini-2.5-flash / gemini-1.5-flash) using strict JSON schema output and deterministic low-temperature sampling (	emperature: 0.1).

---

### 2. Nutritional Calculations & Formulas

#### A. The 4-4-9 Macronutrient Energy Formula
Total calories are strictly grounded in biological energy densities using standard USDA Atwater factors:

\text{Total Calories (kcal)} = (\text{Carbohydrates\_g} \times 4) + (\text{Protein\_g} \times 4) + (\text{Fat\_g} \times 9)

- **Carbohydrates**: 4 kcal per gram
- **Protein**: 4 kcal per gram
- **Fat**: 9 kcal per gram

#### B. Ingredient & Portion Decomposition
Instead of estimating an arbitrary calorie number, the model applies a chain-of-thought breakdown:
1. Identifies discrete ingredients on the plate (e.g., *150g grilled chicken breast*, *1 cup steamed jasmine rice*, *1 tbsp cooking olive oil*).
2. Uses USDA reference data per 100g to compute individual grams of protein, carbs, and fats.
3. Sums all components to form the final nutrition payload.

#### C. Health Score Index (1 – 10)
A holistic nutritional density rating calculated from:
- **Positive factors (+)**: High dietary fiber, lean protein, micronutrient density, whole/unrefined grains.
- **Negative factors (-)**: High trans/saturated fats, added refined sugars, excessive sodium levels, ultra-processed ingredients.

---

## ?? Repository Structure

`	ext
analyze-food/
+-- backend/                  # Node.js Express API Server
¦   +-- routes/               # API endpoint routing (/api/analyze)
¦   +-- services/             # Gemini AI integration service
¦   +-- server.js             # Express server entry point & CORS
¦   +-- package.json          # Backend dependencies (@google/generative-ai, express, etc.)
¦
+-- frontend/                 # React + Vite Single Page Application
¦   +-- public/               # Static assets (icons, manifest, _redirects)
¦   +-- src/
¦   ¦   +-- components/       # CameraCapture, DailyDashboard, WeeklyChart, NutritionCard
¦   ¦   +-- contexts/         # AuthContext (Supabase Auth state)
¦   ¦   +-- services/         # api.js, supabaseClient.js
¦   ¦   +-- App.jsx           # Main UI container
¦   ¦   +-- main.jsx          # React DOM entry point
¦   +-- vite.config.js        # Vite + PWA + SSL plugin configuration
¦   +-- package.json          # Frontend dependencies (React 19, Lucide, Supabase JS)
¦
+-- netlify.toml              # Netlify automated build & routing config
+-- README.md                 # Project documentation
`

---

## ?? Environment Variables

### Backend (ackend/.env)
| Variable | Description | Example |
| :--- | :--- | :--- |
| PORT | Local server port | 3001 |
| GEMINI_API_KEY | Google AI Studio API Key | AIzaSy... |
| SUPABASE_URL | Supabase project URL | https://your-project.supabase.co |
| SUPABASE_ANON_KEY | Supabase anonymous API key | eyJhbGciOi... |
| USE_MOCK | Set 	rue to test offline with mock data | alse |

### Frontend (rontend/.env)
| Variable | Description | Example |
| :--- | :--- | :--- |
| VITE_SUPABASE_URL | Supabase project URL | https://your-project.supabase.co |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous API key | eyJhbGciOi... |
| VITE_API_URL | Live backend API URL (Production) | https://your-backend.onrender.com |

---

## ?? How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- A free [Google AI Studio API Key](https://aistudio.google.com/)
- A free [Supabase Project](https://supabase.com/)

---

### 2. Backend Setup
`ash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file and add your GEMINI_API_KEY
cp .env.example .env

# Start development server
npm run dev
`
Backend runs on http://localhost:3001. Test health check at http://localhost:3001/api/health.

---

### 3. Frontend Setup
`ash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file and add your Supabase keys
cp .env.example .env

# Start development server
npm run dev
`
Frontend runs on https://localhost:5173.

---

## ?? Production Deployment

### Frontend (Netlify)
1. Push your repository to **GitHub**.
2. Connect repository on [Netlify](https://app.netlify.com/).
3. Build Settings are automated via [
etlify.toml](./netlify.toml):
   - **Base directory**: rontend
   - **Build command**: 
pm run build
   - **Publish directory**: dist
4. In Netlify **Environment variables**, set:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_API_URL (your Render backend URL)

### Backend (Render)
1. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Root Directory**: ackend
   - **Runtime**: Node
   - **Build Command**: 
pm install
   - **Start Command**: 
pm start
4. Add environment variables (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY).

---

## ?? License
This project is open-source under the [MIT License](LICENSE).

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const customBaseUrl = process.env.GEMINI_BASE_URL; // e.g. https://my-worker.workers.dev
const useMock = process.env.USE_MOCK === 'true';

if (!apiKey && !useMock) {
  console.error('Warning: GEMINI_API_KEY environment variable is not set in backend/.env');
}

// Initialize GoogleGenerativeAI with custom baseUrl if provided
const requestOptions = customBaseUrl ? { baseUrl: customBaseUrl } : undefined;
const genAI = new GoogleGenerativeAI(apiKey || '', requestOptions);

// Primary and fallback model names
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
].filter(Boolean);

/**
 * Fallback mock response for offline development or testing
 */
function getMockFoodAnalysis() {
  const sampleDishes = [
    {
      food_name: 'Grilled Salmon with Avocado Salad',
      calories: 485,
      carbs_g: 14,
      protein_g: 42,
      fat_g: 28,
      health_score: 9,
      dietary_tags: ['High Protein', 'Keto Friendly', 'Rich in Omega-3'],
      ai_coach_tip: 'Excellent choice! High in lean protein and heart-healthy fats that keep you energized.',
    },
    {
      food_name: 'Chicken Rice & Steamed Veggies',
      calories: 560,
      carbs_g: 68,
      protein_g: 38,
      fat_g: 12,
      health_score: 8,
      dietary_tags: ['Balanced Macros', 'Lean Protein', 'Low Fat'],
      ai_coach_tip: 'Great post-workout balance of clean carbs and protein to replenish muscle glycogen.',
    },
    {
      food_name: 'Classic Cheeseburger',
      calories: 650,
      carbs_g: 48,
      protein_g: 32,
      fat_g: 36,
      health_score: 5,
      dietary_tags: ['High Sodium', 'High Calorie', 'High Protein'],
      ai_coach_tip: 'Consider pairing with water and a side salad to balance sodium intake.',
    },
  ];
  return sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
}

/**
 * Analyzes a food image using Gemini and returns nutritional information.
 * @param {string} base64Image - Base64 encoded image string (with or without data URL prefix)
 * @param {string} [mimeType='image/jpeg'] - MIME type of the image
 * @returns {Promise<{food_name: string, calories: number, carbs_g: number, protein_g: number, fat_g: number, health_score: number, dietary_tags: string[], ai_coach_tip: string}>}
 */
export async function analyzeFoodImage(base64Image, mimeType = 'image/jpeg') {
  if (useMock) {
    console.log('⚡ Using Mock Food Analysis (USE_MOCK=true)');
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMockFoodAnalysis();
  }

  let cleanBase64 = base64Image;
  let detectedMimeType = mimeType;

  // Handle data URL prefix (e.g. data:image/png;base64,...)
  if (base64Image.includes(';base64,')) {
    const parts = base64Image.split(';base64,');
    const mimeMatch = parts[0].match(/data:(.*?)$/);
    if (mimeMatch) {
      detectedMimeType = mimeMatch[1];
    }
    cleanBase64 = parts[1];
  }

  const prompt = `You are an expert nutritionist and visual food analyst.
Carefully examine this food image and estimate the exact nutritional profile for the visible portion size.

Follow these strict scientific estimation guidelines:
1. Break down the dish into its visible ingredients and standard portion sizes (e.g. 150g protein, 1 cup carbs, cooking oils/fats).
2. Use standard USDA nutritional references to calculate grams of Carbs, Protein, and Fat.
3. Calculate Total Calories using the 4-4-9 macro formula: (carbs_g * 4) + (protein_g * 4) + (fat_g * 9) (+/- 5% for fiber/alcohol).
4. Be precise, realistic, and consistent. Do not overestimate or guess randomly.

Return ONLY a valid JSON object with the following exact structure:
{
  "food_name": "string",
  "calories": number,
  "carbs_g": number,
  "protein_g": number,
  "fat_g": number,
  "health_score": number,
  "dietary_tags": ["string"],
  "ai_coach_tip": "string"
}

Rules:
- food_name: Concise name of the dish (e.g., "Grilled Salmon with Quinoa & Steamed Broccoli").
- calories: Total calculated calories (kcal) rounded to the nearest integer.
- carbs_g: Total carbohydrates in grams as an integer.
- protein_g: Total protein in grams as an integer.
- fat_g: Total fat in grams as an integer.
- health_score: Nutritional rating from 1 to 10 (10 = whole unrefined superfoods, 1 = ultra-processed junk).
- dietary_tags: Up to 3 concise tags (e.g. "High Protein", "Low Carb", "Heart Healthy", "High Fiber").
- ai_coach_tip: 1 concise, actionable nutritional recommendation regarding this meal.
- Output MUST strictly be valid JSON adhering to these fields.`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: detectedMimeType,
    },
  };

  let lastError = null;

  // Try candidate models in order
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature eliminates random variance between runs
          topP: 0.8,
        },
      });

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();

      const parsedData = JSON.parse(responseText);
      
      // Ensure defaults if missing
      parsedData.dietary_tags = Array.isArray(parsedData.dietary_tags) ? parsedData.dietary_tags.slice(0, 3) : [];
      parsedData.ai_coach_tip = parsedData.ai_coach_tip || 'A balanced meal with essential nutrients.';

      return parsedData;
    } catch (error) {
      lastError = error;
      const errMsg = error?.message || String(error);
      console.error(`Attempt with model "${modelName}" failed:`, errMsg);

      // If error is not a 404/deprecated model error, don't keep cycling blindly
      if (!errMsg.includes('404') && !errMsg.includes('not found') && !errMsg.includes('no longer available')) {
        break;
      }
    }
  }

  console.error('All Gemini model attempts failed. Last error:', lastError);
  throw lastError || new Error('Failed to analyze food image with Gemini API');
}

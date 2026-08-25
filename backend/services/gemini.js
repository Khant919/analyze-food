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
    },
    {
      food_name: 'Chicken Rice & Steamed Veggies',
      calories: 560,
      carbs_g: 68,
      protein_g: 38,
      fat_g: 12,
      health_score: 8,
    },
    {
      food_name: 'Classic Cheeseburger',
      calories: 650,
      carbs_g: 48,
      protein_g: 32,
      fat_g: 36,
      health_score: 5,
    },
  ];
  return sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
}

/**
 * Analyzes a food image using Gemini and returns nutritional information.
 * @param {string} base64Image - Base64 encoded image string (with or without data URL prefix)
 * @param {string} [mimeType='image/jpeg'] - MIME type of the image
 * @returns {Promise<{food_name: string, calories: number, carbs_g: number, protein_g: number, fat_g: number, health_score: number}>}
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

  const prompt = `Analyze this food image and provide nutritional estimation for the entire serving shown.
Return ONLY a valid JSON object with the following exact structure:
{
  "food_name": "string",
  "calories": number,
  "carbs_g": number,
  "protein_g": number,
  "fat_g": number,
  "health_score": number
}

Rules:
- food_name: A concise name for the identified dish/food item.
- calories: Estimated total calories (kcal) as a number.
- carbs_g: Estimated carbohydrates in grams as a number.
- protein_g: Estimated protein in grams as a number.
- fat_g: Estimated fat in grams as a number.
- health_score: A healthiness rating from 1 to 10 (10 being healthiest/most nutritious).
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
        },
      });

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();

      const parsedData = JSON.parse(responseText);
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

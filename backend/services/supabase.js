import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Warning: SUPABASE_URL or SUPABASE_ANON_KEY environment variable is not set.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Inserts meal analysis data into the Supabase 'meals' table.
 * @param {Object} mealData - The nutritional data object returned by the Gemini service.
 * @param {string} mealData.food_name - Name of the food item.
 * @param {number} mealData.calories - Calories count.
 * @param {number} mealData.carbs_g - Carbohydrates in grams.
 * @param {number} mealData.protein_g - Protein in grams.
 * @param {number} mealData.fat_g - Fat in grams.
 * @param {number} mealData.health_score - Health score rating (1-10).
 * @returns {Promise<Object>} The inserted meal record.
 */
export async function logMeal(mealData) {
  try {
    const { data, error } = await supabase
      .from('meals')
      .insert([
        {
          food_name: mealData.food_name,
          calories: mealData.calories,
          carbs_g: mealData.carbs_g,
          protein_g: mealData.protein_g,
          fat_g: mealData.fat_g,
          health_score: mealData.health_score,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error in logMeal:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logMeal service:', error);
    throw error;
  }
}

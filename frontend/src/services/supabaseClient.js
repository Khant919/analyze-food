import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are missing in frontend/.env'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Fetches all meal records logged today (since 00:00:00 local time).
 * @returns {Promise<Array<Object>>} List of today's meal records
 */
export async function getTodaysMeals() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfTodayIso = today.toISOString();

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('created_at', startOfTodayIso)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching today meals:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get today meals:', error);
    throw error;
  }
}

/**
 * Fetches all meal records logged in the past 7 days.
 * @returns {Promise<Array<Object>>} List of meal records from past 7 days
 */
export async function getWeeklyMeals() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const startIso = sevenDaysAgo.toISOString();

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('created_at', startIso)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching weekly meals:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get weekly meals:', error);
    throw error;
  }
}

/**
 * Inserts a new meal record into the Supabase 'meals' table.
 * @param {Object} mealData - Meal data contract
 * @returns {Promise<Object>} The newly created meal record
 */
export async function insertMeal(mealData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const insertPayload = {
      food_name: mealData.food_name,
      calories: Number(mealData.calories) || 0,
      carbs_g: Number(mealData.carbs_g) || 0,
      protein_g: Number(mealData.protein_g) || 0,
      fat_g: Number(mealData.fat_g) || 0,
      health_score: Number(mealData.health_score) || 5,
    };

    if (user?.id) {
      insertPayload.user_id = user.id;
    }

    const { data, error } = await supabase
      .from('meals')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting meal:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to insert meal:', error);
    throw error;
  }
}

/**
 * Deletes a meal record by its UUID.
 * @param {string} id - The UUID of the meal to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteMeal(id) {
  try {
    if (!id) throw new Error('Meal ID is required to delete');

    const { error } = await supabase.from('meals').delete().eq('id', id);

    if (error) {
      console.error(`Supabase error deleting meal with ID ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete meal:', error);
    throw error;
  }
}

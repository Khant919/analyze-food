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
 * Checks if two dates fall on the same local calendar day.
 */
function isSameCalendarDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Fetches all meal records logged today in local calendar time.
 * @returns {Promise<Array<Object>>} List of today's meal records
 */
export async function getTodaysMeals() {
  try {
    // 1. Fetch recent records from the last 2 days to account for any timezone offsets
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('created_at', twoDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching today meals:', error);
      throw error;
    }

    const today = new Date();
    // Filter to items matching today's local calendar day
    const todaysMeals = (data || []).filter((meal) => {
      if (!meal?.created_at) return false;
      const mealDate = new Date(meal.created_at);
      return isSameCalendarDay(mealDate, today);
    });

    return todaysMeals;
  } catch (error) {
    console.error('Failed to get today meals:', error);
    throw error;
  }
}

export async function getWeeklyMeals() {
  try {
    // Query 14 days of history with local midnight buffer to ensure timezone differences never cut off past days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('created_at', fourteenDaysAgo.toISOString())
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

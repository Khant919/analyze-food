import React from 'react';
import { Flame, Target, Sparkles, TrendingUp } from 'lucide-react';

const DAILY_TARGETS = {
  calories: 2000,
  carbs_g: 250,
  protein_g: 150,
  fat_g: 65,
};

/**
 * DailyDashboard component renders daily caloric and macronutrient progress.
 * @param {Object} props
 * @param {Array<Object>} props.meals - Array of today's logged meals
 */
export default function DailyDashboard({ meals = [] }) {
  // Compute totals
  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories) || 0;
      acc.carbs_g += Number(meal.carbs_g) || 0;
      acc.protein_g += Number(meal.protein_g) || 0;
      acc.fat_g += Number(meal.fat_g) || 0;
      return acc;
    },
    { calories: 0, carbs_g: 0, protein_g: 0, fat_g: 0 }
  );

  // Round values
  const totalCalories = Math.round(totals.calories);
  const totalCarbs = Math.round(totals.carbs_g);
  const totalProtein = Math.round(totals.protein_g);
  const totalFat = Math.round(totals.fat_g);

  // Calorie percentages & remaining
  const calPercent = Math.min(Math.round((totalCalories / DAILY_TARGETS.calories) * 100), 100);
  const caloriesRemaining = Math.max(DAILY_TARGETS.calories - totalCalories, 0);

  // Macro progress percentages (capped at 100% for progress bar visual)
  const carbsPercent = Math.min(Math.round((totalCarbs / DAILY_TARGETS.carbs_g) * 100), 100);
  const proteinPercent = Math.min(Math.round((totalProtein / DAILY_TARGETS.protein_g) * 100), 100);
  const fatPercent = Math.min(Math.round((totalFat / DAILY_TARGETS.fat_g) * 100), 100);

  return (
    <div className="dashboard-card">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-badge">
            <Target size={14} />
            <span>Daily Goal</span>
          </div>
          <h2 className="dashboard-heading">Today's Nutrition</h2>
        </div>
        <div className="meals-count-badge">
          <Sparkles size={14} />
          <span>{meals.length} {meals.length === 1 ? 'Meal' : 'Meals'} Logged</span>
        </div>
      </div>

      {/* Main Calorie Banner */}
      <div className="calorie-summary-box">
        <div className="calorie-main-stat">
          <div className="calorie-flame-icon">
            <Flame size={28} />
          </div>
          <div className="calorie-numbers">
            <div className="calorie-eaten">
              <span className="current-calories">{totalCalories.toLocaleString()}</span>
              <span className="target-calories"> / {DAILY_TARGETS.calories.toLocaleString()} kcal</span>
            </div>
            <div className="calorie-subtext">
              {totalCalories > DAILY_TARGETS.calories ? (
                <span className="over-target">+{totalCalories - DAILY_TARGETS.calories} kcal over target</span>
              ) : (
                <span>{caloriesRemaining.toLocaleString()} kcal remaining today</span>
              )}
            </div>
          </div>
        </div>

        {/* Calorie Progress Bar */}
        <div className="calorie-progress-container">
          <div className="progress-bar-track calorie-track">
            <div
              className="progress-bar-fill calorie-fill"
              style={{ width: `${calPercent}%` }}
            />
          </div>
          <div className="progress-percent-label">{calPercent}% of daily budget</div>
        </div>
      </div>

      {/* Macronutrient Horizontal Progress Bars */}
      <div className="macro-progress-list">
        {/* Carbs */}
        <div className="macro-progress-item">
          <div className="macro-header-row">
            <span className="macro-name carb-name">Carbs</span>
            <span className="macro-fraction">
              <strong>{totalCarbs}g</strong> / {DAILY_TARGETS.carbs_g}g
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill carb-fill"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="macro-progress-item">
          <div className="macro-header-row">
            <span className="macro-name protein-name">Protein</span>
            <span className="macro-fraction">
              <strong>{totalProtein}g</strong> / {DAILY_TARGETS.protein_g}g
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill protein-fill"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="macro-progress-item">
          <div className="macro-header-row">
            <span className="macro-name fat-name">Fat</span>
            <span className="macro-fraction">
              <strong>{totalFat}g</strong> / {DAILY_TARGETS.fat_g}g
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill fat-fill"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

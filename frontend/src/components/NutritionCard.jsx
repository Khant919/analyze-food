import React, { useState } from 'react';
import { Flame, CheckCircle2, RotateCcw, Activity, ShieldCheck, Zap } from 'lucide-react';

/**
 * NutritionCard renders the parsed AI nutritional analysis results.
 * @param {Object} props
 * @param {Object} props.data - Nutritional data contract
 * @param {string} props.data.food_name - Dish or food name
 * @param {number} props.data.calories - Calories in kcal
 * @param {number} props.data.carbs_g - Carbohydrates in grams
 * @param {number} props.data.protein_g - Protein in grams
 * @param {number} props.data.fat_g - Fat in grams
 * @param {number} props.data.health_score - Health score rating (1 - 10)
 * @param {() => void} props.onReset - Callback to reset and scan another meal
 * @param {(data: Object) => Promise<void>} [props.onLogMeal] - Optional callback to save meal to database
 */
export default function NutritionCard({ data, onReset, onLogMeal }) {
  const [isLogged, setIsLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  if (!data) return null;

  const {
    food_name = 'Identified Meal',
    calories = 0,
    carbs_g = 0,
    protein_g = 0,
    fat_g = 0,
    health_score = 5,
  } = data;

  // Normalized health score (1 - 10)
  const clampedScore = Math.min(Math.max(Number(health_score) || 1, 1), 10);
  const scorePercent = (clampedScore / 10) * 100;

  // Health Score Color Tier
  const getScoreColor = (score) => {
    if (score >= 8) return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Excellent' };
    if (score >= 6) return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Good' };
    if (score >= 4) return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Moderate' };
    return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Indulgent' };
  };

  const scoreTheme = getScoreColor(clampedScore);

  const handleLogMeal = async () => {
    if (onLogMeal) {
      try {
        setIsLogging(true);
        await onLogMeal(data);
        setIsLogged(true);
      } catch (err) {
        console.error('Failed to log meal:', err);
      } finally {
        setIsLogging(false);
      }
    } else {
      setIsLogged(true);
    }
  };

  return (
    <div className="nutrition-card">
      {/* Header Section */}
      <div className="card-header">
        <div className="food-title-group">
          <span className="badge-ai">
            <Zap size={14} /> AI Analysis
          </span>
          <h2 className="food-name">{food_name}</h2>
        </div>

        {/* Large Calorie Display */}
        <div className="calories-display">
          <div className="calories-number-group">
            <Flame className="calories-icon" size={26} />
            <span className="calories-value">{calories}</span>
          </div>
          <span className="calories-unit">kcal</span>
        </div>
      </div>

      {/* Health Score Progress Bar */}
      <div className="health-score-section">
        <div className="health-score-header">
          <div className="health-score-title">
            <ShieldCheck size={18} style={{ color: scoreTheme.text }} />
            <span>Health Score</span>
          </div>
          <div
            className="health-score-pill"
            style={{ color: scoreTheme.text, backgroundColor: scoreTheme.bg }}
          >
            <strong>{clampedScore}</strong> / 10 • {scoreTheme.label}
          </div>
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${scorePercent}%`,
              background: `linear-gradient(90deg, #10b981, ${scoreTheme.text})`,
            }}
          />
        </div>
      </div>

      {/* Macronutrient Pills */}
      <div className="macros-grid">
        {/* Carbs */}
        <div className="macro-pill carb-pill">
          <div className="macro-label">Carbs</div>
          <div className="macro-value">{carbs_g}g</div>
          <div className="macro-sub">Energy</div>
        </div>

        {/* Protein */}
        <div className="macro-pill protein-pill">
          <div className="macro-label">Protein</div>
          <div className="macro-value">{protein_g}g</div>
          <div className="macro-sub">Muscle & Repair</div>
        </div>

        {/* Fat */}
        <div className="macro-pill fat-pill">
          <div className="macro-label">Fat</div>
          <div className="macro-value">{fat_g}g</div>
          <div className="macro-sub">Essential Lipids</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <button
          type="button"
          className={`primary-action-btn ${isLogged ? 'logged' : ''}`}
          onClick={handleLogMeal}
          disabled={isLogging || isLogged}
        >
          {isLogged ? (
            <>
              <CheckCircle2 size={18} />
              <span>Meal Logged!</span>
            </>
          ) : isLogging ? (
            <>
              <Activity className="spinner-icon" size={18} />
              <span>Saving Meal...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Log This Meal</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="secondary-action-btn"
          onClick={onReset}
        >
          <RotateCcw size={18} />
          <span>Scan Another</span>
        </button>
      </div>
    </div>
  );
}

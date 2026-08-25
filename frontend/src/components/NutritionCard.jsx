import React, { useState } from 'react';
import PortionControl from './PortionControl';
import {
  Flame,
  CheckCircle2,
  RotateCcw,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  Tag,
  Lightbulb,
} from 'lucide-react';

/**
 * NutritionCard renders the parsed AI nutritional analysis,
 * portion size multiplier, dietary tags, and AI coach tip.
 * @param {Object} props
 * @param {Object} props.data - Nutritional data contract from Gemini
 * @param {() => void} props.onReset - Reset callback
 * @param {(mealData: Object) => Promise<void>} [props.onLogMeal] - Log meal callback
 */
export default function NutritionCard({ data, onReset, onLogMeal }) {
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  const [isLogged, setIsLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  if (!data) return null;

  const {
    food_name = 'Identified Meal',
    calories: baseCalories = 0,
    carbs_g: baseCarbs = 0,
    protein_g: baseProtein = 0,
    fat_g: baseFat = 0,
    health_score = 5,
    dietary_tags = [],
    ai_coach_tip = '',
  } = data;

  // Dynamic calculations based on selected portionMultiplier
  const calculatedCalories = Math.round((Number(baseCalories) || 0) * portionMultiplier);
  const calculatedCarbs = Math.round((Number(baseCarbs) || 0) * portionMultiplier * 10) / 10;
  const calculatedProtein = Math.round((Number(baseProtein) || 0) * portionMultiplier * 10) / 10;
  const calculatedFat = Math.round((Number(baseFat) || 0) * portionMultiplier * 10) / 10;

  // Health Score Color Tier
  const clampedScore = Math.min(Math.max(Number(health_score) || 1, 1), 10);
  const scorePercent = (clampedScore / 10) * 100;

  const getScoreColor = (score) => {
    if (score >= 8) return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Excellent' };
    if (score >= 6) return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Good' };
    if (score >= 4) return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Moderate' };
    return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Indulgent' };
  };

  const scoreTheme = getScoreColor(clampedScore);

  // Helper for tag badge color styles
  const getTagStyle = (tag) => {
    const lower = String(tag).toLowerCase();
    if (lower.includes('sodium') || lower.includes('sugar') || lower.includes('calorie') || lower.includes('fat') && !lower.includes('low')) {
      return { background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: 'rgba(245, 158, 11, 0.3)' };
    }
    if (lower.includes('protein') || lower.includes('keto') || lower.includes('fiber') || lower.includes('omega') || lower.includes('clean')) {
      return { background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: 'rgba(16, 185, 129, 0.3)' };
    }
    return { background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5', border: 'rgba(99, 102, 241, 0.3)' };
  };

  // Handle logging to Supabase with adjusted multiplier values
  const handleLogMeal = async () => {
    if (onLogMeal) {
      try {
        setIsLogging(true);
        const mealPayload = {
          food_name: portionMultiplier !== 1.0 ? `${food_name} (${portionMultiplier}x)` : food_name,
          calories: calculatedCalories,
          carbs_g: calculatedCarbs,
          protein_g: calculatedProtein,
          fat_g: calculatedFat,
          health_score: clampedScore,
        };
        await onLogMeal(mealPayload);
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
          <div className="badge-row">
            <span className="badge-ai">
              <Zap size={13} /> AI Verified
            </span>
          </div>

          <h2 className="food-name">{food_name}</h2>

          {/* AI Dietary Tags */}
          {dietary_tags && dietary_tags.length > 0 && (
            <div className="dietary-tags-list">
              {dietary_tags.map((tag, idx) => {
                const style = getTagStyle(tag);
                return (
                  <span
                    key={idx}
                    className="dietary-tag-badge"
                    style={{
                      backgroundColor: style.background,
                      color: style.color,
                      borderColor: style.border,
                    }}
                  >
                    <Tag size={11} className="tag-icon" />
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Large Calorie Display */}
        <div className="calories-display">
          <div className="calories-number-group">
            <Flame className="calories-icon" size={26} />
            <span className="calories-value">{calculatedCalories}</span>
          </div>
          <span className="calories-unit">kcal</span>
        </div>
      </div>

      {/* Health Score Meter */}
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

      {/* Portion Size Adjuster Control */}
      <PortionControl
        multiplier={portionMultiplier}
        onChange={(val) => {
          setPortionMultiplier(val);
          // If portion changed after logging, allow re-logging
          setIsLogged(false);
        }}
      />

      {/* Macronutrient Pills (Dynamically calculated) */}
      <div className="macros-grid">
        {/* Carbs */}
        <div className="macro-pill carb-pill">
          <div className="macro-label">Carbs</div>
          <div className="macro-value">{calculatedCarbs}g</div>
          <div className="macro-sub">Energy</div>
        </div>

        {/* Protein */}
        <div className="macro-pill protein-pill">
          <div className="macro-label">Protein</div>
          <div className="macro-value">{calculatedProtein}g</div>
          <div className="macro-sub">Muscle & Repair</div>
        </div>

        {/* Fat */}
        <div className="macro-pill fat-pill">
          <div className="macro-label">Fat</div>
          <div className="macro-value">{calculatedFat}g</div>
          <div className="macro-sub">Essential Lipids</div>
        </div>
      </div>

      {/* AI Coach Health Tip Callout Box */}
      {ai_coach_tip && (
        <div className="ai-coach-callout">
          <div className="coach-icon-box">
            <Lightbulb size={20} className="coach-icon" />
          </div>
          <div className="coach-content">
            <div className="coach-header">
              <Sparkles size={13} className="coach-sparkle" />
              <span className="coach-title">AI Nutrition Coach</span>
            </div>
            <p className="coach-tip-text">{ai_coach_tip}</p>
          </div>
        </div>
      )}

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
              <span>Meal Logged ({calculatedCalories} kcal)</span>
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

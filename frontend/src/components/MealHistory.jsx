import React, { useState } from 'react';
import { Clock, Trash2, Utensils, Flame, Sparkles } from 'lucide-react';

/**
 * Formats ISO timestamp to human friendly local time (e.g., "12:30 PM")
 */
function formatTime(isoString) {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Today';
  }
}

/**
 * MealHistory component renders the list of meals logged today.
 * @param {Object} props
 * @param {Array<Object>} props.meals - Array of logged meals
 * @param {(id: string) => Promise<void>} props.onDelete - Callback to delete a meal by ID
 */
export default function MealHistory({ meals = [], onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = async (id) => {
    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (err) {
      console.error('Failed to delete meal in MealHistory component:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="history-card">
      {/* Header */}
      <div className="history-header">
        <div className="history-title-group">
          <Clock size={16} className="history-icon" />
          <h3 className="history-heading">Today's Meal Log</h3>
        </div>
        <span className="history-count-pill">{meals.length} Items</span>
      </div>

      {/* Empty State */}
      {meals.length === 0 ? (
        <div className="history-empty-state">
          <div className="empty-icon-wrapper">
            <Utensils size={24} className="empty-icon" />
          </div>
          <p className="empty-text">No meals logged yet today</p>
          <p className="empty-subtext">Scan or upload your meal above to start tracking</p>
        </div>
      ) : (
        /* Meal List */
        <div className="history-list">
          {meals.map((meal) => (
            <div key={meal.id} className="history-item">
              <div className="history-item-info">
                <div className="history-item-title-row">
                  <span className="history-item-name">{meal.food_name}</span>
                </div>
                <div className="history-item-meta">
                  <span className="history-item-calories">
                    <Flame size={13} className="meta-icon" />
                    <strong>{Math.round(meal.calories || 0)}</strong> kcal
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="history-item-macros">
                    C: {Math.round(meal.carbs_g || 0)}g · P: {Math.round(meal.protein_g || 0)}g · F: {Math.round(meal.fat_g || 0)}g
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="history-item-time">
                    {formatTime(meal.created_at)}
                  </span>
                </div>
              </div>

              {/* Delete Action */}
              <button
                type="button"
                className="delete-item-btn"
                onClick={() => handleDeleteClick(meal.id)}
                disabled={deletingId === meal.id}
                title="Delete meal"
                aria-label={`Delete ${meal.food_name}`}
              >
                {deletingId === meal.id ? (
                  <span className="btn-spinner" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

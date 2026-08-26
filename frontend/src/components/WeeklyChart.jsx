import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Utensils, Flame } from 'lucide-react';

const DAILY_TARGET = 2000;

/**
 * Safely parse a date string, timestamp, or Date object into a valid local Date
 */
function parseMealDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

  // If it's a number or numeric string timestamp
  if (typeof raw === 'number' || /^\d+$/.test(String(raw).trim())) {
    const num = Number(raw);
    const ms = num < 1e11 ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(raw).trim();

  // If it's a YYYY-MM-DD or YYYY/MM/DD date string without time, parse local date parts directly
  // to prevent JS from interpreting it as UTC midnight and shifting the day back
  const dateMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (dateMatch && !str.includes('T') && !str.includes(':')) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1;
    const day = parseInt(dateMatch[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Checks if two Date objects fall on the same local calendar day.
 */
function isSameCalendarDay(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Builds an array of the last 7 calendar days with aggregated nutritional data.
 */
function build7DaysData(weeklyMeals = []) {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);

    const isToday = i === 0;
    const dayLabel = isToday ? 'Today' : targetDate.toLocaleDateString([], { weekday: 'short' });
    const dateLabel = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

    // Aggregate all meals logged on this exact calendar date
    const dayMeals = weeklyMeals.filter((meal) => {
      const raw = meal?.created_at || meal?.logged_at || meal?.date || meal?.timestamp;
      const mealDate = parseMealDate(raw);
      return mealDate ? isSameCalendarDay(mealDate, targetDate) : false;
    });

    const calories = dayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const carbs = dayMeals.reduce((sum, m) => sum + (Number(m.carbs_g) || 0), 0);
    const protein = dayMeals.reduce((sum, m) => sum + (Number(m.protein_g) || 0), 0);
    const fat = dayMeals.reduce((sum, m) => sum + (Number(m.fat_g) || 0), 0);

    days.push({
      dateKey,
      dayLabel,
      dateLabel,
      isToday,
      count: dayMeals.length,
      calories: Math.round(calories),
      carbs: Math.round(carbs),
      protein: Math.round(protein),
      fat: Math.round(fat),
      meals: dayMeals,
    });
  }

  return days;
}

/**
 * WeeklyChart component renders a 7-day caloric & macro summary bar chart.
 * @param {Object} props
 * @param {Array<Object>} props.weeklyMeals - All meals logged in the last 7 days
 */
export default function WeeklyChart({ weeklyMeals = [] }) {
  const daysData = build7DaysData(weeklyMeals);
  
  // Track selected dateKey rather than stale object so updates are reactive
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  // Derive the active selected day dynamically
  const todayDay = daysData[daysData.length - 1];
  const selectedDay = daysData.find((d) => d.dateKey === selectedDateKey) || todayDay;

  // Calculate statistics
  const totalWeeklyCalories = daysData.reduce((acc, d) => acc + d.calories, 0);
  const avgDailyCalories = Math.round(totalWeeklyCalories / 7);

  // Maximum calorie scale for vertical bar heights (min 2400 to leave headroom)
  const maxCalories = Math.max(...daysData.map((d) => d.calories), DAILY_TARGET * 1.15, 2400);

  return (
    <div className="weekly-chart-card">
      {/* Header Section */}
      <div className="weekly-header">
        <div className="weekly-title-group">
          <div className="weekly-badge">
            <BarChart3 size={14} />
            <span>Analytics</span>
          </div>
          <h3 className="weekly-heading">7-Day Calorie Trend</h3>
        </div>

        {/* Weekly Avg Stat */}
        <div className="weekly-avg-box">
          <TrendingUp size={14} className="avg-icon" />
          <span className="avg-text">
            Avg: <strong>{avgDailyCalories.toLocaleString()}</strong> kcal/day
          </span>
        </div>
      </div>

      {/* Target Guide Line Info */}
      <div className="chart-target-legend">
        <span className="legend-target-line" />
        <span className="legend-target-text">Daily Target: {DAILY_TARGET.toLocaleString()} kcal (tap any day to view details)</span>
      </div>

      {/* 7-Day Vertical Bar Chart */}
      <div className="chart-container">
        {/* Dotted Target Line Across Chart */}
        <div
          className="chart-target-horizontal-line"
          style={{ bottom: `${(DAILY_TARGET / maxCalories) * 100}%` }}
        />

        <div className="bars-grid">
          {daysData.map((day) => {
            const heightPercent = Math.min((day.calories / maxCalories) * 100, 100);
            const isSelected = selectedDay?.dateKey === day.dateKey;
            const isOverTarget = day.calories > DAILY_TARGET;

            return (
              <div
                key={day.dateKey}
                className={`chart-bar-column ${day.isToday ? 'today-col' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDateKey(day.dateKey)}
                title={`${day.dayLabel} (${day.dateLabel}): ${day.calories} kcal`}
                style={{ cursor: 'pointer' }}
              >
                {/* Value on top of bar */}
                <div className="bar-top-value">
                  {day.calories > 0 ? `${day.calories}` : '0'}
                </div>

                {/* Bar Track & Fill */}
                <div className="bar-track">
                  <div
                    className={`bar-fill ${day.isToday ? 'bar-today' : ''} ${isOverTarget ? 'bar-over' : ''}`}
                    style={{ height: `${Math.max(heightPercent, day.calories > 0 ? 8 : 4)}%` }}
                  />
                </div>

                {/* Day Labels */}
                <div className="bar-labels">
                  <span className={`bar-day-name ${day.isToday ? 'highlight-today' : ''}`}>
                    {day.dayLabel}
                  </span>
                  <span className="bar-date-sub">{day.dateLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Card */}
      {selectedDay && (
        <div className="selected-day-card">
          <div className="selected-day-header">
            <div className="selected-day-title">
              <Calendar size={14} className="cal-icon" />
              <span>
                {selectedDay.isToday ? "Today's Summary" : `${selectedDay.dayLabel}, ${selectedDay.dateLabel}`}
              </span>
            </div>
            <span className="selected-day-count">
              {selectedDay.count} {selectedDay.count === 1 ? 'Meal' : 'Meals'} Logged
            </span>
          </div>

          <div className="selected-day-stats">
            <div className="day-stat-chip">
              <span className="stat-label">Calories</span>
              <strong className="stat-val stat-cal">{selectedDay.calories} kcal</strong>
            </div>
            <div className="day-stat-chip">
              <span className="stat-label">Carbs</span>
              <strong className="stat-val stat-carb">{selectedDay.carbs}g</strong>
            </div>
            <div className="day-stat-chip">
              <span className="stat-label">Protein</span>
              <strong className="stat-val stat-protein">{selectedDay.protein}g</strong>
            </div>
            <div className="day-stat-chip">
              <span className="stat-label">Fat</span>
              <strong className="stat-val stat-fat">{selectedDay.fat}g</strong>
            </div>
          </div>

          {/* If there are meals for this day, show a quick itemized breakdown */}
          {selectedDay.meals && selectedDay.meals.length > 0 && !selectedDay.isToday && (
            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Meals on this day:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedDay.meals.map((m, idx) => (
                  <div key={m.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <span>🍽️ {m.food_name}</span>
                    <strong style={{ color: 'var(--accent)' }}>{Math.round(m.calories || 0)} kcal</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

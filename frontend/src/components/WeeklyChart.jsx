import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Zap, CheckCircle2 } from 'lucide-react';

const DAILY_TARGET = 2000;

/**
 * Builds an array of the last 7 calendar days with aggregated nutritional data.
 */
function build7DaysData(weeklyMeals = []) {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    // Format labels
    const isToday = i === 0;
    const dayLabel = isToday ? 'Today' : d.toLocaleDateString([], { weekday: 'short' });
    const dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Aggregate meals logged on this date
    const dayMeals = weeklyMeals.filter((meal) => {
      const mealDate = new Date(meal.created_at);
      return mealDate >= d && mealDate < nextDay;
    });

    const calories = dayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const carbs = dayMeals.reduce((sum, m) => sum + (Number(m.carbs_g) || 0), 0);
    const protein = dayMeals.reduce((sum, m) => sum + (Number(m.protein_g) || 0), 0);
    const fat = dayMeals.reduce((sum, m) => sum + (Number(m.fat_g) || 0), 0);

    days.push({
      dateKey: d.toISOString().split('T')[0],
      dayLabel,
      dateLabel,
      isToday,
      count: dayMeals.length,
      calories: Math.round(calories),
      carbs: Math.round(carbs),
      protein: Math.round(protein),
      fat: Math.round(fat),
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
  const [selectedDay, setSelectedDay] = useState(daysData[daysData.length - 1]); // defaults to Today

  // Calculate statistics
  const totalWeeklyCalories = daysData.reduce((acc, d) => acc + d.calories, 0);
  const activeDaysCount = daysData.filter((d) => d.calories > 0).length || 1;
  const avgDailyCalories = Math.round(totalWeeklyCalories / 7);

  // Maximum calorie scale for vertical bar heights (min 2200 to give room)
  const maxCalories = Math.max(...daysData.map((d) => d.calories), DAILY_TARGET * 1.1, 2400);

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
        <span className="legend-target-text">Daily Target: {DAILY_TARGET.toLocaleString()} kcal</span>
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
                onClick={() => setSelectedDay(day)}
                title={`${day.dayLabel} (${day.dateLabel}): ${day.calories} kcal`}
              >
                {/* Value on top of bar if active */}
                <div className="bar-top-value">
                  {day.calories > 0 ? `${day.calories}` : '0'}
                </div>

                {/* Bar Track & Fill */}
                <div className="bar-track">
                  <div
                    className={`bar-fill ${day.isToday ? 'bar-today' : ''} ${isOverTarget ? 'bar-over' : ''}`}
                    style={{ height: `${Math.max(heightPercent, day.calories > 0 ? 6 : 2)}%` }}
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
        </div>
      )}
    </div>
  );
}

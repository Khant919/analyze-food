import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CameraCapture from './components/CameraCapture';
import NutritionCard from './components/NutritionCard';
import DailyDashboard from './components/DailyDashboard';
import WeeklyChart from './components/WeeklyChart';
import MealHistory from './components/MealHistory';
import { analyzeFoodImage } from './services/api';
import { getTodaysMeals, getWeeklyMeals, insertMeal, deleteMeal } from './services/supabaseClient';
import {
  Sparkles,
  AlertCircle,
  UtensilsCrossed,
  CheckCircle2,
  ShieldCheck,
  Zap,
  LogOut,
  User,
} from 'lucide-react';
import './App.css';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [viewState, setViewState] = useState('idle'); // 'idle' | 'loading' | 'result'
  const [nutritionData, setNutritionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [meals, setMeals] = useState([]);
  const [weeklyMeals, setWeeklyMeals] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch meals whenever the authenticated user changes
  useEffect(() => {
    if (!user) {
      setMeals([]);
      setWeeklyMeals([]);
      return;
    }

    async function loadData() {
      try {
        setIsLoadingMeals(true);
        const [todayData, weekData] = await Promise.all([
          getTodaysMeals().catch(() => []),
          getWeeklyMeals().catch(() => []),
        ]);
        setMeals(todayData);
        setWeeklyMeals(weekData);
      } catch (error) {
        console.error('Error fetching meals data on mount:', error);
      } finally {
        setIsLoadingMeals(false);
      }
    }

    loadData();
  }, [user]);

  // Show a temporary success toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Process the captured or uploaded food image
  const handleImageProcess = async (base64Image) => {
    try {
      setErrorMessage(null);
      setCapturedImage(base64Image);
      setViewState('loading');

      const data = await analyzeFoodImage(base64Image);
      setNutritionData(data);
      setViewState('result');
    } catch (error) {
      console.error('Food analysis error:', error);
      setErrorMessage(
        error.message || 'Failed to analyze food image. Please check your network or backend server.'
      );
      setViewState('idle');
    }
  };

  // Log meal into Supabase and update state
  const handleLogMeal = async (mealToLog) => {
    try {
      const inserted = await insertMeal(mealToLog);
      setMeals((prev) => [inserted, ...prev]);
      setWeeklyMeals((prev) => [...prev, inserted]);
      showToast(`Logged "${mealToLog.food_name}" (${mealToLog.calories} kcal)`);
    } catch (error) {
      console.error('Failed to log meal:', error);
      alert('Could not save meal. Please ensure your Supabase RLS policies and "meals" table are updated.');
      throw error;
    }
  };

  // Delete a meal by ID
  const handleDeleteMeal = async (id) => {
    try {
      await deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setWeeklyMeals((prev) => prev.filter((m) => m.id !== id));
      showToast('Meal removed from log');
    } catch (error) {
      console.error('Failed to delete meal:', error);
      alert('Could not delete meal. Please try again.');
    }
  };

  // Reset scanner to idle
  const resetScan = () => {
    setNutritionData(null);
    setCapturedImage(null);
    setErrorMessage(null);
    setViewState('idle');
  };

  // Handle user Sign Out
  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed out successfully');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // 1. Initial Authentication Loading Splash
  if (authLoading) {
    return (
      <div className="auth-splash-screen">
        <div className="auth-splash-box fade-in">
          <div className="brand-logo splash-logo">
            <UtensilsCrossed size={32} />
          </div>
          <div className="sleek-spinner splash-spinner" />
          <p className="splash-text">Loading NutriScan AI...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Show AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Authenticated State -> Show Main App Dashboard
  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-toast fade-in-down">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand">
            <div className="brand-logo">
              <UtensilsCrossed size={22} />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">NutriScan<span className="brand-accent">AI</span></h1>
              <p className="brand-subtitle">Smart Food & Calorie Scanner</p>
            </div>
          </div>

          {/* User Account Badge & Sign Out Button */}
          <div className="navbar-right-actions">
            <div className="user-email-pill" title={user.email}>
              <User size={14} className="user-icon" />
              <span className="user-email-text">{user.email}</span>
            </div>
            <button
              type="button"
              className="signout-btn"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
              <span className="signout-text">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="layout-container">
        {/* Error Banner */}
        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={20} className="error-icon" />
            <div className="error-text">
              <strong>Analysis Error:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="error-dismiss-btn"
              onClick={() => setErrorMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid-layout">
          {/* LEFT COLUMN: Food Scanner & AI Analysis with Error Boundary */}
          <section className="column-scanner">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-pill">Scan</span>
                <h2 className="section-title">Food Scanner</h2>
              </div>
              <p className="section-desc">Take a photo or upload an image to analyze portion & nutrition</p>
            </div>

            <ErrorBoundary onReset={resetScan}>
              {/* View State: IDLE */}
              {viewState === 'idle' && (
                <div className="card-wrapper fade-in">
                  <CameraCapture onCapture={handleImageProcess} />
                </div>
              )}

              {/* View State: LOADING */}
              {viewState === 'loading' && (
                <div className="loading-card fade-in">
                  {capturedImage && (
                    <div className="preview-thumbnail-container">
                      <img
                        src={capturedImage}
                        alt="Captured food preview"
                        className="preview-thumbnail"
                      />
                      <div className="scan-line-animation" />
                    </div>
                  )}
                  <div className="loading-spinner-wrapper">
                    <div className="sleek-spinner" />
                    <Sparkles className="spinner-center-icon" size={24} />
                  </div>
                  <h3 className="loading-title">Analyzing with Gemini AI...</h3>
                  <p className="loading-subtitle">
                    Detecting food item, portion volume, calories & macronutrients
                  </p>
                </div>
              )}

              {/* View State: RESULT */}
              {viewState === 'result' && nutritionData && (
                <div className="result-wrapper fade-in">
                  {capturedImage && (
                    <div className="result-image-preview">
                      <img
                        src={capturedImage}
                        alt="Scanned dish"
                        className="scanned-image"
                      />
                      <div className="image-overlay-badge">
                        <ShieldCheck size={14} /> AI Verified
                      </div>
                    </div>
                  )}
                  <NutritionCard
                    data={nutritionData}
                    onReset={resetScan}
                    onLogMeal={handleLogMeal}
                  />
                </div>
              )}
            </ErrorBoundary>
          </section>

          {/* RIGHT COLUMN: Daily Progress, Weekly Analytics & History */}
          <section className="column-dashboard">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-pill section-pill-green">Progress</span>
                <h2 className="section-title">Nutrition Dashboard</h2>
              </div>
              <p className="section-desc">Personal daily budget and 7-day caloric trend</p>
            </div>

            {/* Daily Dashboard Widget */}
            <div className="card-wrapper">
              <DailyDashboard meals={meals} />
            </div>

            {/* 7-Day Weekly Summary Chart */}
            <div className="card-wrapper">
              <WeeklyChart weeklyMeals={weeklyMeals} />
            </div>

            {/* Today's Meal History */}
            <div className="card-wrapper">
              <MealHistory meals={meals} onDelete={handleDeleteMeal} />
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© 2026 NutriScan AI • Built with React, Supabase Auth & Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}

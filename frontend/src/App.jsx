import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import NutritionCard from './components/NutritionCard';
import { analyzeFoodImage } from './services/api';
import { Sparkles, AlertCircle, UtensilsCrossed, RefreshCw } from 'lucide-react';
import './App.css';

export default function App() {
  const [viewState, setViewState] = useState('idle'); // 'idle' | 'loading' | 'result'
  const [nutritionData, setNutritionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Process the captured/uploaded image
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
        error.message || 'Failed to analyze food image. Please ensure your backend is running.'
      );
      setViewState('idle');
    }
  };

  // Reset to idle scan state
  const resetScan = () => {
    setNutritionData(null);
    setCapturedImage(null);
    setErrorMessage(null);
    setViewState('idle');
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-badge">
          <UtensilsCrossed size={20} className="brand-icon" />
          <span className="brand-title">NutriScan AI</span>
        </div>
        <p className="brand-tagline">
          Real-time nutritional estimation powered by Google Gemini 1.5 Flash
        </p>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={20} className="error-icon" />
            <div className="error-text">
              <strong>Analysis Failed:</strong> {errorMessage}
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

        {/* View State: IDLE */}
        {viewState === 'idle' && (
          <div className="state-section fade-in">
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
              <Sparkles className="spinner-center-icon" size={22} />
            </div>
            <h3 className="loading-title">Analyzing meal with Gemini AI...</h3>
            <p className="loading-subtitle">
              Identifying ingredients, portion sizes, calories & macronutrients
            </p>
          </div>
        )}

        {/* View State: RESULT */}
        {viewState === 'result' && nutritionData && (
          <div className="result-section fade-in">
            {capturedImage && (
              <div className="result-image-preview">
                <img
                  src={capturedImage}
                  alt="Scanned dish"
                  className="scanned-image"
                />
              </div>
            )}
            <NutritionCard data={nutritionData} onReset={resetScan} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>NutriScan MVP • Powered by React, Vite, Express & Gemini AI</p>
      </footer>
    </div>
  );
}

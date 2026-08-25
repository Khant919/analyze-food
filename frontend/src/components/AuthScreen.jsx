import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, Mail, Lock, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * AuthScreen provides a modern, minimalist sign-in and sign-up interface.
 */
export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isSignUp) {
        const res = await signUp(email, password);
        // Supabase might require email confirmation or sign in directly
        if (res?.user && !res?.session) {
          setSuccessMsg('Account created! Please check your email to confirm your account or sign in.');
        } else {
          setSuccessMsg('Account created successfully! Logging you in...');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error('Auth action error:', err);
      // Clean up common error messages
      let message = err.message || 'Authentication failed. Please try again.';
      if (message.toLowerCase().includes('invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="brand-logo">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="auth-title">NutriScan<span className="brand-accent">AI</span></h1>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Create a free account to track your daily nutrition & scans'
              : 'Sign in to access your personal meal history and analytics'}
          </p>
        </div>

        {/* Mode Toggle Switch */}
        <div className="auth-toggle-group">
          <button
            type="button"
            className={`auth-toggle-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-toggle-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error">
            <AlertCircle size={16} className="alert-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert auth-alert-success">
            <CheckCircle2 size={16} className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="auth-password">
              Password
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="btn-loader">
                <span className="btn-spinner-white" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <div className="btn-content">
                <span>{isSignUp ? 'Create Free Account' : 'Sign In'}</span>
                <ArrowRight size={18} />
              </div>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="auth-footer-note">
          <Sparkles size={14} className="note-sparkle" />
          <span>Private & Secure data protected by Supabase Row Level Security</span>
        </div>
      </div>
    </div>
  );
}

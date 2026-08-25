import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, UploadCloud } from 'lucide-react';

/**
 * ErrorBoundary catches runtime and rendering errors in children components
 * and renders a graceful fallback interface.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-card fade-in">
          <div className="error-boundary-icon-wrapper">
            <AlertTriangle size={32} className="error-boundary-icon" />
          </div>

          <h3 className="error-boundary-title">
            Oops, our AI needs a quick breather!
          </h3>

          <p className="error-boundary-desc">
            Something unexpected occurred while processing the camera or image. Try uploading a photo instead, or give it another shot.
          </p>

          <div className="error-boundary-actions">
            <button
              type="button"
              className="error-retry-btn"
              onClick={this.handleReset}
            >
              <RotateCcw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

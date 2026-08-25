import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * CameraCapture component allows users to capture photos via live webcam
 * or upload an existing image file from their device storage/gallery.
 * @param {Object} props
 * @param {(base64Image: string) => void} props.onCapture - Callback triggered when an image is ready
 */
export default function CameraCapture({ onCapture }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [dragActive, setDragActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' | 'environment'
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = useRef(null);

  // Capture snapshot from Webcam
  const handleCapturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  // Convert File to Base64
  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onCapture(e.target.result);
      }
    };
    reader.onerror = (err) => {
      console.error('Error reading file:', err);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const toggleCameraFacing = () => {
    setCameraError(null);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Video constraints with ideal fallback for mobile back & front cameras
  const videoConstraints = {
    facingMode: { ideal: facingMode },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  return (
    <div className="capture-card">
      {/* Mode Toggle Switch */}
      <div className="toggle-container">
        <button
          type="button"
          className={`toggle-btn ${mode === 'camera' ? 'active' : ''}`}
          onClick={() => {
            setMode('camera');
            setCameraError(null);
          }}
        >
          <Camera size={18} />
          <span>Live Camera</span>
        </button>
        <button
          type="button"
          className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          <Upload size={18} />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Live Camera View */}
      {mode === 'camera' && (
        <div className="camera-view">
          {cameraError ? (
            <div className="camera-error-box">
              <AlertCircle size={28} className="camera-error-icon" />
              <p className="camera-error-title">Camera Permission Needed or Unavailable</p>
              <p className="camera-error-sub">
                Mobile browsers require HTTPS or camera permission to stream live video. You can easily upload from your photo gallery instead.
              </p>
              <button
                type="button"
                className="select-file-btn"
                onClick={() => setMode('upload')}
              >
                <Upload size={16} />
                <span>Switch to Photo Upload</span>
              </button>
            </div>
          ) : (
            <div className="webcam-wrapper">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="webcam-video"
                mirrored={facingMode === 'user'}
                playsInline={true}
                onUserMediaError={(err) => {
                  console.warn('Webcam stream error on mobile:', err);
                  setCameraError(err);
                }}
              />
              {/* Viewfinder Target Overlay */}
              <div className="viewfinder-overlay">
                <div className="viewfinder-box" />
              </div>

              {/* Switch Camera Button (Mobile/Multi-cam) */}
              <button
                type="button"
                className="camera-flip-btn"
                onClick={toggleCameraFacing}
                title={`Switch to ${facingMode === 'environment' ? 'Front' : 'Back'} Camera`}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          )}

          {!cameraError && (
            <div className="camera-actions">
              <button
                type="button"
                className="capture-btn"
                onClick={handleCapturePhoto}
              >
                <div className="capture-inner" />
                <span>Capture & Analyze</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Photo Dropzone (File Explorer / Gallery) */}
      {mode === 'upload' && (
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Note: Standard input WITHOUT capture attribute allows selecting from File Explorer & Photo Gallery */}
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            className="file-input"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="dropzone-label">
            <div className="dropzone-icon-wrapper">
              <ImageIcon size={38} className="dropzone-icon" />
            </div>
            <p className="dropzone-title">Choose from Gallery or Files</p>
            <p className="dropzone-subtitle">Click to browse your photos (JPG, PNG, WebP)</p>
            <div className="select-file-btn">
              <Sparkles size={16} />
              <span>Select Meal Image</span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

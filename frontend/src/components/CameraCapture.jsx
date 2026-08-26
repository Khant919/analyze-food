import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle, Smartphone } from 'lucide-react';

/**
 * CameraCapture component allows users to capture photos via live webcam
 * or upload an existing image file from their device storage/gallery.
 * @param {Object} props
 * @param {(base64Image: string) => void} props.onCapture - Callback triggered when an image is ready
 */
export default function CameraCapture({ onCapture }) {
  const [mode, setMode] = useState('upload'); // Default to 'upload' for best mobile & desktop UX
  const [dragActive, setDragActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' | 'environment'
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = useRef(null);
  const galleryInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  // Capture snapshot from live Webcam
  const handleCapturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  /**
   * Reads and compresses any image client-side to ensure fast mobile uploads
   * and broad format compatibility (including iPhone high-res / HEIC).
   */
  const processFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Downscale large mobile camera photos (e.g. 12-48MP) to max 1280px for fast AI analysis
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight standard JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(compressedBase64);
      };

      img.onerror = () => {
        // Fallback to raw data url if canvas decode fails
        onCapture(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = (err) => {
      console.error('Error reading file:', err);
      alert('Could not read the selected image file. Please try another image.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so selecting the same file again triggers onChange
    e.target.value = '';
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
      {/* Hidden File Inputs - Triggered reliably by click handlers */}
      <input
        ref={galleryInputRef}
        type="file"
        id="gallery-file-upload"
        accept="image/*"
        className="file-input"
        onChange={handleFileInput}
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        id="native-camera-upload"
        accept="image/*"
        capture="environment"
        className="file-input"
        onChange={handleFileInput}
      />

      {/* Mode Toggle Switch */}
      <div className="toggle-container">
        <button
          type="button"
          className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          <Upload size={18} />
          <span>Upload & Photos</span>
        </button>
        <button
          type="button"
          className={`toggle-btn ${mode === 'camera' ? 'active' : ''}`}
          onClick={() => {
            setMode('camera');
            setCameraError(null);
          }}
        >
          <Camera size={18} />
          <span>Webcam Stream</span>
        </button>
      </div>

      {/* Upload & Mobile Photo Picker Mode */}
      {mode === 'upload' && (
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => galleryInputRef.current?.click()}
        >
          <div className="dropzone-icon-wrapper">
            <ImageIcon size={38} className="dropzone-icon" />
          </div>
          <p className="dropzone-title">Select Food Photo</p>
          <p className="dropzone-subtitle">Take a photo or choose from your gallery (JPG, PNG, WebP)</p>

          <div className="upload-actions-group" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="select-file-btn primary-action"
              onClick={() => nativeCameraInputRef.current?.click()}
            >
              <Smartphone size={17} />
              <span>Take Photo (Camera)</span>
            </button>

            <button
              type="button"
              className="select-file-btn secondary-action"
              onClick={() => galleryInputRef.current?.click()}
            >
              <Sparkles size={17} />
              <span>Choose from Gallery</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Webcam Stream View */}
      {mode === 'camera' && (
        <div className="camera-view">
          {cameraError ? (
            <div className="camera-error-box">
              <AlertCircle size={28} className="camera-error-icon" />
              <p className="camera-error-title">Webcam Stream Unavailable</p>
              <p className="camera-error-sub">
                Mobile browsers require HTTPS or camera permission. Use the native photo picker instead.
              </p>
              <button
                type="button"
                className="select-file-btn primary-action"
                onClick={() => setMode('upload')}
              >
                <Upload size={16} />
                <span>Switch to Photo Picker</span>
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
                  console.warn('Webcam stream error:', err);
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
    </div>
  );
}

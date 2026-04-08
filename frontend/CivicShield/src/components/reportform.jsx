import React, { useState, useEffect } from "react";
import { createReport } from "../api";

export default function ReportForm() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("road_pothole");
  const [files, setFiles] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(e.target.files);
    
    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setGettingLocation(false);
      },
      () => {
        setError("Unable to retrieve location. Please check permissions.");
        setGettingLocation(false);
      }
    );
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("category", category);

    if (!location) {
      setError("Location is required. Please fetch your coordinates.");
      setSubmitting(false);
      setStep(2);
      return;
    }

    fd.append("latitude", location.latitude);
    fd.append("longitude", location.longitude);
    fd.append("address", "");

    if (files) {
      for (let i = 0; i < files.length; i++) {
        fd.append("images", files[i]);
      }
    }

    try {
      const res = await createReport(fd);
      if (res.message || res.report) {
        window.showToast("✅ Report submitted successfully!", "success");
        setSuccess(true);
        setTitle("");
        setDescription("");
        setFiles(null);
        setPreviews([]);
        setLocation(null);
        setStep(1);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        window.showToast(res.error || "Failed to submit report", "error");
        setError(res.error || "Failed to submit report");
      }
    } catch (err) {
      window.showToast(err.message, "error");
      setError(err.message);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="card success-wizard text-center">
        <div className="success-icon-large">✅</div>
        <h2>Report Submitted!</h2>
        <p>Thank you for contributing to your community. Your report has been logged and authorities have been notified.</p>
        <button onClick={() => setSuccess(false)} className="btn-primary mt-4">Submit Another Report</button>
      </div>
    );
  }

  return (
    <div className="wizard-container card">
      <div className="wizard-progress">
        {[1, 2, 3].map(i => (
          <div key={i} className={`progress-step ${step >= i ? 'active' : ''}`}>
            <span className="step-num">{i}</span>
            <span className="step-label">{i === 1 ? 'Details' : i === 2 ? 'Location' : 'Media'}</span>
          </div>
        ))}
        <div className="progress-bar-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
      </div>

      <form onSubmit={handleSubmit} className="wizard-content">
        {error && <div className="auth-alert alert-error mb-4">{error}</div>}

        {step === 1 && (
          <div className="step-fade">
            <h3 className="wizard-title">Tell us what's happening</h3>
            <p className="wizard-desc">Provide clear details to help authorities understand the issue.</p>
            
            <div className="form-group">
              <label>Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Large pothole near Main St."
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                <option value="road_pothole">Road Pothole</option>
                <option value="street_light">Street Light Issue</option>
                <option value="garbage">Garbage Collection</option>
                <option value="drainage">Drainage Blocking</option>
                <option value="women_safety">Women Safety Concern</option>
              </select>
            </div>

            <div className="form-group">
              <label>Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation in detail..."
                className="form-input"
                rows={4}
                required
              />
            </div>
            
            <div className="wizard-actions">
              <button type="button" onClick={nextStep} className="btn-primary full-width">Continue to Location</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-fade text-center">
            <h3 className="wizard-title">Pinpoint the Location</h3>
            <p className="wizard-desc">We need exact coordinates to dispatch the right team.</p>
            
            <div className="location-box card">
              <div className="loc-icon-large">📍</div>
              {location ? (
                <div className="loc-display">
                  <div className="loc-coord">
                    <span>Latitude: <strong>{location.latitude.toFixed(6)}</strong></span>
                    <span>Longitude: <strong>{location.longitude.toFixed(6)}</strong></span>
                  </div>
                  <button type="button" onClick={handleGetLocation} className="btn-secondary-sm mt-2">Update Location</button>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={handleGetLocation} 
                  disabled={gettingLocation}
                  className="btn-primary"
                >
                  {gettingLocation ? '🛰️ Accessing GPS...' : 'Get My Current Location'}
                </button>
              )}
            </div>

            <div className="wizard-actions dual">
              <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
              <button type="button" onClick={nextStep} disabled={!location} className="btn-primary">Continue to Media</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-fade">
            <h3 className="wizard-title">Visual Proof</h3>
            <p className="wizard-desc">Attach photos to help authorities assess the scale of the issue.</p>
            
            <div className="upload-container">
              <label className="upload-dropzone">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  hidden
                />
                <div className="upload-prompt">
                  <span>📸</span>
                  <p>Click to upload or drag photos</p>
                </div>
              </label>

              {previews.length > 0 && (
                <div className="upload-previews">
                  {previews.map((url, i) => (
                    <img key={i} src={url} alt="preview" className="upload-thumb" />
                  ))}
                </div>
              )}
            </div>

            <div className="wizard-actions dual">
              <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-primary btn-submit-glow"
              >
                {submitting ? '🚀 Submitting...' : '🚀 Submit Report'}
              </button>
            </div>
          </div>
        )}
      </form>

      <style>{`
        .wizard-container { max-width: 600px; margin: 2rem auto; padding: 2.5rem; position: relative; overflow: hidden; }
        .wizard-progress { display: flex; justify-content: space-between; margin-bottom: 3rem; position: relative; }
        .wizard-progress::before { content: ""; position: absolute; top: 15px; left: 0; width: 100%; height: 4px; background: #f1f5f9; z-index: 0; }
        .progress-bar-fill { position: absolute; top: 15px; left: 0; height: 4px; background: linear-gradient(to right, #4f46e5, #9333ea); transition: width 0.4s ease; z-index: 1; }
        
        .progress-step { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .step-num { width: 34px; height: 34px; border-radius: 50%; background: #f8fafc; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #94a3b8; transition: all 0.3s; }
        .progress-step.active .step-num { background: #4f46e5; border-color: #4f46e5; color: white; box-shadow: 0 0 10px rgba(79, 70, 229, 0.3); }
        .step-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .progress-step.active .step-label { color: #4f46e5; }

        .wizard-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; }
        .wizard-desc { font-size: 0.95rem; color: #64748b; margin-bottom: 2rem; }
        
        .location-box { padding: 2rem; background: #f8fafc; border: 2px dashed #e2e8f0; margin-bottom: 2rem; }
        .loc-icon-large { font-size: 3rem; margin-bottom: 1rem; }
        .loc-coord { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: #475569; margin-bottom: 1rem; }
        
        .upload-dropzone { display: block; padding: 2.5rem; border: 2px dashed #4f46e5; border-radius: 12px; background: #eef2ff; cursor: pointer; transition: all 0.2s; text-align: center; }
        .upload-dropzone:hover { background: #e0e7ff; }
        .upload-prompt span { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
        .upload-prompt p { font-weight: 700; color: #4f46e5; }
        
        .upload-previews { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .upload-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        
        .wizard-actions { margin-top: 2rem; }
        .wizard-actions.dual { display: flex; gap: 1rem; }
        .wizard-actions.dual button { flex: 1; }
        .full-width { width: 100%; }
        
        .step-fade { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .success-wizard { padding: 4rem 2rem; }
        .success-icon-large { font-size: 4rem; margin-bottom: 1.5rem; }
        .btn-submit-glow { animation: pulse-border 2s infinite; }
        @keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); } 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); } }
      `}</style>
    </div>
  );
}

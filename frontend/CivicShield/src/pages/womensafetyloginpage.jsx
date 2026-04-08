import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";

export default function WomenSafetyLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(formData.email, formData.password, "women_safety");
      if (result.error) {
        window.showToast(result.error, "error");
        setError(result.error);
      } else {
        window.showToast("✅ Safety Authority verified. Ready for dispatch.", "success");
        navigate("/women-safety-dashboard");
      }
    } catch (err) {
      window.showToast("An error occurred. Please try again.", "error");
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-visual safety-theme">
        <div className="visual-content">
          <div className="visual-badge">🛡️ SAFETY AUTHORITY</div>
          <h1 className="hero-text">Rapid Response</h1>
          <p className="hero-desc">Dedicated portal for Women Safety officials. Monitor alerts, coordinate rescues, and ensure citizen protection.</p>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <span>Fast Issue Resolution</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <span>Enhanced Safety Alerts</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <span>Real-time Dashboards</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-desc">Enter your credentials to access your dashboard</p>
          </div>

          {error && <div className="auth-alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Authority Email</label>
              <input
                type="email"
                name="email"
                placeholder="officer@safety.gov"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Safety Login"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Go back to <Link to="/citizen-login" className="auth-link">Citizen Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

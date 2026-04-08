import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";

export default function AdminLoginPage() {
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
      const result = await loginUser(formData.email, formData.password, "admin");
      if (result.error) {
        window.showToast(result.error, "error");
        setError(result.error);
      } else {
        window.showToast("✅ Admin access granted. Welcome back.", "success");
        navigate("/admin-dashboard");
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
      <div className="login-visual admin-theme">
        <div className="visual-content">
          <div className="visual-badge">🛠️ ADMIN PORTAL</div>
          <h1 className="hero-text">Central Command</h1>
          <p className="hero-desc">Monitor incidents, manage authorities, and ensure civic excellence with the CivicShield Admin Console.</p>
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
              <label>Admin Email</label>
              <input
                type="email"
                name="email"
                placeholder="admin@civicshield.gov"
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
              {loading ? "Verifying..." : "Access Console"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Not an Admin? <Link to="/citizen-login" className="auth-link">Citizen Access</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

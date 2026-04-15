import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword } from "../api";

export default function CitizenLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("login"); // 'login', 'register', 'otp'
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
  });

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Reset OTP field when entering OTP step
  useEffect(() => {
    if (step === "otp" || step === "reset") {
      setFormData((prev) => ({ ...prev, otp: "" }));
    }
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await registerUser(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.otpSent) {
        setMsg("Registration successful! OTP sent to your email.");
        setStep("otp");
        setResendTimer(30);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(formData.email, formData.password);
      if (res.error) {
        setError(res.error);
      } else if (res.token) {
        window.showToast("✅ Welcome back to CivicShield!", "success");
        navigate("/dashboard");
      } else if (res.otpSent) {
        setMsg("OTP sent to your email.");
        setStep("otp");
        setResendTimer(30);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await forgotPassword(formData.email);
      if (res.error) {
        setError(res.error);
      } else {
        setMsg("Password reset code sent to your email.");
        setStep("reset");
        setFormData((prev) => ({ ...prev, otp: "", password: "" }));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await resetPassword(formData.email, formData.otp, formData.password);
      if (res.error) {
        setError(res.error);
      } else if (res.token) {
        window.showToast("✅ Password reset successfully! Welcome back.", "success");
        navigate("/dashboard");
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(formData.email, formData.otp);
      if (res.error) {
        const errorMessage = res.error || "Invalid OTP. Please try again.";
        window.showToast(errorMessage, "error");
        setError(errorMessage);
      } else {
        window.showToast("✅ Verification successful! Welcome to CivicShield.", "success");
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Invalid OTP. Please try again.";
      window.showToast(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await resendOtp(formData.email);
      window.showToast("✅ A new OTP has been sent to your email.", "success");
      setResendTimer(30);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to resend OTP.";
      window.showToast(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (step === "login") {
      return (
        <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <div className="auth-footer">
            <p><span onClick={() => setStep("forgot")} className="auth-link">Forgot password?</span></p>
            <p>Don't have an account? <span onClick={() => setStep("register")} className="auth-link">Sign up</span></p>
          </div>
        </form>
      );
    }

    if (step === "forgot") {
      return (
        <form onSubmit={handleForgotPassword} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset code"}
          </button>
          <div className="auth-footer">
            <p>Remembered your password? <span onClick={() => setStep("login")} className="auth-link">Back to login</span></p>
          </div>
        </form>
      );
    }

    if (step === "reset") {
      return (
        <form onSubmit={handleResetPassword} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input"
              required 
              value={formData.email}
              onChange={handleChange} 
              placeholder="name@example.com"
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Reset Code</label>
            <input
              type="text"
              name="otp"
              className="form-input otp-large-input"
              required
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              placeholder="000000"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
          <div className="auth-footer">
            <p>Back to <span onClick={() => setStep("login")} className="auth-link">Login</span></p>
          </div>
        </form>
      );
    }

    if (step === "register") {
      return (
        <form onSubmit={handleRegister} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="john@example.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              name="phone" 
              className="form-input"
              required 
              onChange={handleChange} 
              placeholder="123-456-7890"
              autoComplete="tel"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Processing..." : "Create Account"}
          </button>
          <div className="auth-footer">
            <p>Already have an account? <span onClick={() => setStep("login")} className="auth-link">Login</span></p>
          </div>
        </form>
      );
    }

    if (step === "otp") {
      return (
        <form onSubmit={handleVerifyOtp} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input"
              required 
              value={formData.email}
              onChange={handleChange} 
              placeholder="name@example.com" 
              readOnly
            />
          </div>
          <div className="form-group">
            <label>6-Digit Verification Code</label>
            <input
              type="text"
              name="otp"
              className="form-input otp-large-input"
              required
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              placeholder="0 0 0 0 0 0"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
          <div className="auth-footer">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className={`resend-btn ${resendTimer > 0 ? "disabled" : ""}`}
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-visual citizen-theme">
        <div className="visual-content">
          <div className="visual-badge">🚀 CITIZEN PORTAL</div>
          <h1 className="hero-text">Protecting Our Community Together</h1>
          <p className="hero-desc">
            Join CivicShield to report local issues, stay updated, and make your neighborhood safer.
          </p>
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
            <h2 className="auth-title">
              {step === "login" ? "Welcome Back" : step === "register" ? "Create Account" : "Verify OTP"}
            </h2>
            <p className="auth-desc">
              {step === "login" ? "Enter your credentials to access your dashboard" : 
               step === "register" ? "Fill in the details to join CivicShield" : 
               "We've sent a code to your email address"}
            </p>
          </div>

          {error && <div className="auth-alert alert-error">{error}</div>}
          {msg && <div className="auth-alert alert-success">{msg}</div>}

          {renderForm()}
        </div>
      </div>

      <style>{`
        .otp-large-input {
          text-align: center;
          font-size: 1.5rem !important;
          letter-spacing: 0.5rem;
          font-weight: 700;
        }
        .resend-btn {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.5rem;
        }
        .resend-btn.disabled { color: #94a3b8; cursor: not-allowed; }
        .auth-footer { margin-top: 1.5rem; text-align: center; color: #64748b; font-size: 0.9rem; }
        .auth-link { color: #6366f1; font-weight: 700; cursor: pointer; text-decoration: underline; margin-left: 0.25rem; }
        .alert-error { background: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; font-size: 0.85rem; border: 1px solid #fee2e2; }
        .alert-success { background: #f0fdf4; color: #166534; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; font-size: 0.85rem; border: 1px solid #dcfce7; }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAssignedReports, authorityUpdateReport, logoutUser, getStoredUser } from "../api";

export default function WomenSafetyDashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== "women_safety") {
      navigate("/women-safety-login");
      return;
    }
    setUser(currentUser);
    loadAssignedReports();
  }, [navigate]);

  const loadAssignedReports = async () => {
    setLoading(true);
    const result = await fetchAssignedReports();
    if (result.success) {
      setReports(result.reports);
    } else {
      setError(result.error || "Failed to load assigned reports");
    }
    setLoading(false);
  };

  const handleUpdate = async (reportId, status, remarks) => {
    try {
      const result = await authorityUpdateReport(reportId, status, remarks);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Case status updated successfully");
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status, authorityRemarks: remarks } : r))
        );
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to update case");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/women-safety-login");
  };

  if (!user) return null;

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.status === 'received' || r.status === 'submitted').length,
    active: reports.filter(r => r.status === 'investigation_started').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div className="dashboard-title-area">
          <h1 className="page-title safety-title">Women Safety Portal</h1>
          <p className="page-subtitle">Security Command Center — Priority Response Management.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={loadAssignedReports} className="btn-secondary-sm">Refresh Alerts</button>
          <button onClick={handleLogout} className="btn-error-sm">Sign Out</button>
        </div>
      </div>

      <div className="stats-grid safety-stats">
        <div className="card stat-card bg-pink">
          <span className="stat-label">Total Cases</span>
          <span className="stat-value">{stats.total}</span>
          <div className="stat-icon">📑</div>
        </div>
        <div className="card stat-card bg-red">
          <span className="stat-label">Critical Alerts</span>
          <span className="stat-value">{stats.critical}</span>
          <div className="stat-icon">🚨</div>
        </div>
        <div className="card stat-card bg-indigo">
          <span className="stat-label">Under Investigation</span>
          <span className="stat-value">{stats.active}</span>
          <div className="stat-icon">🔍</div>
        </div>
        <div className="card stat-card bg-emerald">
          <span className="stat-label">Cases Resolved</span>
          <span className="stat-value">{stats.resolved}</span>
          <div className="stat-icon">🛡️</div>
        </div>
      </div>

      {error && <div className="auth-alert alert-error">{error}</div>}
      {success && <div className="auth-alert alert-success">{success}</div>}

      <div className="reports-section">
        <div className="section-header">
          <h2 className="section-title">Safety Reports Hub</h2>
          <div className="live-badge"><span className="pulse"></span> LIVE MONITORING</div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing with emergency database...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-dashboard card">
            <div className="empty-icon">🛡️</div>
            <h2>No Pending Alerts</h2>
            <p>The safety queue is currently empty. Great job, officer!</p>
          </div>
        ) : (
          <div className="authority-grid">
            {reports.map((report) => (
              <AuthorityReportCard 
                key={report._id} 
                report={report} 
                onUpdate={handleUpdate} 
                possibleStatuses={['received', 'investigation_started', 'resolved']}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .safety-title { color: #db2777; }
        .safety-stats { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .bg-red { border-left: 4px solid #ef4444; }
        .stat-card.bg-red .stat-value { color: #dc2626; }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .live-badge { font-size: 0.7rem; font-weight: 800; color: #dc2626; background: #fee2e2; padding: 0.3rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem; border: 1px solid #fecaca; }
        .pulse { width: 6px; height: 6px; background: #dc2626; border-radius: 50%; display: inline-block; animation: pulse-red 1.5s infinite; }
        
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }
        
        .authority-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
        .btn-error-sm { padding: 0.5rem 1rem; border-radius: 8px; background: #fee2e2; color: #991b1b; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; }
      `}</style>
    </div>
  );
}

function AuthorityReportCard({ report, onUpdate, possibleStatuses }) {
  const [status, setStatus] = useState(report.status);
  const [remarks, setRemarks] = useState(report.authorityRemarks || "");

  const getStatusLabel = (s) => {
    if (s === 'received') return { text: 'Alert Received', class: 'pending' };
    if (s === 'investigation_started') return { text: 'In Investigation', class: 'inprogress' };
    if (s === 'resolved') return { text: 'Case Closed', class: 'resolved' };
    return { text: s, class: '' };
  };

  const statusInfo = getStatusLabel(report.status);

  return (
    <div className={`card auth-report-card ${report.status === 'received' ? 'urgent-border' : ''}`}>
      <div className="auth-card-header">
        <div className="auth-card-info">
          <h3 className="auth-report-title">{report.title}</h3>
          <span className="auth-category alert-cat">🛑 PRIORITY CALL</span>
        </div>
        <span className={`status ${statusInfo.class} status-glow`}>
          {statusInfo.text}
        </span>
      </div>
      
      <div className="auth-card-body">
        <div className="emergency-loc">📍 Location: {report.location.address || "Coordinates Noted"}</div>
        <p className="auth-desc">{report.description}</p>
        {report.images && report.images.length > 0 && (
          <div className="auth-gallery">
            {report.images.map((img, i) => (
              <img key={i} src={`http://localhost:5000${img}`} alt="proof" className="auth-thumb" />
            ))}
          </div>
        )}
      </div>

      <div className="auth-card-footer">
        <div className="update-form">
          <div className="auth-input-grid">
            <div className="auth-input-group">
              <label>Update Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="auth-select safety-select">
                {possibleStatuses.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="auth-input-group">
              <label>Case Notes / Narrative</label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Briefly state investigative progress..."
                className="auth-textarea safety-textarea"
              />
            </div>
          </div>
          <button 
            onClick={() => onUpdate(report._id, status, remarks)}
            className={`auth-update-btn ${report.status === 'resolved' ? 'btn-secondary' : 'btn-primary'} safety-btn`}
          >
            Log Authority Action
          </button>
        </div>
      </div>

      <style>{`
        .dashboard-container { animation: fadeIn 0.5s ease; padding: 2rem 0; }
        .dashboard-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .page-title.safety-title { font-size: 32px; font-weight: 700; color: #dc2626; }
        .page-subtitle { color: var(--text-muted); font-size: 16px; margin-top: 0.5rem; }
        
        .dashboard-actions { display: flex; align-items: center; gap: 1rem; }
        .btn-secondary-sm, .btn-error-sm { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: var(--transition); }
        .btn-secondary-sm { background: white; color: var(--text-heading); border: 1px solid var(--border-color); }
        .btn-error-sm { background: #fee2e2; color: #dc2626; }
        
        .safety-stats { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; box-shadow: var(--shadow-stats); position: relative; border: 1px solid rgba(0,0,0,0.02); }
        .stat-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--text-heading); display: block; margin-top: 8px; }
        .stat-icon { position: absolute; right: 16px; bottom: 16px; font-size: 28px; opacity: 0.15; }

        .bg-pink { border-top: 4px solid #ec4899; }
        .bg-red { border-top: 4px solid #ef4444; }
        .bg-indigo { border-top: 4px solid #5b5fef; }
        .bg-emerald { border-top: 4px solid #10b981; }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-title { font-size: 20px; font-weight: 700; color: var(--text-heading); }
        .live-badge { font-size: 11px; font-weight: 800; color: #dc2626; background: #fee2e2; padding: 6px 14px; border-radius: var(--radius-pill); display: flex; align-items: center; gap: 8px; border: 1px solid #fecaca; }
        .pulse { width: 8px; height: 8px; background: #dc2626; border-radius: 50%; display: inline-block; animation: pulse-red 2s infinite; }
        
        @keyframes pulse-red { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        
        .authority-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
        .auth-report-card { background: white; padding: 24px; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); transition: var(--transition); border-left: 0px solid transparent; }
        .auth-report-card.urgent-border { border-left: 6px solid #ef4444; background: #fffafb; }
        .auth-report-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        
        .auth-report-title { font-size: 18px; font-weight: 700; color: var(--text-heading); }
        .alert-cat { font-size: 11px; font-weight: 700; color: #dc2626; background: #fee2e2; padding: 4px 10px; border-radius: 6px; }
        .emergency-loc { font-size: 13px; font-weight: 700; color: #991b1b; margin-top: 12px; }
        .auth-desc { font-size: 15px; color: var(--text-body); margin: 16px 0; line-height: 1.6; }
        .auth-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color); }

        .update-form { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
        .auth-input-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 8px; }
        .safety-select { height: 44px; width: 100%; border-radius: 8px; border: 1px solid var(--border-color); padding: 0 12px; font-weight: 700; }
        .safety-textarea { width: 100%; border-radius: 8px; border: 1px solid var(--border-color); padding: 12px; font-size: 14px; min-height: 100px; }
        .safety-btn { height: 48px; border-radius: 10px; font-weight: 700; background: var(--primary-gradient); color: white; border: none; cursor: pointer; }
        
        .status { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status.pending { background: #fee2e2; color: #dc2626; box-shadow: 0 0 12px rgba(220, 38, 38, 0.15); }
        .status.inprogress { background: #dbeafe; color: #1e40af; }
        .status.resolved { background: #dcfce7; color: #166534; }
      `}</style>
    </div>
  );
}

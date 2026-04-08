import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAssignedReports, authorityUpdateReport, logoutUser, getStoredUser } from "../api";

export default function MunicipalDashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== "municipal") {
      navigate("/municipal-login");
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
        setSuccess("Report updated successfully");
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status, authorityRemarks: remarks } : r))
        );
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to update report");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/municipal-login");
  };

  if (!user) return null;

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    progress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div className="dashboard-title-area">
          <h1 className="page-title">Municipal Workdesk</h1>
          <p className="page-subtitle">Departmental portal for resolving community civic issues.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={loadAssignedReports} className="btn-secondary-sm">Refresh List</button>
          <button onClick={handleLogout} className="btn-error-sm">Sign Out</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card bg-indigo">
          <span className="stat-label">Assigned</span>
          <span className="stat-value">{stats.total}</span>
          <div className="stat-icon">📥</div>
        </div>
        <div className="card stat-card bg-amber">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{stats.pending}</span>
          <div className="stat-icon">⏳</div>
        </div>
        <div className="card stat-card bg-blue">
          <span className="stat-label">Active</span>
          <span className="stat-value">{stats.progress}</span>
          <div className="stat-icon">⚙️</div>
        </div>
        <div className="card stat-card bg-emerald">
          <span className="stat-label">Closed</span>
          <span className="stat-value">{stats.resolved}</span>
          <div className="stat-icon">🏁</div>
        </div>
      </div>

      {error && <div className="auth-alert alert-error">{error}</div>}
      {success && <div className="auth-alert alert-success">{success}</div>}

      <div className="card filter-card">
        <div className="filter-grid">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search reports by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="reports-section">
        <h2 className="section-title">Current Service Requests</h2>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Scanning tasks...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-dashboard card">
            <div className="empty-icon">📂</div>
            <h2>Clear Desk</h2>
            <p>No issues match your current filters.</p>
          </div>
        ) : (
          <div className="authority-grid">
            {filteredReports.map((report) => (
              <AuthorityReportCard 
                key={report._id} 
                report={report} 
                onUpdate={handleUpdate} 
                possibleStatuses={['pending', 'in_progress', 'resolved']}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-container { animation: fadeIn 0.5s ease; padding: 2rem 0; }
        .dashboard-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .page-title { font-size: 32px; font-weight: 700; color: var(--text-heading); }
        .page-subtitle { color: var(--text-muted); font-size: 16px; margin-top: 0.5rem; }
        
        .dashboard-actions { display: flex; align-items: center; gap: 1rem; }
        .btn-secondary-sm, .btn-error-sm { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: var(--transition); }
        .btn-secondary-sm { background: white; color: var(--text-heading); border: 1px solid var(--border-color); }
        .btn-error-sm { background: #fee2e2; color: #dc2626; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; box-shadow: var(--shadow-stats); position: relative; border: 1px solid rgba(0,0,0,0.02); }
        .stat-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--text-heading); display: block; margin-top: 8px; }
        .stat-icon { position: absolute; right: 16px; bottom: 16px; font-size: 28px; opacity: 0.15; }

        .bg-indigo { border-top: 4px solid #5b5fef; }
        .bg-amber { border-top: 4px solid #f59e0b; }
        .bg-blue { border-top: 4px solid #3b82f6; }
        .bg-emerald { border-top: 4px solid #10b981; }

        .filter-card { padding: 20px; border-radius: 16px; margin-bottom: 1.5rem; background: white; box-shadow: var(--shadow-sm); }
        .filter-grid { display: grid; grid-template-columns: 1fr auto; gap: 1rem; }
        .search-box { position: relative; }
        .search-box input { height: 48px; width: 100%; padding: 0 1rem 0 2.75rem; border-radius: 10px; border: 1px solid var(--border-color); background: #f8fafc; font-size: 14px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 18px; }
        .filter-select { height: 48px; padding: 0 1rem; border-radius: 10px; border: 1px solid var(--border-color); background: white; font-weight: 600; }

        .authority-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
        .auth-report-card { background: white; padding: 24px; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); transition: var(--transition); }
        .auth-report-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        
        .auth-report-title { font-size: 18px; font-weight: 700; color: var(--text-heading); }
        .auth-category { font-size: 11px; font-weight: 700; color: #5b5fef; text-transform: uppercase; background: #f5f3ff; padding: 4px 10px; border-radius: 6px; }
        .auth-desc { font-size: 15px; color: var(--text-body); margin: 16px 0; line-height: 1.6; }
        .auth-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color); }

        .update-form { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
        .auth-input-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 8px; }
        .auth-select { height: 44px; width: 100%; border-radius: 8px; border: 1px solid var(--border-color); padding: 0 12px; font-weight: 600; }
        .auth-textarea { width: 100%; border-radius: 8px; border: 1px solid var(--border-color); padding: 12px; font-size: 14px; min-height: 100px; }
        .auth-update-btn { height: 48px; border-radius: 10px; font-weight: 700; background: var(--primary-gradient); color: white; border: none; cursor: pointer; }
        
        .status { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status.pending { background: #fef3c7; color: #92400e; }
        .status.inprogress { background: #dbeafe; color: #1e40af; }
        .status.resolved { background: #dcfce7; color: #166534; }
      `}</style>
    </div>
  );
}

function AuthorityReportCard({ report, onUpdate, possibleStatuses }) {
  const [status, setStatus] = useState(report.status);
  const [remarks, setRemarks] = useState(report.authorityRemarks || "");

  const getStatusClass = (s) => {
    if (s === 'resolved') return 'resolved';
    if (s === 'in_progress') return 'inprogress';
    return 'pending';
  };

  return (
    <div className="auth-report-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 className="auth-report-title">{report.title}</h3>
          <span className="auth-category">📁 {report.category?.replace("_", " ")}</span>
        </div>
        <span className={`status ${getStatusClass(report.status)}`}>
          {report.status?.replace("_", " ")}
        </span>
      </div>

      <p className="auth-desc">{report.description}</p>

      {report.images && report.images.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {report.images.map((img, i) => (
            <img key={i} src={`http://localhost:5000${img}`} alt="proof" className="auth-thumb" />
          ))}
        </div>
      )}

      <div className="update-form">
        <div className="auth-input-group">
          <label>Current Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="auth-select">
            {possibleStatuses.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
        <div className="auth-input-group">
          <label>Progress Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Detail actions taken..."
            className="auth-textarea"
          />
        </div>
        <button
          onClick={() => onUpdate(report._id, status, remarks)}
          className="auth-update-btn"
        >
          Update Documentation
        </button>
      </div>
    </div>
  );
}

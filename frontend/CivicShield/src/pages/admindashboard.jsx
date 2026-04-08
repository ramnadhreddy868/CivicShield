import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchReports, updateReportStatus, assignReport, logoutUser, getStoredUser } from "../api";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/admin-login");
      return;
    }
    setUser(currentUser);
    loadReports();
  }, [navigate]);

  const loadReports = async () => {
    setLoading(true);
    const result = await fetchReports();
    if (result.success) {
      setReports(result.reports);
    } else {
      setError(result.error || "Failed to load reports");
    }
    setLoading(false);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const result = await updateReportStatus(reportId, newStatus);
      if (result.error) {
        setError(result.error);
      } else {
        setReports((prev) =>
          prev.map((report) =>
            report._id === reportId ? { ...report, status: newStatus } : report
          )
        );
      }
    } catch (err) {
      setError("Failed to update report status");
    }
  };

  const handleAssign = async (reportId, department) => {
    try {
      const result = await assignReport(reportId, department);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Report assigned to ${department.replace('_', ' ')}`);
        setReports((prev) =>
          prev.map((report) =>
            report._id === reportId ? { ...report, assignedDepartment: department } : report
          )
        );
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to assign report");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/admin-login");
  };

  const filteredReports = reports.filter(
    (report) => selectedStatus === "all" || report.status === selectedStatus
  );

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'submitted' || r.status === 'pending').length,
    municipal: reports.filter(r => r.assignedDepartment === 'municipal').length,
    safety: reports.filter(r => r.assignedDepartment === 'women_safety').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div className="dashboard-title-area">
          <h1 className="page-title">Admin Command Center</h1>
          <p className="page-subtitle">Global oversight of all citizen reports and department assignments.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={loadReports} className="btn-secondary-sm">Refresh</button>
          <button onClick={handleLogout} className="btn-error-sm">Sign Out</button>
        </div>
      </div>

      <div className="stats-grid admin-stats">
        <div className="card stat-card bg-indigo">
          <span className="stat-label">Total Reports</span>
          <span className="stat-value">{stats.total}</span>
          <div className="stat-icon">📈</div>
        </div>
        <div className="card stat-card bg-amber">
          <span className="stat-label">Awaiting Action</span>
          <span className="stat-value">{stats.pending}</span>
          <div className="stat-icon">🕒</div>
        </div>
        <div className="card stat-card bg-blue">
          <span className="stat-label">Municipal Tasks</span>
          <span className="stat-value">{stats.municipal}</span>
          <div className="stat-icon">🏛️</div>
        </div>
        <div className="card stat-card bg-pink">
          <span className="stat-label">Safety Alerts</span>
          <span className="stat-value">{stats.safety}</span>
          <div className="stat-icon">🛡️</div>
        </div>
        <div className="card stat-card bg-emerald">
          <span className="stat-label">Resolved</span>
          <span className="stat-value">{stats.resolved}</span>
          <div className="stat-icon">🏆</div>
        </div>
      </div>

      <div className="card filter-card">
        <div className="filter-grid admin-filter">
          <div className="filter-label">Filter by Status:</div>
          <div className="filter-tabs">
            {['all', 'submitted', 'in_progress', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`filter-tab ${selectedStatus === status ? 'active' : ''}`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="auth-alert alert-error">{error}</div>}
      {success && <div className="auth-alert alert-success">{success}</div>}

      <div className="reports-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing data...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-dashboard card">
            <h2>No reports found</h2>
            <p>There are no reports matching the selected status.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report._id} className="card report-card-premium">
              <div className="report-card-header">
                <div className="report-main-info">
                  <h3 className="report-title">{report.title}</h3>
                  <div className="report-meta">
                    <span className="meta-item">📍 {report.location.address || "Coordinates"}</span>
                    <span className="meta-item">📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="report-status-badge">
                  <span className={`status ${report.status === 'in_progress' ? 'inprogress' : report.status === 'resolved' ? 'resolved' : 'pending'}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="report-content-body">
                <p className="report-desc">{report.description}</p>
                {report.images && report.images.length > 0 && (
                  <div className="report-gallery">
                    {report.images.map((img, idx) => (
                      <img key={idx} src={`http://localhost:5000${img}`} alt="Report" className="gallery-thumb" />
                    ))}
                  </div>
                )}
              </div>

              <div className="report-card-footer">
                <div className="assignment-status">
                  <span className="label">Assignment:</span>
                  <span className={`dept-badge ${report.assignedDepartment || 'none'}`}>
                    {report.assignedDepartment ? report.assignedDepartment.replace('_', ' ') : 'Unassigned'}
                  </span>
                </div>
                
                <div className="card-actions">
                  <div className="action-row">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report._id, e.target.value)}
                      className="status-select-sm"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="pending">Pending</option>
                    </select>
                    <div className="assign-btn-group">
                      <button 
                        onClick={() => handleAssign(report._id, 'municipal')}
                        className={`btn-assign ${report.assignedDepartment === 'municipal' ? 'active' : ''}`}
                        title="Assign to Municipal"
                      >🏛️ Municipal</button>
                      <button 
                        onClick={() => handleAssign(report._id, 'women_safety')}
                        className={`btn-assign safety ${report.assignedDepartment === 'women_safety' ? 'active' : ''}`}
                        title="Assign to Women Safety"
                      >🛡️ Safety</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .dashboard-container { animation: fadeIn 0.5s ease; padding: 2rem 0; }
        .dashboard-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .page-title { font-size: 32px; font-weight: 700; color: var(--text-heading); margin-bottom: 0.5rem; }
        .page-subtitle { color: var(--text-muted); font-size: 16px; }
        
        .dashboard-actions { display: flex; align-items: center; gap: 1rem; }
        .btn-secondary-sm, .btn-error-sm { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: var(--transition); }
        .btn-secondary-sm { background: white; color: var(--text-heading); border: 1px solid var(--border-color); }
        .btn-error-sm { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
        
        .admin-stats { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; box-shadow: var(--shadow-stats); display: flex; flex-direction: column; position: relative; border: 1px solid rgba(0,0,0,0.02); }
        .stat-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--text-heading); }
        .stat-icon { position: absolute; right: 16px; bottom: 16px; font-size: 28px; opacity: 0.15; }

        .bg-indigo { border-top: 4px solid #5b5fef; }
        .bg-amber { border-top: 4px solid #f59e0b; }
        .bg-blue { border-top: 4px solid #3b82f6; }
        .bg-pink { border-top: 4px solid #ec4899; }
        .bg-emerald { border-top: 4px solid #10b981; }

        .filter-card { padding: 20px; border-radius: 16px; margin-bottom: 2.5rem; background: white; box-shadow: var(--shadow-sm); }
        .filter-tabs { display: flex; gap: 0.75rem; background: #f8fafc; padding: 6px; border-radius: 12px; width: fit-content; }
        .filter-tab { padding: 8px 20px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text-muted); transition: var(--transition); text-transform: capitalize; }
        .filter-tab.active { background: white; color: #5b5fef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

        .reports-grid { display: grid; gap: 1.5rem; }
        .report-card-premium { background: white; padding: 24px; border-radius: 20px; box-shadow: var(--shadow-md); border: 1px solid var(--border-color); transition: var(--transition); }
        .report-card-premium:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        
        .report-title { font-size: 20px; font-weight: 700; color: var(--text-heading); margin-bottom: 8px; }
        .report-meta { display: flex; gap: 12px; font-size: 13px; color: var(--text-muted); font-weight: 500; }
        
        .report-desc { color: var(--text-body); font-size: 15px; margin: 16px 0; line-height: 1.6; }
        .gallery-thumb { width: 120px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color); }
        
        .report-card-footer { border-top: 1px solid var(--border-color); padding-top: 1.5rem; margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .assignment-status { display: flex; align-items: center; gap: 12px; }
        .dept-badge { font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px; }
        .dept-badge.none { background: #f1f5f9; color: #64748b; }
        .dept-badge.municipal { background: #e0f2fe; color: #0284c7; }
        .dept-badge.women_safety { background: #fce7f3; color: #db2777; }

        .status { padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; }
        .status.pending { background: #fef3c7; color: #92400e; }
        .status.inprogress { background: #dbeafe; color: #1e40af; }
        .status.resolved { background: #dcfce7; color: #166534; }

        .status-select-sm { height: 40px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 600; font-size: 13px; }
        .assign-btn-group { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
        .btn-assign { padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; background: transparent; color: var(--text-muted); transition: var(--transition); }
        .btn-assign.active { background: white; color: #5b5fef; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        @media (max-width: 640px) {
          .report-card-header, .report-card-footer { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .action-row { width: 100%; flex-wrap: wrap; }
          .assign-btn-group { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
}

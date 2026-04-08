import React, { useState, useEffect, useRef } from "react";
import { fetchMyReports, getStoredUser, fetchNotifications } from "../api.js";

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);

  // Load current user
  useEffect(() => {
    const currentUser = getStoredUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportRes, notifRes] = await Promise.all([
        fetchMyReports(),
        fetchNotifications()
      ]);
      
      if (reportRes.success && Array.isArray(reportRes.reports)) {
        setReports(reportRes.reports);
        setLastUpdate(new Date());
      }
      
      if (Array.isArray(notifRes)) {
        setNotifications(notifRes);
      }
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, 15000); // 15s refresh for better performance
    } else {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [autoRefresh]);

  const filteredReports = reports
    .filter((r) => filterCategory === "all" || r.category === filterCategory)
    .filter((r) => {
      if (filterStatus === "all") return true;
      const statusLower = r.status?.toLowerCase() || "";
      return statusLower === filterStatus.toLowerCase();
    })
    .filter((r) => r.title?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "submitted") return <span className="status pending">Submitted</span>;
    if (s === "in_progress" || s === "investigation_started") return <span className="status inprogress">In Progress</span>;
    if (s === "resolved") return <span className="status resolved">Resolved</span>;
    return <span className="status">{status}</span>;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div className="dashboard-title-area">
          <h1 className="page-title">Citizen Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name || "Citizen"}! Track and manage your reported issues.</p>
        </div>
        <div className="dashboard-actions">
          <div className={`refresh-indicator ${autoRefresh ? 'active' : ''}`}>
            {autoRefresh ? "Auto-sync ON" : "Auto-sync OFF"}
          </div>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className="btn-secondary-sm">
            {autoRefresh ? "Pause" : "Resume"}
          </button>
          <button onClick={loadData} className="btn-primary-sm">Refresh Data</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card bg-indigo">
          <span className="stat-label">Total Reports</span>
          <span className="stat-value">{stats.total}</span>
          <div className="stat-icon">📊</div>
        </div>
        <div className="card stat-card bg-amber">
          <span className="stat-label">Submitted</span>
          <span className="stat-value">{stats.submitted}</span>
          <div className="stat-icon">📝</div>
        </div>
        <div className="card stat-card bg-blue">
          <span className="stat-label">In Progress</span>
          <span className="stat-value">{stats.inProgress}</span>
          <div className="stat-icon">⚙️</div>
        </div>
        <div className="card stat-card bg-emerald">
          <span className="stat-label">Resolved</span>
          <span className="stat-value">{stats.resolved}</span>
          <div className="stat-icon">✅</div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="notification-banner card">
          <div className="notif-header">
            <h3>🔔 Recent Updates</h3>
            <span className="notif-count">{notifications.length} new</span>
          </div>
          <div className="notif-list">
            {notifications.slice(0, 3).map((n, i) => (
              <div key={i} className="notif-item">
                <span className="notif-bullet"></span>
                <p className="notif-text">{n.message}</p>
                <span className="notif-time">{new Date(n.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="road_pothole">Road Pothole</option>
            <option value="street_light">Street Light</option>
            <option value="garbage">Garbage</option>
            <option value="drainage">Drainage</option>
            <option value="women_safety">Women Safety</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="reports-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching your reports...</p>
          </div>
        ) : stats.total === 0 ? (
          <div className="empty-dashboard card">
            <div className="empty-icon">📁</div>
            <h2>No reports yet</h2>
            <p>You haven't submitted any civic issues. Your reports will appear here once you file them.</p>
            <button className="btn-primary" onClick={() => (window.location.href = "/")}>File a Report</button>
          </div>
        ) : (
          <div className="card table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Issue Details</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Authority Notes</th>
                  <th>Updates</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="cell-title">{r.title || "Untitled Issue"}</div>
                      <div className="cell-sub">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {r.category === "road_pothole" ? "🚗 Pothole" :
                         r.category === "street_light" ? "💡 Lighting" :
                         r.category === "garbage" ? "🗑️ Garbage" :
                         r.category === "drainage" ? "💧 Drainage" :
                         r.category === "women_safety" ? "🛡️ Safety" : r.category}
                      </span>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td className="remarks-cell">
                      {r.authorityRemarks ? (
                        <p className="remarks-text">"{r.authorityRemarks}"</p>
                      ) : (
                        <span className="text-muted">{r.assignedDepartment ? "Processing..." : "Awaiting assignment"}</span>
                      )}
                    </td>
                    <td className="time-cell">
                      {r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-container { animation: fadeIn 0.5s ease; padding: 2rem 0; }
        .dashboard-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .page-title { font-size: 32px; font-weight: 700; color: var(--text-heading); margin-bottom: 0.5rem; }
        .page-subtitle { color: var(--text-muted); font-size: 16px; }
        
        .dashboard-actions { display: flex; align-items: center; gap: 1rem; }
        .refresh-indicator { font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-pill); background: #f1f5f9; color: var(--text-muted); border: 1px solid var(--border-color); }
        .refresh-indicator.active { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
        
        .btn-primary-sm, .btn-secondary-sm { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: var(--transition); }
        .btn-primary-sm { background: var(--primary-gradient); color: white; }
        .btn-secondary-sm { background: white; color: var(--text-heading); border: 1px solid var(--border-color); }
        .btn-primary-sm:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(91, 95, 239, 0.2); }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; box-shadow: var(--shadow-stats); display: flex; flex-direction: column; position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.02); }
        .stat-label { font-size: 14px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .stat-value { font-size: 32px; font-weight: 800; color: var(--text-heading); line-height: 1; }
        .stat-icon { position: absolute; right: 16px; bottom: 16px; font-size: 32px; opacity: 0.15; }
        
        .bg-indigo { border-top: 4px solid #5b5fef; }
        .bg-amber { border-top: 4px solid #f59e0b; }
        .bg-blue { border-top: 4px solid #3b82f6; }
        .bg-emerald { border-top: 4px solid #10b981; }

        .notification-banner { padding: 20px; border-radius: 16px; margin-bottom: 2.5rem; border: 1px solid #e0e7ff; background: #f5f8ff; }
        .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .notif-count { background: #5b5fef; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
        .notif-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(91, 95, 239, 0.1); }
        .notif-bullet { width: 6px; height: 6px; background: #5b5fef; border-radius: 50%; }
        
        .filter-card { padding: 20px; border-radius: 16px; margin-bottom: 1.5rem; background: white; box-shadow: var(--shadow-sm); }
        .filter-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 1rem; }
        .search-box input { height: 48px; width: 100%; padding: 0 1rem 0 2.75rem; border-radius: 10px; border: 1px solid var(--border-color); background: #f8fafc; font-size: 14px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 18px; }
        .filter-select { height: 48px; padding: 0 1rem; border-radius: 10px; border: 1px solid var(--border-color); background: white; font-weight: 500; }

        .table-container { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
        .styled-table { width: 100%; border-collapse: collapse; }
        .styled-table th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
        .styled-table td { padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
        
        .status { padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; }
        .status.pending { background: #fef3c7; color: #92400e; }
        .status.inprogress { background: #dbeafe; color: #1e40af; }
        .status.resolved { background: #dcfce7; color: #166534; }
        
        @media (max-width: 768px) {
          .dashboard-header-flex { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .filter-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="page-title-block">
        <h1>Dashboard</h1>
        <div className="breadcrumbs">
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>Dashboard</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon-container users">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Users</span>
            <span className="summary-card-value">6</span>
            <span className="summary-card-desc">registered users</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container students">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Students</span>
            <span className="summary-card-value">6</span>
            <span className="summary-card-desc">enrolled students</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container faculty">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Faculty</span>
            <span className="summary-card-value">4</span>
            <span className="summary-card-desc">faculty members</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container projects">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Projects</span>
            <span className="summary-card-value">5</span>
            <span className="summary-card-desc">active projects</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container tasks">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="9" y1="6" x2="20" y2="6"></line>
              <line x1="9" y1="12" x2="20" y2="12"></line>
              <line x1="9" y1="18" x2="20" y2="18"></line>
              <line x1="4" y1="6" x2="4.01" y2="6"></line>
              <line x1="4" y1="12" x2="4.01" y2="12"></line>
              <line x1="4" y1="18" x2="4.01" y2="18"></line>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Tasks</span>
            <span className="summary-card-value">8</span>
            <span className="summary-card-desc">total tasks</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">Project Status Distribution</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', flexDirection: 'column' }}>
            <svg width="150" height="150" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5"></circle>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--success)" strokeWidth="3.5" strokeDasharray="60 40" strokeDashoffset="0"></circle>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="-60"></circle>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--warning)" strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="-80"></circle>
            </svg>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }}></span> Completed (60%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span> In Progress (20%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span> Pending (20%)
              </span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">Task Priority Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '220px', justifyContent: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>High Priority</span>
                <span style={{ fontWeight: 600 }}>4 Tasks</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: 'var(--danger)', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>Medium Priority</span>
                <span style={{ fontWeight: 600 }}>3 Tasks</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '37.5%', height: '100%', backgroundColor: 'var(--warning)', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span>Low Priority</span>
                <span style={{ fontWeight: 600 }}>1 Task</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '12.5%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List Data Table
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Recent User Registrations</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aarav Mehta</td>
                <td>aarav@darshan.ac.in</td>
                <td>9988776655</td>
                <td><span style={{ fontWeight: 600 }}>Student</span></td>
                <td><span className="badge completed">Active</span></td>
              </tr>
              <tr>
                <td>Prof. Madhuresh Fichadiya</td>
                <td>madhuresh.fichadiya@darshan.ac.in</td>
                <td>9876543210</td>
                <td><span style={{ fontWeight: 600 }}>Faculty</span></td>
                <td><span className="badge completed">Active</span></td>
              </tr>
              <tr>
                <td>Priya Sharma</td>
                <td>priya@darshan.ac.in</td>
                <td>9122334455</td>
                <td><span style={{ fontWeight: 600 }}>Student</span></td>
                <td><span className="badge completed">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}
    </AdminLayout>
  );
};

export default AdminDashboard;

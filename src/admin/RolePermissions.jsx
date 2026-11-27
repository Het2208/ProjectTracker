import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import TableState from '../common/TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { roleService } from '../services/roleService';
import { dashboardService } from '../services/dashboardService';

/**
 * Role & permission overview. The backend has no per-action permission entity —
 * authorization is driven by the Role names (Admin/Faculty/Student) attached to
 * users via UserRole and enforced by [Authorize(Roles=...)] on the API. This page
 * therefore consumes Role list + the role statistics / users-by-role reports.
 */
const RolePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [roleStats, setRoleStats] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [expandedRole, setExpandedRole] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [rolesResponse, statsResponse, byRoleResponse] = await Promise.all([
        roleService.getAll(),
        dashboardService.getRoleStatistics(),
        dashboardService.getUsersByRole(),
      ]);
      if (!rolesResponse?.success || !Array.isArray(rolesResponse.data)) throw new Error(rolesResponse?.message || 'Unable to load roles.');
      setRoles(rolesResponse.data);
      if (statsResponse?.success && Array.isArray(statsResponse.data)) setRoleStats(statsResponse.data);
      if (byRoleResponse?.success && Array.isArray(byRoleResponse.data)) setUsersByRole(byRoleResponse.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load role information.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const statsFor = (roleName) => roleStats.find((s) => s.roleName === roleName);
  const usersFor = (roleName) => usersByRole.find((r) => r.roleName === roleName)?.users ?? [];

  // Effective API access derived from the backend's [Authorize(Roles=...)] attributes.
  const accessMatrix = [
    { area: 'Master data (Roles, User Types, Users)', admin: 'Full access', faculty: 'No access', student: 'No access' },
    { area: 'Project Master', admin: 'Full access', faculty: 'View only', student: 'View only' },
    { area: 'Project Allocations', admin: 'Full access', faculty: 'Full access', student: 'View only' },
    { area: 'Tasks', admin: 'Full access', faculty: 'Full access', student: 'View only' },
    { area: 'Task Status / Priority masters', admin: 'Full access', faculty: 'View only', student: 'View only' },
    { area: 'Dashboard & reports', admin: 'Full access', faculty: 'No access', student: 'No access' },
  ];

  return (
    <AdminLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Role Permissions</h1>
          <div className="breadcrumbs">
            <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>Role Permissions</span>
          </div>
        </div>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      <div className="data-table-container" style={{ marginBottom: '24px' }}>
        <div className="data-table-header">
          <span className="table-title">Roles Defined in Backend (SPM_Role)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Role Name</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Total Users</th>
                <th style={{ textAlign: 'center' }}>Active</th>
                <th style={{ textAlign: 'center' }}>Inactive</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={6} loading={isLoading} error={pageError} count={roles.length} emptyText="No roles defined." onRetry={loadData} />
              {!isLoading && !pageError && roles.map((role) => {
                const stats = statsFor(role.roleName);
                return (
                  <tr key={role.roleId}>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{role.roleId}</span></td>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{role.roleName}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{role.description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{stats?.totalUsers ?? 0}</td>
                    <td style={{ textAlign: 'center' }}><span className="badge completed">{stats?.activeUsers ?? 0}</span></td>
                    <td style={{ textAlign: 'center' }}><span className="badge pending">{stats?.inactiveUsers ?? 0}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="data-table-container" style={{ marginBottom: '24px' }}>
        <div className="data-table-header">
          <span className="table-title">Effective API Access by Role (from [Authorize] attributes)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Feature Area</th>
                <th>Admin</th>
                <th>Faculty</th>
                <th>Student</th>
              </tr>
            </thead>
            <tbody>
              {accessMatrix.map((row) => (
                <tr key={row.area}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.area}</td>
                  <td><span className="badge completed">{row.admin}</span></td>
                  <td><span className="badge progress">{row.faculty}</span></td>
                  <td><span className="badge pending">{row.student}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Users Assigned to Each Role</h3>
        {isLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading role assignments…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map((role) => {
              const users = usersFor(role.roleName);
              const isOpen = expandedRole === role.roleName;
              return (
                <div key={role.roleId} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setExpandedRole(isOpen ? null : role.roleName)}
                  >
                    <span style={{ fontWeight: 600 }}>{role.roleName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{users.length} user(s) {isOpen ? '▲' : '▼'}</span>
                  </div>
                  {isOpen && (
                    <ul style={{ margin: '10px 0 0', paddingLeft: '20px', color: 'var(--text-muted)' }}>
                      {users.length ? users.map((name, index) => <li key={index}>{name}</li>) : <li>No users assigned.</li>}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RolePermissions;

import React, { useEffect, useMemo, useState } from 'react';

import MainLayout from '../MainLayout.js/MainLayout';
import apiClient from '../lib/apiClient';
import { cusToast } from '../Components/Toast/CusToast';
import { confirmBox } from '../Components/ConfirmBox/ConfirmBox';
import './AdminDashboard.css';

const initialForm = {
  username: '',
  password: '',
  role: 'student',
  studentId: '',
  staffId: '',
  hrCommissionPercent: '',
};

const metricConfig = [
  { key: 'totalStudents', label: 'Total Students' },
  { key: 'totalStaff', label: 'Total Staff' },
  { key: 'totalRevenue', label: 'Total Revenue', money: true },
  { key: 'pendingFees', label: 'Pending Fees', money: true },
  { key: 'placementRate', label: 'Placement Rate', percent: true },
  { key: 'attendancePercentage', label: 'Attendance', percent: true },
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [activeRole, setActiveRole] = useState('student');
  const [query, setQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(initialForm);

  const loadDashboard = async () => {
    try {
      const res = await apiClient.get('/api/dashboard/admin');
      setDashboard(res.data?.data || null);
    } catch (error) {
      // If backend isn't restarted yet, this can 404. Keep UI usable.
      setDashboard(null);
      cusToast(error.response?.data?.message || 'Dashboard analytics unavailable', 'error');
    }
  };

  const loadUsers = async () => {
    const res = await apiClient.get('/api/user/admin/users');
    setUsers(res.data?.data || []);
  };

  const loadStudents = async () => {
    const [dropdownRes, regRes] = await Promise.all([
      apiClient.get('/api/user/students-dropdown'),
      apiClient.get('/api/stureg'),
    ]);

    const registeredIds = (Array.isArray(regRes.data) ? regRes.data : []).map((r) => r.student?._id);
    const dropdown = dropdownRes.data?.data || [];
    setStudents(dropdown.filter((s) => registeredIds.includes(s._id)));
  };

  const loadStaff = async () => {
    const res = await apiClient.get('/api/user/staff-dropdown');
    setStaff(res.data?.data || []);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDashboard(), loadUsers(), loadStudents(), loadStaff()]);
    } catch (error) {
      cusToast(error.response?.data?.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      if (u.role !== activeRole) return false;
      if (!q) return true;

      return (
        (u.username || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    });
  }, [users, activeRole, query]);

  const resetForm = () => {
    setForm(initialForm);
    setIsEditMode(false);
    setEditingUserId(null);
  };

  const openCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEdit = (user) => {
    setForm({
      username: user.username,
      password: '',
      role: user.role,
      studentId: user.studentId || '',
      staffId: user.staffId || '',
      hrCommissionPercent: '',
    });
    setEditingUserId(user._id);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const saveUser = async () => {
    if (!form.username || (!isEditMode && !form.password)) {
      cusToast('Username and password are required', 'error');
      return;
    }

    if (form.role === 'student' && !form.studentId) {
      cusToast('Select a student', 'error');
      return;
    }

    if ((form.role === 'staff' || form.role === 'hr') && !form.staffId) {
      cusToast('Select a staff member', 'error');
      return;
    }

    if (form.role === 'hr') {
      const percent = Number(form.hrCommissionPercent);
      if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        cusToast('Enter valid HR commission percentage (0-100)', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await apiClient.put(`/api/user/admin/user/${editingUserId}`, {
          username: form.username,
          password: form.password,
        });
        cusToast('User updated successfully');
      } else {
        const payload = { ...form };
        if (payload.role !== 'hr') {
          delete payload.hrCommissionPercent;
        }
        await apiClient.post('/api/user/create-user', payload);
        cusToast('User account created successfully');
      }

      setOpenDialog(false);
      resetForm();
      await loadUsers();
    } catch (error) {
      cusToast(error.response?.data?.message || 'Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    const confirm = await confirmBox(
      `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this account?`
    );

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await apiClient.patch(`/api/user/admin/toggle-user/${user._id}`);
      cusToast(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      await loadUsers();
    } catch (error) {
      cusToast(error.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (user) => {
    const confirm = await confirmBox(`Delete user "${user.username}"? This action cannot be undone.`);
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await apiClient.delete(`/api/user/admin/user/${user._id}`);
      cusToast('User deleted successfully');
      await loadUsers();
    } catch (error) {
      cusToast(error.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="ad-wrap">
        {loading ? (
          <div className="ad-progress">
            <div />
          </div>
        ) : null}

        <div className="ad-header">
          <div className="ad-title">
            <h1>Admin Control Center</h1>
            <p>
              Manage accounts, monitor KPIs, and keep operational visibility across students, staff,
              revenue, and performance.
            </p>
          </div>
        </div>

        <div className="ad-metrics">
          {metricConfig.map((metric) => {
            const value = dashboard?.cards?.[metric.key] ?? 0;
            const formatted = metric.money
              ? `Rs ${Number(value).toLocaleString()}`
              : metric.percent
                ? `${value}%`
                : value;

            return (
              <div className="ad-card" key={metric.key}>
                <div className="k">{metric.label}</div>
                <div className="v">{formatted}</div>
              </div>
            );
          })}
        </div>

        <div className="ad-panel">
          <div className="ad-panel-top">
            <div>
              <h2>User Management</h2>
              <p>Create and control student/staff access credentials.</p>
            </div>

            <div className="ad-actions">
              <input
                className="ad-input"
                placeholder="Search username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="ad-btn primary" onClick={openCreate}>
                Create User
              </button>
            </div>
          </div>

          <div className="ad-tabs" role="tablist" aria-label="User role tabs">
            <button
              className={`ad-tab ${activeRole === 'student' ? 'active' : ''}`}
              onClick={() => setActiveRole('student')}
              type="button"
            >
              Students
            </button>
            <button
              className={`ad-tab ${activeRole === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveRole('staff')}
              type="button"
            >
              Staff
            </button>
            <button
              className={`ad-tab ${activeRole === 'hr' ? 'active' : ''}`}
              onClick={() => setActiveRole('hr')}
              type="button"
            >
              HR
            </button>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="ad-empty">No users found for this filter.</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>
                      <span className="ad-pill">{u.role}</span>
                    </td>
                    <td>
                      <span className={`ad-pill ${u.isActive ? 'ok' : 'bad'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="ad-row-actions">
                        <button className="ad-mini" onClick={() => openEdit(u)} type="button">
                          Edit
                        </button>
                        <button className="ad-mini warn" onClick={() => toggleStatus(u)} type="button">
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="ad-mini danger" onClick={() => removeUser(u)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openDialog ? (
        <div className="ad-modal" role="dialog" aria-modal="true">
          <div className="ad-modal-card">
            <div className="ad-modal-head">
              <h3>{isEditMode ? 'Edit User Account' : 'Create User Account'}</h3>
              <button
                className="ad-mini"
                onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                }}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="ad-modal-body">
              <div className="ad-field">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value,
                      studentId: '',
                      staffId: '',
                    }))
                  }
                  disabled={isEditMode}
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="hr">HR</option>
                </select>
              </div>

              {form.role === 'student' ? (
                <div className="ad-field">
                  <label>Student</label>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                    disabled={isEditMode}
                  >
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.studentName} - {s.studentMobile}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="ad-field">
                  <label>Staff</label>
                  <select
                    value={form.staffId}
                    onChange={(e) => setForm((prev) => ({ ...prev, staffId: e.target.value }))}
                    disabled={isEditMode}
                  >
                    <option value="">Select staff</option>
                    {staff.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.staffName} - {s.staffMobile}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.role === 'hr' && (
                <div className="ad-field">
                  <label>HR Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.hrCommissionPercent}
                    onChange={(e) => setForm((prev) => ({ ...prev, hrCommissionPercent: e.target.value }))}
                    placeholder="e.g. 10"
                    disabled={isEditMode}
                  />
                </div>
              )}

              <div className="ad-field">
                <label>Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>

              <div className="ad-field">
                <label>{isEditMode ? 'New Password (optional)' : 'Password'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={isEditMode ? 'Enter new password (optional)' : 'Enter password'}
                />
              </div>
            </div>

            <div className="ad-modal-foot">
              <button
                className="ad-btn ghost"
                onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                }}
                type="button"
              >
                Cancel
              </button>
              <button className="ad-btn primary" onClick={saveUser} type="button" disabled={loading}>
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
};

export default AdminDashboard;



import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EnquiryTable.css';
const EnquiryTable = ({ enquiries, onEdit, onDelete, handleCopy, role, onRegister, onEarningsStatus }) => {
  const navigate = useNavigate();
 
  const handleRegisterClick = (item) => {
    if (role === 'hr') {
      if (onRegister) onRegister(item);
      return;
    }

    if (role === 'admin' && item.registerStatus === 'registered') {
      navigate('/student-management', {
        state: { enquiry: item, enquiryId: item._id },
      });
      return;
    }

    if (role === 'admin' && item.registerStatus === 'new') {
      if (onRegister) onRegister(item);
    }
  };

  const getToneFromText = (value) => {
    const text = String(value || '').toLowerCase();
    if (text.includes('overdue') || text.includes('urgent') || text.includes('danger')) {
      return 'tone-danger';
    }
    if (text.includes('upcoming') || text.includes('pending') || text.includes('warning')) {
      return 'tone-warning';
    }
    return 'tone-normal';
  };

  const getPriorityTone = (priorityInfo) => {
    if (!priorityInfo?.label) return 'tone-normal';
    const label = String(priorityInfo.label).toLowerCase();
    if (label === 'registered') return 'tone-registered';
    if (label === 'overdue' || label === 'urgent') return 'tone-danger';
    if (label === 'upcoming') return 'tone-warning';
    return 'tone-normal';
  };

  const getRegisterButtonClass = (item) => {
    if (item.registerStatus === 'student_added') return 'success';
    if (item.registerStatus === 'registered') return 'primary';
    if (item.registerStatus === 'new') {
      return role === 'admin' ? 'warning' : 'primary';
    }
    return 'primary';
  };

  const getStatusHistory = (item) => {
    const history =
      item?.enStatusHistory || item?.statusHistory || item?.history || [];
    return Array.isArray(history) ? history : [];
  };

  const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="enquiry-table-card">
      <div className="enquiry-table-scroll">
        <table className="enquiry-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Next Follow-Up</th>
              <th>Priority</th>
              <th>Actions</th>
              <th>Register</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={8} className="enquiry-empty">
                  No enquiries match the current filters.
                </td>
              </tr>
            ) : (
              enquiries.map((item) => {
                const history = getStatusHistory(item);
                return (
                <tr key={item._id} onDoubleClick={() => handleCopy(item)}>
                  <td>
                    <div className="enquiry-name">{item.enName || 'N/A'}</div>
                    <div className="enquiry-sub">{item.enMail || ''}</div>
                  </td>
                  <td>{item.enCourse || 'N/A'}</td>
                  <td>{item.enMobile || 'N/A'}</td>
                  <td>
                    <span className={`enquiry-status `}>
                      {item.enStatus || 'N/A'}
                    </span>
                    {history.length > 0 && (
                      <details className="enquiry-history">
                        <summary>
                          History ({history.length})
                        </summary>
                        {history
                          .slice()
                          .sort((a, b) => new Date(b.changedAt || b.date || 0) - new Date(a.changedAt || a.date || 0))
                          .map((entry, idx) => (
                            <div className="enquiry-history-item" key={`${item._id}-history-${idx}`}>
                              <div className="enquiry-history-status">
                                {entry.status || entry.enStatus || entry.label || 'N/A'}
                              </div>
                              <div className="enquiry-history-meta">
                                {formatDateTime(entry.changedAt || entry.date || entry.createdAt) || 'Unknown time'}
                              </div>
                            </div>
                          ))}
                      </details>
                    )}
                  </td>
                  <td>
                    {item.enNextFollowUp
                      ? new Date(item.enNextFollowUp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'N/A'}
                  </td>
                  <td>
                    {item.priorityInfo ? (
                      <span className={`enquiry-priority ${getPriorityTone(item.priorityInfo)}`}>
                        {item.priorityInfo.label}
                      </span>
                    ) : (
                      <span className="enquiry-priority tone-normal">N/A</span>
                    )}
                  </td>
                  <td>
                    <div className="enquiry-actions">
                      <button className="enquiry-btn ghost" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button className="enquiry-btn danger" onClick={() => onDelete(item._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="enquiry-register">
                      <button
                        className={`enquiry-btn ${getRegisterButtonClass(item)}`}
                        onClick={() => handleRegisterClick(item)}
                        disabled={
                          (role === 'hr' && (item.registerStatus === 'registered' || item.registerStatus === 'student_added')) ||
                          (role === 'admin' && !(item.registerStatus === 'registered' || item.registerStatus === 'new'))
                        }
                      >
                        {role === 'hr' ? (
                          item.registerStatus === 'registered' || item.registerStatus === 'student_added'
                            ? 'Registered'
                            : 'Register'
                        ) : (
                          item.registerStatus === 'student_added'
                            ? 'Student Added'
                            : item.registerStatus === 'registered'
                              ? 'Add Student'
                              : 'Register'
                        )}
                      </button>
                      {role === 'admin' && (
                        <div className="enquiry-register-sub">
                          {item.createdBy?.staffName ||
                            item.registeredBy?.staffName ||
                            (item.registeredByRole === 'admin' ? 'Admin' : 'Unassigned HR')}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
      <div className="enquiry-tip">Tip: double-click a row to copy an enquiry.</div>
    </div>
  );
};

export default EnquiryTable;

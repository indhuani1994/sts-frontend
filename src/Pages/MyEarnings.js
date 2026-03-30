








import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../MainLayout.js/MainLayout';
import {
  Drawer,
  IconButton,
  Box,
  Avatar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

import { API } from '../API';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

const tableHeadCell = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: 700,
  fontSize: 12,
  color: '#0f172a',
};

const tableCell = {
  padding: '10px 12px',
  color: '#1f2937',
};

const badgeStyle = (status) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  color: status === 'earned' ? '#166534' : status === 'refund' ? '#9f1239' : '#92400e',
  background:
    status === 'earned'
      ? 'rgba(34, 197, 94, 0.12)'
      : status === 'refund'
        ? 'rgba(244, 63, 94, 0.12)'
        : 'rgba(234, 179, 8, 0.18)',
});

const formatHistory = (history) => {
  if (!Array.isArray(history) || history.length === 0) return ['No updates yet'];
  return history
    .slice()
    .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
    .map((item) => {
      const dateLabel = item.changedAt ? new Date(item.changedAt).toLocaleString() : '';
      return `${item.status}${dateLabel ? ` · ${dateLabel}` : ''}`;
    });
};

const MyEarnings = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState('');
    const [hrStatsLoading, setHrStatsLoading] = useState(true);
    const [hrStatsError, setHrStatsError] = useState('');
    const [earnings, setEarnings] = useState([]);
    const [earningsLoading, setEarningsLoading] = useState(true);
    const [earningsError, setEarningsError] = useState('');
    const [stats, setStats] = useState({
      assignedStudents: 0,
      assignedCourses: 0,
      attendancePercentage: 0,
      marksPercentage: 0,
      todaySchedule: [],
    });
    const [hrStats, setHrStats] = useState({
      overdue: 0,
      urgent: 0,
      upcoming: 0,
      normal: 0,
      todaySchedule: [],
    });

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };


    const navigate = useNavigate();
    const { user } = useAuth();

    

    const fetchProfile = useCallback(async (userId) => {
        try {
            const response = await apiClient.get(`/api/user/profile/${userId}`);
            setProfile(response.data?.data?.profile);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStaffStats = useCallback(async () => {
      try {
        setStatsLoading(true);
        setStatsError('');

        const [dashboardRes, coursesRes, marksRes, scheduleRes] = await Promise.all([
          apiClient.get('/api/dashboard/staff'),
          apiClient.get('/api/courses/assigned'),
          apiClient.get('/api/marks'),
          apiClient.get('/api/schedule'),
        ]);

        const dashboardData = dashboardRes.data?.data || {};
        const attendancePercentage = Number(dashboardData.attendanceSummary?.percentage || 0);
        const assignedStudents = Number(dashboardData.assignedStudents || 0);

        const assignedCourses = Array.isArray(coursesRes.data) ? coursesRes.data.length : 0;

        const marks = Array.isArray(marksRes.data) ? marksRes.data : [];
        const totalMarks = marks.reduce((sum, mark) => sum + Number(mark.testMark || 0), 0);
        const marksPercentage = marks.length > 0 ? Number((totalMarks / marks.length).toFixed(2)) : 0;

        const schedules = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
        const today = new Date();
        const isSameDay = (a, b) =>
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate();

        const getScheduleDate = (item) => {
          if (!item?.time) return null;
          const parsed = new Date(item.time);
          if (!Number.isNaN(parsed.getTime()) && /\d{4}/.test(String(item.time))) {
            return parsed;
          }
          return null;
        };

        const timeToMinutes = (value) => {
          if (!value) return null;
          const raw = String(value).trim().toLowerCase();
          const match = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
          if (!match) return null;
          let hours = Number(match[1]);
          const minutes = Number(match[2] || 0);
          const meridiem = match[3];
          if (meridiem) {
            if (meridiem === 'pm' && hours < 12) hours += 12;
            if (meridiem === 'am' && hours === 12) hours = 0;
          }
          return hours * 60 + minutes;
        };

        const OFFICE_START = 9 * 60;
        const OFFICE_END = 18 * 60;

        const todaySchedule = schedules
          .filter((item) => {
            const date = getScheduleDate(item);
            if (date && !isSameDay(date, today)) return false;
            const minutes = timeToMinutes(item.time);
            if (minutes == null) return true;
            return minutes >= OFFICE_START && minutes <= OFFICE_END;
          })
          .sort((a, b) => {
            const aMin = timeToMinutes(a.time);
            const bMin = timeToMinutes(b.time);
            if (aMin == null && bMin == null) return 0;
            if (aMin == null) return 1;
            if (bMin == null) return -1;
            return aMin - bMin;
          });

        setStats({
          assignedStudents,
          assignedCourses,
          attendancePercentage,
          marksPercentage,
          todaySchedule,
        });
      } catch (err) {
        setStatsError('Failed to load staff stats');
      } finally {
        setStatsLoading(false);
      }
    }, []);

    const fetchHrStats = useCallback(async () => {
      try {
        setHrStatsLoading(true);
        setHrStatsError('');

        const res = await apiClient.get('/api/enquiry');
        const enquiries = Array.isArray(res.data) ? res.data : [];
        const today = new Date();
        const isSameDay = (a, b) =>
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate();

        const getPriorityLabel = (dateString) => {
          if (!dateString) return 'normal';
          const followUpDate = new Date(dateString);
          const normalized = new Date(followUpDate);
          normalized.setHours(0, 0, 0, 0);
          const current = new Date();
          current.setHours(0, 0, 0, 0);

          const diffDays = Math.floor((normalized - current) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) return 'overdue';
          if (diffDays === 0) return 'urgent';
          if (diffDays <= 3) return 'upcoming';
          return 'normal';
        };

        const counts = {
          overdue: 0,
          urgent: 0,
          upcoming: 0,
          normal: 0,
        };

        enquiries.forEach((item) => {
          const label = getPriorityLabel(item.enNextFollowUp);
          if (counts[label] !== undefined) counts[label] += 1;
        });

        const todaySchedule = enquiries
          .filter((item) => {
            if (!item.enNextFollowUp) return false;
            const followUp = new Date(item.enNextFollowUp);
            return isSameDay(followUp, today);
          })
          .sort((a, b) => new Date(a.enNextFollowUp) - new Date(b.enNextFollowUp));

        setHrStats({
          ...counts,
          todaySchedule,
        });
      } catch (err) {
        setHrStatsError('Failed to load HR stats');
      } finally {
        setHrStatsLoading(false);
      }
    }, []);

    const fetchHrEarnings = useCallback(async () => {
      try {
        setEarningsLoading(true);
        setEarningsError('');
        const res = await apiClient.get('/api/enquiry/earnings');
        const rows = Array.isArray(res.data) ? res.data : [];
        setEarnings(rows);
      } catch (err) {
        setEarningsError('Failed to load earnings');
        setEarnings([]);
      } finally {
        setEarningsLoading(false);
      }
    }, []);

    useEffect(() => {
        const profileData = JSON.parse(localStorage.getItem('profile') || '{}');

        if (!user.id || (user.role !== 'staff' && user.role !== 'hr')) {
            navigate('/login');
            return;
        }

        if (profileData._id) {
            setProfile(profileData);
            setLoading(false);
        } else {
            fetchProfile(user.id);
        }

        if (user.role === 'staff') {
          fetchStaffStats();
        }

        if (user.role === 'hr' || user.role === 'staff') {
          fetchHrStats();
          fetchHrEarnings();
        }
    }, [fetchProfile, fetchStaffStats, fetchHrStats, fetchHrEarnings, navigate, user]);

    const summaryCards = useMemo(() => ([
      { label: 'Assigned Students', value: stats.assignedStudents },
      { label: 'Assigned Courses', value: stats.assignedCourses },
      { label: 'Attendance %', value: `${stats.attendancePercentage}%` },
      { label: 'Marks %', value: `${stats.marksPercentage}%` },
    ]), [stats]);

    const hrSummaryCards = useMemo(() => ([
      { label: 'Overdue', value: hrStats.overdue },
      { label: 'Urgent', value: hrStats.urgent },
      { label: 'Upcoming', value: hrStats.upcoming },
      { label: 'Normal', value: hrStats.normal },
    ]), [hrStats]);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>{error}</div>
            </div>
        );
    }
  return (
    <MainLayout>
          {(user.role === 'hr' || user.role === 'staff') && (
          <Box sx={{
            mt: 3,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 2,
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
            p: 2,
          }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              My Earnings
            </Typography>
            {earningsError && (
              <Typography sx={{ color: '#b91c1c', mb: 1 }}>{earningsError}</Typography>
            )}
            {earningsLoading ? (
              <Typography sx={{ color: '#64748b' }}>Loading earnings...</Typography>
            ) : earnings.length === 0 ? (
              <Typography sx={{ color: '#64748b' }}>No earnings yet.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                  }}
                >
                  <Box component="thead" sx={{ background: '#eff6ff' }}>
                    <Box component="tr">
                      <Box component="th" sx={tableHeadCell}>Student</Box>
                      <Box component="th" sx={tableHeadCell}>Course</Box>
                      <Box component="th" sx={tableHeadCell}>Record</Box>
                      <Box component="th" sx={tableHeadCell}>Payment Date</Box>
                      <Box component="th" sx={tableHeadCell}>Amount</Box>
                      <Box component="th" sx={tableHeadCell}>%</Box>
                      <Box component="th" sx={tableHeadCell}>Earnings</Box>
                      <Box component="th" sx={tableHeadCell}>Status</Box>
                      <Box component="th" sx={tableHeadCell}>History</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {earnings.map((row) => (
                      <Box component="tr" key={`${row.recordType}-${row.recordId}`} sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                        <Box component="td" sx={tableCell}>{row.studentName}</Box>
                        <Box component="td" sx={tableCell}>{row.courseName || 'Course'}</Box>
                        <Box component="td" sx={tableCell}>{row.paymentLabel || row.recordType}</Box>
                        <Box component="td" sx={tableCell}>
                          {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A'}
                        </Box>
                        <Box component="td" sx={tableCell}>{Number(row.amountPaid || 0).toFixed(2)}</Box>
                        <Box component="td" sx={tableCell}>{row.commissionPercent}%</Box>
                        <Box component="td" sx={tableCell}>{Number(row.earningAmount || 0).toFixed(2)}</Box>
                        <Box component="td" sx={tableCell}>
                          <Box sx={badgeStyle(row.status || 'pending')}>
                            {row.status || 'pending'}
                          </Box>
                        </Box>
                        <Box component="td" sx={tableCell}>
                          <Box sx={{ display: 'grid', gap: 0.5 }}>
                            {formatHistory(row.history).map((entry, idx) => (
                              <Typography key={idx} sx={{ fontSize: 11, color: '#475569' }}>
                                {entry}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
    </MainLayout>
  )
}



const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: {
        color: '#2c3e50',
        margin: 0
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto'
    },
    profileHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #ecf0f1'
    },
    profileImage: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '20px'
    },
    profileInfo: {
        flex: 1
    },
    name: {
        margin: '0 0 10px 0',
        color: '#2c3e50',
        fontSize: '24px'
    },
    email: {
        margin: '0 0 5px 0',
        color: '#7f8c8d'
    },
    phone: {
        margin: '0 0 5px 0',
        color: '#7f8c8d'
    },
    role: {
        margin: 0,
        color: '#3498db',
        fontWeight: 'bold'
    },
    section: {
        marginBottom: '30px'
    },
    sectionTitle: {
        color: '#2c3e50',
        marginBottom: '15px',
        fontSize: '18px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '15px'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: 'bold',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    value: {
        color: '#2c3e50',
        fontSize: '16px'
    },
    list: {
        margin: 0,
        paddingLeft: '20px'
    },
    listItem: {
        marginBottom: '5px',
        color: '#2c3e50'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '18px',
        color: '#7f8c8d'
    },
    error: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '18px',
        color: '#e74c3c'
    }
};

export default MyEarnings

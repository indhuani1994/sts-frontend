// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { Box, Typography } from '@mui/material';
// import MainLayout from '../MainLayout.js/MainLayout';
// import apiClient from '../lib/apiClient';
// import { cusToast } from '../Components/Toast/CusToast';

// const tableHeadCell = {
//   textAlign: 'left',
//   padding: '10px 12px',
//   fontWeight: 700,
//   fontSize: 12,
//   color: '#0f172a',
// };

// const tableCell = {
//   padding: '10px 12px',
//   color: '#1f2937',
// };

// const formatHistory = (history) => {
//   if (!Array.isArray(history) || history.length === 0) return ['No updates yet'];
//   return history
//     .slice()
//     .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
//     .map((item) => {
//       const dateLabel = item.changedAt ? new Date(item.changedAt).toLocaleString() : '';
//       return `${item.status}${dateLabel ? ` · ${dateLabel}` : ''}`;
//     });
// };

// const AdminHrEarnings = () => {
//   const [hrList, setHrList] = useState([]);
//   const [selectedHr, setSelectedHr] = useState('');
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [updating, setUpdating] = useState(false);

//   const fetchHrList = useCallback(async () => {
//     try {
//       const [usersRes, staffRes] = await Promise.all([
//         apiClient.get('/api/user/admin/users'),
//         apiClient.get('/api/user/staff-dropdown'),
//       ]);

//       const users = Array.isArray(usersRes.data?.data) ? usersRes.data.data : [];
//       const staff = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
//       const staffMap = new Map(staff.map((item) => [String(item._id), item]));

//       const hrUsers = users
//         .filter((user) => user.role === 'hr' && user.staffId)
//         .map((user) => {
//           const staffProfile = staffMap.get(String(user.staffId));
//           return {
//             userId: user._id,
//             staffId: user.staffId,
//             name: staffProfile?.staffName || user.username || 'HR',
//           };
//         });

//       setHrList(hrUsers);
//     } catch (err) {
//       setHrList([]);
//       setError('Failed to load HR list');
//     }
//   }, []);

//   const fetchEarnings = useCallback(async (hrId) => {
//     if (!hrId) {
//       setRows([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');
//       const res = await apiClient.get(`/api/enquiry/hr-earnings?hrId=${hrId}`);
//       const data = Array.isArray(res.data) ? res.data : [];
//       setRows(data);
//     } catch (err) {
//       setRows([]);
//       setError('Failed to load HR earnings');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchHrList();
//   }, [fetchHrList]);

//   useEffect(() => {
//     fetchEarnings(selectedHr);
//   }, [fetchEarnings, selectedHr]);

//   const handleStatusChange = async (row, status) => {
//     if (!selectedHr) return;
//     try {
//       setUpdating(true);
//       await apiClient.patch('/api/enquiry/hr-earnings/status', {
//         hrId: selectedHr,
//         recordType: row.recordType,
//         recordId: row.recordId,
//         status,
//       });
//       await fetchEarnings(selectedHr);
//       cusToast('Earnings status updated');
//     } catch (err) {
//       cusToast("Can't update earnings status", 'error');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const hrOptions = useMemo(() => hrList, [hrList]);

//   return (
//     <MainLayout>
//       <Box sx={{ mt: 2 }}>
//         <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: 22, mb: 1 }}>
//           HR Earnings
//         </Typography>
//         <Typography sx={{ color: '#64748b', fontSize: 13, mb: 2 }}>
//           Select an HR to review every payment record and update the earning status.
//         </Typography>

//         <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
//           <Box sx={{ minWidth: 220 }}>
//             <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>HR</label>
//             <select
//               value={selectedHr}
//               onChange={(e) => setSelectedHr(e.target.value)}
//               style={{
//                 width: '100%',
//                 marginTop: 6,
//                 padding: '10px 12px',
//                 borderRadius: 10,
//                 border: '1px solid rgba(15, 23, 42, 0.12)',
//                 background: '#fff',
//                 fontSize: 13,
//               }}
//             >
//               <option value="">Select HR</option>
//               {hrOptions.map((item) => (
//                 <option key={item.staffId} value={item.staffId}>
//                   {item.name}
//                 </option>
//               ))}
//             </select>
//           </Box>
//         </Box>

//         {error && (
//           <Typography sx={{ color: '#b91c1c', mb: 1 }}>{error}</Typography>
//         )}

//         <Box sx={{
//           background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
//           borderRadius: 2,
//           border: '1px solid rgba(15, 23, 42, 0.08)',
//           boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
//           p: 2,
//         }}>
//           {loading ? (
//             <Typography sx={{ color: '#64748b' }}>Loading earnings...</Typography>
//           ) : !selectedHr ? (
//             <Typography sx={{ color: '#64748b' }}>Select an HR to view earnings.</Typography>
//           ) : rows.length === 0 ? (
//             <Typography sx={{ color: '#64748b' }}>No earnings records yet.</Typography>
//           ) : (
//             <Box sx={{ overflowX: 'auto' }}>
//               <Box
//                 component="table"
//                 sx={{
//                   width: '100%',
//                   borderCollapse: 'collapse',
//                   fontSize: 13,
//                 }}
//               >
//                 <Box component="thead" sx={{ background: '#eff6ff' }}>
//                   <Box component="tr">
//                     <Box component="th" sx={tableHeadCell}>Student</Box>
//                     <Box component="th" sx={tableHeadCell}>Course</Box>
//                     <Box component="th" sx={tableHeadCell}>Record</Box>
//                     <Box component="th" sx={tableHeadCell}>Payment Date</Box>
//                     <Box component="th" sx={tableHeadCell}>Amount</Box>
//                     <Box component="th" sx={tableHeadCell}>%</Box>
//                     <Box component="th" sx={tableHeadCell}>Earnings</Box>
//                     <Box component="th" sx={tableHeadCell}>Status</Box>
//                     <Box component="th" sx={tableHeadCell}>History</Box>
//                   </Box>
//                 </Box>
//                 <Box component="tbody">
//                   {rows.map((row) => (
//                     <Box
//                       component="tr"
//                       key={`${row.recordType}-${row.recordId}`}
//                       sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}
//                     >
//                       <Box component="td" sx={tableCell}>{row.studentName}</Box>
//                       <Box component="td" sx={tableCell}>{row.courseName || 'Course'}</Box>
//                       <Box component="td" sx={tableCell}>{row.paymentLabel || row.recordType}</Box>
//                       <Box component="td" sx={tableCell}>
//                         {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A'}
//                       </Box>
//                       <Box component="td" sx={tableCell}>{Number(row.amountPaid || 0).toFixed(2)}</Box>
//                       <Box component="td" sx={tableCell}>{row.commissionPercent}%</Box>
//                       <Box component="td" sx={tableCell}>{Number(row.earningAmount || 0).toFixed(2)}</Box>
//                       <Box component="td" sx={tableCell}>
//                         <select
//                           value={row.status || 'pending'}
//                           disabled={updating}
//                           onChange={(e) => handleStatusChange(row, e.target.value)}
//                           style={{
//                             padding: '6px 10px',
//                             borderRadius: 10,
//                             border: '1px solid rgba(15, 23, 42, 0.12)',
//                             background: '#fff',
//                             fontSize: 12,
//                           }}
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="earned">Earned</option>
//                           <option value="refund">Refund</option>
//                         </select>
//                       </Box>
//                       <Box component="td" sx={tableCell}>
//                         <Box sx={{ display: 'grid', gap: 0.5 }}>
//                           {formatHistory(row.history).map((entry, idx) => (
//                             <Typography key={idx} sx={{ fontSize: 11, color: '#475569' }}>
//                               {entry}
//                             </Typography>
//                           ))}
//                         </Box>
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>
//               </Box>
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </MainLayout>
//   );
// };

// export default AdminHrEarnings;


import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import MainLayout from '../MainLayout.js/MainLayout';
import apiClient from '../lib/apiClient';
import { cusToast } from '../Components/Toast/CusToast';

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

const AdminHrEarnings = () => {
  const [hrList, setHrList] = useState([]);
  const [selectedHr, setSelectedHr] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch HR List
  const fetchHrList = useCallback(async () => {
    try {
      const [usersRes, staffRes] = await Promise.all([
        apiClient.get('/api/user/admin/users'),
        apiClient.get('/api/user/staff-dropdown'),
      ]);

      const users = Array.isArray(usersRes.data?.data) ? usersRes.data.data : [];
      const staff = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
      const staffMap = new Map(staff.map((item) => [String(item._id), item]));

      const hrUsers = users
        .filter((user) => (user.role === 'hr' || user.role === 'staff') && user.staffId)
        .map((user) => {
          const staffProfile = staffMap.get(String(user.staffId));
          return {
            userId: user._id,
            staffId: user.staffId,
            name: staffProfile?.staffName || user.username || 'HR',
          };
        });

      setHrList(hrUsers);
    } catch (err) {
      setHrList([]);
      setError('Failed to load HR list');
    }
  }, []);

  // ✅ Fetch Earnings (FIXED: show all if no HR selected)
  const fetchEarnings = useCallback(async (hrId) => {
    try {
      setLoading(true);
      setError('');

      let url = '/api/enquiry/hr-earnings';

      if (hrId) {
        url += `?hrId=${hrId}`;
      }

      const res = await apiClient.get(url);
      const data = Array.isArray(res.data) ? res.data : [];

      setRows(data);
    } catch (err) {
      setRows([]);
      setError('Failed to load HR earnings');

      console.log(err)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHrList();
  }, [fetchHrList]);

  useEffect(() => {
    fetchEarnings(selectedHr);
  }, [fetchEarnings, selectedHr]);

  // ✅ FIXED: allow update even when "All HR"
  const handleStatusChange = async (row, status) => {
    try {
      setUpdating(true);
      console.log("row")

      console.log(row)
      console.log("selectedHr")
      console.log(selectedHr)

      const targetHrId = row.hrId || selectedHr;

    if (!targetHrId) {
      cusToast("Error: HR ID missing for this record", 'error');
      return;
    }

      await apiClient.patch('/api/enquiry/hr-earnings/status', {
        hrId: selectedHr || row.hrId,
        recordType: row.recordType,
        recordId: row.recordId,
        status,
      });

      await fetchEarnings(selectedHr);
      cusToast('Earnings status updated');
    } catch (err) {
      cusToast("Can't update earnings status", 'error');
    } finally {
      setUpdating(false);
    }
  };

  const hrOptions = useMemo(() => hrList, [hrList]);

  return (
    <MainLayout>
      <Box sx={{ mt: 2 }}>
        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: 22, mb: 1 }}>
          HR Earnings
        </Typography>

        <Typography sx={{ color: '#64748b', fontSize: 13, mb: 2 }}>
          Select an HR to review every payment record and update the earning status.
        </Typography>

        {/* ✅ FILTER (UI SAME, only text changed) */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Box sx={{ minWidth: 220 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>HR</label>
            <select
              value={selectedHr}
              onChange={(e) => {
                 console.log(e.target.value)
                return setSelectedHr(e.target.value)}}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(15, 23, 42, 0.12)',
                background: '#fff',
                fontSize: 13,
              }}
            >
              <option value="">All HR</option>
              {hrOptions.map((item) =>
                 
                (
                <option key={item.staffId} value={item.staffId}>
                  {item.name}
                </option>
              ))
              }
            </select>
          </Box>
        </Box>

        {error && (
          <Typography sx={{ color: '#b91c1c', mb: 1 }}>{error}</Typography>
        )}

        <Box sx={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 2,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
          p: 2,
        }}>
          {loading ? (
            <Typography sx={{ color: '#64748b' }}>Loading earnings...</Typography>
          ) : rows.length === 0 ? (
            <Typography sx={{ color: '#64748b' }}>No earnings records yet.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
                  {rows.map((row) => (
                    <Box
                      component="tr"
                      key={`${row.recordType}-${row.recordId}`}
                      sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)'}}
                    >
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
                        <select
                          value={row.status || 'pending'}
                          disabled={updating}
                          onChange={(e) => handleStatusChange(row, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 10,
                            border: '1px solid rgba(15, 23, 42, 0.12)',
                            background: '#fff',
                            fontSize: 12,
                            color: "#fff",
                         

  color:
    row.status === "earned"
      ? "#065f46"
      : row.status === "refund"
      ? "#7f1d1d"
      : "#92400e"
      ,
      border: row.status === "earned"
      ? "2px solid #17cf70"
      : row.status === "refund"
      ? "2px solid #eb0f0f"
      : "2px solid #e6bd1a",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="earned">Earned</option>
                          <option value="refund">Refund</option>
                        </select>
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
      </Box>
    </MainLayout>
  );
};

export default AdminHrEarnings;


// // import React, { useEffect, useState } from "react";
// // import MainLayout from "../MainLayout.js/MainLayout";
// // import apiClient from "../lib/apiClient";

// // const toYmd = (date) => {
// //   const year = date.getFullYear();
// //   const month = String(date.getMonth() + 1).padStart(2, "0");
// //   const day = String(date.getDate()).padStart(2, "0");
// //   return `${year}-${month}-${day}`;
// // };

// // const isToday = (value) => {
// //   const d = new Date(value);
// //   if (Number.isNaN(d.getTime())) return false;
// //   const today = new Date();
// //   d.setHours(0, 0, 0, 0);
// //   today.setHours(0, 0, 0, 0);
// //   return d.getTime() === today.getTime();
// // };

// // const AdminAttendance = () => {
// //   const [reportData, setReportData] = useState([]);
// //   const [filterType, setFilterType] = useState("date");
// //   const [selectedDate, setSelectedDate] = useState(toYmd(new Date()));
// //   const [statusUpdates, setStatusUpdates] = useState({});
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     // Auto-set today's date for date/week/month filters
// //     if (!selectedDate && ["date", "week", "month"].includes(filterType)) {
// //       setSelectedDate(toYmd(new Date()));
// //     }
// //   }, [filterType, selectedDate]);

// //   const fetchReport = async () => {
// //     if (["date", "week", "month"].includes(filterType) && !selectedDate) {
// //       alert("Please select a date");
// //       return;
// //     }

// //     const params = {};
// //     if (filterType !== "all") params.type = filterType;

// //     if (filterType === "date" || filterType === "month") params.date = selectedDate;
// //     if (filterType === "week") {
// //       const start = new Date(selectedDate);
// //       const end = new Date(start);
// //       end.setDate(start.getDate() + 6);
// //       params.startDate = toYmd(start);
// //       params.endDate = toYmd(end);
// //     }

// //     try {
// //       setLoading(true);
// //       const res = await apiClient.get("/api/attendance/report", { params });
// //       setReportData(res.data || []);
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleStatusChange = (id, value) => {
// //     setStatusUpdates((prev) => ({ ...prev, [id]: value }));
// //   };

// //   const handleUpdateStatus = async (attendanceId, studentId) => {
// //     const status = statusUpdates[attendanceId] || statusUpdates[studentId];
// //     if (!status) return;

// //     try {
// //       await apiClient.put("/api/attendance/admin-update", {
// //         attendanceId,
// //         status,
// //       });

// //       // Update the state locally
// //       setReportData((prev) =>
// //         prev.map((item) =>
// //           item._id === attendanceId ? { ...item, status } : item
// //         )
// //       );
// //       alert("Attendance updated successfully!");
// //     } catch (err) {
// //       console.error(err);
// //       alert("Failed to update attendance.");
// //     }
// //   };

// //   const presentCount = reportData.filter(
// //     (row) => row.status === "present" || row.status === "online"
// //   ).length;
// //   const attendancePercent = reportData.length
// //     ? Math.round((presentCount / reportData.length) * 100)
// //     : 0;

// //   return (
// //     <MainLayout>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

// //         .admin-att { font-family: 'Space Grotesk', system-ui, sans-serif; color: #0f172a; background: radial-gradient(900px 420px at 85% 0%, #dbeafe 0%, #f8fafc 55%, #ffffff 100%); border-radius: 24px; padding: 28px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08); }
// //         .admin-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
// //         .admin-title { font-size: 24px; font-weight: 700; margin: 0 0 6px 0; }
// //         .admin-sub { margin: 0; color: #64748b; font-size: 14px; }
// //         .admin-pill { display: inline-flex; align-items: center; gap: 8px; background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; }
// //         .admin-card { background: #fff; border-radius: 18px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06); }
// //         .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
// //         .filter-input, .filter-select { padding: 10px 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; font-size: 13px; }
// //         .btn { background: linear-gradient(135deg, #1d4ed8, #0ea5e9); color: #fff; border: none; padding: 10px 14px; border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 10px 20px rgba(29, 78, 216, 0.2); transition: transform 0.15s ease, box-shadow 0.15s ease; }
// //         .btn:hover { transform: translateY(-1px); box-shadow: 0 14px 24px rgba(29, 78, 216, 0.25); }
// //         .table { width: 100%; border-collapse: collapse; font-size: 14px; }
// //         .table th { text-align: left; font-size: 12px; color: #64748b; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
// //         .table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; }
// //         .status-select { padding: 8px 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 13px; }
// //         .empty { text-align: center; color: #64748b; font-size: 14px; padding: 14px 0; }
// //         .admin-metric { margin: 0 0 14px 0; font-size: 14px; color: #1e293b; font-weight: 600; }
// //         @media (max-width: 1024px) { .filters { grid-template-columns: 1fr 1fr; } }
// //         @media (max-width: 640px) { .filters { grid-template-columns: 1fr; } .admin-header { flex-direction: column; align-items: flex-start; } }
// //       `}</style>

// //       <div className="admin-att">
// //         <div className="admin-header">
// //           <div>
// //             <h2 className="admin-title">Admin Attendance</h2>
// //             <p className="admin-sub">View reports and update only today's attendance.</p>
// //           </div>
// //           <span className="admin-pill">Update Today Only</span>
// //         </div>

// //         <div className="admin-card">
// //           <p className="admin-metric">Attendance %: {attendancePercent}%</p>
// //           <div className="filters">
// //             <select
// //               className="filter-select"
// //               value={filterType}
// //               onChange={(e) => setFilterType(e.target.value)}
// //             >
// //               <option value="date">Date Wise</option>
// //               <option value="week">Week Wise</option>
// //               <option value="month">Month Wise</option>
// //               <option value="all">Overall</option>
// //             </select>

// //             <input
// //               className="filter-input"
// //               type="date"
// //               value={selectedDate}
// //               onChange={(e) => setSelectedDate(e.target.value)}
// //               disabled={filterType === "all"}
// //             />

// //             <button className="btn" onClick={fetchReport}>
// //               Search
// //             </button>
// //           </div>

// //           {loading ? (
// //             <p className="empty">Loading report...</p>
// //           ) : reportData.length === 0 ? (
// //             <p className="empty">No records found.</p>
// //           ) : (
// //             <table className="table">
// //               <thead>
// //                 <tr>
// //                   <th>Date</th>
// //                   <th>Student</th>
// //                   <th>Course</th>
// //                   <th>Status</th>
// //                   <th>Update</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {reportData.map((item) => (
// //                   <tr key={item._id}>
// //                     <td>{new Date(item.date).toLocaleDateString()}</td>
// //                     <td>{item.studentName || item.studentId?.student?.studentName}</td>
// //                     <td>{item.courseName || item.studentId?.course?.courseName}</td>
// //                     <td>{item.status}</td>
// //                     <td>
// //                       {isToday(item.date) ? (
// //                         <>
// //                           <select
// //                             className="status-select"
// //                             value={statusUpdates[item._id] ?? item.status ?? ""}
// //                             onChange={(e) =>
// //                               handleStatusChange(item._id, e.target.value)
// //                             }
// //                           >
// //                             <option value="">Select</option>
// //                             <option value="present">Present</option>
// //                             <option value="absent">Absent</option>
// //                             <option value="leave">Leave</option>
// //                             <option value="online">Online</option>
// //                           </select>
// //                           <button
// //                             className="btn"
// //                             onClick={() => handleUpdateStatus(item._id)}
// //                           >
// //                             Update
// //                           </button>
// //                         </>
// //                       ) : (
// //                         <span>Today only</span>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           )}
// //         </div>
// //       </div>
// //     </MainLayout>
// //   );
// // };

// // export default AdminAttendance;

// import React, { useEffect, useState, useMemo } from "react";
// import MainLayout from "../MainLayout.js/MainLayout";
// import apiClient from "../lib/apiClient";

// // Helper: Format Date to YYYY-MM-DD
// const toYmd = (date) => {
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const AdminAttendance = () => {
//   const [reportData, setReportData] = useState([]);
//   const [filterType, setFilterType] = useState("date");
//   const [selectedDate, setSelectedDate] = useState(toYmd(new Date()));
//   const [statusUpdates, setStatusUpdates] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [updatingId, setUpdatingId] = useState(null); // Track which row is saving

//   // Memoize today's date string to prevent unnecessary recalculations
//   const todayStr = useMemo(() => toYmd(new Date()), []);

//   useEffect(() => {
//     if (!selectedDate && ["date", "week", "month"].includes(filterType)) {
//       setSelectedDate(toYmd(new Date()));
//     }
//   }, [filterType]);

//   const fetchReport = async () => {
//     if (["date", "week", "month"].includes(filterType) && !selectedDate) {
//       alert("Please select a date");
//       return;
//     }

//     const params = {};
//     if (filterType !== "all") params.type = filterType;
//     if (filterType === "date" || filterType === "month") params.date = selectedDate;
    
//     if (filterType === "week") {
//       const start = new Date(selectedDate);
//       const end = new Date(start);
//       end.setDate(start.getDate() + 6);
//       params.startDate = toYmd(start);
//       params.endDate = toYmd(end);
//     }

//     try {
//       setLoading(true);
//       const res = await apiClient.get("/api/attendance/report", { params });
//       setReportData(res.data || []);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       alert("Failed to fetch attendance records.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = (id, value) => {
//     setStatusUpdates((prev) => ({ ...prev, [id]: value }));
//   };

//   const handleUpdateStatus = async (attendanceId) => {
//     const status = statusUpdates[attendanceId];
//     if (!status) return;

//     try {
//       setUpdatingId(attendanceId);
//       await apiClient.put("/api/attendance/admin-update", {
//         attendanceId,
//         status,
//       });

//       // Update local data and clear the pending update state for this ID
//       setReportData((prev) =>
//         prev.map((item) => (item._id === attendanceId ? { ...item, status } : item))
//       );
      
//       setStatusUpdates((prev) => {
//         const next = { ...prev };
//         delete next[attendanceId];
//         return next;
//       });

//       alert("Updated successfully!");
//     } catch (err) {
//       console.error("Update Error:", err);
//       alert("Failed to update status.");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const attendanceStats = useMemo(() => {
//     if (!reportData.length) return 0;
//     const present = reportData.filter(r => ["present", "online"].includes(r.status)).length;
//     return Math.round((present / reportData.length) * 100);
//   }, [reportData]);

//   return (
//     <MainLayout>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
//         .admin-att { font-family: 'Space Grotesk', sans-serif; color: #0f172a; padding: 28px; background: #f8fafc; border-radius: 24px; }
//         .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
//         .admin-title { font-size: 24px; font-weight: 700; margin: 0; }
//         .admin-pill { background: #0f172a; color: #fff; padding: 6px 12px; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
//         .admin-card { background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
//         .filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
//         .filter-input, .filter-select { padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; }
//         .btn { background: #2563eb; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: 0.2s; }
//         .btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
//         .btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//         .table th { text-align: left; padding: 12px; color: #64748b; font-size: 12px; border-bottom: 2px solid #f1f5f9; }
//         .table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
//         .badge { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
//         .badge.present { background: #dcfce7; color: #166534; }
//         .badge.absent { background: #fee2e2; color: #991b1b; }
//         .badge.online { background: #e0f2fe; color: #075985; }
//         .badge.leave { background: #fef3c7; color: #92400e; }
//         .status-select { padding: 6px; border-radius: 8px; border: 1px solid #cbd5e1; margin-right: 8px; }
//       `}</style>

//       <div className="admin-att">
//         <div className="admin-header">
//           <div>
//             <h2 className="admin-title">Attendance Management</h2>
//             <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage student records and generate reports</p>
//           </div>
//           <span className="admin-pill">Editing Today Only</span>
//         </div>

//         <div className="admin-card">
//           <div style={{ marginBottom: '20px', fontSize: '15px' }}>
//             <strong>Average Attendance: </strong>
//             <span style={{ color: attendanceStats > 75 ? '#166534' : '#991b1b' }}>{attendanceStats}%</span>
//           </div>

//           <div className="filters">
//             <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
//               <option value="date">Daily</option>
//               <option value="week">Weekly Range</option>
//               <option value="month">Monthly</option>
//               <option value="all">View All</option>
//             </select>

//             <input 
//               className="filter-input" 
//               type="date" 
//               value={selectedDate} 
//               disabled={filterType === "all"}
//               onChange={(e) => setSelectedDate(e.target.value)} 
//             />

//             <button className="btn" onClick={fetchReport} disabled={loading}>
//               {loading ? "Searching..." : "Search Records"}
//             </button>
//           </div>

//           <div style={{ overflowX: 'auto' }}>
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Student Name</th>
//                   <th>Course</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {reportData.length > 0 ? reportData.map((item) => {
//                   const itemYmd = toYmd(item.date);
//                   const isEditable = itemYmd === todayStr;
//                   const currentStatus = statusUpdates[item._id] ?? item.status ?? "";

//                   return (
//                     <tr key={item._id}>
//                       <td>{new Date(item.date).toLocaleDateString()}</td>
//                       <td>{item.studentName || item.studentId?.student?.studentName || "N/A"}</td>
//                       <td>{item.courseName || item.studentId?.course?.courseName || "General"}</td>
//                       <td>
//                         <span className={`badge ${item.status}`}>
//                           {item.status || "unmarked"}
//                         </span>
//                       </td>
//                       <td>
//                         {isEditable ? (
//                           <div style={{ display: 'flex', alignItems: 'center' }}>
//                             <select
//                               className="status-select"
//                               value={currentStatus}
//                               onChange={(e) => handleStatusChange(item._id, e.target.value)}
//                             >
//                               <option value="">Change Status</option>
//                               <option value="present">Present</option>
//                               <option value="absent">Absent</option>
//                               <option value="leave">Leave</option>
//                               <option value="online">Online</option>
//                             </select>
//                             <button
//                               className="btn"
//                               style={{ padding: '6px 12px', fontSize: '12px' }}
//                               disabled={updatingId === item._id || !statusUpdates[item._id]}
//                               onClick={() => handleUpdateStatus(item._id)}
//                             >
//                               {updatingId === item._id ? "..." : "Save"}
//                             </button>
//                           </div>
//                         ) : (
//                           <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Historical</span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 }) : (
//                   <tr>
//                     <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
//                       {loading ? "Loading records..." : "No attendance data found for this period."}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default AdminAttendance;








import React, { useEffect, useState, useMemo } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";

const stones = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const AdminAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(stones(new Date()));
  const [statusUpdates, setStatusUpdates] = useState({}); // Stores unsaved changes
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [filterType, setFilterType] = useState("date");
  const [reportDate, setReportDate] = useState(stones(new Date()));
  const [reportStudent, setReportStudent] = useState("");

  const todayStr = useMemo(() => stones(new Date()), []);

  // Fetch all registered students AND their attendance for the selected date
  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, attRes] = await Promise.all([
        apiClient.get("/api/stureg"),
        apiClient.get("/api/attendance/report", { 
          params: { type: "date", date: selectedDate } 
        })
      ]);
      setStudents(stuRes.data || []);
      setAttendanceRecords(attRes.data || []);
      setStatusUpdates({}); // Clear unsaved changes on new search
    } catch (err) {
      console.error(err);
      alert("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Sync data on initial load
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleStatusChange = (studentId, value) => {
    setStatusUpdates(prev => ({ ...prev, [studentId]: value }));
  };

  const handleBulkUpdate = async () => {
    const updates = Object.entries(statusUpdates);
    if (updates.length === 0) return alert("No changes to save");

    setIsSaving(true);
    try {
      // Sending bulk updates to the backend
      await apiClient.put("/api/attendance/bulk-update", {
        date: selectedDate,
        updates: updates.map(([sId, status]) => ({ studentId: sId, status }))
      });
      
      alert(`Successfully saved ${updates.length} records`);
      await fetchData(); // Refresh data to turn "Pending" into "Current"
    } catch (err) {
      console.error(err);
      alert("Update failed. Make sure your backend has a /bulk-update route.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchReport = async () => {
    if ((filterType === "date" || filterType === "week" || filterType === "month") && !reportDate) {
      alert("Please select a date");
      return;
    }

    const params = {};
    if (filterType !== "all") {
      params.type = filterType;
    }

    if (reportStudent) {
      params.studentId = reportStudent;
    }

    if (filterType === "date" || filterType === "month") {
      params.date = reportDate;
    }

    if (filterType === "week") {
      const start = new Date(reportDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      params.startDate = stones(start);
      params.endDate = stones(end);
    }

    try {
      setReportLoading(true);
      const res = await apiClient.get("/api/attendance/report", { params });
      setReportData(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    } finally {
      setReportLoading(false);
    }
  };

  const reportPresentCount = reportData.filter(
    (row) => row.status === "present" || row.status === "online"
  ).length;
  const reportTotalCount = reportData.length;
  const reportPercent = reportTotalCount
    ? Math.round((reportPresentCount / reportTotalCount) * 100)
    : 0;

  return (
    <MainLayout>
      <style>{`
        .admin-att { font-family: 'Space Grotesk', sans-serif; padding: 25px; background: #f8fafc; min-height: 100vh; }
        .admin-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 12px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 13px; text-transform: uppercase; }
        .table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        
        .btn-save { background: #059669; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-save:hover { background: #047857; }
        .btn-save:disabled { background: #9ca3af; cursor: not-allowed; }

        .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .present { background: #dcfce7; color: #166534; }
        .absent { background: #fee2e2; color: #991b1b; }
        .pending { background: #fef3c7; color: #92400e; border: 1px dashed #d97706; }
        .not-marked { background: #f1f5f9; color: #64748b; }
        
        .status-select { padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; width: 130px; }
        .highlight-row { background-color: #fffbeb; }
        .report-card { margin-top: 24px; }
        .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
        .filter-input, .filter-select { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 13px; }
        .ghost-btn { border: 1px solid #cbd5f5; background: #f8fafc; color: #1e293b; font-weight: 600; border-radius: 10px; padding: 10px 14px; cursor: pointer; }
        .empty { text-align: center; color: #64748b; font-size: 14px; padding: 14px 0; }
        @media (max-width: 1024px) { .filters { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .filters { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-att">
        <div className="header-row">
          <div>
            <h2 style={{ margin: 0 }}>Admin Attendance Panel</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Marking all registered students for <b>{selectedDate}</b></p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="date" 
              className="status-select"
              style={{ width: '160px' }}
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button 
              className="btn-save" 
              onClick={handleBulkUpdate}
              disabled={isSaving || Object.keys(statusUpdates).length === 0}
            >
              {isSaving ? "Saving..." : `Save Changes (${Object.keys(statusUpdates).length})`}
            </button>
          </div>
        </div>

        <div className="admin-card">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading students...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Course</th>
                  <th>Current Status</th>
                  <th>New Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  // Find if this student has an existing record for the selected date
                  const record = attendanceRecords.find(r => 
                    (r.studentId?._id === student._id) || (r.studentId === student._id)
                  );
                  
                  const isPending = !!statusUpdates[student._id];
                  const displayStatus = record?.status || "not-marked";

                  return (
                    <tr key={student._id} className={isPending ? "highlight-row" : ""}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{student.student?.studentName || "Unknown"}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {student._id.slice(-6)}</div>
                      </td>
                      <td>{student.course?.courseName || "N/A"}</td>
                      <td>
                        {isPending ? (
                          <span className="badge pending">Pending Save</span>
                        ) : (
                          <span className={`badge ${displayStatus}`}>
                            {displayStatus.replace('-', ' ')}
                          </span>
                        )}
                      </td>
                      <td>
                        {selectedDate === todayStr ? (
                          <select 
                            className="status-select"
                            value={statusUpdates[student._id] || ""}
                            onChange={(e) => handleStatusChange(student._id, e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="leave">Leave</option>
                            <option value="online">Online</option>
                          </select>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '12px' }}>History Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card report-card">
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Attendance Report</h3>
            <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Filter by day, week, month, or student.</p>
          </div>
          <p style={{ margin: '0 0 12px 0', color: '#1e293b', fontWeight: 600 }}>
            Attendance %: {reportPercent}% (Present: {reportPresentCount} / Total: {reportTotalCount})
          </p>

          <div className="filters">
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="date">Date Wise</option>
              <option value="week">Week Wise</option>
              <option value="month">Month Wise</option>
              <option value="all">Overall</option>
            </select>

            <input
              className="filter-input"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              disabled={filterType === "all"}
            />

            <select
              className="filter-select"
              value={reportStudent}
              onChange={(e) => setReportStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.student?.studentName || "Unknown"}
                </option>
              ))}
            </select>

            <button className="ghost-btn" onClick={fetchReport}>
              Search
            </button>
          </div>

          {reportLoading ? (
            <p className="empty">Loading report...</p>
          ) : reportData.length === 0 ? (
            <p className="empty">No records found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.studentName || r.studentId?.student?.studentName}</td>
                    <td>{r.courseName || r.studentId?.course?.courseName}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminAttendance;

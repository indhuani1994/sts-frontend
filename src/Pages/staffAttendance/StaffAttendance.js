import React, { useEffect, useState } from "react";
import MainLayout from "../../MainLayout.js/MainLayout";
import apiClient from "../../lib/apiClient";

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StaffAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filterType, setFilterType] = useState("date");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const staff = JSON.parse(localStorage.getItem("profile"));
  const staffId = staff?._id; 
  
  

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/stureg/staff/${staffId}`);
        setStudents(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (staffId) {
      fetchStudents();
    }
  }, [staffId]);

  useEffect(() => {
    if (!selectedDate && (filterType === "date" || filterType === "week" || filterType === "month")) {
      setSelectedDate(toYmd(new Date()));
    }
  }, [filterType, selectedDate]);
  const handleChange = (studentId, value) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const records = Object.keys(attendance)
        .map((studentId) => ({
          studentId,
          status: attendance[studentId],
        }))
        .filter((record) => record.status);

      if (records.length === 0) {
        alert("Select at least one attendance status");
        return;
      }

      await apiClient.post("/api/attendance/mark", {
        records,
      });

      alert("Attendance saved successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Error saving attendance");
    }
  };

  const fetchReport = async () => {
    if ((filterType === "date" || filterType === "week" || filterType === "month") && !selectedDate) {
      alert("Please select a date");
      return;
    }

    const params = {
      studentId: selectedStudent || undefined,
    };

    if (filterType !== "all") {
      params.type = filterType;
    }

    if (filterType === "date" || filterType === "month") {
      params.date = selectedDate || undefined;
    }

    if (filterType === "week") {
      const start = new Date(selectedDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      params.startDate = toYmd(start);
      params.endDate = toYmd(end);
    }

    try {
      setReportLoading(true);
      const res = await apiClient.get("/api/attendance/report", { params });
      setReportData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const presentCount = reportData.filter((row) => row.status === "present" || row.status === "online").length;
  const totalCount = reportData.length;
  const attendancePercent = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .att-page {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          color: #0f172a;
          background: radial-gradient(1200px 600px at 10% 0%, #e6f2ff 0%, #f6f8fb 45%, #ffffff 100%);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }

        .att-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }

        .att-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 4px 0;
        }

        .att-sub {
          margin: 0;
          color: #475569;
          font-size: 14px;
        }

        .att-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f172a;
          color: #fff;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .att-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 22px;
        }

        .att-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .att-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .att-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .att-table th {
          text-align: left;
          font-size: 12px;
          color: #64748b;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .att-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .status-select {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 13px;
        }

        .primary-btn {
          margin-top: 16px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(37, 99, 235, 0.3);
        }

        .att-filters {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .att-input,
        .att-select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
        }

        .ghost-btn {
          border: 1px solid #cbd5f5;
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
        }

        .att-empty {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          padding: 16px 0;
        }

        .att-metric {
          margin: 0 0 14px 0;
          font-size: 14px;
          color: #1e293b;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .att-grid {
            grid-template-columns: 1fr;
          }
          .att-filters {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .att-filters {
            grid-template-columns: 1fr;
          }
          .att-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="att-page">
        <div className="att-header">
          <div>
            <h2 className="att-title">Staff Attendance</h2>
            <p className="att-sub">Mark today’s attendance and view reports in one place.</p>
          </div>
          <span className="att-pill">Today Only</span>
        </div>

        <div className="att-grid">
          <div className="att-card">
            <h3>Mark Today</h3>
            {loading ? (
              <p className="att-empty">Loading students...</p>
            ) : (
              <>
                <table className="att-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr key={s._id}>
                        <td>{index + 1}</td>
                        <td>{s.student?.studentName}</td>
                        <td>{s.course?.courseName}</td>
                        <td>
                          <select
                            className="status-select"
                            value={attendance[s._id] || ""}
                            onChange={(e) => handleChange(s._id, e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="leave">Leave</option>
                            <option value="online">Online</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button className="primary-btn" onClick={handleSave}>
                  Save Attendance
                </button>
              </>
            )}
          </div>

          <div className="att-card">
            <h3>Attendance Report</h3>
            <p className="att-metric">
              Attendance %: {attendancePercent}% (Present: {presentCount} / Total: {totalCount})
            </p>

            <div className="att-filters">
              <select
                className="att-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="date">Date Wise</option>
                <option value="week">Week Wise</option>
                <option value="month">Month Wise</option>
                <option value="all">Overall</option>
              </select>

              <input
                className="att-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <select
                className="att-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">All Students</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.student?.studentName}
                  </option>
                ))}
              </select>

              <button className="ghost-btn" onClick={fetchReport}>
                Search
              </button>
            </div>

            {reportLoading ? (
              <p className="att-empty">Loading report...</p>
            ) : reportData.length === 0 ? (
              <p className="att-empty">No records found.</p>
            ) : (
              <table className="att-table">
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
      </div>
    </MainLayout>
  );
};

export default StaffAttendance;




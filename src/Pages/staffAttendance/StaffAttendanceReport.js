import React, { useEffect, useState } from "react";
import MainLayout from "../../MainLayout.js/MainLayout";
import apiClient from "../../lib/apiClient";

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StaffAttendanceReport = () => {
  const staff = JSON.parse(localStorage.getItem("profile"));
  const staffId = staff?._id;

  const [students, setStudents] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [filterType, setFilterType] = useState("date");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get(`/api/stureg/staff/${staffId}`);
        setStudents(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (staffId) {
      fetchStudents();
    }
  }, [staffId]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(toYmd(new Date()));
    }
  }, [selectedDate]);
  const fetchReport = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    const params = {
      type: filterType,
      studentId: selectedStudent || undefined,
    };

    if (filterType === "date") {
      params.date = selectedDate || undefined;
    }

    if (filterType === "month") {
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
      const res = await apiClient.get("/api/attendance/report", { params });
      setReportData(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: "20px" }}>
        <h2>Attendance Report</h2>

        <div style={{ marginBottom: "15px" }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="date">Date Wise</option>
            <option value="week">Week Wise</option>
            <option value="month">Month Wise</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <select
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

          <button onClick={fetchReport}>Search</button>
        </div>

        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr>
                <td colSpan="3">No Records</td>
              </tr>
            ) : (
              reportData.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.studentId?.student?.studentName}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default StaffAttendanceReport;

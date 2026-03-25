import React, { useState, useEffect } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AttendanceAndReviews = () => {
  const [reportData, setReportData] = useState([]);
  const [filterType, setFilterType] = useState("date");
  const [selectedDate, setSelectedDate] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [formData, setFormData] = useState({
    studentid: "",
    rating: 0,
    review: "",
  });
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get("/api/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const today = toYmd(new Date());
    setSelectedDate(today);
    setFilterType("date");

    const loadToday = async () => {
      try {
        setReportLoading(true);
        const res = await apiClient.get("/api/attendance/report", {
          params: { type: "date", date: today },
        });
        setReportData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setReportLoading(false);
      }
    };

    loadToday();
  }, []);
  const fetchReport = async () => {
    if ((filterType === "date" || filterType === "week" || filterType === "month") && !selectedDate) {
      alert("Please select a date");
      return;
    }
    const params = {};

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

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStarClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
      const profile = JSON.parse(localStorage.getItem("profile"));
      const studentId = profile?._id;

      if (!studentId) {
        alert("No student ID found in local storage");
        return;
      }

      const newFormData = {
        ...formData,
        studentid: studentId,
      };

      if (!newFormData.studentid || newFormData.rating === 0 || !newFormData.review.trim()) {
        alert("Please fill all fields");
        return;
      }

      await apiClient.post("/api/reviews", newFormData);

      setFormData({ rating: 0, review: "" });
      setShowReviewPopup(false);
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert("Error adding review");
    }
  };

  const presentCount = reportData.filter((row) => row.status === "present" || row.status === "online").length;
  const attendancePercent = reportData.length ? Math.round((presentCount / reportData.length) * 100) : 0;

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .student-att {
          --ink: #0f172a;
          --muted: rgba(15, 23, 42, 0.62);
          --accent: #0ea5a4;
          --accent-2: #2563eb;
          --surface: rgba(255, 255, 255, 0.9);
          --border: rgba(15, 23, 42, 0.08);
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          color: var(--ink);
          background:
            radial-gradient(900px 520px at 12% 0%, rgba(14, 116, 144, 0.12) 0%, transparent 55%),
            radial-gradient(700px 460px at 88% 10%, rgba(37, 99, 235, 0.12) 0%, transparent 55%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #ffffff 100%);
          border-radius: 24px;
          padding: 26px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }

        .student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .student-title {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .student-sub {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }

        .att-summary {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 16px;
          align-items: center;
          margin-bottom: 18px;
        }

        .att-ring {
          --value: 0;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: conic-gradient(var(--accent) calc(var(--value) * 1%), rgba(15, 23, 42, 0.08) 0);
          display: grid;
          place-items: center;
          position: relative;
          box-shadow: inset 0 0 0 6px rgba(15, 23, 42, 0.04);
        }

        .att-ring::after {
          content: "";
          width: 96px;
          height: 96px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
          position: absolute;
        }

        .att-ring span {
          position: relative;
          font-weight: 800;
          font-size: 22px;
          color: var(--ink);
        }

        .att-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        .att-card {
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
          padding: 12px 14px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }

        .att-card span {
          display: block;
          font-size: 12px;
          color: var(--muted);
        }

        .att-card strong {
          font-size: 18px;
          color: var(--ink);
        }

        .report-card {
          background: var(--surface);
          border-radius: 18px;
          padding: 18px;
          border: 1px solid var(--border);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .filter-input,
        .filter-select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          font-size: 13px;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: rgba(14, 116, 144, 0.35);
          box-shadow: 0 0 0 4px rgba(14, 116, 144, 0.12);
        }

        .btn {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(37, 99, 235, 0.26);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .table th {
          text-align: left;
          font-size: 11px;
          color: rgba(15, 23, 42, 0.6);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 8px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.12);
        }

        .table td {
          padding: 12px 8px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .table tbody tr:hover td {
          background: rgba(14, 116, 144, 0.06);
        }

        .empty {
          text-align: center;
          color: var(--muted);
          font-size: 14px;
          padding: 14px 0;
        }

        .review-btn {
          margin-top: 18px;
          padding: 10px 16px;
          border-radius: 12px;
          background: #0f172a;
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 700;
        }

        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 20;
        }

        .popup-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          width: 360px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
        }

        .popup-card h3 {
          margin-top: 0;
        }

        .popup-card textarea {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.15);
          resize: vertical;
        }

        .popup-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .popup-actions button {
          padding: 8px 15px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        .popup-actions .ghost {
          background: #94a3b8;
          color: #fff;
        }

        .popup-actions .primary {
          background: #0f172a;
          color: #fff;
        }

        .review-list {
          margin-top: 22px;
          display: grid;
          gap: 12px;
        }

        .review-card {
          border: 1px solid rgba(15, 23, 42, 0.1);
          padding: 14px;
          border-radius: 14px;
          background: #fff;
          display: grid;
          gap: 8px;
        }

        .review-top {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .review-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(15, 23, 42, 0.08);
        }

        .review-stars {
          font-size: 14px;
          color: #f59e0b;
        }

        @media (max-width: 768px) {
          .filters {
            grid-template-columns: 1fr;
          }
          .student-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .att-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="student-att">
        <div className="student-header">
          <div>
            <h2 className="student-title">Attendance Report</h2>
            <p className="student-sub">Track your attendance with flexible filters.</p>
          </div>
        </div>

        <div className="att-summary">
          <div className="att-ring" style={{ "--value": attendancePercent }}>
            <span>{attendancePercent}%</span>
          </div>
          <div className="att-kpis">
            <div className="att-card">
              <span>Present / Total</span>
              <strong>{presentCount} / {reportData.length}</strong>
            </div>
            <div className="att-card">
              <span>Filter Type</span>
              <strong>{filterType.toUpperCase()}</strong>
            </div>
            <div className="att-card">
              <span>Selected Date</span>
              <strong>{selectedDate || "Today"}</strong>
            </div>
          </div>
        </div>

        <div className="report-card">
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button className="btn" onClick={fetchReport}>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* <button className="review-btn" onClick={() => setShowReviewPopup(true)}>
          Add Review
        </button> */}

        {/* {showReviewPopup && (
          <div className="popup-overlay">
            <div className="popup-card">
              <h3>Submit Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <label>Rating:</label>
                <div style={{ marginBottom: "10px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: "24px",
                        cursor: "pointer",
                        color: star <= formData.rating ? "#f59e0b" : "#cbd5f5",
                      }}
                      onClick={() => handleStarClick(star)}
                    >
                      *
                    </span>
                  ))}
                </div>
                <label>Review:</label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleReviewChange}
                />
                <div className="popup-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setShowReviewPopup(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )} */}

        {/* <div className="review-list">
          <h3>Reviews</h3>
          {reviews.map((rev) => (
            <div className="review-card" key={rev._id}>
              <div className="review-top">
                <img
                  src={`http://localhost:5000/uploads/${rev.src}`}
                  alt={rev.name}
                  className="review-avatar"
                />
                <div>
                  <strong>{rev.name}</strong>
                  <div className="review-stars">
                    {"*".repeat(rev.rating)}{"-".repeat(5 - rev.rating)}
                  </div>
                </div>
              </div>
              <p>{rev.review}</p>
            </div>
          ))}
        </div> */}

      </div>
    </MainLayout>
  );
};

export default AttendanceAndReviews;

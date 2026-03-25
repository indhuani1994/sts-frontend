import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";

const buildSparkline = (values, width = 240, height = 80) => {
  if (!values.length) return "";
  const max = 100;
  const min = 0;
  const stepX = values.length === 1 ? 0 : width / (values.length - 1);

  return values
    .map((value, index) => {
      const clamped = Math.max(min, Math.min(max, Number(value)));
      const x = index * stepX;
      const y = height - (clamped / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

const StudentMarksReport = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/marks");
        setMarks(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const grouped = useMemo(() => {
    return marks.reduce((acc, mark) => {
      const key = mark.courseName || "Course";
      if (!acc[key]) acc[key] = [];
      acc[key].push(mark);
      return acc;
    }, {});
  }, [marks]);

  const stats = useMemo(() => {
    const values = marks
      .map((m) => Number(m.testMark))
      .filter((val) => Number.isFinite(val));
    if (!values.length) {
      return { avg: 0, best: 0, worst: 0, count: 0 };
    }
    const total = values.reduce((acc, v) => acc + v, 0);
    return {
      avg: Math.round(total / values.length),
      best: Math.max(...values),
      worst: Math.min(...values),
      count: values.length,
    };
  }, [marks]);

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .student-report {
          --ink: #0f172a;
          --muted: rgba(15, 23, 42, 0.6);
          --accent: #0ea5a4;
          --accent-2: #2563eb;
          --surface: rgba(255, 255, 255, 0.88);
          --border: rgba(15, 23, 42, 0.12);
          min-height: 100vh;
          padding: 24px;
          border-radius: 24px;
          background:
            radial-gradient(900px 520px at 12% 0%, rgba(14, 116, 144, 0.12) 0%, transparent 55%),
            radial-gradient(700px 460px at 88% 10%, rgba(37, 99, 235, 0.12) 0%, transparent 55%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #ffffff 100%);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.05);
          font-family: 'Manrope', 'Segoe UI', sans-serif;
        }
        .student-header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: end;
          margin-bottom: 20px;
        }
        .student-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .student-subtitle {
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }
        .stats-card {
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
          padding: 12px 14px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }
        .stats-card span {
          display: block;
          font-size: 12px;
          color: var(--muted);
        }
        .stats-card strong {
          font-size: 18px;
          color: var(--ink);
        }
        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .course-card {
          background: var(--surface);
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 18px;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(12px);
        }
        .course-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: var(--ink);
        }
        .sparkline {
          width: 100%;
          height: 90px;
          background: linear-gradient(135deg, rgba(14, 116, 144, 0.12), rgba(37, 99, 235, 0.12));
          border-radius: 16px;
          padding: 8px;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .sparkline svg {
          width: 100%;
          height: 100%;
        }
        .mark-list {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }
        .mark-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
          padding: 12px;
          border-radius: 14px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.12);
        }
        .mark-row strong {
          display: block;
          font-size: 13px;
          color: var(--ink);
        }
        .mark-row span {
          font-size: 12px;
          color: var(--muted);
        }
        .mark-chip {
          background: rgba(14, 116, 144, 0.12);
          color: #0f766e;
          font-weight: 700;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
        }
        .history {
          margin-top: 8px;
          font-size: 12px;
          color: var(--muted);
        }
        .history details summary {
          cursor: pointer;
        }
        .empty {
          text-align: center;
          color: var(--muted);
          padding: 24px;
        }
        .chat-bubble {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.04);
          font-size: 12px;
          color: var(--muted);
        }
        @media (max-width: 720px) {
          .student-header {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="student-report">
        <div className="student-header">
          <div>
            <div className="student-title">Your Marks Report</div>
            <div className="student-subtitle">Track progress, trends, and history.</div>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading marks...</div>
        ) : marks.length === 0 ? (
          <div className="empty">No marks available yet.</div>
        ) : (
          <>
            <div className="stats-row">
              <div className="stats-card">
                <span>Average Score</span>
                <strong>{stats.avg} / 100</strong>
              </div>
              <div className="stats-card">
                <span>Best Score</span>
                <strong>{stats.best} / 100</strong>
              </div>
              <div className="stats-card">
                <span>Lowest Score</span>
                <strong>{stats.worst} / 100</strong>
              </div>
              <div className="stats-card">
                <span>Total Tests</span>
                <strong>{stats.count}</strong>
              </div>
            </div>

            <div className="course-grid">
              {Object.entries(grouped).map(([course, items]) => {
                const sorted = [...items].sort(
                  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                const values = sorted.map((m) => m.testMark);
                const points = buildSparkline(values);
                return (
                  <div className="course-card" key={course}>
                    <h3>{course}</h3>
                    <div className="sparkline">
                      <svg viewBox="0 0 240 80" preserveAspectRatio="none">
                        <polyline
                          points={points}
                          fill="none"
                          stroke="#0ea5a4"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="mark-list">
                      {sorted.map((mark) => (
                        <div className="mark-row" key={mark.id}>
                          <div>
                            <strong>{mark.syllabusName}</strong>
                            <span>{new Date(mark.date).toLocaleDateString()}</span>
                            <div className="chat-bubble">
                              <strong>Teacher Remark</strong>
                              {mark.teacherRemark || "No remarks yet."}
                            </div>
                            <div className="chat-bubble">
                              <strong>Syllabus</strong>
                              {mark.syllabusName || "Not specified"}
                            </div>
                            {mark.history && mark.history.length > 0 ? (
                              <details className="history">
                                <summary>History updates: {mark.history.length}</summary>
                                {mark.history.map((h, idx) => (
                                  <div key={`${mark.id}-${idx}`}>
                                    {new Date(h.updatedAt).toLocaleString()}: {h.previous?.testMark} to{" "}
                                    {h.next?.testMark}
                                  </div>
                                ))}
                              </details>
                            ) : null}
                          </div>
                          <div className="mark-chip">{mark.testMark} / 100</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentMarksReport;
      

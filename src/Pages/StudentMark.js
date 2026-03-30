import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";
import { resolveFileUrl } from "../API";

const emptyForm = {
  studentRegisterId: "",
  syllabusName: "",
  testMark: "",
  teacherRemark: "",
};

const StudentMark = () => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [legacyMode, setLegacyMode] = useState(false);
  const [writeDisabled, setWriteDisabled] = useState(false);
  const [filters, setFilters] = useState({ studentName: "", courseName: "", markRange: "" });

  const selectedStudent = useMemo(
    () => students.find((s) => s.studentRegisterId === form.studentRegisterId),
    [students, form.studentRegisterId]
  );
  const uniqueValues = (key) =>
    Array.from(new Set(marks.map((m) => m[key]).filter(Boolean))).sort();
  const filteredMarks = marks.filter((mark) => {
    if (filters.studentName && mark.studentName !== filters.studentName) return false;
    if (filters.courseName && mark.courseName !== filters.courseName) return false;
    if (filters.markRange) {
      const score = Number(mark.testMark);
      if (Number.isNaN(score)) return false;
      if (filters.markRange === "lt25" && !(score < 25)) return false;
      if (filters.markRange === "25-50" && !(score >= 25 && score < 50)) return false;
      if (filters.markRange === "50-75" && !(score >= 50 && score < 75)) return false;
      if (filters.markRange === "75-85" && !(score >= 75 && score < 85)) return false;
      if (filters.markRange === "85-100" && !(score >= 85 && score <= 100)) return false;
    }
    return true;
  });
  const filteredCount = filteredMarks.length;
  const averageMark = filteredCount
    ? Math.round(
        filteredMarks.reduce((sum, mark) => sum + (Number(mark.testMark) || 0), 0) / filteredCount
      )
    : 0;

  const fetchLegacyMarks = async (studentList) => {
    try {
      const requests = studentList.map((student) =>
        apiClient.get(`/api/student-marks/${student.studentRegisterId}`)
      );
      const responses = await Promise.all(requests);
      const flattened = responses.flatMap((res, idx) => {
        const student = studentList[idx];
        return (res.data || []).map((mark) => ({
          id: `${student.studentRegisterId}-${mark._id || mark.createdAt}`,
          date: mark.createdAt,
          updatedAt: mark.updatedAt || mark.createdAt,
          editableUntil: null,
          canEdit: false,
          canDelete: false,
          studentRegisterId: student.studentRegisterId,
          studentName: student.studentName,
          studentImage: student.studentImage,
          courseName: student.courseName,
          staffName: "Your report",
          syllabusName: mark.syllabusName,
          testMark: Number(mark.testMark),
          teacherRemark: "",
          history: [],
        }));
      });
      setMarks(flattened.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load marks in legacy mode");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const staffProfile = JSON.parse(localStorage.getItem("profile") || "{}");
      const studentRes = await apiClient.get("/api/my-students", {
        params: staffProfile?._id ? { staffId: staffProfile._id } : undefined,
      });
      const studentList = studentRes.data || [];
      setStudents(studentList);

      try {
        const marksRes = await apiClient.get("/api/marks");
        setMarks(marksRes.data || []);
        setLegacyMode(false);
      } catch (markErr) {
        if (markErr.response?.status === 404) {
          setLegacyMode(true);
          await fetchLegacyMarks(studentList);
        } else {
          throw markErr;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load marks data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isWithinWeek = (dateValue) => {
    if (!dateValue) return false;
    const createdAt = new Date(dateValue).getTime();
    const diff = Date.now() - createdAt;
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.studentRegisterId || !form.syllabusName || !form.testMark) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      try {
        await apiClient.post("/api/marks", {
          studentRegisterId: form.studentRegisterId,
          syllabusName: form.syllabusName,
          testMark: form.testMark,
          teacherRemark: form.teacherRemark,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          await apiClient.post("/api/add-mark", {
            studentRegisterId: form.studentRegisterId,
            syllabusName: form.syllabusName,
            testMark: form.testMark,
            teacherRemark: form.teacherRemark,
          });
          setLegacyMode(true);
        } else {
          throw err;
        }
      }
      setForm(emptyForm);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save mark");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (mark) => {
    setEditingId(mark.id);
    setEditValues({
      studentRegisterId: mark.studentRegisterId,
      syllabusName: mark.syllabusName || "",
      testMark: mark.testMark ?? "",
      teacherRemark: mark.teacherRemark || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(emptyForm);
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      if (legacyMode) {
        alert("Edit is unavailable until backend is updated.");
        return;
      }
      await apiClient.put(`/api/marks/${editingId}`, {
        syllabusName: editValues.syllabusName,
        testMark: editValues.testMark,
        teacherRemark: editValues.teacherRemark,
      });
      setEditingId(null);
      setEditValues(emptyForm);
      await fetchData();
    } catch (err) {
      if (err.response?.status === 404) {
        setWriteDisabled(true);
        alert("Edit is unavailable: backend routes are missing. Please update backend.");
        return;
      }
      alert(err.response?.data?.message || "Failed to update mark");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (markId) => {
    const confirmDelete = window.confirm("Delete this mark? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      setSaving(true);
      if (legacyMode) {
        alert("Delete is unavailable until backend is updated.");
        return;
      }
      await apiClient.delete(`/api/marks/${markId}`);
      await fetchData();
    } catch (err) {
      if (err.response?.status === 404) {
        setWriteDisabled(true);
        alert("Delete is unavailable: backend routes are missing. Please update backend.");
        return;
      }
      alert(err.response?.data?.message || "Failed to delete mark");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <style>{`
        .marks-shell {
          --ink: #0f172a;
          --muted: #64748b;
          --accent: #2563eb;
          --accent-2: #0ea5e9;
          --surface: rgba(255,255,255,0.75);
          --card: rgba(255,255,255,0.9);
          --shadow: 0 24px 50px rgba(15, 23, 42, 0.12);
          --border: rgba(148, 163, 184, 0.35);
          min-height: 100vh;
          background: radial-gradient(circle at top, #dbeafe 0%, #f8fafc 42%, #f1f5f9 100%);
          padding: 24px;
          border-radius: 24px;
        }
        .marks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .marks-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
        }
        .marks-subtitle {
          color: var(--muted);
          font-size: 14px;
          margin-top: 4px;
        }
        .marks-grid {
          display: grid;
          grid-template-columns: minmax(260px, 360px) 1fr;
          gap: 24px;
        }
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(14px);
          box-shadow: var(--shadow);
        }
        .panel h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: var(--ink);
        }
        .student-card {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }
        .student-card img {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.15);
        }
        .student-meta h4 {
          margin: 0;
          font-size: 16px;
          color: var(--ink);
        }
        .student-meta p {
          margin: 2px 0 0 0;
          font-size: 13px;
          color: var(--muted);
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .form-field label {
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .form-field input,
        .form-field textarea,
        .form-field select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          font-size: 14px;
          background: #fff;
          color: var(--ink);
        }
        .form-field textarea {
          min-height: 80px;
          resize: vertical;
        }
        .input-field {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--border);
          font-size: 13px;
          background: #fff;
          color: var(--ink);
        }
        .primary-btn {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 16px 30px rgba(37, 99, 235, 0.25);
        }
        .primary-btn:hover {
          transform: translateY(-1px);
        }
        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .filters select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          font-size: 13px;
          color: var(--ink);
        }
        .mark-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
        }
        .mark-table thead th {
          text-align: left;
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0 12px 6px;
        }
        .mark-table tbody tr {
          background: var(--card);
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          transition: transform 0.2s ease;
        }
        .mark-table tbody tr:hover {
          transform: translateY(-2px);
        }
        .mark-table tbody td {
          padding: 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        .mark-table tbody td:first-child {
          border-left: 1px solid rgba(148, 163, 184, 0.2);
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }
        .mark-table tbody td:last-child {
          border-right: 1px solid rgba(148, 163, 184, 0.2);
          border-top-right-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        .table-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .mark-table tbody tr:hover .table-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .ghost-btn {
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #fff;
          color: var(--ink);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
        }
        .ghost-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .mark-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.1);
          color: #1e3a8a;
          font-size: 12px;
          font-weight: 600;
        }
        .mark-muted {
          color: var(--muted);
          font-size: 12px;
        }
        .empty-state {
          padding: 24px;
          text-align: center;
          color: var(--muted);
        }
        @media (max-width: 900px) {
          .marks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="marks-shell">
        <div className="marks-header">
          <div>
            <div className="marks-title">Staff Marks Studio</div>
            <div className="marks-subtitle">Add, update, and track marks for your assigned students.</div>
          </div>
        </div>

        {error ? <div className="empty-state">{error}</div> : null}
        {legacyMode ? (
          <div className="empty-state">
            Legacy API detected. Edit/Delete are disabled until backend is updated.
          </div>
        ) : null}
        {writeDisabled ? (
          <div className="empty-state">
            Edit/Delete are disabled because the backend does not expose /api/marks/:id.
          </div>
        ) : null}

        <div className="marks-grid">
          <section className="panel">
            <h3>New Mark Entry</h3>
            <div className="form-field">
              <label>Student Name</label>
              <select
                value={form.studentRegisterId}
                onChange={(e) => handleChange("studentRegisterId", e.target.value)}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.studentRegisterId} value={student.studentRegisterId}>
                    {student.studentName} - {student.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Student Course</label>
              <input value={selectedStudent?.courseName || ""} disabled />
            </div>

            <div className="student-card">
              <img
                src={
                  selectedStudent?.studentImage
                    ? resolveFileUrl(selectedStudent.studentImage)
                    : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                }
                alt={selectedStudent?.studentName || "student"}
              />
              <div className="student-meta">
                <h4>{selectedStudent?.studentName || "Student image"}</h4>
                <p>Selected student image preview</p>
              </div>
            </div>

            <div className="form-field">
              <label>Student Mark</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.testMark}
                onChange={(e) => handleChange("testMark", e.target.value)}
                placeholder="Enter mark (0-100)"
              />
            </div>

            

            <div className="form-field">
              <label>Syllabus Of The Test</label>
              <input
                value={form.syllabusName}
                onChange={(e) => handleChange("syllabusName", e.target.value)}
                placeholder="Enter syllabus or topic"
              />
            </div>

            <div className="form-field">
              <label>Teacher Remark</label>
              <textarea
                value={form.teacherRemark}
                onChange={(e) => handleChange("teacherRemark", e.target.value)}
                placeholder="Add teacher remark"
              />
            </div>

            <button className="primary-btn" onClick={handleCreate} disabled={saving}>
              {saving ? "Saving..." : "Save Mark"}
            </button>
          </section>

          <section className="panel">
            <h3>Your Recent Marks</h3>
            {loading ? (
              <div className="empty-state">Loading marks...</div>
            ) : marks.length === 0 ? (
              <div className="empty-state">No marks added yet.</div>
            ) : (
              <>
                <div className="mark-muted" style={{ marginBottom: 8 }}>
                  Average Mark: {averageMark}% | Count: {filteredCount}
                </div>
                <div className="filters">
                  <select
                    value={filters.studentName}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, studentName: e.target.value }))
                    }
                  >
                    <option value="">Filter by student</option>
                    {uniqueValues("studentName").map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.courseName}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, courseName: e.target.value }))
                    }
                  >
                    <option value="">Filter by course</option>
                    {uniqueValues("courseName").map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.markRange}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, markRange: e.target.value }))
                    }
                  >
                    <option value="">Filter by mark range</option>
                    <option value="lt25">Below 25</option>
                    <option value="25-50">25 to 50</option>
                    <option value="50-75">50 to 75</option>
                    <option value="75-85">75 to 85</option>
                    <option value="85-100">85 to 100</option>
                  </select>
                </div>

                {filteredMarks.length === 0 ? (
                  <div className="empty-state">No marks match the selected filters.</div>
                ) : (
                  <table className="mark-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Syllabus</th>
                        <th>Mark</th>
                        <th>Teacher Remark</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMarks.map((mark) => {
                        const editable =
                          typeof mark.canEdit === "boolean" ? mark.canEdit : isWithinWeek(mark.date);
                        const isEditing = editingId === mark.id;
                        return (
                          <tr key={mark.id}>
                            <td>
                              <div className="student-card" style={{ marginBottom: 0 }}>
                                <img
                                  src={
                                    mark.studentImage
                                      ? resolveFileUrl(mark.studentImage)
                                      : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop"
                                  }
                                  alt={mark.studentName}
                                />
                                <div className="student-meta">
                                  <h4>{mark.studentName}</h4>
                                </div>
                              </div>
                            </td>
                            <td>{mark.courseName}</td>
                            <td>
                              {isEditing ? (
                                <input
                                  value={editValues.syllabusName}
                                  onChange={(e) =>
                                    handleEditChange("syllabusName", e.target.value)
                                  }
                                  className="input-field"
                                />
                              ) : (
                                mark.syllabusName
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editValues.testMark}
                                  onChange={(e) => handleEditChange("testMark", e.target.value)}
                                  className="input-field"
                                />
                              ) : (
                                <span className="mark-chip">{mark.testMark} / 100</span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  value={editValues.teacherRemark}
                                  onChange={(e) =>
                                    handleEditChange("teacherRemark", e.target.value)
                                  }
                                  className="input-field"
                                />
                              ) : (
                                mark.teacherRemark || "-"
                              )}
                            </td>
                            <td className="mark-muted">
                              {new Date(mark.date).toLocaleDateString()}
                            </td>
                            <td>
                              {isEditing ? (
                                <div className="table-actions" style={{ opacity: 1, transform: "none" }}>
                                  <button className="ghost-btn" onClick={cancelEdit}>
                                    Cancel
                                  </button>
                                  <button className="ghost-btn" onClick={saveEdit} disabled={saving}>
                                    {saving ? "Saving..." : "Update"}
                                  </button>
                                </div>
                              ) : editable ? (
                                <div className="table-actions">
                                  <button className="ghost-btn" onClick={() => startEdit(mark)}>
                                    Edit
                                  </button>
                                  <button className="ghost-btn" onClick={() => handleDelete(mark.id)}>
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <span className="mark-muted">Locked</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentMark;

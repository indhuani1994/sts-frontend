import React, { useEffect, useState } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";
import { resolveFileUrl } from "../API";
import { confirmBox } from "../Components/ConfirmBox/ConfirmBox";

const AdminMark = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    syllabusName: "",
    testMark: "",
    teacherRemark: "",
  });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    studentName: "",
    courseName: "",
    staffName: "",
    markRange: "",
  });

  
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [writeDisabled, setWriteDisabled] = useState(false);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/api/marks");
        setMarks(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          const legacy = await apiClient.get("/api/all-marks");
          const mapped = (legacy.data || []).map((m) => ({
            id: m.id || m._id,
            date: m.date || m.createdAt,
            updatedAt: m.updatedAt || m.createdAt,
            editableUntil: null,
            canEdit: true,
            canDelete: true,
            studentRegisterId: m.studentRegisterId,
            studentName: m.studentName,
            studentImage: m.studentImage || "",
            courseName: m.courseName,
            staffName: m.staffName || "N/A",
            syllabusName: m.syllabusName,
            testMark: Number(m.testMark),
            teacherRemark: m.teacherRemark || "",
            history: m.history || [],
          }));
          setMarks(mapped);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  const startEdit = (mark) => {
    setEditingId(mark.id);
    setEditValues({
      syllabusName: mark.syllabusName || "",
      testMark: mark.testMark ?? "",
      teacherRemark: mark.teacherRemark || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ syllabusName: "", testMark: "", teacherRemark: "" });
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/api/marks/${editingId}`, editValues);
      await fetchMarks();
      cancelEdit();
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
    const confirmDelete =( await confirmBox("Delete this mark? This cannot be undone.")).isConfirmed;
    if (!confirmDelete) return;
    try {
      setSaving(true);
      await apiClient.delete(`/api/marks/${markId}`);
      await fetchMarks();
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

  const toggleSelection = (markId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(markId)) {
        next.delete(markId);
      } else {
        next.add(markId);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleSelectAll = (ids) => {
    setSelectedIds(new Set(ids));
  };

  const handleBulkDelete = async (ids) => {
    if (ids.length === 0) return;
    const confirmDelete = window.confirm(`Delete ${ids.length} marks? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      setSaving(true);
      await Promise.all(ids.map((id) => apiClient.delete(`/api/marks/${id}`)));
      clearSelection();
      await fetchMarks();
    } catch (err) {
      if (err.response?.status === 404) {
        setWriteDisabled(true);
        alert("Delete is unavailable: backend routes are missing. Please update backend.");
        return;
      }
      alert(err.response?.data?.message || "Failed to delete selected marks");
    } finally {
      setSaving(false);
    }
  };

  const uniqueValues = (key) =>
    Array.from(new Set(marks.map((m) => m[key]).filter(Boolean))).sort();

  const filteredMarks = marks.filter((mark) => {
    if (filters.studentName && mark.studentName !== filters.studentName) return false;
    if (filters.courseName && mark.courseName !== filters.courseName) return false;
    if (filters.staffName && mark.staffName !== filters.staffName) return false;
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

  return (
    <MainLayout>
      <style>{`
        .admin-marks {
          --ink: #0f172a;
          --muted: #64748b;
          --accent: #0f766e;
          --accent-2: #14b8a6;
          --surface: rgba(255,255,255,0.88);
          --border: rgba(148, 163, 184, 0.35);
          min-height: 100vh;
          padding: 24px;
          border-radius: 24px;
          background:
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 50%),
            radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 50%),
            #f8fafc;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
        }
        .admin-title {
          font-size: 30px;
          font-weight: 700;
          color: var(--ink);
        }
        .admin-subtitle {
          color: var(--muted);
          font-size: 14px;
          margin-top: 6px;
        }
        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .filters select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          font-size: 13px;
          color: var(--ink);
        }
        .bulk-actions {
          display: flex;
          gap: 10px;
          margin: 16px 0;
          flex-wrap: wrap;
        }
        .bulk-btn {
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #fff;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
        }
        .marks-board {
          display: grid;
          gap: 16px;
        }
        .mark-row {
          display: grid;
          grid-template-columns: 40px 72px 1.4fr 1fr 1fr 0.8fr 1fr 1fr;
          gap: 12px;
          align-items: center;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease;
        }
        .mark-row:hover {
          transform: translateY(-2px);
        }
        .mark-row:hover .row-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .row-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .action-btn {
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #fff;
          color: var(--ink);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
        }
        .student-avatar {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          object-fit: cover;
          border: 2px solid #fff;
        }
        .select-box {
          display: flex;
          justify-content: center;
        }
        .select-box input {
          width: 16px;
          height: 16px;
        }
        .cell-title {
          font-size: 13px;
          color: var(--muted);
        }
        .cell-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .cell-muted {
          color: var(--muted);
          font-size: 12px;
          margin-top: 4px;
        }
        .mark-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(15, 118, 110, 0.12);
          color: #0f766e;
          font-size: 12px;
          font-weight: 700;
        }
        .history {
          grid-column: 1 / -1;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px dashed rgba(148, 163, 184, 0.35);
        }
        .history summary {
          cursor: pointer;
          color: var(--muted);
          font-size: 12px;
        }
        .history-item {
          font-size: 12px;
          color: var(--ink);
          margin-top: 8px;
        }
        .edit-grid {
          grid-column: 2 / -1;
          display: grid;
          grid-template-columns: repeat(3, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
        .edit-grid input,
        .edit-grid textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 8px 10px;
          font-size: 13px;
        }
        .edit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }
        @media (max-width: 1200px) {
          .mark-row {
            grid-template-columns: 40px 72px 1fr 1fr;
          }
        }
      `}</style>

      <div className="admin-marks">
        <div className="admin-header">
          <div>
            <div className="admin-title">Admin Marks Command Center</div>
            <div className="admin-subtitle">
              View every mark, teacher report, and student performance at a glance.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="cell-muted">Loading marks...</div>
        ) : error ? (
          <div className="cell-muted">{error}</div>
        ) : marks.length === 0 ? (
          <div className="cell-muted">No marks recorded yet.</div>
        ) : (
          <div className="marks-board">
            {writeDisabled ? (
              <div className="cell-muted">
                Edit/Delete are disabled because the backend does not expose /api/marks/:id.
              </div>
            ) : null}
            <div className="cell-muted">
              Average Mark: {averageMark}% | Count: {filteredCount}
            </div>
            <div className="filters">
              <select
                value={filters.studentName}
                onChange={(e) => setFilters((prev) => ({ ...prev, studentName: e.target.value }))}
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
                onChange={(e) => setFilters((prev) => ({ ...prev, courseName: e.target.value }))}
              >
                <option value="">Filter by course</option>
                {uniqueValues("courseName").map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={filters.staffName}
                onChange={(e) => setFilters((prev) => ({ ...prev, staffName: e.target.value }))}
              >
                <option value="">Filter by staff</option>
                {uniqueValues("staffName").map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={filters.markRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, markRange: e.target.value }))}
              >
                <option value="">Filter by mark range</option>
                <option value="lt25">Below 25</option>
                <option value="25-50">25 to 50</option>
                <option value="50-75">50 to 75</option>
                <option value="75-85">75 to 85</option>
                <option value="85-100">85 to 100</option>
              </select>
            </div>

            <div className="">
              <button
                className="bulk-btn"
                onClick={() => handleSelectAll(filteredMarks.map((m) => m.id))}
              >
                Select All
              </button>
              <button className="bulk-btn" onClick={clearSelection}>
                Clear Selection
              </button>
              <button
                className="bulk-btn"
                disabled={selectedIds.size === 0 || saving}
                onClick={() => handleBulkDelete(Array.from(selectedIds))}
              >
                Delete Selected
              </button>
              <button
                onClick={() =>
                  setFilters({
                    studentName: "",
                    courseName: "",
                    staffName: "",
                    markRange: "",
                  })
                }
                className="bulk-btn"
              >
                Reset
              </button>
            </div>

            {filteredMarks.length === 0 ? (
              <div className="cell-muted">No results match the selected filters.</div>
            ) : null}
            {filteredMarks.map((mark) => {
              const isEditing = editingId === mark.id;
              return (
                <div className="mark-row" key={mark.id}>
                  <div className="select-box">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(mark.id)}
                      onChange={() => toggleSelection(mark.id)}
                    />
                  </div>
                  <img
                    className="student-avatar"
                    src={
                      mark.studentImage
                        ? resolveFileUrl(mark.studentImage)
                        : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop"
                    }
                    alt={mark.studentName}
                  />

                  <div>
                    <div className="cell-title">Student Name</div>
                    <div className="cell-value">{mark.studentName}</div>
                    <div className="cell-muted">{mark.courseName}</div>
                  </div>

                  <div>
                    <div className="cell-title">Teacher</div>
                    <div className="cell-value">{mark.staffName}</div>
                    <div className="cell-muted">
                      {new Date(mark.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="cell-title">Syllabus</div>
                    <div className="cell-value">{mark.syllabusName}</div>
                  </div>

                  <div>
                    <div className="cell-title">Mark</div>
                    <div className="mark-chip">{mark.testMark} / 100</div>
                  </div>

                  <div>
                    <div className="cell-title">Teacher Remark</div>
                    <div className="cell-value">{mark.teacherRemark || "-"}</div>
                  </div>

                  <div className="row-actions">
                    <button className="action-btn" onClick={() => startEdit(mark)}>
                      Edit
                    </button>
                    <button className="action-btn" onClick={() => handleDelete(mark.id)}>
                      Delete
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="edit-grid">
                      <input
                        value={editValues.syllabusName}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, syllabusName: e.target.value }))
                        }
                        placeholder="Syllabus"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editValues.testMark}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, testMark: e.target.value }))
                        }
                        placeholder="Mark"
                      />
                      <textarea
                        value={editValues.teacherRemark}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, teacherRemark: e.target.value }))
                        }
                        placeholder="Teacher remark"
                      />
                      <div className="edit-actions">
                        <button className="action-btn" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button className="action-btn" onClick={saveEdit} disabled={saving}>
                          {saving ? "Saving..." : "Update"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {mark.history && mark.history.length > 0 ? (
                    <details className="history">
                      <summary>History ({mark.history.length})</summary>
                      {mark.history.map((h, idx) => (
                        <div className="history-item" key={`${mark.id}-${idx}`}>
                          {new Date(h.updatedAt).toLocaleString()}: {h.previous?.testMark} to{" "}
                          {h.next?.testMark}
                        </div>
                      ))}
                    </details>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminMark;

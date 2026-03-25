import React, { useEffect, useMemo, useState } from "react";
import CourseCard from "../../Components/CourseCard/CourseCard";
import { cusToast } from "../../Components/Toast/CusToast";
import MainLayout from "../../MainLayout.js/MainLayout";
import apiClient from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import "../../Pages/Management.css";
import { useRef } from "react";

const initialForm = {
  courseCode: "",
  courseName: "",
  fees: "",
  duration: "",
  prerequire: "",
  syllabus: [""],
  drivelink: ""
};

// --- MOVED OUTSIDE TO PREVENT RE-RENDERING FOCUS ISSUES ---
const PageContent = ({
  isStaff, isStudent, courses, open, setOpen, form, setForm,
  editId, setEditId, dragIndex, setDragIndex, fetchCourses,
  handleSubmit, handleEdit, handleSyllabusChange, handleAddSyllabus,
  handleRemoveSyllabus, moveSyllabus, handleKeyDown, inputRefs
}) => {
  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .coursepage { background: #fff; margin-bottom: 10px; padding: 20px; box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08); border-radius: 5px; font-family: 'Manrope', sans-serif; }
        .syllabus-card { background: #fff; border-radius: 18px; border: 1px solid rgba(15, 23, 42, 0.1); padding: 16px; margin-bottom: 15px; }
        .syllabus-card h3 { margin: 0 0 10px 0; font-size: 16px; color: #0f172a; }
        .syllabus-card ul { margin: 0; padding-left: 18px; font-size: 13px; }
        .mgmt-badge { background: rgba(14, 116, 144, 0.12); color: #0f766e; border: 1px solid rgba(14, 116, 144, 0.2); padding: 6px 12px; border-radius: 999px; font-weight: 700; }
        .syllabus-editor { display: grid; gap: 10px; margin-top: 8px; }
        .syllabus-row { display: grid; grid-template-columns: 26px 1fr 30px; gap: 10px; align-items: center; padding: 8px; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 10px; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
        .syllabus-row.dragging { opacity: 0.6; background: #eef2ff; }
        .syllabus-row:focus-within { border-color: rgba(14, 116, 144, 0.45); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12); transform: translateY(-1px); }
        .drag-handle { cursor: grab; color: #0f766e; font-weight: 800; font-size: 14px; text-align: center; user-select: none; border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 6px; background: #fff; height: 26px; line-height: 24px; }
        .syllabus-remove { background: #fff; border: 1px solid rgba(15, 23, 42, 0.2); color: #b91c1c; border-radius: 6px; cursor: pointer; height: 28px; width: 28px; font-weight: 700; }
        .syllabus-input-field { background: #fff; border: 1px solid rgba(15, 23, 42, 0.12); padding: 9px 10px; border-radius: 8px; outline: none; font-size: 13px; transition: border-color 140ms ease, box-shadow 140ms ease; }
        .syllabus-input-field:focus { border-color: rgba(14, 116, 144, 0.6); box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.12); }
        .syllabus-tip { font-size: 12px; color: #0f766e; font-weight: 600; margin: 8px 0 0 0; }
        .syllabus-row{
  display:grid;
  grid-template-columns:28px 1fr 32px;
}

@media (max-width:600px){
  .syllabus-row{
    grid-template-columns:20px 1fr 28px;
  }

  .syllabus-input-field{
    font-size:14px;
  }
      }
      `}</style>

      <div className="container mgmt-page coursepage">
        <div className="mgmt-header">
          <h1 className="mgmt-title">{isStaff ? "Assigned Course Syllabus" : "Syllabus"}</h1>
          <div className="mgmt-actions">
            <span className="mgmt-badge">{isStaff ? "Edit syllabus only" : "My syllabus"}</span>
          </div>
        </div>

        {isStudent && (
          <div className="mgmt-grid">
            {courses.map((course) => (
              <div key={course._id} className="syllabus-card">
                <h3>{course.courseName}</h3>
                <ul>{course.syllabus?.map((item, index) => <li key={index}>{item}</li>)}</ul>
                <p><a href={course.drivelink} target="_blank" rel="noreferrer">Drive Link</a></p>
              </div>
            ))}
          </div>
        )}

        {isStaff && (
          <div className="mgmt-grid">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} onEdit={handleEdit} showDelete={false} showEdit={true} showCopy={false} />
            ))}
          </div>
        )}

        {isStaff && open && (
          <div className="popup">
            <div className="popup-content student-form">
              <div className="dialog-header">
                <h3>Edit Syllabus</h3>
                <button className="dialog-close" onClick={() => setOpen(false)}>X</button>
              </div>
              <div className="dialog-section">
                <label>Drive Link</label>
                <input
                style={{padding: "20px"}}
                  className="syllabus-input-field"
                  placeholder="Paste Google Drive Link here..."
                  value={form.drivelink}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, drivelink: e.target.value }))
                  }
                />
                <div className="syllabus-editor">
                  {form.syllabus.map((item, index) => (
                    <div
                      key={index}
                      className={`syllabus-row ${dragIndex === index ? "dragging" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                      onDrop={(e) => { e.preventDefault(); moveSyllabus(dragIndex, index); setDragIndex(null); }}
                    >
                      <div
                        className="drag-handle"
                        draggable
                        onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragIndex(index); }}
                      >||</div>
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="syllabus-input-field"
                        value={item}
                        onChange={(e) => handleSyllabusChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder={`Syllabus Topic ${index + 1}`}
                      />
                      <button className="syllabus-remove" onClick={() => handleRemoveSyllabus(index)}>X</button>
                    </div>
                  ))}
                </div>
                <p className="syllabus-tip">Press Enter to add a new topic.</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button className="mgmt-btn" onClick={handleSubmit}>Update Syllabus</button>
                <button className="mgmt-btn secondary" onClick={() => setOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function StaffCoursePage() {
  const { role, user } = useAuth();
  const effectiveRole = role || user?.role;
  const isStaff = useMemo(() => effectiveRole === "staff", [effectiveRole]);
  const isStudent = useMemo(() => effectiveRole === "student", [effectiveRole]);
  const inputRefs = useRef([]);

  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get("/api/courses/assigned");
      setCourses(res.data || []);
    } catch (error) { cusToast("Can't fetch assigned courses", "error"); }
  };

  const handleSubmit = async () => {
    try {
      await apiClient.patch(`/api/courses/${editId}/syllabus`, {
        syllabus: form.syllabus.filter((item) => item.trim() !== ""),
        drivelink: form.drivelink
      });
      fetchCourses();
      setOpen(false);
      cusToast("Syllabus updated successfully");
    } catch (error) { cusToast("Failed to update syllabus", "error"); }
  };

  const handleEdit = (course) => {
    setForm({
      ...initialForm,
      syllabus: course.syllabus?.length ? [...course.syllabus] : [""],
      drivelink: course.drivelink || ""
    });
    setEditId(course._id);
    setOpen(true);
  };

  const handleSyllabusChange = (index, value) => {
    const newSyllabus = [...form.syllabus];
    newSyllabus[index] = value;
    setForm(prev => ({ ...prev, syllabus: newSyllabus }));
  };

  const handleAddSyllabus = () => {
    setForm(prev => {
      const updated = [...prev.syllabus, ""];
      return { ...prev, syllabus: updated };
    });

    setTimeout(() => {
      const index = form.syllabus.length;
      inputRefs.current[index]?.focus();
    }, 0);
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();

      setForm(prev => {
        const updated = [...prev.syllabus];
        updated.splice(index + 1, 0, "");
        return { ...prev, syllabus: updated };
      });

      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleRemoveSyllabus = (index) => {
    if (form.syllabus.length <= 1) return;
    const next = [...form.syllabus];
    next.splice(index, 1);
    setForm(prev => ({ ...prev, syllabus: next }));
  };

  const moveSyllabus = (from, to) => {
    if (from === to || from == null) return;
    const next = [...form.syllabus];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setForm(prev => ({ ...prev, syllabus: next }));
  };

  // Logic to determine what to render
  const content = (
    <PageContent
      isStaff={isStaff}
      isStudent={isStudent}
      courses={courses}
      open={open}
      setOpen={setOpen}
      form={form}
      setForm={setForm}
      editId={editId}
      setEditId={setEditId}
      dragIndex={dragIndex}
      setDragIndex={setDragIndex}
      fetchCourses={fetchCourses}
      handleSubmit={handleSubmit}
      handleEdit={handleEdit}
      handleSyllabusChange={handleSyllabusChange}
      handleAddSyllabus={handleAddSyllabus}
      handleRemoveSyllabus={handleRemoveSyllabus}
      moveSyllabus={moveSyllabus}
      inputRefs={inputRefs}
      handleKeyDown={handleKeyDown}
    />
  );

  return isStaff ? <MainLayout>{content}</MainLayout> : content;
}

export default StaffCoursePage;

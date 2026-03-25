import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { cusToast } from '../../Components/Toast/CusToast';
import './AssignmentDashboard.css';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';

const AssignmentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [editRow, setEditRow] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [staffByCourse, setStaffByCourse] = useState({});

  useEffect(() => {
    loadLists();
    loadAssignments();
  }, []);

  const loadLists = async () => {
    try {
      const [studentRes, staffRes, courseRes] = await Promise.all([
        apiClient.get('/api/students'),
        apiClient.get('/api/staffs'),
        apiClient.get('/api/courses'),
      ]);
      setStudents(studentRes.data || []);
      setStaffs(staffRes.data || []);
      setCourses(courseRes.data || []);
    } catch (error) {
      cusToast('Failed to load lists', 'error');
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await apiClient.get('/api/stureg', { params: { paginated: true, page: 1, limit: 20 } });
      setAssignments(res.data?.data || []);
    } catch (error) {
      cusToast('Failed to load assignments', 'error');
    }
  };

  const filteredCourses = useMemo(() => {
    const term = courseSearch.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) =>
      [course.courseName, course.courseCode].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [courses, courseSearch]);

  const filteredStaffs = useMemo(() => {
    const term = staffSearch.trim().toLowerCase();
    if (!term) return staffs;
    return staffs.filter((staff) =>
      [staff.staffName, staff.staffMail, staff.staffMobile].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [staffs, staffSearch]);

  const toggleCourse = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        const next = prev.filter((id) => id !== courseId);
        const nextStaffMap = { ...staffByCourse };
        delete nextStaffMap[courseId];
        setStaffByCourse(nextStaffMap);
        return next;
      }
      return [...prev, courseId];
    });
  };

  const toggleStaffForCourse = (courseId, staffId) => {
    setStaffByCourse((prev) => {
      const current = prev[courseId] || [];
      const next = current.includes(staffId)
        ? current.filter((id) => id !== staffId)
        : [...current, staffId];
      return { ...prev, [courseId]: next };
    });
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      cusToast('Select a student', 'error');
      return;
    }
    if (!selectedCourses.length) {
      cusToast('Select at least one course', 'error');
      return;
    }

    const payload = [];
    selectedCourses.forEach((courseId) => {
      const staffIds = staffByCourse[courseId] || [];
      if (!staffIds.length) {
        return;
      }
      staffIds.forEach((staffId) => {
        const course = courses.find((c) => c._id === courseId);
        payload.push({
          studentId: selectedStudent,
          courseId,
          staffId,
          courseFees: course?.fees || 0,
        });
      });
    });

    if (!payload.length) {
      cusToast('Select staff for each course', 'error');
      return;
    }

    try {
      await apiClient.post('/api/stureg/bulk', { items: payload });
      cusToast('Assignments saved');
      setSelectedCourses([]);
      setStaffByCourse({});
      loadAssignments();
    } catch (error) {
      cusToast(error.response?.data?.message || 'Failed to save assignments', 'error');
    }
  };

  const handleDelete = async (id) => {
       const isConfirm =  (await confirmBox("do you want to delete this assignment?")).isConfirmed;
    if (!isConfirm) return;
    try {
      await apiClient.delete(`/api/stureg/${id}`);
      cusToast('Assignment deleted');
      loadAssignments();
    } catch (error) {
      cusToast('Failed to delete assignment', 'error');
    }
  };

  const handleEditSave = async () => {
    if (!editRow?.studentId || !editRow?.courseId || !editRow?.staffId) {
      cusToast('Select student, course and staff', 'error');
      return;
    }
    try {
      await apiClient.put(`/api/stureg/${editRow.id}`, {
        studentId: editRow.studentId,
        courseId: editRow.courseId,
        staffId: editRow.staffId,
      });
      cusToast('Assignment updated');
      setEditRow(null);
      loadAssignments();
    } catch (error) {
      cusToast('Failed to update assignment', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="assign-page">
        <div className="assign-header">
          <h1>Assignment Dashboard</h1>
          <div className="assign-actions">
            <button className="assign-btn secondary" onClick={loadAssignments}>
              Refresh
            </button>
            <button className="assign-btn" onClick={handleSubmit}>
              Save Assignments
            </button>
          </div>
        </div>

        <div className="assign-grid">
          <div className="assign-card full">
            <div className="assign-hero">
              <div>
                <strong>Assign students to courses & staff</strong>
                <p>Pick a student, choose courses, then map staff per course.</p>
              </div>
              <div className="assign-chips">
                <span className="assign-chip">{students.length} Students</span>
                <span className="assign-chip">{courses.length} Courses</span>
                <span className="assign-chip">{staffs.length} Staff</span>
              </div>
            </div>
          </div>

          <div className="assign-card large">
            <label className="assign-label">Select Student</label>
            <select
              className="assign-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Choose student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.studentName} ({student.studentMobile})
                </option>
              ))}
            </select>

            <label className="assign-label">Select Courses</label>
            <input
              className="assign-input"
              placeholder="Search courses"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
            <div className="assign-list">
              {filteredCourses.map((course) => (
                <label className="assign-item" key={course._id}>
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => toggleCourse(course._id)}
                  />
                  {course.courseName} ({course.courseCode})
                </label>
              ))}
            </div>
          </div>

          <div className="assign-card medium">
            <label className="assign-label">Assign Staff Per Course</label>
            <input
              className="assign-input"
              placeholder="Search staff"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
            />

            {selectedCourses.length === 0 && (
              <div className="assign-item">Select courses to assign staff.</div>
            )}

            {selectedCourses.map((courseId) => {
              const course = courses.find((c) => c._id === courseId);
              return (
                <div key={courseId} className="assign-course-block">
                  <div className="assign-course-header">{course?.courseName || 'Course'}</div>
                  <div className="assign-list">
                    {filteredStaffs.map((staff) => (
                      <label className="assign-item" key={staff._id}>
                        <input
                          type="checkbox"
                          checked={(staffByCourse[courseId] || []).includes(staff._id)}
                          onChange={() => toggleStaffForCourse(courseId, staff._id)}
                        />
                        {staff.staffName} ({staff.staffRole})
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="assign-card full">
          <label className="assign-label">Recent Assignments</label>
          <table className="assign-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Staff</th>
                <th>Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((row) => (
                <tr key={row._id}>
                  <td>{row.student?.studentName}</td>
                  <td>{row.course?.courseName}</td>
                  <td>{row.staff?.staffName}</td>
                  <td>{row.courseFees}</td>
                  <td>
                    <div className="assign-actions">
                      <button
                        className="assign-btn secondary"
                        type="button"
                        onClick={() =>
                          setEditRow({
                            id: row._id,
                            studentId: row.student?._id || '',
                            courseId: row.course?._id || '',
                            staffId: row.staff?._id || '',
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="assign-btn danger"
                        type="button"
                        onClick={() => handleDelete(row._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="5">No assignments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editRow && (
        <div className="assign-modal">
          <div className="assign-modal-card">
            <div className="assign-modal-header">
              <div>
                <strong>Edit Assignment</strong>
                <p>Update the student, course, and staff mapping.</p>
              </div>
              <button className="assign-close" type="button" onClick={() => setEditRow(null)}>
                X
              </button>
            </div>

            <div className="assign-edit-grid">
              <div className="assign-field">
                <label className="assign-label">Student</label>
                <select
                  className="assign-select"
                  value={editRow.studentId}
                  onChange={(e) => setEditRow({ ...editRow, studentId: e.target.value })}
                >
                  <option value="">Choose student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.studentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="assign-field">
                <label className="assign-label">Course</label>
                <select
                  className="assign-select"
                  value={editRow.courseId}
                  onChange={(e) => setEditRow({ ...editRow, courseId: e.target.value })}
                >
                  <option value="">Choose course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="assign-field">
                <label className="assign-label">Staff</label>
                <select
                  className="assign-select"
                  value={editRow.staffId}
                  onChange={(e) => setEditRow({ ...editRow, staffId: e.target.value })}
                >
                  <option value="">Choose staff</option>
                  {staffs.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.staffName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="assign-actions">
              <button className="assign-btn secondary" type="button" onClick={() => setEditRow(null)}>
                Cancel
              </button>
              <button className="assign-btn" type="button" onClick={handleEditSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AssignmentDashboard;

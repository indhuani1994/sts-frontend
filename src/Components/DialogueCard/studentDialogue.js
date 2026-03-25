import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';

function StudentDialogue({ popup, setOpen, handleEditOrAdd, isEditing, form, setForm, setEditId }) {
  const [errors, setErrors] = useState({});
  const [coursesName, setCoursesName] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/api/courses');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const courseNames = list.map((course) => course.courseName).filter(Boolean);
      setCoursesName(courseNames);
    } catch (error) {
      console.error(error);
    }
  };

  const validate = () => {
    const temp = {};
    temp.studentName = form.studentName.trim() ? '' : 'Student Name is required';
    temp.studentMobile = /^[6-9]{1}[0-9]{9}$/.test(form.studentMobile)
      ? ''
      : 'Valid Mobile Number is required';

    setErrors(temp);
    return Object.values(temp).every((x) => x === '');
  };

  const handleSubmit = () => {
    if (validate()) handleEditOrAdd();
  };

  const handleArrayChange = (name, index, value) => {
    const updatedArray = [...form[name]];
    updatedArray[index] = value;
    setForm({ ...form, [name]: updatedArray });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const removeField = (whichField, whichOne) => {
    const updated = [...form[whichField]];
    updated.splice(whichOne, 1);
    setForm({ ...form, [whichField]: updated });
  };

  const addField = (whichField) => {
    setForm({ ...form, [whichField]: [...form[whichField], ''] });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, studentImage: e.target.files[0] });
  };

  const handleAadharChange = (e) => {
    setForm({ ...form, studentAadharImage: e.target.files[0] });
  };

  const PopupClose = () => {
    setOpen(false);
    setEditId(null);
  };

  if (!popup) return null;

  return (
    <div className="popup">
      <div className="popup-content student-form">
        <div className="dialog-header">
          <h3>{isEditing ? 'Edit Student' : 'Add Student'}</h3>
          <button className="dialog-close" type="button" onClick={PopupClose}>
            X
          </button>
        </div>

        <div className="dialog-grid">
          <div className="dialog-field">
            <label>Student Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {form.studentImage ? (
              <img
                className="mgmt-avatar"
                src={URL.createObjectURL(form.studentImage)}
                alt="Student preview"
              />
            ) : form.studentImageExisting ? (
              <img
                className="mgmt-avatar"
                src={resolveFileUrl(form.studentImageExisting)}
                alt="Student"
              />
            ) : null}
          </div>

          <div className="dialog-field">
            <label>Student Name</label>
            <input
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              placeholder="Student Name"
            />
            {errors.studentName && <p className="err">{errors.studentName}</p>}
          </div>

          {/* <div className="dialog-field">
            <label>Course</label>
            <select name="studentCourse" value={form.studentCourse} onChange={handleChange}>
              <option value="">-- Select Course --</option>
              {coursesName.map((courseName, index) => (
                <option value={courseName} key={`${courseName}-${index}`}>
                  {courseName}
                </option>
              ))}
            </select>
          </div> */}

          <div className="dialog-field">
            <label>Mobile</label>
            <input
              name="studentMobile"
              value={form.studentMobile}
              onChange={handleChange}
              placeholder="Student Mobile"
            />
            {errors.studentMobile && <p className="err">{errors.studentMobile}</p>}
          </div>

          <div className="dialog-field">
            <label>Email</label>
            <input
              name="studentMail"
              value={form.studentMail}
              onChange={handleChange}
              placeholder="Student Email"
            />
          </div>

          <div className="dialog-field">
            <label>College/School</label>
            <input
              name="studentCollege"
              value={form.studentCollege}
              onChange={handleChange}
              placeholder="Student College/School"
            />
          </div>

          <div className="dialog-field">
            <label>College/School ID</label>
            <input
              name="studentCollegeId"
              value={form.studentCollegeId}
              onChange={handleChange}
              placeholder="Student College/School ID"
            />
          </div>

          <div className="dialog-field full">
            <label>College Address</label>
            <input
              name="studentCollegeAddress"
              value={form.studentCollegeAddress}
              onChange={handleChange}
              placeholder="Student College Address"
            />
          </div>

          <div className="dialog-field">
            <label>Year/Experience</label>
            <input
              name="studentYearOrExperience"
              value={form.studentYearOrExperience}
              onChange={handleChange}
              placeholder="Year/Experience"
            />
          </div>

          <div className="dialog-field">
            <label>Status</label>
             
            <select 
              name="studentStatus"
              value={form.studentStatus}
              onChange={handleChange}
             
            >
                <option value="">Select Status</option>
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          <div className="dialog-field full">
            <label>Address</label>
            <input
              name="studentAddress"
              value={form.studentAddress}
              onChange={handleChange}
              placeholder="Student Address"
            />
          </div>
        </div>

        <div className="dialog-section">
          <label>Education</label>
          {form.studentEducation.map((edu, i) => (
            <div key={i} className="dialog-row">
              <input
                value={edu}
                onChange={(e) => handleArrayChange('studentEducation', i, e.target.value)}
                placeholder={`Education ${i + 1}`}
              />
              {form.studentEducation.length > 1 && (
                <button
                  className="mgmt-mini danger"
                  type="button"
                  onClick={() => removeField('studentEducation', i)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="mgmt-mini" type="button" onClick={() => addField('studentEducation')}>
            Add Education
          </button>
        </div>

        <div className="dialog-section">
          <label>Aadhar Image</label>
          <input type="file" accept="image/*, application/pdf" onChange={handleAadharChange} />
          {form.studentAadharImage ? (
            <span className="mgmt-badge">New file selected</span>
          ) : form.studentAadharExisting ? (
            <a
              className="mgmt-mini"
              href={resolveFileUrl(form.studentAadharExisting)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Existing Aadhar
            </a>
          ) : null}
        </div>

        <div className="dialog-actions">
          <button className="mgmt-btn" type="button" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Add Student'}
          </button>
          <button className="mgmt-btn secondary" type="button" onClick={PopupClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDialogue;

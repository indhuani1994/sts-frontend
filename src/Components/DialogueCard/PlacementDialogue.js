import React, { useState, useEffect } from 'react';
import CustomSelect from '../CustomSelect/CustomSelect';
import './PlacementDialogue.css';
import { resolveFileUrl } from '../../API';

const initialForm = {
  studentId: '',
  companyId: '',
  jobRole: '',
  salaryPackage: '',
  id: ''
};

const PlacementDialogue = ({ setOpen, onSubmit, students, editData, company }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editData) {
      setForm({
        studentId: editData.student?._id || '',
        companyId: editData.company?._id || editData.companyId || '',
        jobRole: editData.jobRole || '',
        salaryPackage: editData.package || editData.salaryPackage || '',
        id: editData._id || ''
      });
    } else {
      setForm(initialForm);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) data.append(key, value);
    });
    onSubmit(data, !!editData);
  };

  return (
    <div className="placement-modal">
      <div className="placement-modal-card">
        <div className="placement-modal-header">
          <div>
            <p className="placement-modal-kicker">Placement</p>
            <h2>{editData ? 'Update Placement' : 'Add Placement'}</h2>
            <p className="placement-modal-subtitle">
              Enter student placement details and link the correct company.
            </p>
          </div>
          <button className="placement-close" type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <div className="placement-form-grid">
          <div className="placement-field">
            <label>Student</label>
            <CustomSelect
              options={students.map((s) => ({
                value: s._id,
                label: s.studentName,
                image: resolveFileUrl(s.studentImage),
              }))}
              selected={students.find((s) => s._id === form.studentId) && {
                value: form.studentId,
                label: students.find((s) => s._id === form.studentId)?.studentName,
                image: resolveFileUrl(students.find((s) => s._id === form.studentId)?.studentImage),
              }}
              onChange={(val) => setForm({ ...form, studentId: val })}
              placeholder="Select student"
            />
          </div>

          <div className="placement-field">
            <label>Company</label>
            <CustomSelect
              options={company.map((c) => ({
                value: c._id,
                label: c.companyName,
                image: resolveFileUrl(c.companyImage),
              }))}
              selected={company.find((c) => c._id === form.companyId) && {
                value: form.companyId,
                label: company.find((c) => c._id === form.companyId)?.companyName,
                image: resolveFileUrl(company.find((c) => c._id === form.companyId)?.companyImage),
              }}
              onChange={(val) => setForm({ ...form, companyId: val })}
              placeholder="Select company"
            />
          </div>

          <div className="placement-field">
            <label htmlFor="placement-role">Job Role</label>
            <input
              id="placement-role"
              type="text"
              name="jobRole"
              value={form.jobRole}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div className="placement-field">
            <label htmlFor="placement-package">Package</label>
            <input
              id="placement-package"
              type="text"
              name="salaryPackage"
              value={form.salaryPackage}
              onChange={handleChange}
              placeholder="e.g. 6 LPA"
            />
          </div>
        </div>

        <div className="placement-modal-actions">
          <button className="placement-btn primary" type="button" onClick={handleSubmit}>
            {editData ? 'Update Placement' : 'Add Placement'}
          </button>
          <button className="placement-btn ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementDialogue;

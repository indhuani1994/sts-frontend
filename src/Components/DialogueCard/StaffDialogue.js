import React, { useState } from 'react';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';

function StaffDialogue({ popup, setOpen, handleEditOrAdd, form, setForm, isEditing }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const temp = {};
    temp.staffName = form.staffName.trim() ? '' : 'Staff Name is required';
    temp.staffRole = form.staffRole.trim() ? '' : 'Staff Role is required';
    temp.staffMobile = /^[0-9]{10}$/.test(form.staffMobile) ? '' : 'Valid Mobile Number is required';
    temp.staffMail = /\S+@\S+\.\S+/.test(form.staffMail) ? '' : 'Valid Email is required';
    temp.staffAddress = form.staffAddress.trim() ? '' : 'Address is required';

    temp.staffQualification =
      form.staffQualification.length === 0 || form.staffQualification.some((q) => q.trim() === '')
        ? 'At least one valid qualification is required'
        : '';
    temp.staffExperience =
      form.staffExperience.length === 0 || form.staffExperience.some((q) => q.trim() === '')
        ? 'At least one valid experience is required'
        : '';

    if (!isEditing) {
      temp.staffImage = form.staffImage ? '' : 'Photo is required';
      temp.staffAadharImage = form.staffAadharImage ? '' : 'Aadhar image is required';
    }

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
    setForm({ ...form, staffImage: e.target.files[0] });
    setErrors((prev) => ({ ...prev, staffImage: '' }));
  };

  const handleAadharChange = (e) => {
    setForm({ ...form, staffAadharImage: e.target.files[0] });
    setErrors((prev) => ({ ...prev, staffAadharImage: '' }));
  };

  if (!popup) return null;

  return (
    <div className="popup">
      <div className="popup-content student-form">
        <div className="dialog-header">
          <h3>{isEditing ? 'Edit Staff' : 'Add Staff'}</h3>
          <button className="dialog-close" type="button" onClick={() => setOpen(false)}>
            X
          </button>
        </div>

        <div className="dialog-grid">
          <div className="dialog-field">
            <label>Photo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {form.staffImage ? (
              <img
                className="mgmt-avatar"
                src={URL.createObjectURL(form.staffImage)}
                alt="Staff preview"
              />
            ) : form.staffImageExisting ? (
              <img
                className="mgmt-avatar"
                src={resolveFileUrl(form.staffImageExisting)}
                alt="Staff"
              />
            ) : null}
            {errors.staffImage && <p className="err">{errors.staffImage}</p>}
          </div>

          <div className="dialog-field">
            <label>Staff Name</label>
            <input
              name="staffName"
              value={form.staffName}
              onChange={handleChange}
              placeholder="Staff Name"
            />
            {errors.staffName && <p className="err">{errors.staffName}</p>}
          </div>

          <div className="dialog-field">
            <label>Staff Role</label>
            <input
              name="staffRole"
              value={form.staffRole}
              onChange={handleChange}
              placeholder="Staff Role"
            />
            {errors.staffRole && <p className="err">{errors.staffRole}</p>}
          </div>

          <div className="dialog-field">
            <label>HR Commission (%)</label>
            <input
              name="hrCommissionPercent"
              type="number"
              min="0"
              max="100"
              value={form.hrCommissionPercent ?? ''}
              onChange={handleChange}
              placeholder="e.g. 10"
            />
          </div>

          <div className="dialog-field">
            <label>Mobile</label>
            <input
              name="staffMobile"
              value={form.staffMobile}
              onChange={handleChange}
              placeholder="Staff Mobile"
            />
            {errors.staffMobile && <p className="err">{errors.staffMobile}</p>}
          </div>

          <div className="dialog-field">
            <label>Email</label>
            <input
              name="staffMail"
              value={form.staffMail}
              onChange={handleChange}
              placeholder="Staff Email"
            />
            {errors.staffMail && <p className="err">{errors.staffMail}</p>}
          </div>

          <div className="dialog-field full">
            <label>Address</label>
            <input
              name="staffAddress"
              value={form.staffAddress}
              onChange={handleChange}
              placeholder="Staff Address"
            />
            {errors.staffAddress && <p className="err">{errors.staffAddress}</p>}
          </div>
        </div>

        <div className="dialog-section">
          <label>Qualification</label>
          {form.staffQualification.map((eachQualification, i) => (
            <div key={i} className="dialog-row">
              <input
                value={eachQualification}
                onChange={(e) => handleArrayChange('staffQualification', i, e.target.value)}
                placeholder={`Qualification ${i + 1}`}
              />
              {form.staffQualification.length > 1 && (
                <button
                  className="mgmt-mini danger"
                  type="button"
                  onClick={() => removeField('staffQualification', i)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.staffQualification && <p className="err">{errors.staffQualification}</p>}
          <button className="mgmt-mini" type="button" onClick={() => addField('staffQualification')}>
            Add Qualification
          </button>
        </div>

        <div className="dialog-section">
          <label>Experience</label>
          {form.staffExperience.map((eachExp, i) => (
            <div key={i} className="dialog-row">
              <input
                value={eachExp}
                onChange={(e) => handleArrayChange('staffExperience', i, e.target.value)}
                placeholder={`Experience ${i + 1}`}
              />
              {form.staffExperience.length > 1 && (
                <button
                  className="mgmt-mini danger"
                  type="button"
                  onClick={() => removeField('staffExperience', i)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.staffExperience && <p className="err">{errors.staffExperience}</p>}
          <button className="mgmt-mini" type="button" onClick={() => addField('staffExperience')}>
            Add Experience
          </button>
        </div>

        <div className="dialog-section">
          <label>Aadhar Image</label>
          <input type="file" accept="image/*, application/pdf" onChange={handleAadharChange} />
          {form.staffAadharImage ? (
            <span className="mgmt-badge">New file selected</span>
          ) : form.staffAadharExisting ? (
            <a
              className="mgmt-mini"
              href={resolveFileUrl(form.staffAadharExisting)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Existing Aadhar
            </a>
          ) : null}
          {errors.staffAadharImage && <p className="err">{errors.staffAadharImage}</p>}
        </div>

        <div className="dialog-actions">
          <button className="mgmt-btn" type="button" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Add Staff'}
          </button>
          <button className="mgmt-btn secondary" type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffDialogue;

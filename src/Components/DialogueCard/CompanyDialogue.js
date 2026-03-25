import React, { useEffect, useState } from 'react';

function CompanyDialogue({ open, setOpen, form, onChange, onSubmit, isEditing, onImageChange, imagePreview }) {
  const [error, setError] = useState({});

  useEffect(() => {
    if (!open) {
      setError({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    if (!form.companyLocation.trim()) newErrors.companyLocation = 'Company location is required';
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!isEditing && !imagePreview) {
      newErrors.companyImage = 'Company image is required';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    setError({});
    onSubmit();
  };

  const handleInputChange = (e) => {
    const { name } = e.target;
    onChange(e);
    if (error[name]) {
      setError((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLocalImageChange = (e) => {
    onImageChange(e);
    if (e.target.files?.[0] && error.companyImage) {
      setError((prev) => ({ ...prev, companyImage: null }));
    }
  };

  if (!open) return null;

  return (
    <div className="popup">
      <div className="popup-content company-form">
        <div className="dialog-header">
          <div>
            <h3>{isEditing ? 'Edit Company' : 'Add Company'}</h3>
            <p>Manage company details used in placements.</p>
          </div>
          <button className="dialog-close" type="button" onClick={() => setOpen(false)}>
            X
          </button>
        </div>

        <div className="dialog-grid">
          <div className="dialog-field full">
            <label>Company Logo</label>
            <input type="file" accept="image/*" onChange={handleLocalImageChange} />
            {error.companyImage && <p className="err">{error.companyImage}</p>}
            {imagePreview && <img src={imagePreview} alt="Preview" className="company-preview" />}
          </div>

          <div className="dialog-field">
            <label>Company Name</label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleInputChange}
              placeholder="Company Name"
            />
            {error.companyName && <p className="err">{error.companyName}</p>}
          </div>

          <div className="dialog-field">
            <label>Company Location</label>
            <input
              name="companyLocation"
              value={form.companyLocation}
              onChange={handleInputChange}
              placeholder="Company Location"
            />
            {error.companyLocation && <p className="err">{error.companyLocation}</p>}
          </div>
        </div>

        <div className="dialog-actions">
          <button className="mgmt-btn" type="button" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Add Company'}
          </button>
          <button className="mgmt-btn secondary" type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanyDialogue;




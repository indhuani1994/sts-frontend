import React, { useEffect, useState } from 'react';

function CompanyDialogue({ open, setOpen, form, onChange, onSubmit, isEditing, onImageChange, imagePreview, setEditId }) {
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);



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

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    setError({});
    setIsLoading(true)
    try {
    await onSubmit();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);  
    }
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
    <div className="popup" onClick={() => {setOpen(false);setEditId(null) }}>
      <div className="popup-content company-form" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <h3>{isEditing ? 'Edit Company' : 'Add Company'}</h3>
            <p>Manage company details used in placements.</p>
          </div>
          <button className="dialog-close" type="button" onClick={() => {setOpen(false);setEditId(null) }}>
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
          <button className="mgmt-btn" type="button" onClick={handleSubmit} disabled={isLoading}>
           {isEditing ?( isLoading ? 'Updating Company...': 'Update Company'): (isLoading ? 'Adding Company...': 'Add Company')} 
          </button>
          <button className="mgmt-btn secondary" type="button" onClick={() => {setOpen(false);setEditId(null) }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanyDialogue;




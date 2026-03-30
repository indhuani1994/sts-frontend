import React, { useEffect, useState } from 'react';

function CourseDialog({
  open,
  setOpen,
  form,
  onChange,
  onSubmit,
  isEditing,
  onImageChange,
  imagePreview,
  setForm,
  setFile,
  setEditId,
  hiddenFields = [],
    

}) {
  const isHidden = (field) => hiddenFields.includes(field);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (!open) {
      setError({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    const safeTrim = (value) => String(value ?? '').trim();
    if (!isHidden('courseCode') && !safeTrim(form.courseCode)) newErrors.courseCode = "Course code is required";
    if (!isHidden('courseName') && !safeTrim(form.courseName)) newErrors.courseName = "Course Name is required";
    if (!isHidden('fees') && !safeTrim(form.fees)) newErrors.fees = "Fees field is required";
    if (!isHidden('drivelink') && !safeTrim(form.drivelink)) newErrors.drivelink = "course drive link field is required";
    if (!isHidden('duration') && !safeTrim(form.duration)) newErrors.duration = "Duration field is required";
    if (!isHidden('prerequire') && !safeTrim(form.prerequire)) newErrors.prerequire = "Prerequire field is required";

    if (!isHidden('image') && !isEditing && !imagePreview) {
      newErrors.image = "Image is required";
    }
   
    return newErrors;
  };

  const handleSubmit =async () => {
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }
    setError({});
setIsLoading(true);
    try {
      await onSubmit();
    } catch (error) {
       console.log(error)
       
    } finally {
      setIsLoading(false);
    }
    
    
    

  };

  const handleInputChange = (e) => {
    const { name } = e.target;
    onChange(e);
    if (error[name]) {
      setError(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLocalImageChange = (e) => {
    onImageChange(e);
    if (e.target.files[0] && error.image) {
      setError(prev => ({ ...prev, image: null }));
    }
  };

  const handleArrayChange = (name, index, value) => {
    const updatedArray = [...form[name]];
    updatedArray[index] = value;
    setForm({ ...form, [name]: updatedArray });
  };

  const removeField = (whichField, whichOne) => {
    const updated = [...form[whichField]];
    updated.splice(whichOne, 1);
    setForm({ ...form, [whichField]: updated });
  };

  const addField = (whichField) => {
    setForm({ ...form, [whichField]: [...form[whichField], ''] });
  };

  if (!open) return null;

  return (
    <div className="popup" onClick={() => { setOpen(false); setFile(null); setEditId(null)}}>
      <div className="popup-content student-form" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>{isEditing ? 'Edit Course' : 'Add Course'}</h3>
          <button className="dialog-close" type="button" onClick={() => { setOpen(false); setFile(null); setEditId(null)}}>
            X
          </button>
        </div>

        <div className="dialog-grid">
          {!isHidden('image') && (
            <div className="dialog-field">
              <label>Course Image</label>
              {error.image && <p className="err">{error.image}</p>}
              <input type="file" accept="image/*" onChange={handleLocalImageChange} />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mgmt-avatar" />}
            </div>
          )}

          {!isHidden('courseCode') && (
            <div className="dialog-field">
              <label>Course Code</label>
              {error.courseCode && <p className="err">{error.courseCode}</p>}
              <input name="courseCode" value={form.courseCode} onChange={handleInputChange} placeholder="Course Code" />
            </div>
          )}

          {!isHidden('courseName') && (
            <div className="dialog-field">
              <label>Course Name</label>
              {error.courseName && <p className="err">{error.courseName}</p>}
              <input name="courseName" value={form.courseName} onChange={handleInputChange} placeholder="Course Name" />
            </div>
          )}

          {!isHidden('fees') && (
            <div className="dialog-field">
              <label>Fees</label>
              {error.fees && <p className="err">{error.fees}</p>}
              <input name="fees" value={form.fees} onChange={handleInputChange} placeholder="Fees" />
            </div>
          )}
           {!isHidden('drivelink') && (
            <div className="dialog-field">
              <label>drivelink</label>
              {error.drivelink && <p className="err">{error.drivelink}</p>}
              <input name="drivelink" value={form.drivelink} onChange={handleInputChange} placeholder="drivelink" />
            </div>
          )}

          {!isHidden('duration') && (
            <div className="dialog-field">
              <label>Duration</label>
              {error.duration && <p className="err">{error.duration}</p>}
              <input name="duration" value={form.duration} onChange={handleInputChange} placeholder="Duration" />
            </div>
          )}

          {!isHidden('prerequire') && (
            <div className="dialog-field">
              <label>Pre-requirements</label>
              {error.prerequire && <p className="err">{error.prerequire}</p>}
              <input name="prerequire" value={form.prerequire} onChange={handleInputChange} placeholder="Pre-requirements" />
            </div>
          )}

          {!isHidden('description') && (
            <div className="dialog-field full">
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleInputChange} placeholder="Description..." />
            </div>
          )}

          {!isHidden('offer') && (
            <div className="dialog-field">
              <label>Offer</label>
              <input name="offer" value={form.offer} onChange={handleInputChange} placeholder="Offer..." />
            </div>
          )}

          {!isHidden('type') && (
            <div className="dialog-field">
              <label>Course Type</label>
              <select name="type" value={form.type} onChange={handleInputChange} required>
                <option value="">Select Course Type</option>
                <option value="Basic">Basic course</option>
                <option value="Professional">Professional Course</option>
                <option value="Advance">Advance Course</option>
              </select>
            </div>
          )}
        </div>

        {/* {!isHidden('syllabus') && (
          <div className="dialog-section">
            <label>Syllabus</label>
            {form.syllabus.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                <input
                  value={edu}
                  onChange={(e) => handleArrayChange('syllabus', i, e.target.value)}
                  placeholder={`Syllabus Topic ${i + 1}...`}
                />
                {form.syllabus.length > 1 && (
                  <button type="button" onClick={() => removeField('syllabus', i)}> ❌ </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addField('syllabus')}> ➕ Add Syllabus </button>
            {error.syllabus && <p className="err">{error.syllabus}</p>}
          </div>
        )} */}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button className="mgmt-btn" type="button" onClick={handleSubmit} disabled={isLoading} >
            {isEditing ?( isLoading ? 'Updating Course...': 'Update Course'): (isLoading ? 'Adding Course...': 'Add Course')} 
          </button>
          <button className="mgmt-btn secondary" type="button" onClick={() => { setOpen(false); setFile(null); setEditId(null)}}>
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
}

export default CourseDialog;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Stack,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function JobDialogue({ popup, setOpen, handleEditOrAdd, form, setForm, isEditing }) {
  const [errors, setErrors] = useState({});

  const jobTypes = ['consultancy', 'career'];
  const employmentTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
  const workModes = ['Onsite', 'Remote', 'Hybrid'];

  const validate = () => {
    const temp = {};
    temp.title = form.title.trim() ? '' : 'Job Title is required*';
    temp.company = form.company.trim() ? '' : 'Company is required*';
    temp.location = form.location.trim() ? '' : 'Location is required*';
    temp.type = form.type ? '' : 'Job Type is required*';
    temp.employmentType = form.employmentType ? '' : 'Employment Type is required*';
    temp.workMode = form.workMode ? '' : 'Work Mode is required*';
    setErrors(temp);
    return Object.values(temp).every((x) => x === '');
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === 'skills' && index !== null) {
      const newSkills = [...form.skills];
      newSkills[index] = value;
      setForm({ ...form, skills: newSkills });
    } else {
      setForm({ ...form, [name]: value });
    }

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const addSkill = () => setForm({ ...form, skills: [...form.skills, ''] });
  const removeSkill = (index) => {
    const newSkills = form.skills.filter((_, i) => i !== index);
    setForm({ ...form, skills: newSkills });
  };

  const handleSubmit = () => {
    if (validate()) handleEditOrAdd();
  };

  return (
    <Dialog open={popup} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Job' : 'Add Job'}
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            name="title"
            label="Job Title *"
            value={form.title}
            onChange={handleChange}
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
            variant="standard"
          />
          <TextField
            name="company"
            label="Company *"
            value={form.company}
            onChange={handleChange}
            fullWidth
            error={!!errors.company}
            helperText={errors.company}
            variant="standard"
          />
          <TextField
            name="location"
            label="Location *"
            value={form.location}
            onChange={handleChange}
            fullWidth
            error={!!errors.location}
            helperText={errors.location}
            variant="standard"
          />
          <TextField
            select
            name="type"
            label="Job Type *"
            value={form.type}
            onChange={handleChange}
            fullWidth
            error={!!errors.type}
            helperText={errors.type}
            variant="standard"
          >
            {jobTypes.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="employmentType"
            label="Employment Type *"
            value={form.employmentType}
            onChange={handleChange}
            fullWidth
            error={!!errors.employmentType}
            helperText={errors.employmentType}
            variant="standard"
          >
            {employmentTypes.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="workMode"
            label="Work Mode *"
            value={form.workMode}
            onChange={handleChange}
            fullWidth
            error={!!errors.workMode}
            helperText={errors.workMode}
            variant="standard"
          >
            {workModes.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          {/* Skills array */}
          {form.skills.map((skill, idx) => (
            <Stack key={idx} direction="row" spacing={1} alignItems="center">
              <TextField
              name='skills'
                label={`Skill ${idx + 1}`}
                value={skill}
                onChange={(e) => handleChange(e, idx)}
                fullWidth
                variant="standard"
              />
              <Button color="error" onClick={() => removeSkill(idx)}>Remove</Button>
            </Stack>
          ))}
          <Button onClick={addSkill}>Add Skill</Button>

          <TextField
            name="experience"
            label="Experience"
            value={form.experience}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            name="salary"
            label="Salary / CTC"
            value={form.salary}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            name="description"
            label="Job Description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            variant="standard"
          />
          <TextField
            name="perks"
            label="Perks"
            value={form.perks}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            variant="standard"
          />
          <TextField
            name="applicationLink"
            label="Application Link"
            value={form.applicationLink}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            name="applicationDeadline"
            label="Application Deadline"
            type="date"
            value={form.applicationDeadline}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            variant="standard"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">{isEditing ? 'Save Changes' : 'Add Job'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default JobDialogue;

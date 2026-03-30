import React, { useEffect, useMemo, useState } from 'react';
import { cusToast } from '../Components/Toast/CusToast';
import MainLayout from '../MainLayout.js/MainLayout';
import apiClient from '../lib/apiClient';
import './JobPosting.css';

const initialJobForm = {
  title: '',
  company: '',
  location: '',
  type: '',  // consultancy | career
  employmentType: '', // Full-time | Part-time | etc.
  workMode: '', // Onsite | Remote | Hybrid
  skills: [''],
  experience: '',
  salary: '',
  description: '',
  perks: '',
  applicationLink: '',
  applicationDeadline: '', // date string
};


function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialJobForm);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [viewJob, setViewJob] = useState(null);

  const jobTypes = useMemo(() => ['consultancy', 'career'], []);
  const employmentTypes = useMemo(() => ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'], []);
  const workModes = useMemo(() => ['Onsite', 'Remote', 'Hybrid'], []);

const fetchJobs = async () => {
  try {
    const res = await apiClient.get(`/api/jobs`);
    const data = res.data;
    setJobs(data.jobs || data || []);
  } catch (error) {
    console.log(error);
    cusToast("Error fetching jobs", "error");
  }
};

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/jobs/${id}`);
      fetchJobs();
      cusToast('Job deleted successfully');
    } catch (error) {
      cusToast("Can't delete job", 'error');
    }
  };

  const validate = () => {
    const temp = {};
    temp.title = form.title.trim() ? '' : 'Job Title is required';
    temp.company = form.company.trim() ? '' : 'Company is required';
    temp.location = form.location.trim() ? '' : 'Location is required';
    temp.type = form.type ? '' : 'Job Type is required';
    temp.employmentType = form.employmentType ? '' : 'Employment Type is required';
    temp.workMode = form.workMode ? '' : 'Work Mode is required';
    setErrors(temp);
    return Object.values(temp).every((x) => x === '');
  };

  const handleAddOrEdit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        title: form.title || form.jobTitle,
        company: form.company || form.companyName,
        location: form.location,
        type: form.type || form.jobType,
        employmentType: form.employmentType,
        workMode: form.workMode,
        skills: form.skills.filter(s => s.trim() !== ''),
        experience: form.experience,
        salary: form.salary,
        description: form.description || form.jobDescription,
        perks: form.perks,
        applicationLink: form.applicationLink,
        applicationDeadline: form.applicationDeadline,
      };

      if (editId) {
        const formData = new FormData();
        for (const key in payload) {
          if (Array.isArray(payload[key])) formData.append(key, JSON.stringify(payload[key]));
          else formData.append(key, payload[key]);
        }
        await apiClient.put(`/api/jobs/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await apiClient.post(`/api/jobs`, payload, {
          headers: { "Content-Type": "application/json" }
        });
      }

      fetchJobs();
      setForm(initialJobForm);
      setEditId(null);
      setShowForm(false);
      cusToast(editId ? 'Job updated successfully' : 'Job posted successfully');
    } catch (error) {
      console.log("Submit Error:", error.response?.data || error.message);
      cusToast(error.response?.data?.error || "Error submitting job", 'error');
    }
  };



  const handleEdit = (job) => {
    setForm({
      ...job,
      skills: job.skills || [''],
      companyLogo: null
    });
    setEditId(job._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className='job-posting-page'>
        <div className="job-posting-header">
          <div>
            <h1>Job Posting</h1>
            <p>Post and manage consultancy + career roles in one place.</p>
          </div>
          <button
            className="job-primary-btn"
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(initialJobForm);
              setErrors({});
            }}
          >
            Add Job
          </button>
        </div>

        {showForm && (
          <div
            className="job-modal-overlay"
            onClick={() => {
              setForm(initialJobForm);
              setEditId(null);
              setErrors({});
              setShowForm(false);
            }}
          >
            <div className="job-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="job-form-header">
                <h2>{editId ? 'Edit Job' : 'Post a New Job'}</h2>
                <button
                  className="job-secondary-btn"
                  type="button"
                  onClick={() => {
                    setForm(initialJobForm);
                    setEditId(null);
                    setErrors({});
                    setShowForm(false);
                  }}
                >
                  Close
                </button>
              </div>
              <div className="job-form-grid">
              <div className="job-field">
                <label>Job Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder='e.g., Frontend Developer...'
                />
                {errors.title ? <span className="job-error">{errors.title}</span> : null}
              </div>
              <div className="job-field">
                <label>Company *</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder='e.g., TCS, Infosys'
                />
                {errors.company ? <span className="job-error">{errors.company}</span> : null}
              </div>
              <div className="job-field">
                <label>Location *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder='e.g., Chennai, Remote'
                />
                {errors.location ? <span className="job-error">{errors.location}</span> : null}
              </div>
              <div className="job-field">
                <label>Job Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {jobTypes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.type ? <span className="job-error">{errors.type}</span> : null}
              </div>
              <div className="job-field">
                <label>Employment Type *</label>
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                >
                  <option value="">Select employment</option>
                  {employmentTypes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.employmentType ? <span className="job-error">{errors.employmentType}</span> : null}
              </div>
              <div className="job-field">
                <label>Work Mode *</label>
                <select
                  name="workMode"
                  value={form.workMode}
                  onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                >
                  <option value="">Select mode</option>
                  {workModes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.workMode ? <span className="job-error">{errors.workMode}</span> : null}
              </div>
              <div className="job-field full">
                <label>Skills</label>
                <div className="job-skill-list">
                  {form.skills.map((skill, idx) => (
                    <div key={idx} className="job-skill-row">
                      <input
                        name="skills"
                        value={skill}
                        placeholder={`e.g., React`}
                        onChange={(e) => {
                          const next = [...form.skills];
                          next[idx] = e.target.value;
                          setForm({ ...form, skills: next });
                        }}
                      />
                      <button
                        type="button"
                        className="job-link-btn"
                        onClick={() => setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) })}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="job-link-btn"
                    onClick={() => setForm({ ...form, skills: [...form.skills, ''] })}
                  >
                    Add Skill
                  </button>
                </div>
              </div>
              <div className="job-field">
                <label>Experience</label>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder='e.g., 0-2 years'
                />
              </div>
              <div className="job-field">
                <label>Salary / CTC</label>
                <input
                  name="salary"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder='e.g., ₹3,00,000 - ₹6,00,000'
                />
              </div>
              <div className="job-field full">
                <label>Job Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder='Describe roles and responsibilities'
                />
              </div>
              <div className="job-field full">
                <label>Perks</label>
                <textarea
                  name="perks"
                  rows={2}
                  value={form.perks}
                  onChange={(e) => setForm({ ...form, perks: e.target.value })}
                  placeholder='e.g., Health insurance, Bonus, WFH'
                />
              </div>
              <div className="job-field">
                <label>Application Link</label>
                <input
                  name="applicationLink"
                  value={form.applicationLink}
                  onChange={(e) => setForm({ ...form, applicationLink: e.target.value })}
                  placeholder='e.g., https://company.com/careers'
                />
              </div>
              <div className="job-field">
                <label>Application Deadline</label>
                <input
                  name="applicationDeadline"
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                />
              </div>
              <div className="job-actions">
                <button type="button" className="job-primary-btn" onClick={handleAddOrEdit}>
                  {editId ? 'Update Job' : 'Post Job'}
                </button>
                <button
                  type="button"
                  className="job-secondary-btn"
                  onClick={() => {
                    setForm(initialJobForm);
                    setEditId(null);
                    setErrors({});
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        <div className="job-table-card">
          <div className="job-table-header">
            <h2>Posted Jobs</h2>
            <span>{jobs.length} total</span>
          </div>
          <div className="job-table-wrap">
            <table className="job-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Work Mode</th>
                  <th>Location</th>
                  <th>Apply By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={job._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="job-table-title">{job.title}</div>
                      <div className="job-table-sub">{job.employmentType || '-'}</div>
                    </td>
                    <td>{job.company || '-'}</td>
                    <td ><span className="job-pill">{job.type || '-'}</span></td>
                    <td>{job.workMode || '-'}</td>
                    <td>{job.location || '-'}</td>
                    <td>{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="job-table-actions">
                        <button className="job-link" type="button" onClick={() => setViewJob(job)}>
                          View
                        </button>
                        <button className="job-tertiary-btn" type="button" onClick={() => handleEdit(job)}>
                          Edit
                        </button>
                        <button className="job-danger-btn" type="button" onClick={() => handleDelete(job._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="job-empty">No jobs posted yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {viewJob && (
          <div className="job-modal-overlay" onClick={() => setViewJob(null)}>
            <div className="job-modal-card job-view-card" onClick={(e) => e.stopPropagation()}>
              <div className="job-form-header">
                <h2>{viewJob.title || 'Job Details'}</h2>
                <button className="job-secondary-btn" type="button" onClick={() => setViewJob(null)}>
                  Close
                </button>
              </div>
              <div className="job-view-grid">
                <div>
                  <p className="job-view-label">Company</p>
                  <p className="job-view-value">{viewJob.company || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Location</p>
                  <p className="job-view-value">{viewJob.location || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Job Type</p>
                  <p className="job-view-value">{viewJob.type || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Employment Type</p>
                  <p className="job-view-value">{viewJob.employmentType || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Work Mode</p>
                  <p className="job-view-value">{viewJob.workMode || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Experience</p>
                  <p className="job-view-value">{viewJob.experience || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Salary / CTC</p>
                  <p className="job-view-value">{viewJob.salary || '-'}</p>
                </div>
                <div>
                  <p className="job-view-label">Apply By</p>
                  <p className="job-view-value">{viewJob.applicationDeadline ? new Date(viewJob.applicationDeadline).toLocaleDateString() : '-'}</p>
                </div>
                <div className="job-view-full">
                  <p className="job-view-label">Skills</p>
                  <p className="job-view-value">{Array.isArray(viewJob.skills) && viewJob.skills.length ? viewJob.skills.join(', ') : '-'}</p>
                </div>
                <div className="job-view-full">
                  <p className="job-view-label">Job Description</p>
                  <p className="job-view-value">{viewJob.description || '-'}</p>
                </div>
                <div className="job-view-full">
                  <p className="job-view-label">Perks</p>
                  <p className="job-view-value">{viewJob.perks || '-'}</p>
                </div>
                <div className="job-view-full">
                  <p className="job-view-label">Application Link</p>
                  {viewJob.applicationLink ? (
                    <a className="job-link" href={viewJob.applicationLink} target="_blank" rel="noreferrer">
                      {viewJob.applicationLink}
                    </a>
                  ) : (
                    <p className="job-view-value">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default JobManagement;

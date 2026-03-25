import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobTable from '../Components/JobTable/JobTable';
import JobDialogue from '../Components/DialogueCard/JobDialogue';
import { cusToast } from '../Components/Toast/CusToast';
import MainLayout from '../MainLayout.js/MainLayout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Button, Typography } from '@mui/material';
import { API } from '../API';

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
  const [popup, setPopup] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialJobForm);

const fetchJobs = async () => {
  try {
    const res = await axios.get(`${API}/api/jobs`);
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
      await axios.delete(`${API}/api/jobs/${id}`);
      fetchJobs();
      cusToast('Job deleted successfully');
    } catch (error) {
      cusToast("Can't delete job", 'error');
    }
  };

const handleAddOrEdit = async () => {
  try {
    // pick only fields your backend expects
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

    console.log("Sending payload:", payload);

    if (editId) {
      const formData = new FormData();
      for (const key in payload) {
        if (Array.isArray(payload[key])) formData.append(key, JSON.stringify(payload[key]));
        else formData.append(key, payload[key]);
      }
      await axios.put(`${API}/api/jobs/${editId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      await axios.post(`${API}/api/jobs`, payload, {
        headers: { "Content-Type": "application/json" }
      });
    }

    fetchJobs();
    setForm(initialJobForm);
    setEditId(null);
    setPopup(false);
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
    setPopup(true);
  };

  return (
    <MainLayout>
      <div className='container'>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          color="primary"
          onClick={() => {
            setPopup(true);
            setForm(initialJobForm);
          }}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: 3,
            px: 3,
            py: 1,
          }}
        >
          Add Job
        </Button>

        <br /><br />

        <JobTable onDelete={handleDelete} onEdit={handleEdit} jobs={jobs} />

        <JobDialogue
          popup={popup}
          setOpen={setPopup}
          form={form}
          setForm={setForm}
          handleEditOrAdd={handleAddOrEdit}
          isEditing={!!editId}
        />
      </div>
    </MainLayout>
  );
}

export default JobManagement;

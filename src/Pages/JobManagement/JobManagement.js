import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobTable from '../../Components/JobTable/JobTable';
import JobDialogue from '../../Components/DialogueCard/JobDialogue';
import { cusToast } from '../../Components/Toast/CusToast';
import MainLayout from '../../MainLayout.js/MainLayout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Button, Typography } from '@mui/material';
import { API } from '../../API';
import JobEnquiryTable from '../../Components/JobEnquiryTable/JobEnquiryTable';

const initialJobForm = {
  title: '',
  company: '',
  location: '',
  type: '',
  employmentType: '',
  workMode: '',
  skills: [''],
  experience: '',
  salary: '',
  description: '',
  perks: '',
  applicationLink: '',
  applicationDeadline: '',
};

function JobManagement() {
  const [popup, setPopup] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [recruit, setRecruit] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialJobForm);

const fetchJobs = async () => {
  try {
    const res = await axios.get("https://sts-yyhy.onrender.com/api/jobs");
    const data = res.data;
    console.log( data); // Should log the array

    
    setJobs(data || []);
  } catch (error) {
    console.log(error);
    cusToast("Error fetching jobs", "error");
  }
};

const fetchRecruit = async () => {
  try {
    const res = await axios.get("http://lohalhost:5000/api/recruit");
    const data = res.data;
    console.log( data); // Should log the array

    
    setRecruit(data || []);
  } catch (error) {
    console.log(error);
    cusToast("Error fetching jobs", "error");
  }
};
 console.log('jkkhsdahf')

  useEffect(() => { fetchJobs(); fetchRecruit()}, []);

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
  console.log(form);

  try {
    if (editId) {
      await axios.put(`${API}/api/jobs/${editId}`, form);
    } else {
      await axios.post(`${API}/api/jobs`, form);
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
    });
    setEditId(job._id);
    setPopup(true);
  };
  console.log("Jobs state:", jobs);


  return (
    <MainLayout>
      <div className='container'>
        <Typography variant="h4" gutterBottom>Job Management</Typography>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          color="primary"
          onClick={() => { setPopup(true); setForm(initialJobForm); setEditId(null); }}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', boxShadow: 3, px: 3, py: 1 }}
        >
          Add Job
        </Button>

        <br /><br />

        {jobs.length === 0 ? (
          <Typography>No jobs found</Typography>
        ) : (
          <JobTable jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        <JobDialogue
          popup={popup}
          setOpen={setPopup}
          form={form}
          setForm={setForm}
          handleEditOrAdd={handleAddOrEdit}
          isEditing={!!editId}
        />
      </div>
  
      <div>
        <h2> Recruit Enquiry </h2>
   {recruit.length === 0 ? (
          <Typography>No Candidates found</Typography>
        ) : (
          <JobEnquiryTable jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} />
        )}
         
      </div>
       
       
    </MainLayout>
  );
}

export default JobManagement;

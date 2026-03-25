import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewTable from '../Components/ReviewTable/ReviewTable';
import ReviewDialogue from '../Components/DialogueCard/ReviewDialogue';
import { cusToast } from '../Components/Toast/CusToast';
import MainLayout from '../MainLayout.js/MainLayout';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Button, Typography } from '@mui/material';

import { API } from '../API';

const initialForm = {
  stuImage: null,
  stuId: '',
  review: '',
  rate: ''
};

function ReviewManagement() {
  const [popup, setPopup] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchReviews = async () => {
    const res = await axios.get(`${API}/api/review`,  { withCredentials: true });
    setReviews(res.data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/review/${id}`);
      fetchReviews();
      cusToast('Review deleted successfully');
    } catch (error) {
      cusToast("Can't Delete Review", 'error');
    }
  };

  const handleAddOrEdit = async () => {
    try {
      const formData = new FormData();

      for (const key in form) {
        if (key === 'stuImage') {
          if (form[key]) {
            formData.append(key, form[key]);
          }
        } else {
          formData.append(key, form[key]);
        }
      }

      if (editId) {
        await axios.put(`${API}/api/review/${editId}`, formData);
      } else {
        await axios.post(`${API}/api/review`, formData);
      }

      fetchReviews();
      setForm(initialForm);
      setEditId(null);
      setPopup(false);
      editId
        ? cusToast('Review updated successfully')
        : cusToast('Review submitted successfully');
    } catch (error) {
      console.log('review management add function error:', error);
      cusToast("Error occurred, can't submit review", 'error');
    }
  };

  const handleEdit = async (review) => {
    try {
      setForm({
        ...review,
        stuImage: null // reset file field
      });
      setEditId(review._id);
      setPopup(true);
    } catch (error) {
      console.log('error in review management page', error);
      alert('Check ReviewManagement component');
    }
  };

  return (
    <MainLayout>
      <div className="container">
        <Typography variant="h4" component="h1" gutterBottom>
          Review Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<RateReviewIcon />}
          color="primary"
          onClick={() => {
            setPopup(true);
            setForm(initialForm);
          }}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: 3,
            px: 3,
            py: 1
          }}
        >
          Add Review
        </Button>

        <br />
        <br />

        <ReviewTable onDelete={handleDelete} onEdit={handleEdit} reviews={reviews} />

        <ReviewDialogue
          popup={popup}
          setOpen={setPopup}
          form={form}
          setForm={setForm}
          handleEditOrAdd={handleAddOrEdit}
        />
      </div>
    </MainLayout>
  );
}

export default ReviewManagement;

import React, { useEffect, useState } from 'react';
import CourseCard from '../../Components/CourseCard/CourseCard';
import CourseDialog from '../../Components/DialogueCard/CourseDialogue';
import { cusToast } from '../../Components/Toast/CusToast';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';
import '../../Pages/Management.css';

const initialForm = {
  courseCode: '',
  courseName: '',
  fees: '',
  duration: '',
  prerequire: '',
  syllabus: [''], 
  description: '',
  type: '',
  offer: '',
  drivelink: ''
};

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
        const res = await apiClient.get('/api/courses');
    setCourses(res.data);
    } catch (error) {
      cusToast("Can't Fetch Course Details Error is occur", 'error')
    }
  
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
   
    try {
    const formData = new FormData();
    formData.append('courseCode', form.courseCode);
    formData.append('courseName', form.courseName);
    formData.append('fees', form.fees);
    formData.append('duration', form.duration);
    formData.append('prerequire', form.prerequire);
    formData.append('description', form.description);
    formData.append('type', form.type);
    formData.append('offer', form.offer);
    formData.append('drivelink', form.drivelink);
    formData.append('syllabus', form.syllabus.filter(item => item.trim( ) !== ''));
    if(file) formData.append('image', file);
    
    

    if (editId ) {
      await apiClient.put(`/api/courses/${editId}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
     setEditId(null);
     setOpen(false)
    } else {
      
      await apiClient.post('/api/courses', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
    }
    fetchCourses();
    setForm(initialForm);
    setEditId(null);
     setOpen(false)
    setOpen(false);
    setFile(null);
    editId ? cusToast('Course Detail is Updated Successfully') : cusToast('Course Detail is Added Successfully')
    } catch (error) {
      cusToast('Internet error occur, you may check your image files it only accept', 'error')
    }
   
  };

  const handleEdit = course => {
  setForm({
    courseCode: course.courseCode || '',
    courseName: course.courseName || '',
    fees: course.fees || '',
    duration: course.duration || '',
    prerequire: course.prerequire || '',
    syllabus: course.syllabus?.length ? course.syllabus : [''],
    description: course.description || '',
    type: course.type || '',
    offer: course.offer || '',
    drivelink: course.drivelink || '',
    image: course.image || ''
  });
  setEditId(course._id);
  setOpen(true);
};


  const handleDelete = async id => {
     const isCopy = (await confirmBox('Do you want to delete the course?')).isConfirmed;

  if (!isCopy) return;

    try {
        await apiClient.delete(`/api/courses/${id}`);
    fetchCourses();
    } catch (error) {
      cusToast('Course Deleted Failed', 'error');
    } 
  };

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  }

 const handleCopy = async (item) => {
  const isCopy = (await confirmBox('Do you want to copy the course?')).isConfirmed;

  if (!isCopy) return;

  try {
    // ✅ Step 1: Get the image as blob from server
   
    // ✅ Step 3: Prepare FormData
    const formData = new FormData();
    formData.append('courseCode', item.courseCode + '_copy');
    formData.append('courseName', item.courseName);
    formData.append('fees', item.fees);
    formData.append('duration', item.duration);
    formData.append('prerequire', item.prerequire);
    formData.append('description', item.description);
    formData.append('type', item.type);
    formData.append('offer', item.offer);
    formData.append('drivelink', item.drivelink);
    formData.append('syllabus', item.syllabus.filter(i => i.trim() !== ''));
   

    // ✅ Step 4: Send to backend
    await apiClient.post('/api/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    fetchCourses();
    cusToast('Course copied with image successfully');
  } catch (error) {
    console.error('Copy Error:', error);
    cusToast('Failed to copy course with image', 'error');
  }
};



  return (
    <MainLayout>
    <div className="container mgmt-page">
  <div className="mgmt-header">
    <h1 className="mgmt-title">Course Management</h1>
    <div className="mgmt-actions">
      <button className="mgmt-btn" onClick={() =>{ setOpen(true);  setForm(initialForm);}}>Add Course</button>
    </div>
  </div>

  <div className="mgmt-grid">
  {courses.map((course) => (
      <CourseCard course={course} onEdit={handleEdit} onDelete={handleDelete} handleCopy={handleCopy} showDelete={true} showEdit={true} showCopy={true} key={course._id}/>
  ))}
  </div>
  

  <CourseDialog
    open={open}
    setOpen={setOpen}
    form={form}
    setForm={setForm}
    onChange={handleChange}
    onSubmit={handleSubmit}
    isEditing={!!editId}
    isLoading={isLoading}
    setFile={setFile}
    onImageChange={handleImageChange}
    imagePreview={file ? URL.createObjectURL(file) : resolveFileUrl(form.image)}
    setEditId={setEditId}
  />
 
</div>
</MainLayout>
  );
}

export default CourseManagement;

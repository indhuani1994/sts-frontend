import React, { useEffect, useState } from 'react';
import StudentTable from '../../Components/StudentTable/StudentTable';
import StudentDialogue from '../../Components/DialogueCard/studentDialogue';
import { cusToast } from '../../Components/Toast/CusToast';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import '../Management.css';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';


const initialForm = {
    studentName: '',
    studentMobile: '',
    studentMail: '',   
    studentEducation: [''],
    studentCollege: '',
    studentCollegeAddress: '',
    studentYearOrExperience: '',
    studentImage: null,
    studentAadharImage: null,
    studentImageExisting: '',
    studentAadharExisting: '',
    studentAddress: '',
    studentStatus: '',
   
    studentCollegeId: '',
};






function StudentManagement() {
  const Navigator = useNavigate();
  const locatedData =  useLocation();
  const [popup, setPopup] = useState(false);
 const [students, setStudents] = useState([]);
 const [editId, setEditId] = useState(null);
 const [form, setForm] = useState(initialForm)
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(0);
 const [pageSize, setPageSize] = useState(5);
 const [total, setTotal] = useState(0);
 const [loading, setLoading] = useState(false);

useEffect(() => {
  if (locatedData.state) {
    setForm({
      ...initialForm,
      studentName: locatedData.state.enquiry.enName || '',
      studentMobile: locatedData.state.enquiry.enMobile || '',
      studentMail: locatedData.state.enquiry.enMail || '',
    });
    setPopup(true);
  }
}, [locatedData.state]);
  const fetchStudents = async (searchText = query, currentPage = page, currentPageSize = pageSize) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/students', {
        params: {
          paginated: true,
          page: currentPage + 1,
          limit: currentPageSize,
          search: searchText || undefined,
        },
      });
      setStudents(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (error) {
      cusToast('Failed to fetch students. Please try again.', 'error');
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{
    fetchStudents();
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchStudents(query, 0, pageSize);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleDelete = async (id) => {
  const isDelete =  (await confirmBox('Do you want to delete this student?')).isConfirmed;
  if (!isDelete) return;
    try {
      await apiClient.delete(`/api/students/${id}`);
    fetchStudents(); 
      cusToast('Deleted Successfully');

    } catch (error) {
      cusToast("Error occur can't delete", 'error');
    }
   
  }
  const handleAddOrEdit = async () => {
    try {
      const formData = new FormData();
      const isEditing = Boolean(editId);
      let createdStudent = null;

      const studentRedId = isEditing
        ? form.studentRedId
        : `scopetech2021_${new Date().getTime()}_${form.studentName}_${students.length + 1}`;

      formData.append('studentName', form.studentName || '');
      formData.append('studentMobile', form.studentMobile || '');
      formData.append('studentMail', form.studentMail || '');
      formData.append('studentCollege', form.studentCollege || '');
      formData.append('studentCollegeId', form.studentCollegeId || '');
      formData.append('studentCollegeAddress', form.studentCollegeAddress || '');
      formData.append('studentYearOrExperience', form.studentYearOrExperience || '');
      formData.append('studentAddress', form.studentAddress || '');
      formData.append('studentStatus', form.studentStatus || '');
      formData.append('studentRedId', studentRedId || '');
      formData.append('studentEducation', JSON.stringify(form.studentEducation || []));

      if (form.studentImage) {
        formData.append('studentImage', form.studentImage);
      }
      if (form.studentAadharImage) {
        formData.append('studentAadharImage', form.studentAadharImage);
      }

      if (isEditing) {
        await apiClient.put(`/api/students/${editId}`, formData);
      } else {
        const res = await apiClient.post('/api/students', formData);
        createdStudent = res.data?.data || null;
      }

    fetchStudents();
    setForm(initialForm);
    setEditId(null);
    setPopup(false);
    if(!locatedData.state){
 editId ? cusToast('Form Updated Successfully') : cusToast('Form Added Successfully')
    }
   

     if (locatedData.state && !isEditing) {
      const enquiryId = locatedData.state?.enquiryId;
      if (enquiryId && createdStudent?._id) {
        await apiClient.patch(`/api/enquiry/${enquiryId}/link-student`, {
          studentId: createdStudent._id,
        });
      }
      Navigator('/enquiry', {
        state: {
          enquiry: {
            message: 'student registered successfully delete the enquiry if you want'
          }
        }
      })
     }

    } catch (err) {
      const message = err?.response?.data?.message || "Error occur can't add form";
      cusToast(message, 'error');
    }

  }
  const handleEdit = async(student) => {
    setForm({
      ...student,
     
      studentEducation: student.studentEducation || [''],
      studentImageExisting: student.studentImage || '',
      studentAadharExisting: student.studentAadharImage || '',
      studentImage: null,
      studentAadharImage: null
    });
    setEditId(student._id);
    setPopup(true)
  }

  const handleStatusEdit = async(student) => { 
   try {
      const isEdit = (await confirmBox('Do you want to change this student status?')).isConfirmed;
     
       if (!isEdit) return;

       const studentUpdatedState = {...student, studentStatus: student.studentStatus === 'Student' ? 'Alumni' : 'Student'};
       await apiClient.put(`/api/students/${student._id}`, studentUpdatedState);
       fetchStudents();
       cusToast('Student Status Updated Successfully');

   } catch (error) {
        cusToast('Student Status Update Failed', 'error');
        console.log(error.message)
   }

  }

  return (
    <MainLayout>
    <div className='container mgmt-page'>
      <div className="mgmt-header">
        <h1 className="mgmt-title">Student Management</h1>
        <div className="mgmt-actions">
          <input
            className="mgmt-input"
            placeholder="Search by name, email, mobile or course"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="mgmt-btn" onClick={()=> {setPopup(true); setForm(initialForm); }}>Add Student</button>
        </div>
      </div>
     
      <StudentTable
        onDelete={handleDelete}
        onEdit={handleEdit}
        students={students}
        page={page}
        pageSize={pageSize}
        rowCount={total}
        loading={loading}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchStudents(query, newPage, pageSize);
        }}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(0);
          fetchStudents(query, 0, newPageSize);
        }}
        handleStatusEdit={handleStatusEdit}

      />
      <StudentDialogue popup={popup} setOpen={setPopup} form={form} setForm={setForm} handleEditOrAdd={handleAddOrEdit} isEditing={editId} setEditId={setEditId} />
     
    
     
    </div>
    </MainLayout>
  )
}

export default StudentManagement;

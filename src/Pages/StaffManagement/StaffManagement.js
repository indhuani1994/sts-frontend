import React, { useEffect, useState } from 'react';
import StaffTable from '../../Components/StaffTable/StaffTable';
import StaffDialogue from '../../Components/DialogueCard/StaffDialogue';
import { cusToast } from '../../Components/Toast/CusToast';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import '../Management.css';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';




const initialForm = {
  staffName: '',
  staffMobile: '',
  staffMail: '',
  staffAddress: '',
  staffQualification: [''],
  staffExperience: [''],
  staffRole: '',
  hrCommissionPercent: '',
  staffImage: null,
  staffAadharImage: null,
  staffImageExisting: '',
  staffAadharExisting: ''
};

function StaffManagement() {
  const [popup, setPopup] = useState(false);
 const [staffs, setStaffs] = useState([]);
 const [editId, setEditId] = useState(null);
 const [form, setForm] = useState(initialForm);
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(0);
 const [pageSize, setPageSize] = useState(10);
 const [total, setTotal] = useState(0);
 const [loading, setLoading] = useState(false);

  const fetchStaffs = async (searchText = query, currentPage = page, currentPageSize = pageSize) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/staffs', {
        params: {
          paginated: true,
          page: currentPage + 1,
          limit: currentPageSize,
          search: searchText || undefined,
        },
      });
      setStaffs(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (error) {
      cusToast('Failed to fetch staff. Please try again.', 'error');
      setStaffs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{
    fetchStaffs();
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchStaffs(query, 0, pageSize);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleDelete = async (id) => {
    const isDelete = (await confirmBox('You want to delete this staff')).isConfirmed;
    if (!isDelete) return;
    try {
         await apiClient.delete(`/api/staffs/${id}`);
    fetchStaffs();
    cusToast('staff Detail deleted successfully')
    } catch (error) {
    cusToast("Can't Delete Staff Details", 'error')
      
    }
 
  }
  const handleAddOrEdit = async () => {
    try {
      const formData = new FormData();

      formData.append('staffName', form.staffName || '');
      formData.append('staffMobile', form.staffMobile || '');
      formData.append('staffMail', form.staffMail || '');
      formData.append('staffAddress', form.staffAddress || '');
      formData.append('staffRole', form.staffRole || '');
      formData.append('hrCommissionPercent', form.hrCommissionPercent || 0);
      formData.append('staffQualification', JSON.stringify(form.staffQualification || []));
      formData.append('staffExperience', JSON.stringify(form.staffExperience || []));

      if (form.staffImage) {
        formData.append('staffImage', form.staffImage);
      }
      if (form.staffAadharImage) {
        formData.append('staffAadharImage', form.staffAadharImage);
      }

      if (editId) {
        await apiClient.put(`/api/staffs/${editId}`, formData);
      } else {
        await apiClient.post('/api/staffs', formData);
      }

    fetchStaffs();
    setForm(initialForm);
    setEditId(null);
    setPopup(false);
    editId ? cusToast('Form updated successfully'): cusToast('Form  submitted successfully')
    } catch (error) {
      cusToast(error.response?.data?.message || "Error occur can't submit form", 'error');
    }

   

  }
  const handleEdit = async(staff) => {
    try {
      setForm({
      ...staff,
      staffQualification: staff.staffQualification || [''],
      staffExperience: staff.staffExperience || [''],
      hrCommissionPercent: staff.hrCommissionPercent ?? '',
      staffImageExisting: staff.staffImage || '',
      staffAadharExisting: staff.staffAadharImage || '',
      staffImage: null,
      staffAadharImage: null
    });
    setEditId(staff._id);
    setPopup(true)
    } catch (error) {
      console.log('error in staff management page');
      
      console.log(error);
      
      alert('go and see staffmanagement and fix')
    }
    
  }
  return (
    <MainLayout>
    <div className='container mgmt-page'>
      <div className="mgmt-header">
        <h1 className="mgmt-title">Staff Management</h1>
        <div className="mgmt-actions">
          <input
            className="mgmt-input"
            placeholder="Search by name, email, mobile or role"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            className="mgmt-btn"
            onClick={() => {
              setPopup(true);
              setForm(initialForm);
            }}
          >
            Add Staff
          </button>
        </div>
      </div>
     
      <StaffTable
        onDelete={handleDelete}
        onEdit={handleEdit}
        staffs={staffs}
        page={page}
        pageSize={pageSize}
        rowCount={total}
        loading={loading}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchStaffs(query, newPage, pageSize);
        }}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(0);
          fetchStaffs(query, 0, newPageSize);
        }}
      />
    
      
   

    <StaffDialogue
      popup={popup}
      setOpen={setPopup}
      form={form}
      setForm={setForm}
      handleEditOrAdd={handleAddOrEdit}
      isEditing={!!editId}
    />

      

   
    </div>
    </MainLayout>
  )
}

export default StaffManagement;

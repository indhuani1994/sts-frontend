import React, { useEffect, useMemo, useState } from 'react';
import { cusToast } from '../../Components/Toast/CusToast';
import CompanyDialogue from '../../Components/DialogueCard/CompanyDialogue';
import CompanyTable from '../../Components/CompanyTable/CompanyTable';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';
import '../Management.css';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';

const initialForm = {
  companyName: '',
  companyLocation: ''
};

function CompanyManagement() {
  const [companies, setCompany] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await apiClient.get('/api/company');
      setCompany(res.data || []);
    } catch (error) {
      cusToast("Can't fetch company details", 'error');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('companyName', form.companyName);
      formData.append('companyLocation', form.companyLocation);

      if (file) formData.append('companyImage', file);

      if (editId) {
        await apiClient.put(`/api/company/${editId}`, formData);
      } else {
        await apiClient.post('/api/company', formData);
      }
      fetchCompany();
      setForm(initialForm);
      setEditId(null);
      setOpen(false);
      setFile(null);
      editId
        ? cusToast('Company updated successfully')
        : cusToast('Company added successfully');
    } catch (error) {
      cusToast('Failed to save company. Check image format and try again.', 'error');
    }
  };

  const handleEdit = (company) => {
    setForm(company);
    setEditId(company._id);
    setFile(null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
      const isDelete = (await confirmBox('You want to delete this alumni/student placement')).isConfirmed;
            if (!isDelete) return;
            
    try {
      await apiClient.delete(`/api/company/${id}`);
      fetchCompany();
      cusToast('Company deleted successfully');
    } catch (error) {
      cusToast('Company delete failed', 'error');
    }
  };

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };

  const filteredCompanies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((company) =>
      [company.companyName, company.companyLocation].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [companies, query]);

  return (
    <MainLayout>
      <div className="container mgmt-page">
        <div className="mgmt-header">
          <h1 className="mgmt-title">Company Management</h1>
          <div className="mgmt-actions">
            <input
              className="mgmt-input"
              placeholder="Search by company name or location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              className="mgmt-btn"
              onClick={() => {
                setOpen(true);
                setForm(initialForm);
                setEditId(null);
                setFile(null);
              }}
            >
              Add Company
            </button>
          </div>
        </div>

        <CompanyTable onEdit={handleEdit} onDelete={handleDelete} companies={filteredCompanies} />

        <CompanyDialogue
          open={open}
          setOpen={setOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isEditing={!!editId}
          onImageChange={handleImageChange}
          imagePreview={
            file
              ? URL.createObjectURL(file)
              : resolveFileUrl(form.companyImage)
          }
        />
      </div>
    </MainLayout>
  );
}

export default CompanyManagement;

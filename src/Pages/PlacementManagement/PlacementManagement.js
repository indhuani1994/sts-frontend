import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlacementTable from '../../Components/PlacementTable/PlacementTable';
import PlacementDialogue from '../../Components/DialogueCard/PlacementDialogue';
import { cusToast } from '../../Components/Toast/CusToast';
import MainLayout from '../../MainLayout.js/MainLayout';
import { API } from '../../API';
import './PlacementManagement.css';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';

const PlacementManagement = () => {
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [popup, setPopup] = useState(false);
  const [editData, setEditData] = useState(null);
  const [company, setCompany] = useState([]);
  const [filterField, setFilterField] = useState('student');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlacements = async () => {
    try {
      const res = await axios.get(`${API}/api/placements`);
      setPlacements(res.data);
    } catch (error) {
      cusToast('Error fetching placements', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (error) {
      console.log(error);
      cusToast("Can't fetch students", 'error');
    }
  };

  const fetchCompany = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/company`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompany(res.data);
    } catch (error) {
      console.log(error);
      cusToast("Can't fetch companies", 'error');
    }
  };

  useEffect(() => {
    fetchPlacements();
    fetchStudents();
    fetchCompany();
  }, []);

  const handleAddOrEdit = async (formData, isEditing) => {
    try {
      if (isEditing) {
        const id = formData.get('id');
        await axios.put(`${API}/api/placements/${id}`, formData);
      } else {
        await axios.post(`${API}/api/placements`, formData);
      }
      fetchPlacements();
      setPopup(false);
      setEditData(null);
      cusToast('Placement Details Saved Successfully');
    } catch (error) {
      cusToast("Can't save placement details", 'error');
    }
  };

  const handleDelete = async (id) => {
     const isDelete = (await confirmBox('You want to delete this alumni/student placement')).isConfirmed;
        if (!isDelete) return;
        
    try {
      await axios.delete(`${API}/api/placements/${id}`);
      fetchPlacements();
      cusToast('Placement Deleted Successfully');
    } catch (error) {
      cusToast("Can't delete placement", 'error');
    }
  };

  const handleEdit = (placement) => {
    setEditData(placement);
    setPopup(true);
  };

  const handleClearFilters = () => {
    setFilterField('student');
    setSearchTerm('');
  };

  const filteredPlacements = placements.filter((p) => {
    const term = searchTerm.toLowerCase();
    switch (filterField) {
      case 'student':
        return p.student?.studentName?.toLowerCase().includes(term);
      case 'role':
        return p.jobRole?.toLowerCase().includes(term);
      case 'company':
        return p.company?.companyName?.toLowerCase().includes(term);
      case 'location':
        return p.company?.companyLocation?.toLowerCase().includes(term);
      default:
        return true;
    }
  });

  return (
    <MainLayout>
      <div className="container placement-page">
        <div className="placement-hero">
          <div>
            <p className="placement-kicker">Admin Console</p>
            <h1>Placement Management</h1>
            <p className="placement-subtitle">
              Track student placements, keep company details in sync, and manage offers in one place.
            </p>
          </div>
          <div className="placement-hero-actions">
            <button className="placement-btn primary" onClick={() => { setEditData(null); setPopup(true); }}>
              Add Placement
            </button>
          </div>
        </div>

        <div className="placement-filters">
          <div className="placement-filter-group">
            <label htmlFor="placement-filter-field">Filter By</label>
            <select
              id="placement-filter-field"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              <option value="student">Student Name</option>
              <option value="role">Job Role</option>
              <option value="company">Company Name</option>
              <option value="location">Company Location</option>
            </select>
          </div>

          <div className="placement-filter-group">
            <label htmlFor="placement-search">Search</label>
            <input
              id="placement-search"
              type="text"
              placeholder={`Search by ${filterField}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="placement-filter-group">
            <label>Quick Filters</label>
            <div className="placement-filter-chips">
              {[
                { key: 'student', label: 'Student' },
                { key: 'company', label: 'Company' },
                { key: 'role', label: 'Role' },
                { key: 'location', label: 'Location' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`placement-chip ${filterField === item.key ? 'active' : ''}`}
                  onClick={() => setFilterField(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="placement-filter-actions">
            <div className="placement-result">Showing {filteredPlacements.length} records</div>
            <button className="placement-btn ghost" type="button" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <PlacementTable
          placements={filteredPlacements}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {popup && (
          <PlacementDialogue
            setOpen={setPopup}
            onSubmit={handleAddOrEdit}
            students={students}
            editData={editData}
            company={company}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PlacementManagement;

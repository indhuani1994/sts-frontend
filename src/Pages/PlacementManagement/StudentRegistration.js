import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../MainLayout.js/MainLayout';
import { API } from '../../API';
import { cusToast } from '../../Components/Toast/CusToast';
import './StudentRegistration.css';

// Icons
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);


const StudentRegistration = () => {
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const initialFormState = {
    studentId: '',
    courseId: '',
    staffId: '',
    courseFees: '',
    amountReceived: '',
    paymentType: 'Cash',
    courseDuration: '',
    freezingDate: '',
    secondInstallment: '',
    availTime: '',
    receiptGen: 'Admin'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch Data
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, stuRes, courseRes, staffRes] = await Promise.all([
        axios.get(`${API}/api/stureg`, getAuthHeader()),
        axios.get(`${API}/api/students`, getAuthHeader()),
        axios.get(`${API}/api/courses`, getAuthHeader()),
        axios.get(`${API}/api/staffs`, getAuthHeader())
      ]);
      setRegistrations(regRes.data);
      setStudents(stuRes.data);
      setCourses(courseRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      console.error(error);
      cusToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill fees if course selected
    if (name === 'courseId') {
      const selectedCourse = courses.find(c => c._id === value);
      if (selectedCourse) {
        setFormData(prev => ({ ...prev, courseFees: selectedCourse.fees, courseId: value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API}/api/stureg/${editId}`, formData, getAuthHeader());
        cusToast('Registration updated successfully');
      } else {
        await axios.post(`${API}/api/stureg`, formData, getAuthHeader());
        cusToast('Student registered successfully');
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      cusToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await axios.delete(`${API}/api/stureg/${id}`, getAuthHeader());
        cusToast('Registration deleted');
        fetchData();
      } catch (error) {
        cusToast('Failed to delete', 'error');
      }
    }
  };

  const openEditModal = (reg) => {
    setFormData({
      studentId: reg.student?._id || '',
      courseId: reg.course?._id || '',
      staffId: reg.staff?._id || '',
      courseFees: reg.courseFees,
      amountReceived: reg.amountReceived,
      paymentType: reg.paymentType || 'Cash',
      courseDuration: reg.courseDuration,
      freezingDate: reg.freezingDate ? reg.freezingDate.split('T')[0] : '',
      secondInstallment: reg.secondInstallment ? reg.secondInstallment.split('T')[0] : '',
      availTime: reg.availTime,
      receiptGen: reg.receiptGen
    });
    setEditId(reg._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  // Filter
  const filteredRegs = registrations.filter(r => 
    r.student?.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="reg-container">
        {/* Header Section */}
        <div className="reg-header">
          <div>
            <h1 className="reg-title">Student Registration</h1>
            <p className="reg-subtitle">Manage course enrollments and fee structures</p>
          </div>
          <button className="reg-btn-add" onClick={() => setShowModal(true)}>
            <span>+</span> New Registration
          </button>
        </div>

        {/* Search & Stats */}
        <div className="reg-controls">
          <div className="reg-search-box">
            <div className="search-icon">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Search students, courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="reg-stat">
            <span>Total Active: </span>
            <strong>{registrations.length}</strong>
          </div>
        </div>

        {/* Table Section */}
        <div className="reg-table-wrapper">
          <table className="reg-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Staff</th>
                <th>Fees</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center">Loading...</td></tr>
              ) : filteredRegs.length === 0 ? (
                <tr><td colSpan="8" className="text-center">No registrations found</td></tr>
              ) : (
                filteredRegs.map((reg) => (
                  <tr key={reg._id}>
                    <td>
                      <div className="reg-student-info">
                        <div className="reg-avatar">{reg.student?.studentName?.charAt(0)}</div>
                        <div>
                          <div className="fw-bold">{reg.student?.studentName}</div>
                          <div className="text-muted">{reg.student?.studentMobile}</div>
                        </div>
                      </div>
                    </td>
                    <td>{reg.course?.courseName}</td>
                    <td>{reg.staff?.staffName}</td>
                    <td>₹{reg.courseFees}</td>
                    <td className="text-success">₹{reg.amountReceived}</td>
                    <td className="text-danger">₹{reg.balance}</td>
                    <td>
                      <span className={`reg-badge ${reg.balance <= 0 ? 'paid' : 'due'}`}>
                        {reg.balance <= 0 ? 'Paid' : 'Due'}
                      </span>
                    </td>
                    <td>
                      <div className="reg-actions">
                        <button className="icon-btn edit" onClick={() => openEditModal(reg)} title="Edit">
                          <EditIcon />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(reg._id)} title="Delete">
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="reg-modal-overlay">
            <div className="reg-modal">
              <div className="reg-modal-header">
                <h2>{isEditing ? 'Edit Registration' : 'New Registration'}</h2>
                <button className="reg-close-btn" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="reg-form">
                <div className="reg-form-section">
                  <h3>Academic Details</h3>
                  <div className="reg-grid">
                    <div className="reg-field">
                      <label>Student <span className="req">*</span></label>
                      <select name="studentId" value={formData.studentId} onChange={handleInputChange} required disabled={isEditing}>
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.studentName} ({s.studentMobile})</option>)}
                      </select>
                    </div>
                    <div className="reg-field">
                      <label>Course <span className="req">*</span></label>
                      <select name="courseId" value={formData.courseId} onChange={handleInputChange} required>
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.courseName}</option>)}
                      </select>
                    </div>
                    <div className="reg-field">
                      <label>Assigned Staff <span className="req">*</span></label>
                      <select name="staffId" value={formData.staffId} onChange={handleInputChange} required>
                        <option value="">Select Staff</option>
                        {staff.map(s => <option key={s._id} value={s._id}>{s.staffName}</option>)}
                      </select>
                    </div>
                    <div className="reg-field">
                      <label>Duration</label>
                      <input type="text" name="courseDuration" value={formData.courseDuration} onChange={handleInputChange} placeholder="e.g. 6 Months" />
                    </div>
                    <div className="reg-field">
                      <label>Available Time</label>
                      <input type="text" name="availTime" value={formData.availTime} onChange={handleInputChange} placeholder="e.g. 10 AM - 12 PM" />
                    </div>
                  </div>
                </div>

                <div className="reg-form-section">
                  <h3>Financial Details</h3>
                  <div className="reg-grid">
                    <div className="reg-field">
                      <label>Total Fees <span className="req">*</span></label>
                      <input type="number" name="courseFees" value={formData.courseFees} onChange={handleInputChange} required />
                    </div>
                    <div className="reg-field">
                      <label>Initial Payment</label>
                      <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleInputChange} />
                    </div>
                    <div className="reg-field">
                      <label>Payment Mode</label>
                      <select name="paymentType" value={formData.paymentType} onChange={handleInputChange}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                    <div className="reg-field">
                      <label>Receipt Generated By</label>
                      <input type="text" name="receiptGen" value={formData.receiptGen} onChange={handleInputChange} />
                    </div>
                    <div className="reg-field">
                      <label>Freezing Date</label>
                      <input type="date" name="freezingDate" value={formData.freezingDate} onChange={handleInputChange} />
                    </div>
                    <div className="reg-field">
                      <label>Next Installment Date</label>
                      <input type="date" name="secondInstallment" value={formData.secondInstallment} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>

                <div className="reg-modal-footer">
                  <button type="button" className="reg-btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="reg-btn-primary">
                    {isEditing ? 'Update Registration' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentRegistration;
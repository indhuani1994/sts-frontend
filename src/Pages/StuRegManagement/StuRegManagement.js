import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../MainLayout.js/MainLayout';
import { API } from '../../API';
import { cusToast } from '../../Components/Toast/CusToast';
import './StuRegManagement.css';
import html2pdf from 'html2pdf.js';
import logo from '../../Assets/Images/logo png.png'
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';


// Icons
const EditIcon = ({ size = 18, color = "currentColor" }) =>
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17V7" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.883-.523-5.546-1.474l-6.328 1.671zm6.715-4.613c.96 1.139 2.315 1.848 3.782 1.848 5.421 0 9.82-4.399 9.821-9.82 0-2.655-1.04-5.15-2.915-7.024-1.875-1.875-4.37-2.915-7.024-2.915-5.42 0-9.819 4.399-9.819 9.819 0 2.105.67 4.135 1.903 5.804l-1.212 4.422 4.515-1.185z" />
  </svg>
);

const InstallmentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const StuRegManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRegForReceipt, setSelectedRegForReceipt] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // Installment Modal State
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedRegForInstallment, setSelectedRegForInstallment] = useState(null);
  const [installmentForm, setInstallmentForm] = useState({
    amount: '',
    mode: 'Cash',
    nextDate: '',
    latePenalty: ''
  });

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
    const isDelete = (await confirmBox('You want to delete this alumni/student placement')).isConfirmed;
                if (!isDelete) return;
                
    if (isDelete) {
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

  const handleViewReceipt = async (reg) => {
    if (!reg || !reg._id) {
      cusToast('Invalid registration selected', 'error');
      return;
    }
    setLoading(true);
    setSelectedRegForReceipt(reg);
    try {
      const historyRes = await axios.get(`${API}/api/stuins?registerId=${reg._id}`, getAuthHeader());
      setPaymentHistory(Array.isArray(historyRes.data) ? historyRes.data : (historyRes.data?.data || []));
      setShowReceiptModal(true);
    } catch (error) {
      console.error("Failed to fetch payment history", error);
      cusToast('Failed to fetch payment history', 'error');
      setPaymentHistory([]); // Ensure history is cleared on error
      setShowReceiptModal(true); // Still show the modal but with no history
    } finally {
      setLoading(false);
    }
  };

  // const handleSendEmail = async (regId) => {
  //   if (isSending) return;
  //   if (!window.confirm('Are you sure you want to send this receipt via email?')) return;

  //   setIsSending(true);
  //   try {
  //       await axios.post(`${API}/api/receipt/send`, { registerId: regId }, getAuthHeader());
  //       cusToast('Receipt sent successfully via Email');
  //   } catch (error) {
  //       console.error('Failed to send email', error);
  //       cusToast(error.response?.data?.message || 'Failed to send email', 'error');
  //   } finally {
  //       setIsSending(false);
  //   }
  // };

  const handleSendEmail = async (regId, pdfBlob) => {
    if (isSending) return;
    if (!window.confirm('Are you sure you want to send this receipt via email?')) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("registerId", regId);
      formData.append("receipt", pdfBlob, `Receipt-${regId}.pdf`);

      await axios.post(
        `${API}/api/receipt/send`,
        formData,
        {
          headers: {
            ...getAuthHeader().headers,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      cusToast("Receipt sent successfully via Email");
    } catch (error) {
      console.error("Email send failed:", error);
      cusToast(error.response?.data?.message || "Failed to send email", "error");
    } finally {
      setIsSending(false);
    }
  };
  const handleSendWhatsApp = (reg) => {
    if (!reg.student?.studentMobile) {
      cusToast('Student mobile number is not available.', 'error');
      return;
    }

    const message = `Dear ${reg.student.studentName},\n\nHere is your payment summary for the course: ${reg.course.courseName}.\n\nTotal Fees: ₹${reg.courseFees}\nTotal Paid: ₹${reg.amountReceived}\nBalance: ₹${reg.balance}\n\nThank you!\nSTS-Training`;

    // Basic validation for Indian mobile numbers
    let mobileNumber = reg.student.studentMobile.replace(/\D/g, '');
    if (mobileNumber.length === 10) {
      mobileNumber = `91${mobileNumber}`;
    }

    const whatsappUrl = `https://wa.me/${mobileNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openInstallmentModal = (reg) => {
    setSelectedRegForInstallment(reg);

    const isOverdue = reg.secondInstallment && new Date() > new Date(reg.secondInstallment);
    const penaltyAmount = isOverdue ? 250 : 0; // Fixed penalty of 250 if overdue

    setInstallmentForm({
      balance: reg.balance,
      amount: '',
      mode: 'Cash',
      nextDate: '',
      latePenalty: penaltyAmount
    });
    setShowInstallmentModal(true);
  };

  const handleInstallmentSubmit = async (e) => {
    e.preventDefault();
    console.log(installmentForm)
    if (!installmentForm.amount) {
      cusToast('Please enter an amount', 'error');
      return;
    }

    try {
      await axios.post(`${API}/api/stuins`, {
        registerId: selectedRegForInstallment._id,
        amountPaid: installmentForm.amount,
        latePenalty: installmentForm.latePenalty,
        paymentMode: installmentForm.mode,
        nextIns: installmentForm.nextDate,
        receiptGen: 'Admin'
      }, getAuthHeader());

      cusToast('Installment added successfully');
      setShowInstallmentModal(false);

      // Refresh data to get updated balance, then open receipt
      setLoading(true);
      const regRes = await axios.get(`${API}/api/stureg`, getAuthHeader());
      setRegistrations(regRes.data);

      const updatedReg = regRes.data.find(r => r._id === selectedRegForInstallment._id);
      if (updatedReg) {
        handleViewReceipt(updatedReg);
      }
      setLoading(false);

    } catch (error) {
      console.error(error);
      cusToast(error.response?.data?.message || 'Failed to add installment', 'error');
    }
  };

  // Filter
  const filteredRegs = registrations.filter(r => {
    const matchesSearch = r.student?.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStaff = filterStaff ? r.staff?._id === filterStaff : true;
    const matchesStatus = filterStatus ? (filterStatus === 'Paid' ? r.balance <= 0 : r.balance > 0) : true;
    return matchesSearch && matchesStaff && matchesStatus;
  });

  

  return (
    <MainLayout>
      <div className="reg-container" >
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

          <select
            className='select'
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
          >
            <option value="">All Staff</option>
            {staff.map(s => <option key={s._id} value={s._id}>{s.staffName}</option>)}
          </select>

          <select
            className='select'
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>

          <div className="reg-stat">
            <span>Total Active: </span>
            <strong>{filteredRegs.length}</strong>
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
                      <div className="receipt-status-cell">
                        <span className={`reg-badge ${reg.balance <= 0 ? 'paid' : 'due'}`}>
                          {reg.balance <= 0 ? 'Paid' : 'Due'}
                        </span>
                        <button className="icon-btn view" onClick={() => handleViewReceipt(reg)} title="View Receipt" style={{ color: "#fff", fontWeight: '900' }}>
                          <ReceiptIcon />📃
                        </button>
                        <button className="icon-btn installment" onClick={() => openInstallmentModal(reg)} title="Add Installment" disabled={reg.balance <= 0} style={{ color: "#fff", fontWeight: '900', background: "#4dd5ea" }}>
                          <InstallmentIcon /> $
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="reg-actions">
                        <button className="icon-btn edit" onClick={() => openEditModal(reg)} title="Edit" style={{ color: "#fff", fontWeight: '900' }}>
                         ⏱️

                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(reg._id)} title="Delete" style={{ color: "#fff", fontWeight: '900' }}>
                          <DeleteIcon /> 🗑
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
          <div className="reg-modal-overlay" onClick={closeModal}>
            <div className="reg-modal" onClick={(e)=>e.stopPropagation()}>
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
                    {/* <div className="reg-field">
                      <label>Initial Payment</label>
                      <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleInputChange} />
                    </div> */}
                    {/* <div className="reg-field">
                      <label>Payment Mode</label>
                      <select name="paymentType" value={formData.paymentType} onChange={handleInputChange}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div> */}
                    {/* <div className="reg-field">
                      <label>Receipt Generated By</label>
                      <input type="text" name="receiptGen" value={formData.receiptGen} onChange={handleInputChange} />
                    </div> */}
                    <div className="reg-field">
                      <label>Course End Date (Freezing)</label>
                      <input type="date" name="freezingDate" value={formData.freezingDate} onChange={handleInputChange} />
                    </div>
                    {/* Show Next Installment Date only if there is a balance */}
                    {/* {Number(formData.amountReceived) < Number(formData.courseFees) && (
                      <div className="reg-field">
                        <label>Next Installment Date</label>
                        <input type="date" name="secondInstallment" value={formData.secondInstallment} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} />
                      </div>
                    )} */}
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

        {showReceiptModal && selectedRegForReceipt && (
          <ReceiptModal
            reg={selectedRegForReceipt}
            history={paymentHistory}
            onClose={() => setShowReceiptModal(false)}
            isSending={isSending}
            onSendEmail={handleSendEmail}
            onSendWhatsApp={handleSendWhatsApp}
            setIsSending={setIsSending}
          />
        )}

        {showInstallmentModal && (
          <div className="reg-modal-overlay">
            <div className="reg-modal" style={{ maxWidth: '500px' }}>
              <div className="reg-modal-header">
                <h2>Add Installment</h2>
                <button className="reg-close-btn" onClick={() => setShowInstallmentModal(false)}>×</button>
              </div>
              <form onSubmit={handleInstallmentSubmit} className="reg-form">
                <div className="reg-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="reg-field">
                    <label>Student Name</label>
                    <input type="text" value={selectedRegForInstallment?.student?.studentName || ''} disabled style={{ background: '#f3f4f6' }} />
                  </div>
                   <div className="reg-field">
                    <label>Balance</label>
                    <input type="text" value={installmentForm.balance || ''} disabled style={{ background: '#f3f4f6' }} />
                  </div>
                  <div className="reg-field">
                    <label>Amount Paid <span className="req">*</span></label>
                    <input type="number" value={installmentForm.amount} onChange={(e) => setInstallmentForm({ ...installmentForm, amount: e.target.value })} required placeholder="Enter amount" />
                  </div>
                  <div className="reg-field">
                    <label>Late Penalty {selectedRegForInstallment?.secondInstallment && new Date() > new Date(selectedRegForInstallment.secondInstallment) && <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>(Overdue)</span>}</label>
                    <input type="number" value={installmentForm.latePenalty} disabled placeholder="Penalty amount" style={{ background: '#f3f4f6', color: '#6b7280' }} />
                  </div>
                  <div className="reg-field">
                    <label>Payment Mode</label>
                    <select value={installmentForm.mode} onChange={(e) => setInstallmentForm({ ...installmentForm, mode: e.target.value })}>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  <div className="reg-field">
                    <label>Next Installment Date</label>


                    <input type="date" value={installmentForm.nextDate} onChange={(e) => setInstallmentForm({ ...installmentForm, nextDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="reg-modal-footer">
                  <button type="button" className="reg-btn-ghost" onClick={() => setShowInstallmentModal(false)}>Cancel</button>
                  <button type="submit" className="reg-btn-primary">Submit Payment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// const ReceiptModal = ({ reg, history, onClose, isSending, onSendEmail, onSendWhatsApp, setIsSending }) => {
//     const receiptRef = React.useRef();

//     const handlePrint = () => window.print();

//     const initialPayment = {
//       createdAt: reg.createdAt,
//       amountPaid: reg.amountReceived || 0,
//       paymentMode: reg.paymentType,
//       latePenalty: 0
//     };

//     const totalPenaltiesPaid = history.reduce((acc, item) => acc + (Number(item.latePenalty) || 0), 0);
//     const allPayments = [
//         ...(initialPayment.amountPaid > 0 ? [initialPayment] : []),
//         ...history
//     ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

//     return (
//         <div className="premium-receipt-overlay">
//             <div className="premium-receipt-card">
//                 {/* Printable Area */}
//                 <div className="premium-printable" ref={receiptRef}>

//                     {/* Decorative Top Bar */}
//                     <div className="premium-accent-bar"></div>

//                     <div className="premium-header">
//                         <div className="brand-section">
//                             <img src={logo} className='logo'/>
//                             <p className="brand-tagline">Excellence in Professional Education</p>
//                         </div>
//                         <div className="invoice-meta">
//                             <div className="meta-details">
//                                 <p><span>Receipt No:</span> <strong>#STS-{reg._id.slice(-6).toUpperCase()}</strong></p>
//                                 <p><span>Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="premium-content">
//                         <div className="info-grid-premium">
//                             <div className="info-box">
//                                 <label>RECIPIENT</label>
//                                 <h3>{reg.student?.studentName}</h3>
//                                 <p>{reg.student?.studentMail}</p>
//                                 <p>{reg.student?.studentMobile}</p>
//                             </div>
//                             <div className="info-box">
//                                 <label>ENROLLMENT DETAILS</label>
//                                 <h3>{reg.course?.courseName}</h3>
//                                 <p>Instructor: {reg.staff?.staffName}</p>
//                                 <p>Batch: {reg.courseDuration || 'Full Time'}</p>
//                             </div>
//                         </div>

//                         <div className="table-wrapper-premium">
//                             <table className="premium-table">
//                                 <thead>
//                                     <tr>
//                                         <th>Transaction Date</th>
//                                         <th>Description</th>
//                                         <th className="text-right">Penalty</th>
//                                         <th className="text-right">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {allPayments.map((item, index) => (
//                                         <tr key={index}>
//                                             <td>{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
//                                             <td>{index === 0 ? 'Registration Deposit' : `Installment (${item.paymentMode || 'Transfer'})`}</td>
//                                             <td className="text-right">₹{Number(item.latePenalty || 0).toLocaleString()}</td>
//                                             <td className="text-right payment-amt">₹{Number(item.amountPaid || item.amountReceived).toLocaleString()}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="premium-footer-section">
//                             <div className="terms-box">
//                                 <h4>Terms & Conditions</h4>
//                                 <p>1. This receipt confirms the partial/full payment of course fees.</p>
//                                 <p>2. Fees once paid are non-refundable under any circumstances.</p>
//                                 {reg.balance > 0 && <p className="next-due">Next Installment Due: <strong>{new Date(reg.secondInstallment).toLocaleDateString()}</strong></p>}
//                             </div>

//                             <div className="totals-box">
//                                 <div className="total-row">
//                                     <span>Course Subtotal</span>
//                                     <span>₹{Number(reg.courseFees).toLocaleString()}</span>
//                                 </div>
//                                 <div className="total-row">
//                                     <span>Late Penalties</span>
//                                     <span>₹{totalPenaltiesPaid.toLocaleString()}</span>
//                                 </div>
//                                 <div className="total-row grand-total">
//                                     <span>Amount Paid</span>
//                                     <span>₹{Number(reg.amountReceived).toLocaleString()}</span>
//                                 </div>
//                                 <div className="total-row balance-row">
//                                     <span>Balance Due</span>
//                                     <span>₹{Number(reg.balance).toLocaleString()}</span>
//                                 </div>
//                                 {reg.balance <= 0 && <div className="paid-stamp">PAID IN FULL</div>}
//                             </div>
//                         </div>
//                     </div>
//                      <div className="placeholder-receipt"><img src={logo} /></div>
//                 </div>

//                 {/* Control Actions */}
//                 <div className="premium-actions">
//                     <button className="btn-secondary" onClick={onClose}>Close</button>
//                     <div className="action-group">
//                         <button className="btn-print" onClick={handlePrint}>Print Document</button>
//                         <button className="btn-whatsapp" onClick={() => onSendWhatsApp(reg)}>WhatsApp</button>
//                         {/* <button className="btn-primary" onClick={() => onSendEmail(reg._id)} disabled={isSending}>
//                             {isSending ? 'Processing...' : 'Send via Email'}
//                         </button> */}


// <button
//   className="btn-primary"
//   disabled={isSending}
//   onClick={async () => {
//     if (isSending) return;

//     try {
//       const element = receiptRef.current;

//       // 🔥 IMPORTANT FIX START
//       const originalHeight = element.style.height;
//       const originalOverflow = element.style.overflow;

//       element.style.height = "auto";
//       element.style.overflow = "visible";
//       // 🔥 IMPORTANT FIX END

//       const options = {
//         margin: 0.3,
//         filename: `Receipt-${reg._id}.pdf`,
//         image: { type: "jpeg", quality: 1 },
//         html2canvas: { 
//           scale: 3,
//           useCORS: true,
//           scrollY: 0
//         },
//         jsPDF: { 
//           unit: "mm", 
//           format: "a4", 
//           orientation: "portrait" 
//         },
//         pagebreak: { mode: ["avoid-all", "css", "legacy"] }
//       };

//       const pdfBlob = await html2pdf()
//         .set(options)
//         .from(element)
//         .outputPdf("blob");

//       // 🔥 Restore original styles
//       element.style.height = originalHeight;
//       element.style.overflow = originalOverflow;

//       const formData = new FormData();
//       formData.append("email", reg.student?.studentMail);
//       formData.append(
//         "message",
//         `Dear ${reg.student?.studentName}, please find your receipt attached.`
//       );
//       formData.append("receipt", pdfBlob, `Receipt-${reg._id}.pdf`);

//       setIsSending(true);

//       await axios.post(`${API}/api/receipt`, formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "Content-Type": "multipart/form-data"
//         }
//       });

//       cusToast("Receipt sent successfully via Email");

//     } catch (error) {
//       console.error("Email send failed:", error);
//       cusToast(
//         error.response?.data?.error || "Failed to send email",
//         "error"
//       );
//     } finally {
//       setIsSending(false);
//     }
//   }}
// >
//   {isSending ? "Processing..." : "Send via Email"}
// </button>
//                     </div>
//                 </div>


//             </div>
//         </div>
//     );
// };


const ReceiptModal = ({ reg, history, onClose, isSending, onSendEmail, onSendWhatsApp, setIsSending }) => {
  const receiptRef = React.useRef();
  const totalInstallmentsPaid = (history || []).reduce(
  (acc, item) => acc + (Number(item.amountPaid) || 0),
  0
);
const registrationAmount =
  (Number(reg.amountReceived) || 0) - totalInstallmentsPaid;
  const handlePrint = () => window.print();
  const initialPayment = {
    createdAt: reg.createdAt,
   amountPaid: registrationAmount > 0 ? registrationAmount : 0,
    paymentMode: reg.paymentType || "Registration",
    latePenalty: 0,
    isInitial: true
  };

  
  const allPayments = [
    initialPayment,
    ...(history || [])
  ]
    .filter(item => Number(item.amountPaid || item.amountReceived) > 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const totalPaidAmount = allPayments.reduce(
  (acc, item) => acc + Number(item.amountPaid || item.amountReceived || 0),
  0
);

  const totalPenaltiesPaid = allPayments.reduce(
  (acc, item) => acc + Number(item.latePenalty || 0),
  0
);  


const latestInstallment =
  history && history.length > 0
    ? [...history].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0]
    : null;

const nextInstallmentDate =
  latestInstallment?.nextIns || reg.secondInstallment || null;


  return (
    <div className="premium-receipt-overlay">
      <div className="premium-receipt-card">
        {/* Printable Area */}
        <div className="premium-printable" ref={receiptRef}>

          {/* Decorative Top Bar */}
          <div className="premium-accent-bar"></div>

          <div className="premium-header">
            <div className="brand-section">
              <img src={logo} className='logo' />
              <p className="brand-tagline">Excellence in Professional Education</p>
            </div>
            <div className="invoice-meta">
              <div className="meta-details">
                <p><span>Receipt No:</span> <strong>#STS-{reg._id.slice(-6).toUpperCase()}</strong></p>
                <p><span>Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="premium-content">
            <div className="info-grid-premium">
              <div className="info-box">
                <label>RECIPIENT</label>
                <h3>{reg.student?.studentName}</h3>
                <p>{reg.student?.studentMail}</p>
                <p>{reg.student?.studentMobile}</p>
              </div>
              <div className="info-box">
                <label>ENROLLMENT DETAILS</label>
                <h3>{reg.course?.courseName}</h3>
                <p>Instructor: {reg.staff?.staffName}</p>
                <p>Batch: {reg.courseDuration || 'Full Time'}</p>
              </div>
            </div>

            <div className="table-wrapper-premium">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Transaction Date</th>
                    <th>Description</th>
                    <th className="text-right">Penalty</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                {/* <tbody>
                  {allPayments.map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                      <td>{index === 0 ? 'Registration Deposit' : `Installment (${item.paymentMode || 'Transfer'})`}</td>
                      <td className="text-right">₹{Number(item.latePenalty || 0).toLocaleString()}</td>
                      <td className="text-right payment-amt">₹{Number(item.amountPaid || item.amountReceived).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody> */}
                <tbody>
  {allPayments.map((item, index) => (
    <tr key={index}>
      <td>{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>

      <td>
        {item.isInitial
          ? "Registration Payment"
          : `Installment (${item.paymentMode || "Transfer"})`}
      </td>

      <td className="text-right">
        ₹{Number(item.latePenalty || 0).toLocaleString()}
      </td>

      <td className="text-right payment-amt">
        ₹{Number(item.amountPaid || item.amountReceived || 0).toLocaleString()}
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>

            <div className="premium-footer-section">
<div className="terms-box">
  <h4>Terms & Conditions</h4>
  <p>1. This receipt confirms the partial/full payment of course fees.</p>
  <p>2. Fees once paid are non-refundable under any circumstances.</p>

 {reg.balance > 0 && nextInstallmentDate && (
  <p className="next-due">
    Next Installment Due:{" "}
    <strong>
      {new Date(nextInstallmentDate).toLocaleDateString("en-GB")}
    </strong>
  </p>
)}
</div>

              <div className="totals-box">
                <div className="total-row">
                  <span>Course Subtotal</span>
                  <span>₹{Number(reg.courseFees).toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Late Penalties</span>
                  <span>₹{totalPenaltiesPaid.toLocaleString()}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Amount Paid</span>
                  <span>₹{totalPaidAmount.toLocaleString()}</span>
                </div>
                <div className="total-row balance-row">
                  <span>Balance Due</span>
                  <span>₹{Number(reg.balance).toLocaleString()}</span>
                </div>
                {reg.balance <= 0 && <div className="paid-stamp">PAID IN FULL</div>}
              </div>
            </div>
          </div>
          <div className="placeholder-receipt"><img src={logo} /></div>
        </div>

        {/* Control Actions */}
        <div className="premium-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <div className="action-group">
            <button className="btn-print" onClick={handlePrint}>Print Document</button>
            <button className="btn-whatsapp" onClick={() => onSendWhatsApp(reg)}>WhatsApp</button>
            {/* <button className="btn-primary" onClick={() => onSendEmail(reg._id)} disabled={isSending}>
                            {isSending ? 'Processing...' : 'Send via Email'}
                        </button> */}


            <button
              className="btn-primary"
              disabled={isSending}
              onClick={async () => {
                if (isSending) return;

                try {
                  const element = receiptRef.current;

                  // 🔥 IMPORTANT FIX START
                  const originalHeight = element.style.height;
                  const originalOverflow = element.style.overflow;

                  element.style.height = "auto";
                  element.style.overflow = "visible";
                  // 🔥 IMPORTANT FIX END

                  const options = {
                    margin: 0.3,
                    filename: `Receipt-${reg._id}.pdf`,
                    image: { type: "jpeg", quality: 1 },
                    html2canvas: {
                      scale: 3,
                      useCORS: true,
                      scrollY: 0
                    },
                    jsPDF: {
                      unit: "mm",
                      format: "a4",
                      orientation: "portrait"
                    },
                    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
                  };

                  const pdfBlob = await html2pdf()
                    .set(options)
                    .from(element)
                    .outputPdf("blob");

                  // 🔥 Restore original styles
                  element.style.height = originalHeight;
                  element.style.overflow = originalOverflow;

                  const formData = new FormData();
                  formData.append("email", reg.student?.studentMail);
                  formData.append(
                    "message",
                    `Dear ${reg.student?.studentName}, please find your receipt attached.`
                  );
                  formData.append("receipt", pdfBlob, `Receipt-${reg._id}.pdf`);

                  setIsSending(true);

                  await axios.post(`${API}/api/receipt`, formData, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "Content-Type": "multipart/form-data"
                    }
                  });

                  cusToast("Receipt sent successfully via Email");

                } catch (error) {
                  console.error("Email send failed:", error);
                  cusToast(
                    error.response?.data?.error || "Failed to send email",
                    "error"
                  );
                } finally {
                  setIsSending(false);
                }
              }}
            >
              {isSending ? "Processing..." : "Send via Email"}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default StuRegManagement;
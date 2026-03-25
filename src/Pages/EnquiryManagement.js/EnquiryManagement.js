import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { cusToast } from '../../Components/Toast/CusToast';
// Removed unused imports: StuRegDialogue, StuRegDetails, InstallDialogue, StuInsTable, StuInsDetails
import EnquiryDialogue from '../../Components/DialogueCard/EnquiryDialogue';
import EnquiryTable from '../../Components/EnquiryTable/EnquiryTable'; // Assuming EnquiryTable is a component you created
import { useLocation } from 'react-router-dom';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';
import coolAlarm from '../../Assets/audio/coolAlarm.mp3';
import MainLayout from '../../MainLayout.js/MainLayout';
import './EnquiryManagement.css';

import { EnquiryContext } from '../../context/EnquiryContextProvider';

 

const InstallmentPage = () => {
    
    const [enquiry, setEnquiry] = useState([]);
    const [popup, setPopup] = useState(false);
    const [editData, setEditData] = useState(null);
    const hasShownToast = useRef(false);
    const notifiedRef = useRef(new Set());
    const getQuery = useLocation();
    const [filters, setFilters] = useState({
        name: '',
        course: '',
        status: 'all',
        priority: 'all',
        'hr': '',
        date: ''
    });
    const role = localStorage.getItem('role');

   const {handleCount} = useContext(EnquiryContext)


    useEffect(() => {
        if (getQuery.state && !hasShownToast.current) {
            cusToast(getQuery.state.enquiry.message);
            hasShownToast.current = true;
        }
    }, [getQuery.state])

    useEffect(() => {
        const activeKeys = new Set();
        enquiry.forEach((item) => {
            if (!item.enNextFollowUp) return;
            const followUpTime = new Date(item.enNextFollowUp).getTime();
            if (Number.isNaN(followUpTime)) return;
            const key = `${item._id || item.id || ''}:${followUpTime}`;
            activeKeys.add(key);
        });
        // prune old keys so the set doesn't grow forever
        notifiedRef.current.forEach((key) => {
            if (!activeKeys.has(key)) {
                notifiedRef.current.delete(key);
            }
        });

        const interval = setInterval(() => {
            const now = Date.now();
            enquiry.forEach((item) => {
                if (!item.enNextFollowUp) return;
                const followUpTime = new Date(item.enNextFollowUp).getTime();
                if (Number.isNaN(followUpTime)) return;

                const key = `${item._id || item.id || ''}:${followUpTime}`;
                // Trigger sound when the time has passed (within a 1-minute window)
                if (Math.abs(now - followUpTime) < 60000 && !notifiedRef.current.has(key)) {
                    ringBell();
                    notifiedRef.current.add(key);
                }
            });
        }, 30000); // check every 30 seconds

        return () => clearInterval(interval);
    }, [enquiry]);

const ringBell = () => {
  const audio = new Audio(coolAlarm);
  audio.play();
};

    // Moved getPriority function from FollowUpPage
    // const getPriority = (dateString) => {
    //     if (!dateString) {
    //         return { label: 'N/A', className: 'priority normal' }; // Handle cases where follow-up date might be missing
    //     }
    //     const followUpDate = new Date(dateString);
    //     const today = new Date();

    //     followUpDate.setHours(0, 0, 0, 0);
    //     today.setHours(0, 0, 0, 0);

    //     const diffDays = Math.floor((followUpDate - today) / (1000 * 60 * 60 * 24));

    //     if (diffDays < 0) return { label: 'Overdue', className: 'priority overdue' };
    //     if (diffDays === 0) return { label: 'Urgent', className: 'priority urgent' };
    //     if (diffDays <= 3) return { label: 'Upcoming', className: 'priority upcoming' };
    //     return { label: 'Normal', className: 'priority normal' };
    // };

//     const getPriority = (item) => {
//     // ✅ If registered → override everything
//     const statusText = String(item.enStatus || '').toLowerCase();
//     const registerStatusText = String(item.registerStatus || '').toLowerCase();

//     if (statusText === 'registered' || registerStatusText === 'registered' || registerStatusText === 'student_added') {
//         return { label: 'Registered', className: 'priority registered' };
//     }

//     if (!item.enNextFollowUp) {
//         return { label: 'N/A', className: 'priority normal' };
//     }

//     const followUpDate = new Date(item.enNextFollowUp);
//     const today = new Date();

//     followUpDate.setHours(0, 0, 0, 0);
//     today.setHours(0, 0, 0, 0);

//     const diffDays = Math.floor((followUpDate - today) / (1000 * 60 * 60 * 24));

//     if (diffDays < 0) return { label: 'Overdue', className: 'priority overdue' };
//     if (diffDays === 0) return { label: 'Urgent', className: 'priority urgent' };
//     if (diffDays <= 3) return { label: 'Upcoming', className: 'priority upcoming' };

//     return { label: 'Normal', className: 'priority normal' };
// };

const getPriority = (item) => {
  const registerStatusText = String(item.registerStatus || '').toLowerCase();
  const statusText = String(item.enStatus || '').toLowerCase();

  // ✅ Registered should override follow-up priority
  if (
    registerStatusText === 'registered' ||
    registerStatusText === 'student_added' ||
    statusText === 'registered'
  ) {
    return { label: 'Registered', className: 'priority registered' };
  }

  if (!item.enNextFollowUp) {
    return { label: 'N/A', className: 'priority normal' };
  }

  const followUpDate = new Date(item.enNextFollowUp);
  const today = new Date();

  followUpDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((followUpDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', className: 'priority overdue' };
  if (diffDays === 0) return { label: 'Urgent', className: 'priority urgent' };
  if (diffDays <= 3) return { label: 'Upcoming', className: 'priority upcoming' };

  return { label: 'Normal', className: 'priority normal' };
};
    const fetchEnquiry = useCallback(async () => {
        try {
            const res = await apiClient.get('/api/enquiry');

            // Remove duplicate entries based on _id
            const uniqueEnquiries = Array.from(
                new Map(res.data.map(item => [item._id, item])).values()
            );

            // Add priority info (from getPriority)
            const updatedEnquiry = uniqueEnquiries.map(item => ({
                ...item,
                priorityInfo: getPriority(item)
            }));

            // Optional: if you want to hide overdue enquiries, uncomment the next line
            // const filtered = updatedEnquiry.filter(e => e.priorityInfo.label.toLowerCase() !== 'overdue');

            // Sort by priority: urgent > upcoming > normal > overdue
            const priorityOrder = ['overdue', 'urgent', 'upcoming', 'normal','registered' ];
            const sortedEnquiry = updatedEnquiry.sort((a, b) => {
                const aPriority = a.priorityInfo.label.toLowerCase();
                const bPriority = b.priorityInfo.label.toLowerCase();
                return priorityOrder.indexOf(aPriority) - priorityOrder.indexOf(bPriority);
            });

            // Set final data to state
            setEnquiry(sortedEnquiry);
        } catch (error) {
            cusToast('Error fetching enquiries', 'error');
            console.error("Error fetching enquiries:", error);
        }
    }, []);


    useEffect(() => {
        fetchEnquiry();
    }, [fetchEnquiry]);

    const handleAddOrEdit = async (formData, isEditing) => {
        const dataToSend = Object.fromEntries(formData.entries());

        try {
            if (isEditing) {
                const id = formData.get('id');
                await apiClient.put(`/api/enquiry/${id}`, dataToSend);
            cusToast('Enquiry Details Updated Successfully'); // Changed message for clarity

            } else {
                await apiClient.post('/api/enquiry', dataToSend);
                 cusToast('Enquiry Details Saved Successfully'); // Changed message for clarity
            }
            fetchEnquiry(); // Re-fetch enquiries to update the table
            setPopup(false);
            setEditData(null);
        
            
        } catch (error) {
            cusToast("Can't save enquiry details", 'error'); // Changed message for clarity
            console.error("Error saving enquiry:", error);
        }
    };

    
    const handleDelete = async (id) => {
      const isDelete =   (await confirmBox('Do you want to delete this enquiry')).isConfirmed ;
            if (!isDelete) return;
        try {
            await apiClient.delete(`/api/enquiry/${id}`);
            fetchEnquiry(); // Re-fetch enquiries to update the table
            cusToast('Enquiry Deleted Successfully'); // Changed message for clarity
        } catch (error) {
            cusToast("Can't delete enquiry", 'error'); // Changed message for clarity
            console.error("Error deleting enquiry:", error);
        }
    };

    const handleEdit = (enquiryItem) => { // Renamed parameter from 'stureg' to 'enquiryItem' for clarity
        setEditData(enquiryItem);
        setPopup(true);
    };

    const handleCopy = async (item) => {
       
        const isCopy = (await confirmBox('Do you want to copy this enquiry')).isConfirmed;
        if (isCopy) {
            try {
                await apiClient.post('/api/enquiry', item);
                fetchEnquiry(); // Re-fetch enquiries to update the table
                setPopup(false);
                setEditData(null);
                cusToast('copy successfully');
            } catch (error) {
                cusToast("can't copy", 'error'); // Changed message for clarity
                console.error("Error saving enquiry:", error);
            }
        }
    }

    const handleRegister = async (item) => {
        try {
            await apiClient.patch(`/api/enquiry/${item._id}/register`);
            fetchEnquiry();
            cusToast('Marked as registered');
        } catch (error) {
            cusToast("Can't update register status", 'error');
        }
    };

    const handleEarningsStatus = async (item, status) => {
        try {
            await apiClient.patch(`/api/enquiry/${item._id}/earnings-status`, { status });
            fetchEnquiry();
            cusToast('Earnings status updated');
        } catch (error) {
            cusToast("Can't update earnings status", 'error');
        }
    };

    const statusOptions = useMemo(() => {
        const options = new Set();
        enquiry.forEach((item) => {
            if (item.enStatus) {
                options.add(String(item.enStatus));
            }
        });
        return ['all', ...Array.from(options)];
    }, [enquiry]);

    const priorityOptions = ['all','overdue', 'urgent', 'upcoming', 'normal', 'registered',  'n/a'];

    const filteredEnquiry = useMemo(() => {
        const nameQuery = filters.name.trim().toLowerCase();
        const courseQuery = filters.course.trim().toLowerCase();
        const statusQuery = filters.status.toLowerCase();
        const priorityQuery = filters.priority.toLowerCase();
        const hrQuery = filters.hr.trim().toLowerCase();
        const dateQuery = filters.date;

        return enquiry.filter((item) => {
            const nameMatch = nameQuery
                ? String(item.enName || '').toLowerCase().includes(nameQuery)
                : true;
            const courseMatch = courseQuery
                ? String(item.enCourse || '').toLowerCase().includes(courseQuery)
                : true;
            const statusMatch = statusQuery === 'all'
                ? true
                : String(item.enStatus || '').toLowerCase() === statusQuery;
            const priorityLabel = String(item.priorityInfo?.label || 'N/A').toLowerCase();
            const priorityMatch = priorityQuery === 'all'
                ? true
                : priorityLabel === priorityQuery;
            const hrMatch = hrQuery
                ? [
                      item.enHR,
                      item.createdBy?.staffName,
                      item.createdBy?.staffMail,
                      item.registeredBy?.staffName,
                      item.registeredBy?.staffMail,
                  ]
                      .filter(Boolean)
                      .some((value) => String(value).toLowerCase().includes(hrQuery))
                : true;
            const dateMatch = dateQuery
                ? (() => {
                      const followUp = item.enNextFollowUp ? new Date(item.enNextFollowUp) : null;
                      if (!followUp || Number.isNaN(followUp.getTime())) return false;
                      const selected = new Date(dateQuery);
                      if (Number.isNaN(selected.getTime())) return false;
                      return (
                          followUp.getFullYear() === selected.getFullYear() &&
                          followUp.getMonth() === selected.getMonth() &&
                          followUp.getDate() === selected.getDate()
                      );
                  })()
                : true;

            return nameMatch && courseMatch && statusMatch && priorityMatch && hrMatch && dateMatch;
        });
    }, [enquiry, filters]);
const now = new Date().toISOString().slice(0,16);

useEffect(() => {
    const count = enquiry.filter(item => {
        const priority = item.priorityInfo?.label?.toLowerCase();
        return priority === 'urgent' || priority === 'overdue';
    }).length;

    handleCount(count);
}, [enquiry, handleCount]);


    return (
        <MainLayout>
        <div className="enquiry-page">
            <div className="enquiry-hero">
                <div>
                    <h1>Enquiries</h1>
                    <p>Track leads, plan follow-ups, and convert more registrations.</p>
                </div>
                <button className="enquiry-add-btn" onClick={() => { setEditData(null); setPopup(true); }}>
                    Add Enquiry
                </button>
            </div>

            <div className="enquiry-filters">
                <div className="filter-group">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={filters.name}
                        onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="filter-group">
                    <label>Course</label>
                    <input
                        type="text"
                        placeholder="Search by course..."
                        value={filters.course}
                        onChange={(e) => setFilters((prev) => ({ ...prev, course: e.target.value }))}
                    />
                </div>
                <div className="filter-group">
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All' : status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
    <label>HR</label>
    <input
        type="text"
        placeholder="Search by HR..."
        value={filters.hr}
        onChange={(e) => setFilters((prev) => ({ ...prev, hr: e.target.value }))}
    />
</div>
                <div className="filter-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                    />
                </div>
                <div className="filter-group">
                    <label>Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                    >
                        {priorityOptions.map((priority) => (
                            <option key={priority} value={priority}>
                                {priority === 'all' ? 'All' : priority.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    className="enquiry-clear"
                    onClick={() => setFilters({ name: '', course: '', status: 'all', priority: 'all', hr: '', date: '' })}
                >
                    Clear Filters
                </button>
            </div>

            <EnquiryTable
                enquiries={filteredEnquiry}
                onEdit={handleEdit}
                onDelete={handleDelete}
                handleCopy={handleCopy}
                role = {role}
                onRegister={handleRegister}
                onEarningsStatus={handleEarningsStatus}
            />

            {popup && (
                <EnquiryDialogue
                    setOpen={setPopup}
                    onSubmit={handleAddOrEdit}
                    editData={editData}
                    enquiry={enquiry}
                    now={now}
                // Passing full enquiry list, might be needed for dropdowns or validation
                />
            )}
        </div>
        </MainLayout>
    );
};

export default InstallmentPage;

import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../lib/apiClient';
import { cusToast } from '../../Components/Toast/CusToast';
// Removed unused imports: StuRegDialogue, StuRegDetails, InstallDialogue, StuInsTable, StuInsDetails
import EnquiryDialogue from '../../Components/DialogueCard/EnquiryDialogue';
import EnquiryTable from '../../Components/EnquiryTable/EnquiryTable'; // Assuming EnquiryTable is a component you created
import { useLocation } from 'react-router-dom';
import { confirmBox } from '../../Components/ConfirmBox/ConfirmBox';
import coolAlarm from '../../Assets/audio/coolAlarm.mp3';
import MainLayout from '../../MainLayout.js/MainLayout';


const JobRequire = () => {
    const [enquiry, setEnquiry] = useState([]);
    const [popup, setPopup] = useState(false);
    const [editData, setEditData] = useState(null);
    const hasShownToast = useRef(false);
    const getQuery = useLocation();
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (getQuery.state && !hasShownToast.current) {
            cusToast(getQuery.state.enquiry.message);
            hasShownToast.current = true;
        }
    }, [getQuery.state])

    useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();

    enquiry.forEach(item => {
      if (item.enNextFollowUp) {
        const followUpTime = new Date(item.enNextFollowUp);

        // Trigger sound when the time has passed (within a 1-minute window)
        if (
          Math.abs(now - followUpTime) < 60000 &&
          !item.notified // prevent re-triggering
        ) {
          ringBell();
          item.notified = true; // mark it as notified (in-memory only)
        }
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
    const getPriority = (dateString) => {
        if (!dateString) {
            return { label: 'N/A', className: 'priority normal' }; // Handle cases where follow-up date might be missing
        }
        const followUpDate = new Date(dateString);
        const today = new Date();

        followUpDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((followUpDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Overdue', className: 'priority overdue' };
        if (diffDays === 0) return { label: 'Urgent', className: 'priority urgent' };
        if (diffDays <= 3) return { label: 'Upcoming', className: 'priority upcoming' };
        return { label: 'Normal', className: 'priority normal' };
    };
    const fetchEnquiry = async () => {
        try {
            const res = await apiClient.get('/api/enquiry');

            // Remove duplicate entries based on _id
            const uniqueEnquiries = Array.from(
                new Map(res.data.map(item => [item._id, item])).values()
            );

            // Add priority info (from getPriority)
            const updatedEnquiry = uniqueEnquiries.map(item => ({
                ...item,
                priorityInfo: getPriority(item.enNextFollowUp)
            }));

            // Optional: if you want to hide overdue enquiries, uncomment the next line
            // const filtered = updatedEnquiry.filter(e => e.priorityInfo.label.toLowerCase() !== 'overdue');

            // Sort by priority: urgent > upcoming > normal > overdue
            const priorityOrder = ['urgent', 'upcoming', 'normal', 'overdue'];
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
    };


    useEffect(() => {
        fetchEnquiry();
    }, []);

    const handleAddOrEdit = async (formData, isEditing) => {
        const dataToSend = Object.fromEntries(formData.entries());

        try {
            if (isEditing) {
                const id = formData.get('id');
                await apiClient.put(`/api/enquiry/${id}`, dataToSend);
            } else {
                await apiClient.post('/api/enquiry', dataToSend);
            }
            fetchEnquiry(); // Re-fetch enquiries to update the table
            setPopup(false);
            setEditData(null);
            cusToast('Enquiry Details Saved Successfully'); // Changed message for clarity
        } catch (error) {
            cusToast("Can't save enquiry details", 'error'); // Changed message for clarity
            console.error("Error saving enquiry:", error);
        }
    };

    const handleDelete = async (id) => {
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

    return (
        <MainLayout>
        <div className="container">
            <h1>Enquiries</h1> {/* Changed title for clarity */}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <button className="add" onClick={() => { setEditData(null); setPopup(true); }}>
                    Add Enquiry
                </button>
            </div>

            {/* Pass getPriority and enquiry data to EnquiryTable */}
            <EnquiryTable
              enquiries={enquiry}
              onEdit={handleEdit}
              onDelete={handleDelete}
              handleCopy={handleCopy}
              role={role}
              onRegister={handleRegister}
            />

            {popup && (
                <EnquiryDialogue
                    setOpen={setPopup}
                    onSubmit={handleAddOrEdit}
                    editData={editData}
                    enquiry={enquiry}
                // Passing full enquiry list, might be needed for dropdowns or validation
                />
            )}
        </div>
        </MainLayout>
    );
};

export default JobRequire;

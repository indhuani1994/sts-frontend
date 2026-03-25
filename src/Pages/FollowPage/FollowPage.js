import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';
import MainLayout from '../../MainLayout.js/MainLayout';

const FollowUpPage = () => {
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    apiClient.get('/api/enquiry/followups')
      .then(res => setFollowUps(res.data))
      .catch(err => console.error("Error fetching follow-ups:", err));
  }, []);

  const getPriority = (dateString) => {
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

  return (
    <MainLayout>
    <div className="container">
      <h1>📅 Next Follow-Ups</h1>
      <table className="followup-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Course</th>
          
            <th>Mobile</th>
              <th>Status</th>
            <th>Next Follow-Up</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {followUps.map((item) => {
            const priority = getPriority(item.enNextFollowUp);
            console.log(item);
            
            return (
              <tr key={item._id}>
                <td>{item.enName}</td>
                <td>{item.enCourse}</td>
                <td>{item.enMobile}</td>
                <td>{item.enStatus}</td>
                <td>{new Date(item.enNextFollowUp).toLocaleDateString()}</td>
                <td>
                  <span className={priority.className}>
                    {priority.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </MainLayout>
  );
};

export default FollowUpPage;

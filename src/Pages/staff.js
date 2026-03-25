import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../MainLayout.js/MainLayout';
import './RoleDashboard.css';

const Staff = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('loggedInName');

  const cards = [
    {
      title: 'Mark Attendance',
      description: 'Record attendance for your assigned students.',
      path: '/staff-attendance',
    },
    {
      title: 'Update Marks',
      description: 'Enter marks for your assigned students.',
      path: '/staff-marks',
    },
    {
      title: 'Course Syllabus',
      description: 'Manage syllabus for your assigned courses.',
      path: '/course-staff',
    },
    {
      title: 'Next Day Schedule',
      description: "Plan tomorrow's classes and timing.",
      path: '/course-update',
    },
    {
      title: 'My Profile',
      description: 'View and update your profile details.',
      path: '/staff-profile',
    },
  ];

  return (
    <MainLayout>
      <div className="role-dashboard">
        <div className="role-header">
          <div>
            <h1>Staff Dashboard</h1>
            <p>Welcome {name || 'back'}. Access your daily tasks quickly.</p>
          </div>
        </div>

        <div className="role-actions">
          <span className="role-pill">Attendance</span>
          <span className="role-pill">Marks</span>
          <span className="role-pill">Syllabus</span>
          <span className="role-pill">Schedule</span>
        </div>

        <div className="role-grid">
          {cards.map((card) => (
            <div key={card.title} className="role-card" onClick={() => navigate(card.path)}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Staff;

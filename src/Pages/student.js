import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../MainLayout.js/MainLayout";
import "./RoleDashboard.css";
import NextDayScheduleStu from "../Components/NextDayScheduleStu.js/NextDayScheduleStu";
import StudentProfile from "../Pages/StudentProfile";
import StaffCoursePage from "./CourseManagementPage/StaffCoursePage";
import StudentDashboard from "./StuRegManagement/StudentDashboard";

const initialShow = {
  profile: false,
  Schedule: false,
  syllabus: false,
  bill: false,
};

const Student = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem("loggedInName");
  const [show, setShow] = useState(initialShow);

  const handleShow = (key) => {
    setShow((prev) => ({
      ...initialShow,
      [key]: !prev[key],
    }));
  };

  const cards = [
    {
      title: "View Attendance",
      description: "Track your attendance percentage and history.",
      path: "/student-attendance",
    },
    {
      title: "View Marks",
      description: "Track your Marks percentage and history.",
      path: "/student-marks",
    },
    
  
   
  ];

  return (
    <MainLayout>
      <div className="role-dashboard">
        <div className="role-header">
          <div>
            <h1>Student Dashboard</h1>
            <p>Welcome {name || "back"}. Stay updated with your progress.</p>
          </div>
        </div>

        <div className="role-actions">
          <span className="role-pill">Dashboard</span>
          <span className="role-pill">Attendance</span>
          <span className="role-pill">Marks</span>
          <span className="role-pill">Courses</span>
          <span className="role-pill">Profile</span>
          <span className="role-pill">Receipt</span>
        </div>

        <div className="role-grid">
          {cards.map((card) => (
            <div
              key={card.title}
              className="role-card"
              onClick={() => navigate(card.path)}
            >
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}

          <div className="role-card" onClick={() => handleShow("Schedule")}>
            <h3>Upcoming Schedule</h3>
            <p>See your upcoming schedule.</p>
          </div>

          <div className="role-card" onClick={() => handleShow("profile")}>
            <h3>Student Profile</h3>
            <p>See your Profile</p>
          </div>

          <div className="role-card" onClick={() => handleShow("syllabus")}>
            <h3>My Courses</h3>
            <p>View Course Syllabus</p>
          </div>

          <div className="role-card" onClick={() => handleShow("bill")}>
            <h3>Download Receipt </h3>
            <p>View and Download</p>
          </div>
        </div>
      </div>

      {show.Schedule && (
        <NextDayScheduleStu onClick={() => setShow(initialShow)} />
      )}

      {show.profile && (
        <StudentProfile onClick={() => setShow(initialShow)} />
      )}

      {show.syllabus && (
        <StaffCoursePage onClick={() => setShow(initialShow)} />
      )}

      {show.bill && (
        <StudentDashboard onClick={() => setShow(initialShow)} />
      )}
    </MainLayout>
  );
};

export default Student;

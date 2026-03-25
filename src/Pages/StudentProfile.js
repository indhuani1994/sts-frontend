import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cusToast } from '../Components/Toast/CusToast';

import { resolveFileUrl } from '../API';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import './StudentProfile.css';
import MainLayout from '../MainLayout.js/MainLayout';
import NextDayScheduleStu from '../Components/NextDayScheduleStu.js/NextDayScheduleStu';
import StaffCoursePage from './CourseManagementPage/StaffCoursePage';
import AttendanceGraph from '../Components/Graphp/AttendanceGraph';
import OverallMarksChart from '../Components/Graphp/OverAllMarkChart';
import StudentDashboard from './StuRegManagement/StudentDashboard';

const StudentProfile = ({onClick}) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [receiptOpen , setReceiptOpen] = useState(false)

    const handleLogout = useCallback(() => {
        logout();
        localStorage.removeItem('profile');
        navigate('/login');
    }, [logout, navigate]);

    const fetchProfile = useCallback(async (userId) => {
        try {
            const response = await apiClient.get(`/api/user/profile/${userId}`);
            setProfile(response.data?.data?.profile);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        const profileData = JSON.parse(localStorage.getItem('profile') || '{}');

        if (!user.id || user.role !== 'student' ) {
            navigate('/login');
            return;
        }

        if (profileData._id) {
            setProfile(profileData);

            setLoading(false);
        } else {
            fetchProfile(user.id);
        }
    }, [fetchProfile, navigate, user]);

    useEffect(() => {
        if (!user.id || user.role !== 'student') {
            cusToast('Unauthorized access', 'error');
            navigate('/login');
            return;
        }
        fetchProfile(user.id);
    }, [fetchProfile, navigate, user]);



    const fetchStudentData = useCallback(async () => {
  try {
    const data = await apiClient.get('/api/stureg');
    const regStudents = data.data;

    const matchedStudent = regStudents.find((val) => val.student?._id === user.profileId);

    if (matchedStudent) {
      const studentRegisterId = matchedStudent._id;
      console.log("register student", matchedStudent);
      console.log("studentRegisterId", studentRegisterId);

      localStorage.setItem("studentRegisterId", studentRegisterId);
    } else {
      console.log("Student not found");
    }
  } catch (err) {
    console.error("Error fetching student data", err);
  }
}, [user.profileId]);

     useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);
    if (loading) {
        return (
            <div className="student-profile-page">
                <div className="student-profile-loading">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-profile-page">
                <div className="student-profile-error">{error}</div>
            </div>
        );
    }

    return (
       <MainLayout>
        <div>
            <div className="student-profile-page">
                <div className="student-profile-header">
                 
                </div>

                

                {profile && (
                    <div className="student-profile-card">
                       {/* <div style={{textAlign: "right"}}>  <button onClick={onClick} className="student-back-btn">Back</button> </div> */}
                        
                        <div className='resflex'>
                        <div className="student-profile-top">
                            {profile.studentImage && (
                                <img
                                    src={resolveFileUrl(profile.studentImage)}
                                    alt="Student"
                                />
                            )}
                            <div>
                                <h2>{profile.studentName}</h2>
                                <p>{profile.studentMail}</p>
                                <p>{profile.studentMobile}</p>
                                <span className="student-status-badge">
                                  {profile.studentStatus || "Student"}
                                </span>
                               
                            </div>
                           
                        </div>
                       
                            </div>
                        <div className="student-profile-grid" style={{marginBottom: "10px"}}>
                        <AttendanceGraph/>
                        <OverallMarksChart/>
                       </div>
                       <div className="student-profile-grid">
                        <NextDayScheduleStu/>
                       </div>
                       <div className="student-profile-grid">
                        <StaffCoursePage/>
                       </div>
                        <div className="student-profile-grid">
                            <div className="student-profile-section">
                                <h3>Personal</h3>
                                <div className="student-profile-kv">
                                    <span>Address</span>
                                    <strong>{profile.studentAddress}</strong>
                                </div>
                                <div className="student-profile-kv"  >
                                    <span>Status</span>
                                    <strong>{profile.studentStatus}</strong>
                                </div>
                                <div className="student-profile-kv">
                                    <span>Course</span>
                                    <strong>{profile.studentCourse}</strong>
                                </div>
                                <div className="student-profile-kv">
                                    <span>Year / Experience</span>
                                    <strong>{profile.studentYearOrExperience}</strong>
                                </div>
                            </div>

                            <div className="student-profile-section">
                                <h3>College</h3>
                                <div className="student-profile-kv">
                                    <span>College</span>
                                    <strong>{profile.studentCollege}</strong>
                                </div>
                                <div className="student-profile-kv">
                                    <span>College Address</span>
                                    <strong>{profile.studentCollegeAddress}</strong>
                                </div>
                                <div className="student-profile-kv">
                                    <span>College ID</span>
                                    <strong>{profile.studentCollegeId}</strong>
                                </div>
                            </div>

                            <div className="student-profile-section">
                                <h3>Education</h3>
                                <ul>
                                    {profile.studentEducation?.map((edu, index) => (
                                        <li key={index}>{edu}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="student-profile-section">
                                <h3>Identifiers</h3>
                                <div className="student-profile-kv">
                                    <span>Student ID</span>
                                    <strong>{profile.studentRedId}</strong>
                                </div>
                            </div>

                             
                            
                        </div>

                    </div>
                )}
            </div>
       </div>
          <div className='bill-btn-container-new'>
                    <button  className='reg-btn-add' onClick={()=>setReceiptOpen(!receiptOpen)}>{receiptOpen ? "Close" : "Open"} Receipt</button>

              {  receiptOpen ? <StudentDashboard /> : <p>Click the button to open the receipt</p> } </div>
      
       </MainLayout> 
    );
};

export default StudentProfile; 

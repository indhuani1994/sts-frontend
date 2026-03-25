import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';
import './StudentDetails.css';

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
const [placement, setPlacement] = useState(null);

  const getStudent = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/students/${id}/details`);
      const payload = res.data?.data || {};
      setStudent(payload.student || null);
      setPlacement(payload.placement || null);
    } catch (error) {
      console.log(`Can't fetch student details with id ${id}`, error);
    }
  }, [id]);

  useEffect(() => {
    getStudent();
  }, [getStudent]);

  if (!student) return <p>Loading...</p>;

  return (
    <MainLayout>
      <div className="student-details">
        <div className="student-hero">
          <div className="student-hero-card">
            <div className="student-hero-info">
              <h2>{student.studentName}</h2>
              <p>{student.studentMail}</p>
              <p>{student.studentMobile}</p>
            </div>
            {student.studentImage && (
              <img
                src={resolveFileUrl(student.studentImage)}
                className="student-hero-avatar"
                alt="Student"
              />
            )}
          </div>
        </div>

        <div className="student-grid">
          <div className="student-card">
            <h3>Personal Details</h3>
            <div className="student-kv">
              <span>Address</span>
              <strong>{student.studentAddress}</strong>
            </div>
            <div className="student-kv">
              <span>Status</span>
              <strong>{student.studentStatus}</strong>
            </div>
            <div className="student-kv">
              <span>Course</span>
              <strong>{student.studentCourse}</strong>
            </div>
            <div className="student-kv">
              <span>Year / Experience</span>
              <strong>{student.studentYearOrExperience}</strong>
            </div>
          </div>

          <div className="student-card">
            <h3>College Details</h3>
            <div className="student-kv">
              <span>College</span>
              <strong>{student.studentCollege}</strong>
            </div>
            <div className="student-kv">
              <span>College ID</span>
              <strong>{student.studentCollegeId}</strong>
            </div>
            <div className="student-kv">
              <span>College Address</span>
              <strong>{student.studentCollegeAddress}</strong>
            </div>
          </div>

          <div className="student-card">
            <h3>Education</h3>
            <ul className="student-list">
              {student.studentEducation?.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="student-card">
            <h3>Documents</h3>
            {student.studentAadharImage ? (
              <a
                className="student-link"
                href={resolveFileUrl(student.studentAadharImage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Aadhar
              </a>
            ) : (
              <p>No Aadhar uploaded</p>
            )}
          </div>
        </div>

        {placement && (
          <div className="student-card">
            <h3>Placement Details</h3>
            <div className="student-placement">
              {placement.companyImage && (
                <img src={resolveFileUrl(placement.companyImage)} alt="Company logo" />
              )}
              <div>
                <div className="student-kv">
                  <span>Company</span>
                  <strong>{placement.company?.companyName}</strong>
                </div>
                <div className="student-kv">
                  <span>Role</span>
                  <strong>{placement.jobRole}</strong>
                </div>
                <div className="student-kv">
                  <span>Package</span>
                  <strong>{placement.package}</strong>
                </div>
                <div className="student-kv">
                  <span>Location</span>
                  <strong>{placement.location}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentDetails;

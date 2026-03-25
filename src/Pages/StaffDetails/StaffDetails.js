import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';
import './StaffDetails.css';

const StaffDetails = () => {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);

  const getStaff = useCallback(async () => {
    try {
      const staffget = await apiClient.get(`/api/staffs/${id}`);
      setStaff(staffget.data);
    } catch (error) {
      console.log(`Can't fetch the staff with id ${id}`, error);
    }
  }, [id]);

  useEffect(() => {
    getStaff();
  }, [getStaff]);

  if (!staff) return <p>Loading...</p>;

  return (
    <MainLayout>
      <div className="staff-details">
        <div className="staff-hero">
          <div className="staff-hero-card">
            <div className="staff-hero-info">
              <h2>{staff.staffName}</h2>
              <p>{staff.staffMail}</p>
              <p>{staff.staffMobile}</p>
            </div>
            {staff.staffImage && (
              <img
                src={resolveFileUrl(staff.staffImage)}
                className="staff-hero-avatar"
                alt="Staff"
              />
            )}
          </div>
        </div>

        <div className="staff-grid">
          <div className="staff-card">
            <h3>Contact</h3>
            <div className="staff-kv">
              <span>Mobile</span>
              <strong>{staff.staffMobile}</strong>
            </div>
            <div className="staff-kv">
              <span>Email</span>
              <strong>{staff.staffMail}</strong>
            </div>
            <div className="staff-kv">
              <span>Address</span>
              <strong>{staff.staffAddress}</strong>
            </div>
            <div className="staff-kv">
              <span>Role</span>
              <strong>{staff.staffRole}</strong>
            </div>
          </div>

          <div className="staff-card">
            <h3>Qualification</h3>
            <ul className="staff-list">
              {staff.staffQualification?.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="staff-card">
            <h3>Experience</h3>
            <ul className="staff-list">
              {staff.staffExperience?.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="staff-card">
            <h3>Documents</h3>
            {staff.staffAadharImage ? (
              <a
                className="staff-link"
                href={resolveFileUrl(staff.staffAadharImage)}
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
      </div>
    </MainLayout>
  );
};

export default StaffDetails;

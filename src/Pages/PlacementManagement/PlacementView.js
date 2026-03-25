import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../MainLayout.js/MainLayout';
import { API, resolveFileUrl } from '../../API';
import { cusToast } from '../../Components/Toast/CusToast';
import './PlacementView.css';

// Icons
const PrintIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const PlacementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef();

  useEffect(() => {
    const fetchPlacement = async () => {
      try {
        const res = await axios.get(`${API}/api/placements/${id}`);
        setPlacement(res.data);
      } catch (error) {
        console.error(error);
        cusToast('Failed to fetch placement details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPlacement();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <MainLayout><div className="pv-loading">Loading...</div></MainLayout>;
  if (!placement) return <MainLayout><div className="pv-error">Placement not found</div></MainLayout>;

  return (
    <MainLayout>
      <div className="pv-container">
        {/* Header / Actions */}
        <div className="pv-header-actions">
          <button className="pv-btn-back" onClick={() => navigate(-1)}>
            <BackIcon /> Back
          </button>
          <button className="pv-btn-print" onClick={handlePrint}>
            <PrintIcon /> Print Certificate
          </button>
        </div>

        <div className="pv-content-grid">
          {/* Left Side: Details Card */}
          <div className="pv-details-card">
            <div className="pv-card-header">
              <div className="pv-avatar">
                {placement.student?.studentName?.charAt(0)}
              </div>
              <div>
                <h2>{placement.student?.studentName}</h2>
                <p className="pv-subtitle">Placed at {placement.company?.companyName}</p>
              </div>
            </div>
            
            <div className="pv-info-group">
              <label>Job Role</label>
              <p>{placement.jobRole}</p>
            </div>
            <div className="pv-info-group">
              <label>Package (CTC)</label>
              <p className="pv-highlight">{placement.package}</p>
            </div>
            <div className="pv-info-group">
              <label>Company Location</label>
              <p>{placement.company?.companyLocation || 'N/A'}</p>
            </div>
            <div className="pv-info-group">
              <label>Student Email</label>
              <p>{placement.student?.studentMail}</p>
            </div>
            <div className="pv-info-group">
              <label>Student Mobile</label>
              <p>{placement.student?.studentMobile}</p>
            </div>
          </div>

          {/* Right Side: Certificate Preview */}
          <div className="pv-certificate-wrapper">
            <div className="pv-cert-label">Certificate Preview</div>
            
            <div className="certificate-frame" ref={certificateRef}>
              <div className="certificate-border">
                <div className="certificate-content">
                  <div className="cert-header">
                    <div className="cert-logo">STS</div>
                    <div className="cert-org">STS Training & Placement</div>
                  </div>
                  
                 
                  
                  <h1 className="cert-title">Certificate of Placement</h1>
                   {placement.student?.studentImage && (
                    <div className="cert-student-photo">
                      <img 
                        src={resolveFileUrl(placement.student.studentImage)} 
                        alt={placement.student.studentName} 
                      />
                    </div>
                  )}
                  <p className="cert-subtitle">This is to certify that</p>
                  
                  <h2 className="cert-name">{placement.student?.studentName}</h2>
                  
                  <p className="cert-body">
                    has successfully secured a position as a <strong>{placement.jobRole}</strong> at
                  </p>
                  
                  <h3 className="cert-company">{placement.company?.companyName}</h3>
                  
                  <p className="cert-body-sub">
                    We wish them the very best for their future endeavors and a successful career ahead.
                  </p>

                  <div className="cert-footer">
                    <div className="cert-sign">
                      <div className="sign-line"></div>
                      <p>Director Signature</p>
                    </div>
                    <div className="cert-seal">
                      <div className="seal-inner">STS<br/>SEAL</div>
                    </div>
                    <div className="cert-date">
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlacementView;

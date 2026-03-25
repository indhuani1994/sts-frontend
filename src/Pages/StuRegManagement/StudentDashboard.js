import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../API";
import { cusToast } from "../../Components/Toast/CusToast";
import "./StuRegManagement.css";
import logo from "../../Assets/Images/logo png.png";
import apiClient from "../../lib/apiClient";
import jsPDF from "jspdf";

const StudentDashboard = () => {
 
  const [paymentHistory, setPaymentHistory] = useState({});

  const [studentRegistrations , setStudentRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
  const loadAllHistory = async () => {
    const historyMap = {};

    for (const reg of studentRegistrations) {
      try {
        const historyRes = await axios.get(
          `${API}/api/stuins?registerId=${reg._id}`,
          authHeader
        );

        const historyData = Array.isArray(historyRes.data)
          ? historyRes.data
          : historyRes.data?.data || [];

        historyMap[reg._id] = historyData;

      } catch (error) {
        cusToast("Failed to load receipt", "error");
      }
    }

    setPaymentHistory(historyMap);
  };

  if (studentRegistrations.length) {
    loadAllHistory();
  }
}, [studentRegistrations]);

    const fetchStudentRegistrations = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem('profile'));
      if(!profile._id) {
        cusToast("No profile id is there", "error");
        return;
      }
      const res = await apiClient.get(`/api/stureg/student/${profile._id}`);
      setStudentRegistrations(res.data);
      } catch (error) {
        cusToast(error.message, "error");
      }
      
      
    }

    

  
  useEffect(() => {
   

    fetchStudentRegistrations();
    console.log(studentRegistrations)

  }, []);

 

  return (
   <>
    {studentRegistrations.length === 0 ? (
      <div >
        <h4 >Student Registration</h4>
        <p >No Registration Found</p>
      </div>
    ) : (
      <div className="bill-list-container">

       

        {studentRegistrations.map((reg) => (
          <button
            key={reg._id}
            className="schedule-btn clip"
            onClick={() => setSelectedRegistration(reg)

            }
          >
            {reg.course?.courseName} Bill
          </button>
        ))}

      </div>
    )}

    {selectedRegistration && (
      <ReceiptModal
        reg={selectedRegistration}
        history={paymentHistory[selectedRegistration._id] || []}
        onClose={() => setSelectedRegistration(null)}
      />
    )}
  </>
  );
};

// ================= RECEIPT MODAL =================



const ReceiptModal = ({ reg, history, onClose }) => {

  const handlePrint = () => window.print();

  // ✅ Calculate Installment Total
  const installmentTotal = history.reduce(
    (acc, item) => acc + Number(item.amountPaid || 0),
    0
  );

  const penaltyTotal = history.reduce(
    (acc, item) => acc + Number(item.latePenalty || 0),
    0
  );

  // ✅ Correct Registration Amount (Avoid Double Count)
  const registrationAmount =
    Number(reg.amountReceived || 0) - installmentTotal;

  const safeRegistration =
    registrationAmount > 0 ? registrationAmount : 0;

  // ✅ Combine Payments Properly
  const allPayments = [
    ...(safeRegistration > 0
      ? [{
          createdAt: reg.createdAt,
          amountPaid: safeRegistration,
          paymentMode: reg.paymentType || "Registration",
          latePenalty: 0,
          type: "registration"
        }]
      : []),
    ...history.map(item => ({
      ...item,
      type: "installment"
    }))
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // ✅ Final Totals
  const totalPaid = safeRegistration + installmentTotal;
  const balanceDue = Number(reg.courseFees || 0) - totalPaid;

  // 

  return (
    <div onClick={onClose} className="over-overlay">
      <div className="premium-receipt-card">
        <div className="premium-printable">

          <div className="premium-accent-bar"></div>

          {/* HEADER */}
          <div className="premium-header">
            <div className="brand-section">
              <img src={logo} className="logo" alt="Company Logo" />
            </div>

            <div className="invoice-meta">
              <p>
                Receipt No:{" "}
                <strong>
                  #STS-{reg._id?.slice(-6)?.toUpperCase()}
                </strong>
              </p>
              <p>Date: {new Date().toLocaleDateString("en-GB")}</p>
            </div>
          </div>

          <div className="premium-content">

            {/* STUDENT INFO */}
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
                <p>Batch: {reg.courseDuration || "Full Time"}</p>
              </div>
            </div>

            {/* PAYMENT TABLE */}
            <div className="table-wrapper-premium">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="text-right">Penalty</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {allPayments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    allPayments.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(item.createdAt)
                            .toLocaleDateString("en-GB")}
                        </td>

                        <td>
                          {item.type === "registration"
                            ? "Registration Payment"
                            : `Installment (${item.paymentMode || "Transfer"})`}
                        </td>

                        <td className="text-right">
                          ₹{Number(item.latePenalty || 0)
                            .toLocaleString()}
                        </td>

                        <td className="text-right payment-amt">
                          ₹{Number(item.amountPaid || 0)
                            .toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTAL SECTION */}
            <div className="premium-footer-section">

              <div className="terms-box">
                <h4>Terms & Conditions</h4>
                <p>1. This receipt confirms the payment of course fees.</p>
                <p>2. Fees once paid are non-refundable.</p>
              </div>

              <div className="totals-box">

                <div className="total-row">
                  <span>Total Course Fees</span>
                  <span>
                    ₹{Number(reg.courseFees || 0).toLocaleString()}
                  </span>
                </div>

                <div className="total-row">
                  <span>Total Penalties</span>
                  <span>₹{penaltyTotal.toLocaleString()}</span>
                </div>

                <div className="total-row grand-total">
                  <span>Total Paid</span>
                  <span>₹{totalPaid.toLocaleString()}</span>
                </div>

                <div className="total-row balance-row">
                  <span>Balance Due</span>
                  <span>₹{balanceDue.toLocaleString()}</span>
                </div>

                {balanceDue <= 0 && (
                  <div className="paid-stamp">
                    PAID IN FULL
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="premium-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            className="btn-print"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
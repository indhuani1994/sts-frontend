import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cusToast } from '../../Components/Toast/CusToast';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf'
import html2canvas from 'html2canvas'
import MainLayout from '../../MainLayout.js/MainLayout';
import { API, resolveFileUrl } from '../../API';

function PlacedStudentDetails() {
    const { id } = useParams();
    const [placedStudent, setPlacedStudent] = useState(null);
 const certRef = useRef();
  
    const getPlacedStudentsById = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/placements/${id}/`);
            setPlacedStudent(res.data)
        } catch (error) {
            console.log(`Can't fetch student details with id ${id}`, error);
            cusToast("can't fetch student detail", 'error')

        }
    }, [id]);
    useEffect(() => {
        getPlacedStudentsById();
    }, [getPlacedStudentsById]);

     const downloadCertificate = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${placedStudent.student.studentName}_Certificate.pdf`);
  };


    if (!placedStudent) return 'Loading...';

    return (
     <MainLayout>
        <div className='container border'>
        <div className='details-container ptag'>

             <div className="details-img">
        {
          placedStudent.student.studentImage && (
            <img
              src={resolveFileUrl(placedStudent.student.studentImage)}
              className="details-photo"
              alt="Student"
            />
          )
        }
      </div>
           <div>
         
             <p> <strong>Student Name </strong>  {placedStudent ? placedStudent.student?.studentName : ''} </p>


               <p><strong >Email:</strong> {placedStudent.student.studentMail}</p>
        <p><strong >Mobile:</strong> {placedStudent.student.studentMobile}</p>
        <p><strong >Address:</strong> {placedStudent.student.studentAddress}</p>
        <p><strong >Student College :</strong> {placedStudent.student.studentCollege}</p>
        <p><strong >Student College Address:</strong> {placedStudent.student.studentCollegeAddress}</p>
      
        <p><strong >Student Current Year or Experience:</strong> {placedStudent.student.studentYearOrExperience}</p>
        <p><strong >Student Status:</strong> {placedStudent.student.studentStatus}</p>
        <p><strong >Student Course:</strong> {placedStudent.student.studentCourse}</p>
        <p><strong >Student Course:</strong> {placedStudent.student.studentCourse}</p>

        <h4>Education</h4>
        <ul>
          {placedStudent.student.studentEducation?.map((q, i) => <li key={i}>{q}</li>)}
        </ul>

       
        <h4>
          <a
            href={resolveFileUrl(placedStudent.student.studentAadharImage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Student Aadhar Image
          </a>
        </h4>

         <h4>Placement Details</h4>
  {
          placedStudent.student.studentImage && (
            <img
              src={resolveFileUrl(placedStudent.company.companyImage)}
              className="details-photo"
              alt="Company"
            width={120} height={120}/>
          )
        }

           <p><strong >Company Name</strong> {placedStudent.company.companyName}</p>
        <p><strong >Company Location</strong> {placedStudent.company.companyLocation}</p>
        <p><strong >Job Role: </strong> {placedStudent.jobRole}</p>
        <p><strong >Package</strong> {placedStudent.package}</p>


         <div ref={certRef} style={{
          padding: "20px",
          textAlign: "center",
          border: "2px solid #333",
          borderRadius: "12px",
          width: "80%",
          margin: "30px 0px",
          backgroundColor: "#f9f9f9"
        }}>
          <h2>Placement Certificate</h2>
          <hr />
          <img
            src={resolveFileUrl(placedStudent.company.companyImage)}
            alt="Company Logo"
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
          />
          <h3>{placedStudent.student.studentName}</h3>
          <p>has successfully been placed at</p>
          <h3>{placedStudent.company.companyName}</h3>
          <p>Located at: <strong>{placedStudent.company.companyLocation}</strong></p>
          <p>Job Role: <strong>{placedStudent.jobRole}</strong></p>
          <p>Package Offered: <strong>{placedStudent.package}</strong></p>
          <p>Course Completed: <strong>{placedStudent.student.studentCourse}</strong></p>
          <p><em>We wish them all the best for their future endeavors.</em></p>
        </div>

        {/* Download Button */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={downloadCertificate} style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Download Certificate as PDF
          </button>
        </div>

         </div>

        </div>
        </div>
        </MainLayout>
    )
}

export default PlacedStudentDetails

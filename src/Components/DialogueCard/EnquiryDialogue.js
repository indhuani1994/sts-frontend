// import React, { useState, useEffect } from 'react';
// import CustomSelect from '../CustomSelect/CustomSelect';
// import axios from 'axios';


// const initialForm = {
//   enName: '',
//   enMobile: '',
//   enMail: '',
//   enCourse: '',
//   enReference: '',
//   enReferedStudent: '',
//   enStatus: '',
//   enNextFollowUp: '',
//   receiptGen: '',
//   paymentType: '',
//   nextIns: '',
// };

// const EnquiryDialogue = ({ setOpen, onSubmit, editData, enquiry }) => {
//   const [form, setForm] = useState(initialForm);


//   const [coursesName, setCoursesName] = useState([]);
  
  
//     useEffect(()=> {
//       fetchCourses();
//     })
//   // Prefill form if editing
//   useEffect(() => {
//     if (editData) {
//       setForm({
//         enName: editData.enName || '',
//         enMobile: editData.enMobile || '',
//         enMail: editData.enMail || '',
//         enCourse: editData.enCourse || '',
//         enReference: editData.enReference || '',
//         enReferedStudent: editData.enReferedStudent || '',
//         enStatus: editData.enStatus || '',
//         enNextFollowUp: editData.enNextFollowUp || '',
//         receiptGen: editData.receiptGen || '',
//         paymentType: editData.paymentType || '',
//         nextIns: editData.nextIns || '',
//         id: editData._id,
//       });
//     } else {
//       setForm(initialForm);
//     }
//   }, [editData]);

//   // Auto-fill receiptGen if student selected and not editing
//   useEffect(() => {
//     if (!editData && form.registerId) {
//       const selected = enquiry.find((reg) => reg._id === form.registerId);
//       if (selected) {
//         setForm((prev) => ({
//           ...prev,
//           receiptGen: prev.receiptGen || selected.receiptGen || '',
//         }));
//       }
//     }
//   }, [form.registerId, editData, enquiry]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     const data = new FormData();
//     Object.entries(form).forEach(([key, value]) => {
//       if (value !== null) data.append(key, value);
//     });
//     onSubmit(data, !!editData);
//   };


//    const fetchCourses = async () => {
  
//       try {
//          const res = await axios.get('http://localhost:5000/api/courses');
   
  
//       const courseNames = res.data.map(course => course.courseName);    
//       setCoursesName(courseNames);
//       } catch (error) {
//         console.log(error);
//         alert('Something is wrong');
        
//       }
     
     
      
//     };

//   return (
//     <div className="popup">
//       <div className="popup-content">
//         <h2>{editData ? 'Edit Enquiry' : 'Add Enquiry'}</h2>

//         <input
//           type="text"
//           name="enName"
//           value={form.enName}
//           onChange={handleChange}
//           placeholder="Name..."
//         />

//         <input
//           type="text"
//           name="enMobile"
//           value={form.enMobile}
//           onChange={handleChange}
//           placeholder="Mobile..."
//         />

//         <input
//           type="email"
//           name="enMail"
//           value={form.enMail}
//           onChange={handleChange}
//           placeholder="Email..."
//         />

    

//         <select name='enCourse' value={form.enCourse} onChange={handleChange} placeholder='Student Course...'>
//         <option value="">-- Select Course --</option>
//         {
//             coursesName && coursesName.map((courseName, index) => {
//                 return (
//                     <option value={courseName} key={index} >{courseName}</option>
//                 )
//             })

            
//         }
//         </select>
       
//       <select name="enReference" value={form.enReference} onChange={handleChange}>
//   <option value="">Select Reference...</option> {/* default empty option */}
//   <option value="Justdial">Justdial</option>
//   <option value="Walking">Walking</option>
//   <option value="Student Reference">Student Reference</option>
//   <option value="Others">Others</option>
// </select>


//         <input
//           type="text"
//           name="enReferedStudent"
//           value={form.enReferedStudent}
//           onChange={handleChange}
//           placeholder="Referred Student..."
//         />

//         <input
//           type="text"
//           name="enStatus"
//           value={form.enStatus}
//           onChange={handleChange}
//           placeholder="Status..."
//         />

//         <input
//           type="datetime-local"
//           name="enNextFollowUp"
//           value={form.enNextFollowUp}
//           onChange={handleChange}
//         />

     


       

//         <div className="dialogue-actions">
//           <button
//             onClick={handleSubmit}
//             style={editData ? { background: '#007cdf', color: '#fff' } : { background: '#007bff', color: '#fff' }}
//           >
//             {editData ? 'Update' : 'Add'}
//           </button>
//           <button onClick={() => setOpen(false)}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EnquiryDialogue;


import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid,

} from "@mui/material";
import apiClient from "../../lib/apiClient";
import { cusToast } from "../Toast/CusToast";

const initialForm = {
  enName: "",
  enMobile: "",
  enMail: "",
  enCourse: "",
  enReference: "",
  enReferedStudent: "",
  enStatus: "",
  enNextFollowUp: "",
  receiptGen: "",
  paymentType: "",
  nextIns: "",
};

const EnquiryDialogue = ({ setOpen, onSubmit, editData, enquiry,now }) => {
  const [form, setForm] = useState(initialForm);
  const [coursesName, setCoursesName] = useState([]);

  // Fetch course list once
  useEffect(() => {
    fetchCourses();
  }, []);

  // Prefill if editing
  useEffect(() => {
    if (editData) {
      setForm({
        enName: editData.enName || "",
        enMobile: editData.enMobile || "",
        enMail: editData.enMail || "",
        enCourse: editData.enCourse || "",
        enReference: editData.enReference || "",
        enReferedStudent: editData.enReferedStudent || "",
        enStatus: editData.enStatus || "",
        enNextFollowUp: editData.enNextFollowUp || "",
        receiptGen: editData.receiptGen || "",
        paymentType: editData.paymentType || "",
        nextIns: editData.nextIns || "",
        id: editData._id,
      });
    } else {
      setForm(initialForm);
    }
  }, [editData]);

  // Auto-fill receiptGen if student selected and not editing
  useEffect(() => {
    if (!editData && form.registerId) {
      const selected = enquiry.find((reg) => reg._id === form.registerId);
      if (selected) {
        setForm((prev) => ({
          ...prev,
          receiptGen: prev.receiptGen || selected.receiptGen || "",
        }));
      }
    }
  }, [form.registerId, editData, enquiry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.enName || !form.enMobile || !form.enStatus || !form.enNextFollowUp) {
      cusToast("please fill the fields name, mobile and status, follow up date", "error")
      return ;
    }

   if (new Date(form.enNextFollowUp) < new Date()) {
  cusToast("Follow up date must be in the future", "error");
  return;
}
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) data.append(key, value);
    });
    onSubmit(data, !!editData);
  };
 


  const fetchCourses = async () => {
    try {
      const res = await apiClient.get("/api/courses");
      const courseNames = res.data.map((course) => course.courseName);
      setCoursesName(courseNames);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <Dialog open onClose={() => setOpen(false)} fullWidth maxWidth="sm" >
      <DialogTitle>{editData ? "Edit Enquiry" : "Add Enquiry"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="enName"
              label="Name"
              value={form.enName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="enMobile"
              label="Mobile"
              value={form.enMobile}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="enMail"
              label="Email"
              type="email"
              value={form.enMail}
              onChange={handleChange}

            />
          </Grid>

          <Grid item xs={6} size={'large'} minWidth={'200px'}>
            <TextField
              fullWidth
              select
              name="enCourse"
              label="Course"
              value={form.enCourse}
              onChange={handleChange}
              
            >
              <MenuItem value="">-- Select Course --</MenuItem>
              {coursesName.map((courseName, index) => (
                <MenuItem value={courseName} key={index}>
                  {courseName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={3} size={'large'} width={'200px'}>
            <TextField
              fullWidth
              select
              name="enReference"
              label="Reference"
              value={form.enReference}
              onChange={handleChange}

            >
              <MenuItem value="">Select Reference...</MenuItem>
              <MenuItem value="Justdial">Justdial</MenuItem>
              <MenuItem value="Walking">Walking</MenuItem>
              <MenuItem value="Student Reference">Student Reference</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="enReferedStudent"
              label="Referred Student"
              value={form.enReferedStudent}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="enStatus"
              label="Status"
              value={form.enStatus}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="datetime-local"
              name="enNextFollowUp"
              label="Next Follow Up"
              InputLabelProps={{ shrink: true }}
              value={form.enNextFollowUp}
              onChange={handleChange}
              inputProps={{ min: now }}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {editData ? "Update" : "Add"}
        </Button>
        <Button onClick={() => setOpen(false)} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnquiryDialogue;

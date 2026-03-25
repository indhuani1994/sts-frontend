// import React from 'react'
// import './StaffTable.css'
// import { Link } from 'react-router-dom';

// const StaffTable = ({ staffs , onEdit, onDelete}) => {
//   console.log(staffs);

//   return (
//     <div className='staff-table-container'>
//       <table className='staff-table'>
//         <thead>
//           <tr>
//             <th>Image</th>
//             <th>Role</th>
//             <th>Name</th>
           
//             <th>Email Id</th>
//             <th>Phone No</th>
//             <th>View</th>           
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {
//             staffs && staffs.map((staff, index) => {
//               return (
//                 <tr key={staff._id}>
//                   <td>
//                     {
//                       staff.staffImage ? (
//                         <img src={`http://localhost:5000/uploads/${staff.staffImage}`} className='staff-photo' alt='staff image' />
//                       ) : (<span className='no-image'>No Image</span>)
//                     }
//                   </td>
//                   <td>
//                     {staff.staffRole }
//                   </td>
//                   <td>
//                     {staff.staffName}
//                   </td>
//                   <td>
//                     {staff.staffMail }
//                   </td>
//                   <td>
//                     {staff.staffMobile}
//                   </td>
                
//                   <td>
//                    <Link to={`${staff._id}`}>View Details</Link>
//                   </td>
//                   <td>
//                     <button className="edit-btn" onClick={() => onEdit(staff)}>✏️</button>
//                     <button className="delete-btn" onClick={() => onDelete(staff._id)}>🗑️</button>
//                   </td>
//                 </tr>
//               )

//             }) 
//           } 

//           <tr>
//              <td>Image</td>
//             <td>Role</td>
//             <td>Name</td>
           
//             <td>Email Id</td>
//             <td>Phone No</td>
//             <td>View</td>           
//             <td>Actions</td>
//             </tr>


//         </tbody>
//       </table>
//     </div>
//   )
// }

// export default StaffTable



// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Avatar,
//   IconButton,
//   Typography,
//   Button
// } from '@mui/material';
// import { Edit, Delete } from '@mui/icons-material';
// import { Link } from 'react-router-dom';

// const StaffTable = ({ staffs, onEdit, onDelete }) => {
//   return (
//     <TableContainer component={Paper} sx={{ mt: 2 }}>
//       <Table>
//         <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
//           <TableRow>
//             <TableCell><strong>Image</strong></TableCell>
//             <TableCell><strong>Role</strong></TableCell>
//             <TableCell><strong>Name</strong></TableCell>
//             <TableCell><strong>Email Id</strong></TableCell>
//             <TableCell><strong>Phone No</strong></TableCell>
//             <TableCell><strong>View</strong></TableCell>
//             <TableCell><strong>Actions</strong></TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {staffs && staffs.length > 0 ? (
//             staffs.map((staff) => (
//               <TableRow key={staff._id}>
//                 <TableCell>
//                   {staff.staffImage ? (
//                     <Avatar
//                       alt="Staff"
//                       src={`http://localhost:5000/uploads/${staff.staffImage}`}
//                       sx={{ width: 56, height: 56 }}
//                     />
//                   ) : (
//                     <Typography variant="body2" color="textSecondary">
//                       No Image
//                     </Typography>
//                   )}
//                 </TableCell>
//                 <TableCell>{staff.staffRole}</TableCell>
//                 <TableCell>{staff.staffName}</TableCell>
//                 <TableCell>{staff.staffMail}</TableCell>
//                 <TableCell>{staff.staffMobile}</TableCell>
//                 <TableCell>
//                   <Button
//                     component={Link}
//                     to={`${staff._id}`}
//                     variant="outlined"
//                     size="small"
//                   >
//                     View Details
//                   </Button>
//                 </TableCell>
//                 <TableCell>
//                   <IconButton color="primary" onClick={() => onEdit(staff)}>
//                     <Edit />
//                   </IconButton>
//                   <IconButton color="error" onClick={() => onDelete(staff._id)}>
//                     <Delete />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={7} align="center">
//                 No staff data available
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default StaffTable;


import React from 'react';
import { Link } from 'react-router-dom';
import { resolveFileUrl } from '../../API';
import '../../Pages/Management.css';

const StaffTable = ({
  staffs,
  onEdit,
  onDelete,
  page,
  pageSize,
  rowCount,
  loading,
  onPageChange,
  onPageSizeChange,
}) => {

  return (
    <div>
      <table className="mgmt-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Image</th>
            <th>Role</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>View</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff, index) => (
            <tr key={staff._id}>
              <td>{page * pageSize + index + 1}</td>
              <td>
                {staff.staffImage ? (
                  <img
                    className="mgmt-avatar"
                    src={resolveFileUrl(staff.staffImage)}
                    alt="Staff"
                  />
                ) : (
                  'No Image'
                )}
              </td>
              <td>{staff.staffRole}</td>
              <td>{staff.staffName}</td>
              <td>{staff.staffMail}</td>
              <td>{staff.staffMobile}</td>
              <td>
                <Link className="mgmt-mini" to={`${staff._id}`}>
                  View Details
                </Link>
              </td>
              <td>
                <div className="mgmt-row-actions">
                  <button className="mgmt-mini" onClick={() => onEdit(staff)} type="button">
                    Edit
                  </button>
                  <button className="mgmt-mini danger" onClick={() => onDelete(staff._id)} type="button">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {staffs.length === 0 ? (
            <tr>
              <td colSpan={8}>No staff found</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="mgmt-pagination">
        <div>
          Page {page + 1} of {Math.max(1, Math.ceil(rowCount / pageSize))}
        </div>
        <div className="mgmt-row-actions">
          <button className="mgmt-mini" onClick={() => onPageChange(Math.max(page - 1, 0))} disabled={page === 0}>
            Prev
          </button>
          <button
            className="mgmt-mini"
            onClick={() => onPageChange(page + 1)}
            disabled={(page + 1) * pageSize >= rowCount}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? <div style={{ marginTop: 8 }}>Loading...</div> : null}
    </div>
  );
};

export default StaffTable;

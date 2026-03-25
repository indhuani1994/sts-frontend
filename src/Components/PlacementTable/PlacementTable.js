// import React from 'react';
// import { Link } from 'react-router-dom';

// const PlacementTable = ({ placements, onEdit, onDelete }) => {
//   return (
//     <div className="staff-table-container">
//       <table className="staff-table">
//         <thead>
//           <tr>
//             <th>Student</th>
//             <th>Company</th>
//             <th>Logo</th>
//             <th>Job Role</th>
//             <th>Package</th>
//             <th>Location</th>
//             <th>View</th>

//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {placements.slice().reverse().map((p, i) => (
//             <tr key={i}>
//               <td>{p.student?.studentName}</td>
//               <td>{p.company?.companyName}</td>
//               <td>
//                 {p.company?.companyImage && (
//                   <img
//                     src={`http://localhost:5000/uploads/${p.company?.companyImage}`}
//                     alt="Company"
//                     className='company-photo'
//                     width="60"
//                   />
//                 )}
//               </td>
//               <td>{p.jobRole}</td>
//               <td>{p.package}</td>
//               <td>{p.company?.companyLocation}</td>
//               <td> <Link to={`${p._id}`}> View Details
//               </Link>   </td>
//               <td><button class="edit-btn" onClick={() => onEdit(p)}>✏️</button><button class="delete-btn" onClick={() => onDelete(p._id)}>🗑️</button></td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default PlacementTable;

import React from 'react';
import { Link } from 'react-router-dom';
import './PlacementTable.css';
import { resolveFileUrl } from '../../API';

const PlacementTable = ({ placements, onEdit, onDelete }) => {
  const rows = placements.slice().reverse();

  return (
    <div className="placement-table-wrap">
      <table className="placement-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Logo</th>
            <th>Job Role</th>
            <th>Package</th>
            <th>Location</th>
            <th>View</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const companyName = p.company?.companyName || 'Company';
            const avatarLetter = companyName.trim().charAt(0).toUpperCase() || 'C';

            return (
              <tr key={p._id || i}>
                <td data-label="Student">{p.student?.studentName || 'N/A'}</td>
                <td data-label="Company">{companyName}</td>
                <td data-label="Logo">
                  {p.company?.companyImage ? (
                    <img
                      src={resolveFileUrl(p.company.companyImage)}
                      alt={companyName}
                      className="placement-company-avatar"
                    />
                  ) : (
                    <div className="placement-company-fallback">{avatarLetter}</div>
                  )}
                </td>
                <td data-label="Job Role">{p.jobRole || 'N/A'}</td>
                <td data-label="Package">{p.package || 'N/A'}</td>
                <td data-label="Location">{p.company?.companyLocation || 'N/A'}</td>
                <td data-label="View">
                  <Link className="placement-link" to={`${p._id}`}>
                    View
                  </Link>
                </td>
                <td data-label="Actions">
                  <div className="placement-actions">
                    <button className="placement-btn ghost" type="button" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button className="placement-btn danger" type="button" onClick={() => onDelete(p._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="placement-empty">No placements found. Try adjusting your filters.</div>
      )}
    </div>
  );
};

export default PlacementTable;

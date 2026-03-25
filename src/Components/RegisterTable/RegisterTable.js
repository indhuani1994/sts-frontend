import React from 'react';
import { Link } from 'react-router-dom';
import { resolveFileUrl } from '../../API';

const PlacementTable = ({ placements, onEdit, onDelete }) => {
  return (
    <div className="staff-table-container">
      <table className="staff-table">
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
          {placements.slice().reverse().map((p, i) => (
            <tr key={i}>
              <td>{p.student?.studentName}</td>
              <td>{p.company?.companyName}</td>
              <td>
                {p.company?.companyImage && (
                  <img
                    src={resolveFileUrl(p.company?.companyImage)}
                    alt="Company"
                    className='company-photo'
                    width="60"
                  />
                )}
              </td>
              <td>{p.jobRole}</td>
              <td>{p.package}</td>
              <td>{p.company?.companyLocation}</td>
              <td> <Link to={`${p._id}`}> View Details
              </Link>   </td>
              <td><button class="edit-btn" onClick={() => onEdit(p)}>✏️</button><button class="delete-btn" onClick={() => onDelete(p._id)}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlacementTable;

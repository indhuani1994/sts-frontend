import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../MainLayout.js/MainLayout';
import { resolveFileUrl } from '../../API';

const PlacementTable = ({ placements, onEdit, onDelete }) => {
  return (
    <MainLayout>
    <div className='staff-table-container'>
      <table className='staff-table'>
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Logo</th>
            <th>Job Role</th>
            <th>Package</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {placements.map((p) => (
            <tr key={p._id}>
              <td>{p.student?.studentName}</td>
              <td>{p.companyName}</td>
              <td>
                {p.companyLogo && (
                  <img
                    src={resolveFileUrl(p.companyLogo)}
                    alt="Logo"
                    className='staff-photo'
                  />
                )}
              </td>
              <td>{p.jobRole}</td>
              <td>{p.package}</td>
              <td>{p.location}</td>
              <td>
                <button onClick={() => onEdit(p)}>✏️</button>
                <button onClick={() => onDelete(p._id)}>🗑️</button>
                <Link to={`/placements/${p._id}`}>👁️</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </MainLayout>
  );
};

export default PlacementTable;

import React from 'react';
import { resolveFileUrl } from '../../API';

const CompanyTable = ({ companies, onEdit, onDelete }) => {
  return (
    <table className="mgmt-table">
      <thead>
        <tr>
          <th>Company Logo</th>
          <th>Company Name</th>
          <th>Company Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => (
          <tr key={company._id}>
            <td>
              {company.companyImage ? (
                <img
                  className="company-logo"
                  src={resolveFileUrl(company.companyImage)}
                  alt={company.companyName || 'Company'}
                />
              ) : (
                <span className="mgmt-badge">No Image</span>
              )}
            </td>
            <td>{company.companyName}</td>
            <td>{company.companyLocation}</td>
            <td>
              <div className="mgmt-row-actions">
                <button className="mgmt-mini" type="button" onClick={() => onEdit(company)}>
                  Edit
                </button>
                <button
                  className="mgmt-mini danger"
                  type="button"
                  onClick={() => onDelete(company._id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
        {companies.length === 0 && (
          <tr>
            <td colSpan="4">No companies yet</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CompanyTable;




import React from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../API';
import '../../Pages/Management.css';

const StudentTable = ({
  students,
  onEdit,
  onDelete,
  page,
  pageSize,
  rowCount,
  loading,
  onPageChange,
  onPageSizeChange,
  handleStatusEdit
}) => {

  return (
    <div>
      <table className="mgmt-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Image</th>
            <th>Name</th>
          
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>View</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student._id}>
              <td>{page * pageSize + index + 1}</td>
              <td>
                {student.studentImage ? (
                  <img
                    className="mgmt-avatar"
                    src={student.studentImage}
                    alt="Student"
                  />
                ) : (
                  'No Image'
                )}
              </td>
              <td>{student.studentName}</td>
           
              <td>{student.studentMail}</td>
              <td>{student.studentMobile}</td>
              <td>
                <Link className="mgmt-mini" to={`${student._id}`}>
                  View Details
                </Link>
              </td>
              <td onDoubleClick={()=>handleStatusEdit(student)} >
               <span className="mgmt-badge" style={{userSelect: 'none', cursor: 'pointer', background: student.studentStatus === 'Student' ? '#7afd6e5d' : '#18f5f5'}}>{student.studentStatus}</span> 
              </td>
              <td>

                <div className="mgmt-row-actions">
                  <button className="mgmt-mini" onClick={() => onEdit(student)} type="button">
                    Edit
                  </button>
                  <button className="mgmt-mini danger" onClick={() => onDelete(student._id)} type="button">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {students.length === 0 ? (
            <tr>
              <td colSpan={8}>No students found</td>
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

export default StudentTable;

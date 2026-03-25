import React, { useState } from 'react';
import { resolveFileUrl } from '../../API';

export default function CourseCard({
  course,
  onEdit,
  onDelete,
  handleCopy,
  showDelete = true,
  showEdit = true,
  showCopy = true,
}) {
  const [expanded, setExpanded] = useState(false);

  const imageUrl = resolveFileUrl(course.image);
  const courseName = course.courseName || 'Course';
  const avatarText = courseName.trim().charAt(0).toUpperCase() || 'C';
  const syllabus = Array.isArray(course.syllabus) ? course.syllabus.filter(Boolean) : [];

  return (
    <div className="course-card" onDoubleClick={() => showCopy && handleCopy(course)}>
      <div className="course-card-header">
        <div className="course-avatar">{avatarText}</div>
        <div className="course-title">
          <h3>{courseName}</h3>
          <p>Code: {course.courseCode || 'N/A'}</p>
        </div>
        {showCopy && (
          <button className="course-icon-btn" type="button" onClick={() => handleCopy(course)}>
            Copy
          </button>
        )}
      </div>

      {imageUrl && (
        <div className="course-media">
          <img src={imageUrl} alt={courseName} loading="lazy" />
        </div>
      )}

      <div className="course-body">
        <div className="course-meta">
          <span>Fees: Rs. {course.fees || '0'}</span>
          <span>Duration: {course.duration || 'N/A'}</span>
        </div>   
      </div>

      <div className="course-actions">
        {showEdit && (
          <button className="mgmt-mini" type="button" onClick={() => onEdit(course)}>
            Edit
          </button>
        )}
        {showDelete && (
          <button className="mgmt-mini danger" type="button" onClick={() => onDelete(course._id)}>
            Delete
          </button>
        )}
        <button className="mgmt-mini" type="button" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {expanded && (
        <div className="course-extra">
          <div>
            <strong>Pre-requirements:</strong> {course.prerequire || 'None'}
          </div>
          {course.description && (
            <div>
              <strong>Description:</strong> {course.description}
            </div>
          )}
          {course.offer && (
            <div>
              <strong>Offer:</strong> {course.offer}
            </div>
          )}
          {course.type && (
            <div>
              <strong>Type:</strong> {course.type}
            </div>
          )}
          <div>
            <strong>Course ID:</strong> {course._id || 'N/A'}
          </div>
          {syllabus.length > 0 && (
            <div className="course-syllabus">
              <strong>Syllabus:</strong>
              <ul>
                {syllabus.map((item, index) => (
                  <li key={`${course._id || 'course'}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

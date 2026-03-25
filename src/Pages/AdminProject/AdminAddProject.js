import React, { useState, useEffect } from "react";
import axios from "axios";
import "../AdminProject/AdminAddProject.css";
import MainLayout from "../../MainLayout.js/MainLayout";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectCode: "",
    projectTitle: "",
    technology: "",
    category: "",
    algorithm: "",
    projectCost: "",
    link: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects"); // Change to deployed API
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit project (Add or Update)
 // Submit project (Add or Update)
const handleSubmit = async (e) => {
  e.preventDefault();

  // Fix: convert projectCost to number
  const payload = {
    ...formData,
    projectCost: Number(formData.projectCost),
  };

  try {
    if (editId) {
      await axios.put(`http://localhost:5000/api/projects/${editId}`, payload);
    } else {
      console.log("Form Data:", payload);
      await axios.post("http://localhost:5000/api/projects", payload);
    }

    // Reset form
    setFormData({
      projectCode: "",
      projectTitle: "",
      technology: "",
      category: "",
      algorithm: "",
      projectCost: "",
      link: "",
    });

    setEditId(null);
    setShowModal(false);
    fetchProjects();
  } catch (err) {
    console.error("Error saving project", err.response?.data || err.message);
  }
};


  // Delete project
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error("Error deleting project", err);
      }
    }
  };

  // Open modal for edit
  const handleEdit = (project) => {
    setFormData(project);
    setEditId(project._id);
    setShowModal(true);
  };

  return (
    <MainLayout>
    <div className="admin-dash">
      <h1>📂 Admin Project Management</h1>
      <button className="add-btn" onClick={() => setShowModal(true)}>
        ➕ Add Project
      </button>

      {/* Project List */}
      <table className="project-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Technology</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((p) => (
              <tr key={p._id}>
                <td>{p.projectCode}</td>
                <td>{p.projectTitle}</td>
                <td>{p.technology}</td>
                <td>{p.category}</td>
                <td>₹{p.projectCost}</td>
                <td>
                  <a href={p.link} target="_blank" rel="noreferrer">
                    Visit
                  </a>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(p)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p._id)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No projects found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editId ? "Edit Project" : "Add Project"}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Project Code</label>
              <input type="text" name="projectCode" value={formData.projectCode} onChange={handleChange} required />

              <label>Project Title</label>
              <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange} required />

              <label>Technology</label>
              <input type="text" name="technology" value={formData.technology} onChange={handleChange} required />

              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />

              <label>Algorithm</label>
              <input type="text" name="algorithm" value={formData.algorithm} onChange={handleChange} required />

           <label>Project Cost (₹)</label>
<input type="number" name="projectCost" value={formData.projectCost} onChange={handleChange} required />


              <label>Project Link</label>
              <input type="url" name="link" value={formData.link} onChange={handleChange} required />

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {editId ? "Update" : "Save"}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  );
};

export default AdminProjects;

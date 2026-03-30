import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../AdminProject/AdminAddProject.css";
import MainLayout from "../../MainLayout.js/MainLayout";
import apiClient from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { cusToast } from "../../Components/Toast/CusToast";
import { confirmBox } from "../../Components/ConfirmBox/ConfirmBox";

const initialForm = {
  projectCode: "",
  projectTitle: "",
  technology: "",
  category: "",
  algorithm: "",
  projectCost: "",
  link: "",
  abstract: "",
  video: "",
  existing: "",
  proposed: "",
  systemRequirements: "",
  staffId: "",
  staffName: "",
};

const safeParseJSON = (value, fallback = null) => {
  if (value === null || value === undefined || value === "" || value === "undefined" || value === "null") {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "all", technology: "all", staffId: "all" });
  const [resolvedStaff, setResolvedStaff] = useState({ id: "", name: "" });

  const { role, user } = useAuth();
  const effectiveRole = role || user?.role;
  const isAdmin = useMemo(() => effectiveRole === "admin", [effectiveRole]);
  const isStaff = useMemo(() => effectiveRole === "staff", [effectiveRole]);
  const profile = useMemo(() => safeParseJSON(localStorage.getItem("profile"), null), []);
  const staffId = user?.profileId || profile?._id || profile?.staffId || "";
  const staffName = profile?.staffName || user?.name || user?.username || "";
  const effectiveStaffId = staffId || resolvedStaff.id;
  const effectiveStaffName = staffName || resolvedStaff.name;

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching projects", err);
      cusToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!isAdmin) return;
    try {
      const res = await apiClient.get("/api/user/staff-dropdown");
     
      
      const list = res?.data?.data || res?.data || [];
      const filtered = (Array.isArray(list) ? list : []);
      setStaffOptions(filtered);
    } catch (err) {
      console.error("Error fetching staff dropdown", err);
    }
  };


    // const fetchHrList = useCallback(async () => {
    //   try {
    //     const [usersRes, staffRes] = await Promise.all([
    //       apiClient.get('/api/user/admin/users'),
    //       apiClient.get('/api/user/staff-dropdown'),
    //     ]);
  
    //     const users = Array.isArray(usersRes.data?.data) ? usersRes.data.data : [];
    //     const staff = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
    //     const staffMap = new Map(staff.map((item) => [String(item._id), item]));
  
    //     const hrUsers = users
    //       .filter((user) => ( user.role === 'staff') && user.staffId)
    //       .map((user) => {
    //         const staffProfile = staffMap.get(String(user.staffId));
    //         return {
    //           userId: user._id,
    //           staffId: user.staffId,
    //           name: staffProfile?.staffName || user.username || 'staff',
    //         };
    //       });
  
    //     setStaffOptions(hrUsers);
    //     console.log(staffOptions)
    //   } catch (err) {
    //     setStaffOptions([]);
    //     console.log('Failed to load HR list');
    //   }
    // }, [])

  //  useEffect(() => {
  //   fetchHrList();
  // }, []);


  useEffect(() => {
    fetchProjects();
    fetchStaff();
  
  }, [isAdmin]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isStaff || !user?.id) return;
      if (staffId && staffName) return;
      try {
        const res = await apiClient.get(`/api/user/profile/${user.id}`);
        const profileData = res?.data?.data?.profile;
        if (profileData?._id) {
          setResolvedStaff({
            id: profileData._id,
            name: profileData.staffName || "",
          });
        }
      } catch (err) {
        console.error("Error fetching staff profile", err);
      }
    };
    fetchProfile();
  }, [isStaff, user?.id, staffId, staffName]);

  const visibleProjects = useMemo(() => {
    if (isAdmin) return projects;
    if (!isStaff) return [];
    if (!effectiveStaffId) return projects;
    return projects.filter((item) => String(item.staffId || "") === String(effectiveStaffId));
  }, [projects, isAdmin, isStaff, effectiveStaffId]);

  const categories = useMemo(() => {
    const unique = new Set(visibleProjects.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [visibleProjects]);

  const technologies = useMemo(() => {
    const unique = new Set(visibleProjects.map((item) => item.technology).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [visibleProjects]);

  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((item) => {
      const matchesSearch =
        !search ||
        item.projectTitle?.toLowerCase().includes(search.toLowerCase()) ||
        item.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
        item.technology?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filters.category === "all" || item.category === filters.category;
      const matchesTechnology = filters.technology === "all" || item.technology === filters.technology;
      const matchesStaff =
        !isAdmin ||
        filters.staffId === "all" ||
        String(item.staffId || "") === String(filters.staffId);
      return matchesSearch && matchesCategory && matchesTechnology && matchesStaff;
    });
  }, [visibleProjects, search, filters, isAdmin]);

  const summary = useMemo(() => {
    const totalCost = visibleProjects.reduce((sum, item) => sum + Number(item.projectCost || 0), 0);
    const techCount = new Set(visibleProjects.map((item) => item.technology).filter(Boolean)).size;
    const categoryCount = new Set(visibleProjects.map((item) => item.category).filter(Boolean)).size;
    return {
      totalProjects: visibleProjects.length,
      totalCost,
      techCount,
      categoryCount,
    };
  }, [visibleProjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "staffId") {
      const selected = staffOptions.find((item) => String(item._id) === String(value));
      setFormData((prev) => ({
        ...prev,
        staffId: value,
        staffName: selected?.staffName || "",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    if (isStaff) {
      setFormData({
        ...initialForm,
        staffId: effectiveStaffId || "",
        staffName: effectiveStaffName || "",
      });
    } else {
      setFormData(initialForm);
    }
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (project) => {
    const resolvedStaffName =
      project.staffName ||
      staffOptions.find((item) => String(item._id) === String(project.staffId))?.staffName ||
      "";
    setFormData({
      projectCode: project.projectCode || "",
      projectTitle: project.projectTitle || "",
      technology: project.technology || "",
      category: project.category || "",
      algorithm: project.algorithm || "",
      projectCost: project.projectCost ?? "",
      link: project.link || "",
      abstract: project.abstract || "",
      video: project.video || "",
      existing: project.existing || "",
      proposed: project.proposed || "",
      systemRequirements: project.systemRequirements || "",
      staffId: project.staffId || "",
      staffName: resolvedStaffName,
    });
    setEditId(project._id);
    setShowModal(true);
  };

  const canManageProject = (project) => {
    if (isAdmin) return true;
    if (!isStaff) return false;
    return String(project.staffId || "") === String(staffId);
  };

  const buildPayload = () => {
    const payload = {
      ...formData,
      projectCost: Number(formData.projectCost || 0),
    };

    if (isStaff) {
      payload.staffId = effectiveStaffId || formData.staffId || null;
      payload.staffName = effectiveStaffName || formData.staffName || "";
    } else if (isAdmin && formData.staffId) {
      const selected = staffOptions.find((item) => String(item._id) === String(formData.staffId));
      payload.staffName = selected?.staffName || formData.staffName || "";
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin && !isStaff) {
      cusToast("You do not have permission to manage projects.", "error");
      return;
    }
    if (isStaff && !effectiveStaffId) {
      cusToast("Your staff profile is missing. Please re-login.", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      if (editId) {
        await apiClient.put(`/api/projects/${editId}`, payload);
        cusToast("Project updated");
      } else {
        await apiClient.post("/api/projects", payload);
        cusToast("Project created");
      }
      setShowModal(false);
      setEditId(null);
      setFormData(initialForm);
      fetchProjects();
    } catch (err) {
      console.error("Error saving project", err);
      const message = err?.response?.data?.error || "Failed to save project";
      cusToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!((await confirmBox("Do you want to delete this project?")).isConfirmed)) return;
    try {
      await apiClient.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((item) => item._id !== id));
      cusToast("Project deleted");
    } catch (err) {
      console.error("Error deleting project", err);
      cusToast("Failed to delete project", "error");
    }
  };

  return (
    <MainLayout>
      <div className="projects-dashboard">
        <div className="projects-header">
          <div>
            <p className="projects-kicker">{isAdmin ? "Admin Control Center" : "Staff Workspace"}</p>
            <h1>Projects Dashboard</h1>
            <p className="projects-subtitle">
              {isAdmin ? "Create, assign, and monitor every project." : "Manage and track your assigned projects."}
            </p>
          </div>
          <button className="projects-btn primary" onClick={openCreate}>
            Add Project
          </button>
        </div>

        <div className="projects-stats">
          <div className="projects-stat-card">
            <p>Total Projects</p>
            <h3>{summary.totalProjects}</h3>
          </div>
          <div className="projects-stat-card">
            <p>Total Cost</p>
            <h3>INR {summary.totalCost.toLocaleString("en-IN")}</h3>
          </div>
          <div className="projects-stat-card">
            <p>Technologies</p>
            <h3>{summary.techCount}</h3>
          </div>
          <div className="projects-stat-card">
            <p>Categories</p>
            <h3>{summary.categoryCount}</h3>
          </div>
        </div>

        <div className="projects-toolbar">
          <input
            className="projects-search"
            placeholder="Search by title, code, technology"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="projects-filter"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Categories" : item}
              </option>
            ))}
          </select>
          <select
            className="projects-filter"
            value={filters.technology}
            onChange={(e) => setFilters((prev) => ({ ...prev, technology: e.target.value }))}
          >
            {technologies.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Technologies" : item}
              </option>
            ))}
          </select>
          {isAdmin && (
            <select
              className="projects-filter"
              value={filters.staffId}
              onChange={(e) => setFilters((prev) => ({ ...prev, staffId: e.target.value }))}
            >
              <option value="all">All Staff</option>
              {staffOptions.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.staffName}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="projects-empty">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="projects-empty">
            {isStaff ? "No projects assigned yet." : "No projects found."}
          </div>
        ) : (
          <div className="projects-table-wrap">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Technology</th>
                  <th>Cost</th>
                  <th>Staff</th>
                  <th>Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project._id}>
                    <td>
                      <div className="table-title">{project.projectTitle}</div>
                      <div className="table-sub">{project.projectCode}</div>
                    </td>
                    <td>{project.category}</td>
                    <td>{project.technology}</td>
                    <td>INR {Number(project.projectCost || 0).toLocaleString("en-IN")}</td>
                    <td>
                      {project.staffName ||
                        staffOptions.find((item) => String(item._id) === String(project.staffId))?.staffName ||
                        (isStaff && String(project.staffId) === String(effectiveStaffId) ? effectiveStaffName : "") ||
                        "Unassigned"}
                    </td>
                    <td>
                      <a href={project.link} target="_blank" rel="noreferrer" className="table-link">
                        Open
                      </a>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="projects-btn ghost small" onClick={() => setViewProject(project)}>
                          View
                        </button>
                        {canManageProject(project) && (
                          <>
                            <button className="projects-btn ghost small" onClick={() => handleEdit(project)}>
                              Edit
                            </button>
                            <button className="projects-btn danger small" onClick={() => handleDelete(project._id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewProject && (
        <div className="projects-modal" onClick={() => setViewProject(null)}>
          <div className="projects-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="projects-modal-header">
              <h2>{viewProject.projectTitle}</h2>
              <button className="projects-close" type="button" onClick={() => setViewProject(null)}>
                X
              </button>
            </div>
            <div className="project-view-grid">
              <div>
                <p className="view-label">Project Code</p>
                <p className="view-value">{viewProject.projectCode}</p>
              </div>
              <div>
                <p className="view-label">Category</p>
                <p className="view-value">{viewProject.category}</p>
              </div>
              <div>
                <p className="view-label">Technology</p>
                <p className="view-value">{viewProject.technology}</p>
              </div>
              <div>
                <p className="view-label">Algorithm</p>
                <p className="view-value">{viewProject.algorithm}</p>
              </div>
              <div>
                <p className="view-label">Cost</p>
                <p className="view-value">INR {Number(viewProject.projectCost || 0).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="view-label">Staff</p>
                <p className="view-value">
                  {viewProject.staffName ||
                    staffOptions.find((item) => String(item._id) === String(viewProject.staffId))?.staffName ||
                    (isStaff && String(viewProject.staffId) === String(effectiveStaffId) ? effectiveStaffName : "") ||
                    "Unassigned"}
                </p>
              </div>
              <div className="full">
                <p className="view-label">Project Link</p>
                <a href={viewProject.link} target="_blank" rel="noreferrer" className="table-link">
                  {viewProject.link}
                </a>
              </div>
              <div className="full">
                <p className="view-label">Abstract</p>
                <p className="view-value">{viewProject.abstract}</p>
              </div>
              <div>
                <p className="view-label">Existing System</p>
                <p className="view-value">{viewProject.existing}</p>
              </div>
              <div>
                <p className="view-label">Proposed System</p>
                <p className="view-value">{viewProject.proposed}</p>
              </div>
              <div className="full">
                <p className="view-label">System Requirements</p>
                <p className="view-value">{viewProject.systemRequirements}</p>
              </div>
              <div className="full">
                <p className="view-label">Video Link</p>
                <p className="view-value">{viewProject.video}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="projects-modal" onClick={() => { setShowModal(false); setFormData(initialForm); setEditId(null); }}>
          <div className="projects-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="projects-modal-header">
              <h2>{editId ? "Edit Project" : "Add Project"}</h2>
              <button className="projects-close" type="button" onClick={() => { setShowModal(false); setFormData(initialForm); setEditId(null); }}>
                X
              </button>
            </div>
            <form onSubmit={handleSubmit} className="projects-form">
              <div className="projects-form-grid">
                <label>
                  Project Code
                  <input name="projectCode" value={formData.projectCode} onChange={handleChange} required placeholder="(.g., PRJ001"/>
                </label>
                <label>
                  Project Title
                  <input name="projectTitle" value={formData.projectTitle} onChange={handleChange} required placeholder="e.g., Student Management System" />
                </label>
                <label>
                  Technology
                  <input name="technology" value={formData.technology} onChange={handleChange} required placeholder="e.g., React, Node.js"/>
                </label>
                <label>
                  Category
                  <input name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Web Application"/>
                </label>
                <label>
                  Algorithm
                  <input name="algorithm" value={formData.algorithm} onChange={handleChange} required placeholder="e.g., Dijkstra, ML Model"/>
                </label>
                <label>
                  Project Cost (INR)
                  <input type="number" name="projectCost" value={formData.projectCost} onChange={handleChange} required placeholder="e.g., 5000"/>
                </label>
                <label className="full">
                  Project Link
                  <input type="url" name="link" value={formData.link} onChange={handleChange} required placeholder="e.g., https://example.com"/>
                </label>
                {isAdmin && (
                  <label className="full">
                    Assign Staff
                    <select name="staffId" value={formData.staffId} onChange={handleChange}>
                      <option value="">Unassigned</option>
                      {staffOptions.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.staffName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="full">
                  Abstract
                  <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows={3} required placeholder="Write a short summary of the project"/>
                </label>
                <label className="full">
                  Video Link
                  <input name="video" value={formData.video} onChange={handleChange} required placeholder="Enter demo video link (e.g., YouTube URL)"/>
                </label>
                <label className="full">
                  Existing System
                  <textarea name="existing" value={formData.existing} onChange={handleChange} rows={3} required  placeholder="Describe the current/existing system"/>
                </label>
                <label className="full">
                  Proposed System
                  <textarea name="proposed" value={formData.proposed} onChange={handleChange} rows={3} required placeholder="Describe your proposed solution"/>
                </label>
                <label className="full">
                  System Requirements
                  <textarea
                    name="systemRequirements"
                    value={formData.systemRequirements}
                    onChange={handleChange}
                    rows={3}
                    required
                    placeholder="List hardware/software requirements"
                  />
                </label>
              </div>
              <div className="projects-modal-actions">
                <button type="button" className="projects-btn ghost" onClick={() => { setShowModal(false); setFormData(initialForm); setEditId(null); }}>
                  Cancel
                </button>
                <button type="submit" className="projects-btn primary" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminProjects;

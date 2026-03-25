import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { cusToast } from "../Components/Toast/CusToast";
import { resolveFileUrl } from "../API";
import "./EventsPage.css";
import { confirmBox } from "../Components/ConfirmBox/ConfirmBox";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    description: "",
    eventType: "",
  });

  const { role, user } = useAuth();
  const effectiveRole = role || user?.role;
  const isAdmin = useMemo(() => effectiveRole === "admin", [effectiveRole]);

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get("/api/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      cusToast("Only admin can manage events.", "error");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.eventType) {
      cusToast("Please fill all required fields.", "error");
      return;
    }

    if (!editingId && !formData.image) {
      cusToast("Event image is required.", "error");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    if (formData.image) {
      formDataObj.append("image", formData.image);
    }
    formDataObj.append("description", formData.description);
    formDataObj.append("eventType", formData.eventType);

    try {
      setSaving(true);
      if (editingId) {
        await apiClient.put(`/api/events/${editingId}`, formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cusToast("Event updated successfully");
      } else {
        await apiClient.post("/api/events", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cusToast("Event created successfully");
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        title: "",
        image: null,
        description: "",
        eventType: "",
      });
      fetchEvents();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save event";
      cusToast(message, "error");
      console.error("Error saving event:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title || "",
      image: null,
      description: event.description || "",
      eventType: event.eventType || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {

    if (!((await confirmBox('Do you want to delete this event?')).isConfirmed)) return;

    try {
      await apiClient.delete(`/api/events/${id}`);
      setEvents(events.filter((event) => event._id !== id));
      cusToast("Event deleted successfully");
    } catch (err) {
      cusToast("Failed to delete event", "error");
      console.error("Error deleting event:", err);
    }
  };

  const resolveImage = (event) => {
    const filename = event?.image || event?.src;
    return resolveFileUrl(filename);
  };

  return (
    <MainLayout>
      <div className="events-page">
        <div className="events-header">
          <h1 className="events-title">Event Management</h1>
          {isAdmin && (
            <button className="events-btn" onClick={() => setShowModal(true)}>
              Add Event
            </button>
          )}
        </div>

        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="events-card">
              {resolveImage(event) && (
                <img src={resolveImage(event)} alt={event.title} className="events-image" />
              )}
              <div className="events-body">
                <h3>{event.title}</h3>
                <p className="events-type">{event.eventType}</p>
                <p className="events-desc">{event.description}</p>
              </div>
              {isAdmin && (
                <div className="events-actions">
                  <button className="events-mini" onClick={() => handleEdit(event)}>
                    Edit
                  </button>
                  <button className="events-mini danger" onClick={() => handleDelete(event._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="events-modal">
            <div className="events-modal-card">
              <div className="events-modal-header">
                <h2>{editingId ? "Edit Event" : "Add Event"}</h2>
                <button
                  className="events-close"
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                >
                  X
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="events-form-grid">
                  <div className="events-field">
                    <label className="events-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="events-input"
                      required
                    />
                  </div>

                  <div className="events-field">
                    <label className="events-label">Type</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="events-input"
                      required
                    >
                      <option value="">Choose</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Celebration">Celebration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="events-field full">
                    <label className="events-label">Image</label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      className="events-input"
                      accept="image/*"
                      required={!editingId}
                    />
                  </div>

                  <div className="events-field full">
                    <label className="events-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="events-input"
                      rows={4}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="events-modal-actions">
                  <button
                    type="button"
                    className="events-btn secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="events-btn" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update" : "Submit"}
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

export default AdminEvents;

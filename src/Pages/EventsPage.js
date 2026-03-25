import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../MainLayout.js/MainLayout";
import apiClient from "../lib/apiClient";
import { resolveFileUrl } from "../API";
import "./EventsPage.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

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

  const selectedEvent = useMemo(() => {
    if (!events.length) return null;
    const found = events.find((event) => event._id === selectedId);
    return found || events[0];
  }, [events, selectedId]);

  const resolveImage = (event) => {
    const filename = event?.image || event?.src;
    return resolveFileUrl(filename);
  };

  return (
    <MainLayout>
      <div className="events-page">
        <div className="events-header">
          <div>
            <h1 className="events-title">Events</h1>
            <p className="events-subtitle">Tap an event image to see full details</p>
          </div>
        </div>

        {selectedEvent && (
          <div className="events-detail">
            <div className="events-detail-media">
              {resolveImage(selectedEvent) ? (
                <img src={resolveImage(selectedEvent)} alt={selectedEvent.title} />
              ) : (
                <div className="events-detail-placeholder">No image</div>
              )}
            </div>
            <div className="events-detail-body">
              <span className="events-tag">{selectedEvent.eventType || "Event"}</span>
              <h2>{selectedEvent.title}</h2>
              <p>{selectedEvent.description}</p>
            </div>
          </div>
        )}

        <div className="events-strip">
          {events.map((event) => (
            <button
              key={event._id}
              type="button"
              className={`events-strip-card ${selectedEvent?._id === event._id ? "active" : ""}`}
              onClick={() => setSelectedId(event._id)}
            >
              {resolveImage(event) ? (
                <img src={resolveImage(event)} alt={event.title} />
              ) : (
                <div className="events-strip-placeholder">No image</div>
              )}
              <div className="events-strip-title">{event.title}</div>
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default EventsPage;

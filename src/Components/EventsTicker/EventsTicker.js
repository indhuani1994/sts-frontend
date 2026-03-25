import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { resolveFileUrl } from '../../API';
import './EventsTicker.css';

const EventsTicker = () => {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiClient.get('/api/events');
        setEvents(res.data || []);
      } catch (error) {
        console.error('Failed to load events', error);
      }
    };
    fetchEvents();
  }, []);

  const selectedEvent = useMemo(() => {
    if (!events.length) return null;
    return events.find((event) => event._id === selectedId) || events[0];
  }, [events, selectedId]);

  const resolveImage = (event) => {
    const filename = event?.image || event?.src;
    return resolveFileUrl(filename);
  };

  if (!events.length) return null;

  return (
    <>
      <div className="events-ticker">
        <div className="events-ticker-track">
          {events.map((event) => (
            <button
              key={event._id}
              type="button"
              className="events-ticker-item"
              onClick={() => {
                setSelectedId(event._id);
                setOpen(true);
              }}
            >
             
              {resolveImage(event) ? (
                <img src={resolveImage(event)} alt={event.title} />
              ) : (
                <span className="events-ticker-placeholder">No image</span>
              )}
              <div className='myspinner'></div>  
            </button>
          ))}
        </div>
      </div>

      {open && selectedEvent && (
        <div className="events-ticker-modal">
          <div className="events-ticker-modal-card">
            <button className="events-ticker-close" onClick={() => setOpen(false)} type="button">
              X
            </button>
            <div className="events-ticker-modal-media">
              {resolveImage(selectedEvent) ? (
                <img src={resolveImage(selectedEvent)} alt={selectedEvent.title} />
              ) : (
                <div className="events-ticker-placeholder">No image</div>
              )}
            </div>
            <div className="events-ticker-modal-body">
              <span className="events-ticker-tag">{selectedEvent.eventType || 'Event'}</span>
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventsTicker;

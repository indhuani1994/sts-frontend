import React, { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import './NextDayScheduleStu.css'; // Separate CSS for styling

const NextDayScheduleStu = ({onClick}) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSchedule = async () => {
    try {
      const profile = JSON.parse(localStorage.getItem('profile'));
      if (!profile?._id) return;

      // Fetch schedules by studentId
      const res = await apiClient.get(`/api/schedule/${profile._id}`);
      setSchedules(res.data.schedules);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Am i running even when i am open ")
    getSchedule();
  }, []);

  if (loading) {
    return (
      <div className="schedule-loading">
        Loading your schedule...
      </div>
    );
  }

  return (
        <div >

    <div style={{background:"#fff",  padding: "20px", boxShadow: "0px 0px 3px rgba(0,0,0,0.3)", borderRadius: "5px"}}>
      
      <h1 className='text-shadow reshead black'>Upcoming Schedule</h1>
      {schedules.length === 0 ? (
        <p className="no-schedule">No schedules found 😢</p>
      ) : (
        <div className="schedule-grid">
          {schedules.map((item, index) => (
            <div key={index} className="schedule-card">

              <div className="schedule-time">{item.time || 'Time not set'}</div>
              <div className="schedule-class">{item.classType || 'Class/Lab'}</div>
              <div className="schedule-topic">{item.topic || 'Topic not set'}</div>
              <div className="schedule-topic">{item.course || 'Topic not set'}</div>
              <div className="schedule-topic">{item.staff || 'Topic not set'}</div>
              <div className="schedule-meta">
                <span>RegID: {item.regId}</span>
                <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default NextDayScheduleStu;


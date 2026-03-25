import React, { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';

const CourseUpdatedProject = () => {
  const { role, user } = useAuth();
  const [data, setData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [clipImages, setClipImages] = useState([]);
  const [clipOpen, setClipOpen] = useState(false);
  const [filters, setFilters] = useState({
    student: '',
    staff: '',
    time: '',
    course: '',
  });
  const [bulkMenu, setBulkMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    anchorRegId: null,
    values: {
      time: '',
      classType: '',
      topic: '',
    },
  });
  const tableRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [role, user?.profileId]);

  useEffect(() => {
    if (!bulkMenu.open) return;
    const handleClose = () => setBulkMenu((prev) => ({ ...prev, open: false }));
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [bulkMenu.open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedProfile = JSON.parse(localStorage.getItem('profile') || 'null');
      const staffProfileId = role === 'staff' ? (user?.profileId || storedProfile?._id) : null;

      const studentsRequest =
        role === 'staff' && staffProfileId
          ? apiClient.get(`/api/stureg?staffId=${staffProfileId}`)
          : apiClient.get('/api/stureg');

      const [studentsRes, scheduleRes] = await Promise.all([
        studentsRequest,
        apiClient.get('/api/schedule'),
      ]);

      const rows = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.data || []);
      setData(rows);

      const scheduleMap = {};
      if (scheduleRes.data && Array.isArray(scheduleRes.data)) {
        scheduleRes.data.forEach((schedule) => {
          scheduleMap[schedule.regId] = schedule;
        });
      }

      const mergedSchedule = rows.map((item) => ({
        regId: item._id,
        studentId: item.student?._id || '',
        time: scheduleMap[item._id]?.time || item.availTime || '',
        topic: scheduleMap[item._id]?.topic || '',
        staff: item.staff?.staffName || '',
        course: item.course?.courseName || '',
        classType: scheduleMap[item._id]?.classType || 'Class / Lab',
        ...(scheduleMap[item._id]?._id && { _id: scheduleMap[item._id]._id }),
      }));

      setScheduleData(mergedSchedule);
      setSelected({});
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...scheduleData];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setScheduleData(updated);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validEntries = scheduleData.filter((item) => item.time && item.topic);
    const missingCount = scheduleData.length - validEntries.length;

    if (validEntries.length === 0) {
      alert('Please fill at least one time and topic field');
      return;
    }

    try {
      await apiClient.post('/api/schedule', validEntries);
      if (missingCount > 0) {
        alert(`Schedule submitted. ${missingCount} rows were skipped (missing time/topic).`);
      } else {
        alert('Schedule submitted successfully');
      }
      await fetchData();
    } catch (error) {
      console.error('Error submitting schedule:', error);
      alert('Submission failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetScheduleData = () => {
    if (!data) return;

    const initialSchedule = data.map((item) => ({
      regId: item._id,
      studentId: item.student?._id || '',
      time: item.availTime || '',
      topic: '',
      staff: item.staff?.staffName || '',
      course: item.course?.courseName || '',
      classType: 'Class / Lab',
    }));
    setScheduleData(initialSchedule);
    setSelected({});
  };

  const resetFilters = () => {
    setFilters({
      student: '',
      staff: '',
      time: '',
      course: '',
    });
  };

  const clearSelection = () => {
    setSelected({});
  };

  const combinedRows = useMemo(
    () =>
      data.map((item, index) => ({
        item,
        index,
        scheduleItem: scheduleData[index] || {},
      })),
    [data, scheduleData]
  );

  const filteredRows = useMemo(() => {
    const studentFilter = filters.student.trim().toLowerCase();
    const staffFilter = filters.staff.trim().toLowerCase();
    const timeFilter = filters.time.trim().toLowerCase();
    const courseFilter = filters.course.trim().toLowerCase();

    return combinedRows.filter(({ item, scheduleItem }) => {
      const studentName = (item.student?.studentName || '').toLowerCase();
      const staffName = (item.staff?.staffName || '').toLowerCase();
      const courseName = (item.course?.courseName || '').toLowerCase();
      const timeValue = (scheduleItem.time || '').toLowerCase();

      if (studentFilter && !studentName.includes(studentFilter)) return false;
      if (staffFilter && !staffName.includes(staffFilter)) return false;
      if (courseFilter && !courseName.includes(courseFilter)) return false;
      if (timeFilter && !timeValue.includes(timeFilter)) return false;

      return true;
    });
  }, [combinedRows, filters]);

  const handleToggleSelect = (regId) => {
    setSelected((prev) => ({ ...prev, [regId]: !prev[regId] }));
  };

  const selectAllFiltered = () => {
    const nextSelected = { ...selected };
    filteredRows.forEach(({ item }) => {
      nextSelected[item._id] = true;
    });
    setSelected(nextSelected);
  };

  const handleContextMenu = (event, regId) => {
    event.preventDefault();
    setBulkMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      anchorRegId: regId,
      values: {
        time: '',
        classType: '',
        topic: '',
      },
    });
  };

  const applyBulk = () => {
    const selectedIds = Object.keys(selected).filter((key) => selected[key]);
    const targets = selectedIds.length > 0 ? selectedIds : bulkMenu.anchorRegId ? [bulkMenu.anchorRegId] : [];

    if (targets.length === 0) {
      alert('Select at least one student to apply the bulk update.');
      return;
    }

    const { time, classType, topic } = bulkMenu.values;

    setScheduleData((prev) =>
      prev.map((item) => {
        if (!targets.includes(item.regId)) return item;
        return {
          ...item,
          time: time ? time : item.time,
          classType: classType ? classType : item.classType,
          topic: topic ? topic : item.topic,
        };
      })
    );

    setBulkMenu((prev) => ({ ...prev, open: false }));
  };

  const handleClip = async () => {
    if (!tableRef.current) return;

    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const maxSliceHeight = "1300";
      const slices = [];

      for (let y = 0; y < canvas.height; y += maxSliceHeight) {
        const sliceHeight = Math.min(maxSliceHeight, canvas.height - y);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        slices.push(sliceCanvas.toDataURL('image/png'));
      }

      setClipImages(slices);
      setClipOpen(true);
    } catch (error) {
      console.error('Error taking clip:', error);
      alert('Failed to capture schedule');
    }
  };

  const downloadAllClips = () => {
    if (!clipImages.length) return;
    clipImages.forEach((dataUrl, index) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `schedule-clip-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="schedule-container">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }} className='schedule-filter'>
          <input
            type="text"
            placeholder="Filter by student"
            value={filters.student}
            onChange={(event) => setFilters((prev) => ({ ...prev, student: event.target.value }))}
            style={{ width: '180px', margin: 0 }}
          />
          <input
            type="text"
            placeholder="Filter by staff"
            value={filters.staff}
            onChange={(event) => setFilters((prev) => ({ ...prev, staff: event.target.value }))}
            style={{ width: '180px', margin: 0 }}
          />
          <input
            type="text"
            placeholder="Filter by time"
            value={filters.time}
            onChange={(event) => setFilters((prev) => ({ ...prev, time: event.target.value }))}
            style={{ width: '160px', margin: 0 }}
          />
          <input
            type="text"
            placeholder="Filter by course"
            value={filters.course}
            onChange={(event) => setFilters((prev) => ({ ...prev, course: event.target.value }))}
            style={{ width: '200px', margin: 0 }}
          />
           <button type="button" onClick={resetFilters} className='schedule-btn reset'>
            Reset Filters
          </button>
          <button type="button" onClick={selectAllFiltered} className='schedule-btn primary'>
            Select All (Filtered)
          </button>
          <button type="button" onClick={clearSelection} className='schedule-btn clip'>
            Clear Selection
          </button>
         
        </div>
        <form onSubmit={handleSubmit}>
          <div className="schedule-table-wrap" ref={tableRef}>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Staff</th>
                  <th>Time</th>
                  <th>Class/Lab</th>
                  <th>Topic</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(({ item, index, scheduleItem }) => {
                  const regId = item._id;
                  const isSelected = Boolean(selected[regId]);
                  return (
                    <tr
                      key={item._id}
                      onContextMenu={(event) => handleContextMenu(event, regId)}
                      className={isSelected ? 'schedule-row-selected' : ''}
                    >
                      <td>
                        <input
                          className="schedule-checkbox"
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(regId)}
                        />
                      </td>
                      <td>{item.student?.studentName || 'N/A'}</td>
                      <td>{item.course?.courseName || 'N/A'}</td>
                      <td>{item.staff?.staffName || 'N/A'}</td>
                      <td>
                        <input
                          list="timeList"
                          value={scheduleItem.time || ''}
                          onChange={(event) => handleChange(index, 'time', event.target.value)}
                        />
                        <datalist id="timeList">
                          {[
                            '10:00-12:00',
                            '11:00-1:00',
                            '12:00-2:00',
                            '1:00-3:00',
                            '2:00-4:00',
                            '3:00-5:00',
                            '4:00-6:00',
                            '3:30-5:30',
                          ].map((timeSlot, idx) => (
                            <option key={idx} value={timeSlot} />
                          ))}
                        </datalist>
                      </td>
                      <td>
                        <select
                          value={scheduleItem.classType || 'Class / Lab'}
                          onChange={(event) => handleChange(index, 'classType', event.target.value)}
                        >
                          <option value="Class / Lab">Class/Lab</option>
                          <option value="Lab">Lab</option>
                          <option value="Class">Class</option>
                          <option value="Test">Test</option>
                          <option value="Not Schedule">Not Schedule</option>
                        </select>
                      </td>
                      <td>
                        <input
                          placeholder="Enter Topic"
                          // size={40}
                          list={item.course?.courseName}
                          value={scheduleItem.topic || ''}
                          onChange={(event) => handleChange(index, 'topic', event.target.value)}
                        />
                        {item.course?.syllabus && (
                          <datalist id={item.course.courseName}>
                            {item.course.syllabus.map((topic, topicIndex) => (
                              <option key={topicIndex} value={topic} />
                            ))}
                          </datalist>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="schedule-btn reset" type="button" onClick={resetScheduleData}>
              Reset
            </button>
            <button className="schedule-btn primary" type="submit" style={{ marginLeft: '10px' }}>
              Submit
            </button>
            {role === 'admin' && (
              <button className="schedule-btn clip" type="button" onClick={handleClip} style={{ marginLeft: '10px' }}>
                Take a clip
              </button>
            )}
          </div>
        </form>

        {bulkMenu.open && (
          <div
            className="schedule-bulk-menu"
            style={{ top: bulkMenu.y + 6, left: bulkMenu.x + 6 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bulk-title">Bulk update</div>
            <div className="bulk-field">
              <label>Time</label>
              <input
                list="timeList"
                value={bulkMenu.values.time}
                onChange={(event) =>
                  setBulkMenu((prev) => ({
                    ...prev,
                    values: { ...prev.values, time: event.target.value },
                  }))
                }
              />
            </div>
            <div className="bulk-field">
              <label>Class/Lab</label>
              <select
                value={bulkMenu.values.classType}
                onChange={(event) =>
                  setBulkMenu((prev) => ({
                    ...prev,
                    values: { ...prev.values, classType: event.target.value },
                  }))
                }
              >
                <option value="">Keep existing</option>
                <option value="Class / Lab">Class/Lab</option>
                <option value="Lab">Lab</option>
                <option value="Class">Class</option>
                <option value="Test">Test</option>
              </select>
            </div>
            <div className="bulk-field">
              <label>Topic</label>
              <input
                placeholder="Enter topic"
                value={bulkMenu.values.topic}
                onChange={(event) =>
                  setBulkMenu((prev) => ({
                    ...prev,
                    values: { ...prev.values, topic: event.target.value },
                  }))
                }
              />
            </div>
            <div className="bulk-actions">
              <button type="button" onClick={applyBulk}>
                Apply
              </button>
              <button
                type="button"
                className="bulk-cancel"
                onClick={() => setBulkMenu((prev) => ({ ...prev, open: false }))}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {clipOpen && clipImages.length > 0 && (
          <div className="clip-preview-overlay" onClick={() => setClipOpen(false)}>
            <div className="clip-preview-content" onClick={(event) => event.stopPropagation()}>
              <div className="clip-preview-header">
                <h3>Schedule clip</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={downloadAllClips}>
                    Download all
                  </button>
                  <button type="button" onClick={() => setClipOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
              <div className="clip-preview-list">
                {clipImages.map((src, index) => (
                  <img key={index} src={src} alt={`Schedule clip ${index + 1}`} />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default CourseUpdatedProject;

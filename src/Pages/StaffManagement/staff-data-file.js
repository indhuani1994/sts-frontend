import axios from 'axios';

 const staffDataSource = {
  // Read operation
  async findMany({ pagination }) {
    const { page, pageSize } = pagination;
    const response = await axios.get('http://localhost:5000/api/staffs', {
      params: { page, pageSize },
    });
    return {
      rows: response.data,
      rowCount: response.headers['x-total-count'], // Your API needs to send this header
    };
  },

  // Create operation
  async create({ newStaff }) {
    const formData = new FormData();
    for (const key in newStaff) {
      if (Array.isArray(newStaff[key])) {
        formData.append(key, JSON.stringify(newStaff[key]));
      } else {
        formData.append(key, newStaff[key]);
      }
    }
    const response = await axios.post('http://localhost:5000/api/staffs', formData);
    return response.data;
  },

  // Update operation
  async update({ id, updatedStaff }) {
    const formData = new FormData();
    for (const key in updatedStaff) {
      if (Array.isArray(updatedStaff[key])) {
        formData.append(key, JSON.stringify(updatedStaff[key]));
      } else {
        formData.append(key, updatedStaff[key]);
      }
    }
    const response = await axios.put(`http://localhost:5000/api/staffs/${id}`, formData);
    return response.data;
  },

  // Delete operation
  async delete({ id }) {
    await axios.delete(`http://localhost:5000/api/staffs/${id}`);
  },
};

export default staffDataSource;
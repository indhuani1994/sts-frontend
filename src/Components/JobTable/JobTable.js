import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Typography, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const JobTable = ({ jobs = [], onEdit, onDelete }) => {
  const jobArray = Array.isArray(jobs) ? jobs : [];

  // Preprocess rows to include S.No
  const rows = jobArray.map((job, index) => ({
    ...job,
    id: job._id,
    sno: (index + 1).toString(), // cast to string to avoid NaN warning
  }));

  const columns = [
    { field: 'sno', headerName: 'S.No', width: 80, sortable: false, filterable: false },
    { field: 'title', headerName: 'Job Title', width: 180 },
    { field: 'company', headerName: 'Company', width: 150 },
    { field: 'location', headerName: 'Location', width: 130 },
    { field: 'type', headerName: 'Job Type', width: 120 },
    { field: 'employmentType', headerName: 'Employment Type', width: 140 },
    { field: 'workMode', headerName: 'Work Mode', width: 120 },
    { field: 'experience', headerName: 'Experience', width: 120 },
    { field: 'salary', headerName: 'Salary / CTC', width: 130 },
    {
      field: 'skills',
      headerName: 'Skills',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.row.skills?.join(', ')}
        </Typography>
      ),
    },
    {
      field: 'applicationDeadline',
      headerName: 'Apply By',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.applicationDeadline
            ? new Date(params.row.applicationDeadline).toLocaleDateString()
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'postedDate',
      headerName: 'Posted Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : '-'}
        </Typography>
      ),
    },
    {
      field: 'view',
      headerName: 'View',
      width: 140,
      renderCell: (params) => (
        <Button
          component={Link}
          to={`/jobs/${params.row._id}`}
          variant="outlined"
          size="small"
        >
          View Details
        </Button>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => onEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(params.row._id)}>
            <Delete />
          </IconButton>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Paper sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        disableRowSelectionOnClick
        autoHeight
      />
    </Paper>
  );
};

export default JobTable;

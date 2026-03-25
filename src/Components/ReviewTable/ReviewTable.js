import * as React from 'react';
import {
  DataGrid,
} from '@mui/x-data-grid';
import {
  Avatar,
  IconButton,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { resolveFileUrl } from '../../API';

const ReviewTable = ({ reviews, onEdit, onDelete }) => {
  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 80,
      renderCell: (params) => {
        const allRowIds = params.api.getAllRowIds();
        const index = allRowIds.indexOf(params.id);
        return index + 1;
      },
      sortable: false,
      filterable: false,
    },
    {
      field: 'stuImage',
      headerName: 'Student Image',
      width: 120,
      renderCell: (params) =>
        params.row.stuImage ? (
          <Avatar
            alt="Student"
            src={resolveFileUrl(params.row.stuImage)}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No Image
          </Typography>
        ),
      sortable: false,
      filterable: false,
    },
    { field: 'stuId', headerName: 'Student ID', width: 150 },
    { field: 'review', headerName: 'Review', width: 250, flex: 1 },
    { field: 'rate', headerName: 'Rate', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
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

  // Transforming _id to id for DataGrid
  const rows = reviews.map((review) => ({ ...review, id: review._id }));

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[3, 5, 10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
        disableRowSelectionOnClick
      />
    </Paper>
  );
};

export default ReviewTable;

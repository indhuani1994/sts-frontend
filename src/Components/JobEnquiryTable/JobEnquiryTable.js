


import { DataGrid } from '@mui/x-data-grid';
import {
  IconButton,
  Button,
  Paper,
  Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const JobEnquiryTable = ({ enquiries, onEdit, onDelete, handleCopy }) => {
  const navigate = useNavigate();

  
  const columns = [
    { field: 'enName', headerName: 'Name', width: 150 },
    { field: 'enCourse', headerName: 'Course', width: 150 },
    { field: 'enMobile', headerName: 'Mobile', width: 140 },
    { field: 'enStatus', headerName: 'Status', width: 130 },
    {
      field: 'enNextFollowUp',
      headerName: 'Next Follow-Up',
      width: 200,
      renderCell: (params) =>
        params.row.enNextFollowUp
          ? new Date(params.row.enNextFollowUp).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : 'N/A',
    },
    {
      field: 'priorityInfo',
      headerName: 'Priority',
      width: 100,
     
      renderCell: (params) =>
        params.row.priorityInfo ? (
        
            <span>
             <Button
          variant="contained"
          size="small"
          className={params.row.priorityInfo.className }
        >
         {params.row.priorityInfo.label}
        </Button>
          </span>
        ) : (
          <Typography variant="body2" color="textSecondary">
            N/A
          </Typography>
        ),
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

  const rows = enquiries.map((item) => ({
    id: item._id,
    ...item,
  }));

  return (
    <Paper sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
        onRowDoubleClick={(params) => handleCopy(params.row)}
        disableRowSelectionOnClick
      />
    </Paper>
  );
};

export default JobEnquiryTable;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { cusToast } from '../../Components/Toast/CusToast';
import InstallDialogue from '../../Components/DialogueCard/InstallDialogue';
import StuInsTable from '../../Components/StuInsTable/StuInsTable';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';

const InstallmentPage = () => {
  const [stuRegs, setStuRegs] = useState([]);
  const [stuIns, setStuIns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [popup, setPopup] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStuRegs = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/stureg');
      setStuRegs(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (_error) {
      cusToast('Error fetching registrations', 'error');
    }
  }, []);

  const fetchStuIns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/stuins', {
        params: {
          paymentStatus: statusFilter || undefined,
        },
      });

      const rows = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStuIns(rows);
    } catch (_error) {
      cusToast('Error fetching installments', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStuRegs();
  }, [fetchStuRegs]);

  useEffect(() => {
    fetchStuIns();
  }, [fetchStuIns]);

  const handleAddOrEdit = async (formData, isEditing) => {
    const payload = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      if (isEditing) {
        await apiClient.put(`/api/stuins/${payload.id}`, payload);
      } else {
        await apiClient.post('/api/stuins', payload);
      }

      cusToast(`Installment ${isEditing ? 'updated' : 'created'} successfully`);
      setPopup(false);
      setEditData(null);
      await fetchStuIns();
    } catch (error) {
      cusToast(error.response?.data?.message || 'Failed to save installment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await apiClient.delete(`/api/stuins/${id}`);
      cusToast('Installment deleted successfully');
      await fetchStuIns();
    } catch (error) {
      cusToast(error.response?.data?.message || 'Failed to delete installment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stuIns;

    return stuIns.filter((row) => {
      const studentName = row.register?.student?.studentName || '';
      const studentId = row.register?.student?.studentRedId || '';
      const courseName = row.register?.course?.courseName || '';

      return (
        studentName.toLowerCase().includes(q) ||
        studentId.toLowerCase().includes(q) ||
        courseName.toLowerCase().includes(q)
      );
    });
  }, [stuIns, search]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        const paid = Number(row.amountPaid || row.amountReceived || 0);
        const balance = Number(row.balance || 0);
        acc.totalPaid += paid;
        acc.totalBalance += balance;

        const status = row.paymentStatus || 'unpaid';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { totalPaid: 0, totalBalance: 0, paid: 0, unpaid: 0, overdue: 0, due_today: 0 }
    );
  }, [filteredRows]);

  return (
    <MainLayout>
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {loading ? <LinearProgress /> : null}

        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Installment & Billing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track payments, dues, penalties, and generate receipts with fast filters.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Total Paid</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Rs {summary.totalPaid.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Remaining Balance</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Rs {summary.totalBalance.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Overdue</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary.overdue}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Due Today</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary.due_today}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  size="small"
                  label="Search"
                  placeholder="Student / ID / Course"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <TextField
                  size="small"
                  select
                  label="Payment Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="due_today">Due Today</MenuItem>
                </TextField>
              </Stack>

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => {
                  setEditData(null);
                  setPopup(true);
                }}
              >
                Add Installment
              </Button>
            </Stack>

            <StuInsTable stuIns={filteredRows} onEdit={(row) => { setEditData(row); setPopup(true); }} onDelete={handleDelete} />
          </CardContent>
        </Card>
      </Box>

      {popup && (
        <InstallDialogue
          setOpen={setPopup}
          onSubmit={handleAddOrEdit}
          editData={editData}
          stuRegs={stuRegs}
        />
      )}
    </MainLayout>
  );
};

export default InstallmentPage;

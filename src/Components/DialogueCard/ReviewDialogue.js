import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ReviewDialogue({ popup, setOpen, handleEditOrAdd, form, setForm, isEditing }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const temp = {};
    temp.stuImage = form.stuImage ? '' : 'Student image is required*';
    temp.stuId = form.stuId.trim() ? '' : 'Student ID is required*';
    temp.review = form.review.trim() ? '' : 'Review text is required*';
    temp.rate =
      form.rate && Number(form.rate) >= 1 && Number(form.rate) <= 5
        ? ''
        : 'Rate should be between 1 and 5';
    setErrors(temp);
    return Object.values(temp).every((x) => x === '');
  };

  const handleSubmit = () => {
    if (validate()) {
      handleEditOrAdd();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, stuImage: e.target.files[0] });
    setErrors({ ...errors, stuImage: '' });
  };

  return (
    <Dialog open={popup} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Review' : 'Add Review'}
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Student Image */}
          <Box>
            <Typography variant="body1">Student Image:</Typography>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {errors.stuImage && (
              <Typography color="error" variant="body2">
                {errors.stuImage}
              </Typography>
            )}
          </Box>

          {/* Student ID */}
          <TextField
            name="stuId"
            value={form.stuId}
            onChange={handleChange}
            label="Student ID"
            fullWidth
            error={!!errors.stuId}
            helperText={errors.stuId}
            variant="standard"
            margin="dense"
          />

          {/* Review */}
          <TextField
            name="review"
            value={form.review}
            onChange={handleChange}
            label="Review"
            fullWidth
            multiline
            rows={3}
            error={!!errors.review}
            helperText={errors.review}
            variant="standard"
            margin="dense"
          />

          {/* Rate */}
          <TextField
            name="rate"
            type="number"
            value={form.rate}
            onChange={handleChange}
            label="Rate (1-5)"
            fullWidth
            error={!!errors.rate}
            helperText={errors.rate}
            inputProps={{ min: 1, max: 5 }}
            variant="standard"
            margin="dense"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Save Changes' : 'Add Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewDialogue;

import React from 'react';
import { Box, Skeleton } from '@mui/material';

const PageSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={40} />
      <Skeleton variant="rounded" height={120} sx={{ my: 2 }} />
      <Skeleton variant="rounded" height={340} />
    </Box>
  );
};

export default PageSkeleton;

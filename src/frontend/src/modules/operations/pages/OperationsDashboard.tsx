import { Box, Typography, Grid, Paper } from '@mui/material';

const OperationsDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Operations Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Today's Jobs</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Technicians</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Completion Rate</Typography>
            <Typography variant="h3">0%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Avg Time/Job</Typography>
            <Typography variant="h3">0 min</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OperationsDashboard;

import { Box, Typography, Grid, Paper } from '@mui/material';

const FinanceDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Finance Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h3">$0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Outstanding</Typography>
            <Typography variant="h3">$0</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboard;

/**
 * Forecast Page
 * 
 * Weekly forecast view with commit/best case/pipeline breakdown.
 * Shows historical snapshots for trend analysis.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  Skeleton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { opportunitiesService } from '../../../services/opportunities.service';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import type { Opportunity, ForecastSnapshot } from '../../../lib/database.types';

interface ForecastData {
  commit: number;
  bestCase: number;
  pipeline: number;
  quota: number;
}

interface OpportunityForecast extends Opportunity {
  contact?: { first_name: string; last_name: string };
  account?: { name: string };
}

const ForecastPage: React.FC = () => {
  const { profile, isManager, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'next' | 'previous'>('current');
  const [viewType, setViewType] = useState<'summary' | 'detail'>('summary');
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityForecast[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const getPeriodDates = () => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (selectedPeriod) {
      case 'previous':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'next':
        start = startOfMonth(addMonths(now, 1));
        end = endOfMonth(addMonths(now, 1));
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
      label: format(start, 'MMMM yyyy'),
    };
  };

  const loadForecastData = async () => {
    setLoading(true);
    try {
      const period = getPeriodDates();
      const userId = isManager || isAdmin ? undefined : profile?.id;

      // Get forecast data
      const forecastData = await opportunitiesService.getForecast(
        period.start,
        period.end,
        userId
      );

      setForecast({
        commit: forecastData.commit,
        bestCase: forecastData.bestCase,
        pipeline: forecastData.pipeline,
        quota: 100000, // Default quota
      });

      // Get opportunities for detail view
      const opps = await opportunitiesService.getAll({
        status: 'open',
        expectedCloseDateFrom: period.start,
        expectedCloseDateTo: period.end,
        ownerId: userId,
      });

      setOpportunities(opps.data as OpportunityForecast[]);

      // Get historical snapshots
      await loadHistoricalData();

    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const sixMonthsAgo = subMonths(new Date(), 6);

      const { data: snapshots, error } = await supabase
        .from('forecast_snapshots')
        .select('*')
        .is('user_id', isManager || isAdmin ? null : profile?.id)
        .gte('snapshot_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      // Group by snapshot date and format for chart
      const chartData = snapshots?.map((s: ForecastSnapshot) => ({
        date: format(new Date(s.snapshot_date), 'MMM d'),
        commit: s.commit_amount,
        bestCase: s.best_case_amount,
        pipeline: s.pipeline_amount,
      })) || [];

      setHistoricalData(chartData);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
  };

  useEffect(() => {
    loadForecastData();
  }, [selectedPeriod, profile?.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 3) return 'success';
    if (coverage >= 2) return 'warning';
    return 'error';
  };

  const getTrendIcon = (current: number, previous: number) => {
    const diff = ((current - previous) / previous) * 100;
    if (diff > 5) return <TrendingUpIcon color="success" />;
    if (diff < -5) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="disabled" />;
  };

  const period = getPeriodDates();
  const coverage = forecast ? forecast.bestCase / forecast.quota : 0;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Forecast
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {period.label}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ButtonGroup size="small">
            <Button
              variant={selectedPeriod === 'previous' ? 'contained' : 'outlined'}
              onClick={() => setSelectedPeriod('previous')}
            >
              Previous
            </Button>
            <Button
              variant={selectedPeriod === 'current' ? 'contained' : 'outlined'}
              onClick={() => setSelectedPeriod('current')}
            >
              Current
            </Button>
            <Button
              variant={selectedPeriod === 'next' ? 'contained' : 'outlined'}
              onClick={() => setSelectedPeriod('next')}
            >
              Next
            </Button>
          </ButtonGroup>
          <IconButton onClick={loadForecastData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Forecast Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" color="text.secondary">
                  Commit
                </Typography>
                <Tooltip title="Deals you are confident will close">
                  <InfoOutlinedIcon fontSize="small" color="disabled" />
                </Tooltip>
              </Box>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {formatCurrency(forecast?.commit || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(((forecast?.commit || 0) / (forecast?.quota || 1)) * 100)}% of quota
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" color="text.secondary">
                  Best Case
                </Typography>
                <Tooltip title="Commit + likely upside">
                  <InfoOutlinedIcon fontSize="small" color="disabled" />
                </Tooltip>
              </Box>
              <Typography variant="h4" fontWeight={600} color="info.main">
                {formatCurrency(forecast?.bestCase || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(((forecast?.bestCase || 0) / (forecast?.quota || 1)) * 100)}% of quota
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" color="text.secondary">
                  Pipeline
                </Typography>
                <Tooltip title="All open opportunities closing this period">
                  <InfoOutlinedIcon fontSize="small" color="disabled" />
                </Tooltip>
              </Box>
              <Typography variant="h4" fontWeight={600} color="primary">
                {formatCurrency(forecast?.pipeline || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {opportunities.length} opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" color="text.secondary">
                  Coverage
                </Typography>
                <Tooltip title="Best Case ÷ Quota (target: 3x+)">
                  <InfoOutlinedIcon fontSize="small" color="disabled" />
                </Tooltip>
              </Box>
              <Typography 
                variant="h4" 
                fontWeight={600}
                color={`${getCoverageColor(coverage)}.main`}
              >
                {coverage.toFixed(1)}x
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(coverage / 3 * 100, 100)}
                color={getCoverageColor(coverage)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Details */}
      <Grid container spacing={3}>
        {/* Historical Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Forecast Trend" 
              subheader="Weekly snapshots over time"
            />
            <CardContent sx={{ height: 300 }}>
              {historicalData.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No historical data available yet. Snapshots are created weekly.
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="pipeline"
                      stackId="1"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.2}
                      name="Pipeline"
                    />
                    <Area
                      type="monotone"
                      dataKey="bestCase"
                      stackId="2"
                      stroke="#0288d1"
                      fill="#0288d1"
                      fillOpacity={0.4}
                      name="Best Case"
                    />
                    <Area
                      type="monotone"
                      dataKey="commit"
                      stackId="3"
                      stroke="#2e7d32"
                      fill="#2e7d32"
                      fillOpacity={0.6}
                      name="Commit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Forecast Category Breakdown */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Category Breakdown" />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Commit</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {formatCurrency(forecast?.commit || 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((forecast?.commit || 0) / (forecast?.pipeline || 1)) * 100}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Best Case</Typography>
                  <Typography variant="body2" fontWeight={600} color="info.main">
                    {formatCurrency((forecast?.bestCase || 0) - (forecast?.commit || 0))}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(((forecast?.bestCase || 0) - (forecast?.commit || 0)) / (forecast?.pipeline || 1)) * 100}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Pipeline Only</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {formatCurrency((forecast?.pipeline || 0) - (forecast?.bestCase || 0))}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(((forecast?.pipeline || 0) - (forecast?.bestCase || 0)) / (forecast?.pipeline || 1)) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                <strong>Commit:</strong> High confidence deals you expect to close this period.
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <strong>Best Case:</strong> Commit plus deals with good probability.
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <strong>Pipeline:</strong> All open opportunities for the period.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Opportunities Table */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Opportunities in Forecast"
              action={
                <ButtonGroup size="small">
                  <Button
                    variant={viewType === 'summary' ? 'contained' : 'outlined'}
                    onClick={() => setViewType('summary')}
                  >
                    Summary
                  </Button>
                  <Button
                    variant={viewType === 'detail' ? 'contained' : 'outlined'}
                    onClick={() => setViewType('detail')}
                  >
                    Detail
                  </Button>
                </ButtonGroup>
              }
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Opportunity</TableCell>
                    {viewType === 'detail' && <TableCell>Account</TableCell>}
                    <TableCell>Stage</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Forecast</TableCell>
                    <TableCell>Close Date</TableCell>
                    {viewType === 'detail' && <TableCell>Next Step</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opportunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={viewType === 'detail' ? 7 : 5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          No opportunities closing in this period.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    opportunities.map((opp) => (
                      <TableRow key={opp.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {opp.name}
                          </Typography>
                        </TableCell>
                        {viewType === 'detail' && (
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {opp.account?.name || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip 
                            label={opp.stage} 
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(opp.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={opp.forecast_category}
                            size="small"
                            color={
                              opp.forecast_category === 'commit'
                                ? 'success'
                                : opp.forecast_category === 'best_case'
                                  ? 'info'
                                  : 'default'
                            }
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {opp.expected_close_date 
                              ? format(new Date(opp.expected_close_date), 'MMM d')
                              : '-'
                            }
                          </Typography>
                        </TableCell>
                        {viewType === 'detail' && (
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              color={opp.next_step ? 'text.secondary' : 'error'}
                              sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {opp.next_step || 'No next step!'}
                            </Typography>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForecastPage;


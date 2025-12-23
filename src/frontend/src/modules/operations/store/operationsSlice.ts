import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OperationsState {
  jobs: any[];
  technicians: any[];
  routes: any[];
  selectedJob: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OperationsState = {
  jobs: [],
  technicians: [],
  routes: [],
  selectedJob: null,
  loading: false,
  error: null,
};

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<any[]>) => {
      state.jobs = action.payload;
    },
    setTechnicians: (state, action: PayloadAction<any[]>) => {
      state.technicians = action.payload;
    },
    setRoutes: (state, action: PayloadAction<any[]>) => {
      state.routes = action.payload;
    },
    setSelectedJob: (state, action: PayloadAction<any | null>) => {
      state.selectedJob = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setJobs, setTechnicians, setRoutes, setSelectedJob, setLoading, setError } = operationsSlice.actions;
export default operationsSlice.reducer;

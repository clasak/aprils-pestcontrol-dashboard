import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SalesState {
  leads: any[];
  quotes: any[];
  selectedLead: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  leads: [],
  quotes: [],
  selectedLead: null,
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setLeads: (state, action: PayloadAction<any[]>) => {
      state.leads = action.payload;
    },
    setQuotes: (state, action: PayloadAction<any[]>) => {
      state.quotes = action.payload;
    },
    setSelectedLead: (state, action: PayloadAction<any | null>) => {
      state.selectedLead = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLeads, setQuotes, setSelectedLead, setLoading, setError } = salesSlice.actions;
export default salesSlice.reducer;

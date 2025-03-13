import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  records: [],
  medications: [],
  documents: [],
  selectedRecord: null,
  loading: false,
  error: null,
};

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setRecords: (state, action) => {
      state.records = action.payload;
    },
    setMedications: (state, action) => {
      state.medications = action.payload;
    },
    setDocuments: (state, action) => {
      state.documents = action.payload;
    },
    setSelectedRecord: (state, action) => {
      state.selectedRecord = action.payload;
    },
    addRecord: (state, action) => {
      state.records.push(action.payload);
    },
    updateRecord: (state, action) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteRecord: (state, action) => {
      state.records = state.records.filter(record => record.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRecords,
  setMedications,
  setDocuments,
  setSelectedRecord,
  addRecord,
  updateRecord,
  deleteRecord,
  setLoading,
  setError
} = recordsSlice.actions;

export default recordsSlice.reducer;

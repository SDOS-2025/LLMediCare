import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MedicalRecord {
  id: string;
  type: string;
  date: string;
  doctor: string;
  description: string;
  fileUrl?: string;
  userId: string;
}

interface RecordsState {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: RecordsState = {
  records: [],
  loading: false,
  error: null,
};

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<MedicalRecord[]>) => {
      state.records = action.payload;
    },
    addRecord: (state, action: PayloadAction<MedicalRecord>) => {
      state.records.push(action.payload);
    },
    updateRecord: (state, action: PayloadAction<MedicalRecord>) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  setLoading,
  setError,
} = recordsSlice.actions;

export default recordsSlice.reducer;
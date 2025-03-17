import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the base API URL (adjust according to your backend)
const BASE_URL = 'http://127.0.0.1:8000/api/records/';

// Async thunk to fetch records from the backend
export const fetchRecords = createAsyncThunk('records/fetchRecords', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}list/`);
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const recordsSlice = createSlice({
  name: 'records',
  initialState: {
    records: [],
    documents: [],
    medications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.documents = action.payload.documents;
        state.medications = action.payload.medications;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recordsSlice.reducer;

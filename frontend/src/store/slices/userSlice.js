import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL
const API_BASE = 'http://localhost:8000/api/user';

// Async thunk to create a new user
export const createUser = createAsyncThunk('user/createUser', async (userData, { rejectWithValue }) => {
    try {
      console.log(userData);
      const response = await axios.post(`${API_BASE}/users/`, userData);
      console.log(response.data);
      return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error");
    }
});

// Async thunk to delete a user by email
export const deleteUser = createAsyncThunk('user/deleteUser', async (userEmail, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_BASE}/users/${userEmail}/`);
        return userEmail;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error");
    }
});

// Async thunk to fetch user details by email
export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (userEmail, { rejectWithValue }) => {
    try {
      console.log(userEmail);
      const response = await axios.get(`${API_BASE}/users/fetch-by-email/?email=${userEmail}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching user details");
    }
  }
);

// Async thunk to update user details by email (PATCH)
export const updateUserDetails = createAsyncThunk('user/updateUserDetails', async ( userData, { rejectWithValue }) => {
    try {
      console.log(userData);
      const response = await axios.patch(`${API_BASE}/users/${userData.email}/`, userData);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(createUser.fulfilled, (state, action) => { state.loading = false; state.currentUser = action.payload; })
            .addCase(createUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(deleteUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteUser.fulfilled, (state, action) => { state.loading = false; state.currentUser = null; })
            .addCase(deleteUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchUserDetails.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchUserDetails.fulfilled, (state, action) => { state.loading = false; state.currentUser = action.payload; })
            .addCase(fetchUserDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(updateUserDetails.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateUserDetails.fulfilled, (state, action) => { state.loading = false; state.currentUser = action.payload; })
            .addCase(updateUserDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export default userSlice.reducer;

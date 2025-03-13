import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";

// Thunks with integrated API calls
export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async () => {
  const { data } = await axios.get(`http://localhost:5000/api/users`);
  return data;
});

export const fetchUserById = createAsyncThunk('user/fetchUserById', async (email) => {
  const { data } = await axios.get(`http://localhost:5000/api/users/${email}`);
  return data;
});

export const createNewUser = createAsyncThunk('user/createUser', async (userData) => {
  await axios.post(`http://localhost:5000/api/users`, userData);
});

export const updateExistingUser = createAsyncThunk('user/updateUser', async ({ email, userData }) => {
  await axios.put(`http://localhost:5000/api/users/${email}`, userData);
  const { data } = await axios.get(`http://localhost:5000/api/users/${email}`)
  return data;
});

export const deleteUserById = createAsyncThunk('user/deleteUser', async (id) => {
  await axios.delete(`http://localhost:5000/api/users/${id}`);
  const { data } = await axios.get(`http://localhost:5000/api/users`)
  return data;
});

// Redux slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    selectedUser: []
  },
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(createNewUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(updateExistingUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.users = action.payload;
      })
  },
});

// Export the action for dynamic state updates
export const { setSelectedUser, setUsers } = userSlice.actions;
export default userSlice.reducer;
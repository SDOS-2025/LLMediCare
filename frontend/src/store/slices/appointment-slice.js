import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  availabilitySlots: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    setAvailabilitySlots: (state, action) => {
      state.availabilitySlots = action.payload;
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(
        appointment => appointment.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action) => {
      state.appointments = state.appointments.filter(
        appointment => appointment.id !== action.payload
      );
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
  setAppointments,
  setAvailabilitySlots,
  setSelectedAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  setLoading,
  setError
} = appointmentSlice.actions;

export default appointmentSlice.reducer;

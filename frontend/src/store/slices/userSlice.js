import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api-config"; // Import our improved API client
import { API_BASE_URL } from "../../utils/environment";

// Base API URL
const API_BASE = API_BASE_URL;

// Async thunk to create a new user
export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log(userData);
      const response = await api.post(`${API_BASE}/users/`, userData);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  }
);

// Async thunk to delete a user by email
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userEmail, { rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE}/api/user/users/${userEmail}/`);
      return userEmail;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  }
);

// Async thunk to fetch user details by email
export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (userEmail, { rejectWithValue }) => {
    try {
      console.log(userEmail);
      const response = await api.get(
        `${API_BASE}/api/user/users/fetch-by-email/?email=${userEmail}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching user details"
      );
    }
  }
);

// Async thunk to update user details by email (PATCH)
export const updateUserDetails = createAsyncThunk(
  "user/updateUserDetails",
  async (userData, { rejectWithValue }) => {
    try {
      console.log(userData);
      const response = await api.patch(
        `${API_BASE}/api/user/users/${userData.email}/`,
        userData
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  }
);

// NEW: Async thunk to fetch all doctors
export const fetchAllDoctors = createAsyncThunk(
  "user/fetchAllDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE}/api/user/users/doctors/list/`);
      console.log("Doctors:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching doctors");
    }
  }
);

// NEW: Async thunk for a doctor to upload a medical record for a patient
export const uploadMedicalRecord = createAsyncThunk(
  "user/uploadMedicalRecord",
  async ({ appointmentId, recordData, doctorEmail }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${API_BASE}/api/user/appointments/${appointmentId}/add_medical_record/?email=${doctorEmail}`,
        recordData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error uploading medical record"
      );
    }
  }
);

// NEW: Async thunk for a doctor to set medication for a patient
export const setMedication = createAsyncThunk(
  "user/setMedication",
  async (
    { appointmentId, medicationData, doctorEmail },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `${API_BASE}/api/user/appointments/${appointmentId}/add_medication/?email=${doctorEmail}`,
        medicationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error setting medication"
      );
    }
  }
);

// NEW: Async thunk for a doctor to upload a document for a patient
export const doctorUploadDocument = createAsyncThunk(
  "user/doctorUploadDocument",
  async ({ documentData, doctorEmail, patientEmail }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${API_BASE}/api/user/documents/doctor/upload/?doctor_email=${doctorEmail}&patient_email=${patientEmail}`,
        documentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error uploading document"
      );
    }
  }
);

export const userUploadDocument = createAsyncThunk(
  "user/userUploadDocument",
  async ({ documentData, patientEmail }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(
        `${API_BASE}/api/user/records/add_document/${patientEmail}/`,
        documentData
      );
      dispatch(fetchPatientRecords(patientEmail)); // Fetch updated records after upload
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error uploading document"
      );
    }
  }
);

// NEW: Async thunk to get a patient's medical records, documents, and medications
export const fetchPatientRecords = createAsyncThunk(
  "user/fetchPatientRecords",
  async (patientEmail, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `${API_BASE}/api/user/records/user/?email=${patientEmail}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching patient records"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    doctors: [],
    patientRecords: null,
    uploadedDocument: null,
    createdMedicalRecord: null,
    prescribedMedication: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUploadedDocument: (state) => {
      state.uploadedDocument = null;
    },
    clearCreatedMedicalRecord: (state) => {
      state.createdMedicalRecord = null;
    },
    clearPrescribedMedication: (state) => {
      state.prescribedMedication = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing reducers
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // New reducers
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(uploadMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadMedicalRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.createdMedicalRecord = action.payload;
      })
      .addCase(uploadMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(setMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.prescribedMedication = action.payload;
      })
      .addCase(setMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(doctorUploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(doctorUploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedDocument = action.payload;
      })
      .addCase(doctorUploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPatientRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.patientRecords = action.payload;
      })
      .addCase(fetchPatientRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearUploadedDocument,
  clearCreatedMedicalRecord,
  clearPrescribedMedication,
} = userSlice.actions;
export default userSlice.reducer;

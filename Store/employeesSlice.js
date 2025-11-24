// Store/employeesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Configuration
const API_CONFIG = {
  LOCAL_URL: 'http://localhost:8080/api/v1/auth/',
  HOSTED_URL: 'https://api.myapp.com/api/auth/', // Replace with your actual host URL
};

// Use local or hosted based on environment
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? API_CONFIG.LOCAL_URL 
  : API_CONFIG.HOSTED_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // or get from Redux state
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = response.status;
    err.response = data;
    throw err;
  }

  return data;
};

// Async Thunk: Fetch all employees
export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const data = await apiCall('allEmployees', { 
        method: 'GET',
        headers: headers
      });
      
      // Extract employees from various possible response structures
      const employees = data?.employees ?? data?.payload?.employees ?? data?.allEmployees ?? [];
      return Array.isArray(employees) ? employees : [];
    } catch (error) {
      const message = error?.response?.message || error.message || 'Failed to load employees';
      return rejectWithValue(message);
    }
  }
);

// Initial State
const initialState = {
  employees: [],
  loading: false,
  error: null,
  currentEmployee: 0,
};

// Slice
const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setCurrentEmployee: (state, action) => {
      state.currentEmployee = action.payload;
    },
    nextEmployee: (state) => {
      if (state.employees.length > 0) {
        state.currentEmployee = (state.currentEmployee + 1) % state.employees.length;
      }
    },
    prevEmployee: (state) => {
      if (state.employees.length > 0) {
        state.currentEmployee = state.currentEmployee === 0 
          ? state.employees.length - 1 
          : state.currentEmployee - 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setEmployees: (state, action) => {
      state.employees = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.currentEmployee = 0;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load employees';
      });
  },
});

// Export actions
export const { 
  setCurrentEmployee, 
  nextEmployee, 
  prevEmployee, 
  clearError,
  setEmployees,
  setLoading,
  setError
} = employeesSlice.actions;

// Export reducer
export default employeesSlice.reducer;
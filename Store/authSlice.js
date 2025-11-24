// Store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// API Configuration
const API_CONFIG = {
  LOCAL_URL: 'http://localhost:8080/api/v1/auth/',
  HOSTED_URL: 'https://api.myapp.com/api/auth/', // Replace with your actual host URL
};

// Use local or hosted based on environment
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? API_CONFIG.LOCAL_URL 
  : API_CONFIG.HOSTED_URL;

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
   // added to hold employees list
};

// ...existing code...
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setAuth: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // optional: update one employee in employees list
    updateEmployeeInList: (state, action) => {
      const updated = action.payload;
      if (!updated || !updated._id) return;
      state.employees = state.employees.map((e) => (e._id === updated._id ? updated : e));
      state.isLoading = false;
    },
  },
});

export const { setLoading, setAuth, setError, logout, updateUser, clearError, setEmployees, updateEmployeeInList } = authSlice.actions;
export default authSlice.reducer;

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
  // console.log(data);

  if (!response.ok) {
    // throw an Error object that carries the parsed response so callers can inspect errors/messages
    const err = new Error(data.message || 'Request failed');
    err.status = response.status;
    err.response = data;
    throw err;
  }

  return data;
};


// Helper to save auth data with Bearer_ prefix
const saveAuth = (user, token) => {
  try {
    const stored = token?.startsWith?.('Bearer_') ? token : `Bearer_ ${token}`;
    localStorage.setItem('token', stored);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.error('saveAuth error', e);
  }
};

// Helper to clear auth data
const clearAuth = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (e) {
    console.error('clearAuth error', e);
  }
};
// Helper function to get auth token
const getAuthTooken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    // console.log("Auth Token:", token);
    if (!token) return null;
    return token;
  }
  return null;
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthTooken();
  // console.log("Token in Headers:", token);
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    // console.log(token);
    
    headers['accesstoken'] = token;
  }
  
  return headers;
};
// console.log(getAuthHeaders());

// Thunk Actions


// Thunk: editUserByAdmin -> PUT /editUserByAdmin/:idofuser
export const editUserByAdmin = (userId, updateData = {}) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    if (!userId) throw new Error('userId is required');

    

    // Build payload with only the allowed fields
    const payload = {};
    if (updateData.job !== undefined) payload.job = updateData.job;
    if (updateData.rate !== undefined) payload.rate = updateData.rate;
    if (updateData.reviewsCount !== undefined) payload.reviewsCount = updateData.reviewsCount;
    if (updateData.role !== undefined) payload.role = updateData.role;

    const headers = { 'Content-Type': 'application/json',  "accesstoken": getAuthHeaders() };
    const safeId = encodeURIComponent(userId);

    const data = await apiCall(`editUserByAdmin/${safeId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    const updatedUser = data?.user ?? data?.payload?.user ?? null;
    if (updatedUser) {
      // update employees list if present
      dispatch(updateEmployeeInList(updatedUser));
      // if admin edited current user, update auth user too
      const stateUser = getState().auth.user;
      if (stateUser && stateUser._id === updatedUser._id) {
        dispatch(updateUser(updatedUser));
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch {}
      }
    }

    return { success: true, payload: data, message: data?.message };
  } catch (error) {
    const server = error?.response ?? {};
    const message = server?.message || error.message || 'Failed to update user';
    dispatch(setError(message));
    return { success: false, message, payload: server };
  } finally {
    dispatch(setLoading(false));
  }
};

// Login
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await apiCall('login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    saveAuth(data.user, data.token);
    dispatch(setAuth({ user: data.user, token: data.token }));
    return { success: true };
  } catch (error) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  }
};

// Register - Returns success without auto-login
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await apiCall('register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    dispatch(setLoading(false));
    // return a consistent shape for the caller (page.jsx)
    return { success: true, message: data.message || 'Registration successful', payload: data };
  } catch (error) {
    dispatch(setError(error.message || 'Registration failed'));
    // If server sent structured validation errors, include them
    const server = error?.response || {};
    const errors = server.errors || null;
    const message = server.message || error.message || 'Registration failed';
    return { success: false, message, errors, payload: server };
  }
};

// Restore session from localStorage (handle different token formats)
export const restoreSession = () => (dispatch) => {
  try {
    const tokenStr = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (tokenStr && userStr) {
      const user = JSON.parse(userStr);
      let cleanToken = tokenStr;
      if (tokenStr.startsWith('Bearer ')) cleanToken = tokenStr.split(' ')[1];
      else if (tokenStr.startsWith('Bearer_')) cleanToken = tokenStr.substring(7);
      dispatch(setAuth({ user, token: cleanToken }));
    }
  } catch (error) {
    console.error('Error restoring session:', error);
    clearAuth();
  }
};


// Logout (thunk) — ensures localStorage cleared, redux reset and full reload/navigation
export const logoutUser = (redirect = '/') => (dispatch) => {
  try {
    // console.log("tttttttt");
    
    clearAuth();
    dispatch(logout());
    // force a full reload to ensure any client-only state resets (optional)
    if (typeof window !== 'undefined') {
      // prefer redirect without hard reload when possible:
      window.location.href = redirect;
    }
  } catch (e) {
    console.error('logoutUser error', e);
  }
};
// Update profile
export const updateProfile = (updateData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { token } = getState().auth;

    const data = await apiCall('profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(updateData),
    });

    saveAuth(data.user, token);
    dispatch(updateUser(data.user));
    dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  }
};

// Verify token
export const verifyToken = () => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;

    if (!token) {
      dispatch(logoutUser());
      return { success: false };
    }

    const data = await apiCall('verify', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch(updateUser(data.user));
    return { success: true };
  } catch (error) {
    dispatch(logoutUser());
    return { success: false };
  }
};
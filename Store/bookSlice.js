// Store/bookSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/book';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token;
  }
  return null;
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['accesstoken'] = token;
  }
  
  return headers;
};

// 1. Create a booking
export const createBooking = createAsyncThunk(
  'book/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/createBooking`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Get all bookings (Admin only)
export const getAllBookings = createAsyncThunk(
  'book/getAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getAllBookings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch all bookings');
      }
      
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Update booking status to opened (Admin only)
export const updateBookingStatus = createAsyncThunk(
  'book/updateBookingStatus',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/updateBookingStatus/${bookingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update booking status');
      }
      
      const data = await response.json();
      return data.booking;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Delete booking
export const deleteBooking = createAsyncThunk(
  'book/deleteBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteBooking/${bookingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete booking');
      }
      
      const data = await response.json();
      return { bookingId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Get bookings by user email
export const getBookingsByEmail = createAsyncThunk(
  'book/getBookingsByEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/myBookings/${email}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user bookings');
      }
      
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 6. Get bookings by employee ID
export const getBookingsByEmployeeId = createAsyncThunk(
  'book/getBookingsByEmployeeId',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employeeBookings/${employeeId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch employee bookings');
      }
      
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 7. Update booking
export const updateBooking = createAsyncThunk(
  'book/updateBooking',
  async ({ bookingId, bookingData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/updateBooking/${bookingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update booking');
      }
      
      const data = await response.json();
      return data.booking;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bookSlice = createSlice({
  name: 'book',
  initialState: {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearBookingState: (state) => {
      state.currentBooking = null;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentBooking = action.payload.booking || action.payload;
        state.bookings.unshift(action.payload.booking || action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to create booking';
        state.success = false;
      })
      
      // 2. Get All Bookings (Admin)
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch all bookings';
      })
      
      // 3. Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update the booking in the array
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to update booking status';
      })
      
      // 4. Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Remove the booking from the array
        state.bookings = state.bookings.filter(b => b._id !== action.payload.bookingId);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to delete booking';
      })
      
      // 5. Get Bookings by Email
      .addCase(getBookingsByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingsByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getBookingsByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch user bookings';
      })
      
      // 6. Get Bookings by Employee ID
      .addCase(getBookingsByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingsByEmployeeId.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getBookingsByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch employee bookings';
      })
      
      // 7. Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update the booking in the array
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.currentBooking = action.payload;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to update booking';
        state.success = false;
      });
  },
});

export const { clearBookingState, clearError, clearSuccess } = bookSlice.actions;
export default bookSlice.reducer;
// Store/sliderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL - automatically detects local or production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/photo';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token;
  }
  return null;
};

// Helper function to get headers with auth token (for JSON)
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

// Helper function to get headers for FormData (no Content-Type)
const getAuthHeadersForFormData = () => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['accesstoken'] = token;
  }
  
  return headers;
};

// Async thunks for API calls
export const fetchSliders = createAsyncThunk(
  'slider/fetchSliders',
  async (category = 'mainSlider', { rejectWithValue }) => {
    try {
      const url = new URL(`${API_BASE_URL}/getPhotoByCategory`);
      url.searchParams.set('category', category);

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to fetch sliders');

      const data = await response.json();
      return data.photos || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addSlider = createAsyncThunk(
  'slider/addSlider',
  async ({ sliderData, imageFile ,category = 'mainSlider' }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', sliderData.title || '');
      formData.append('description', sliderData.description || '');
      formData.append('category', 'mainSlider');
      
      // Add optional fields
      if (sliderData.titleAr) formData.append('titleAr', sliderData.titleAr);
      if (sliderData.descriptionAr) formData.append('descriptionAr', sliderData.descriptionAr);
      if (sliderData.badge) formData.append('badge', sliderData.badge);
      if (sliderData.buttonText) formData.append('buttonText', sliderData.buttonText);
      if (sliderData.buttonTextAr) formData.append('buttonTextAr', sliderData.buttonTextAr);
      if (sliderData.secondaryButtonText) formData.append('secondaryButtonText', sliderData.secondaryButtonText);
      if (sliderData.secondaryButtonTextAr) formData.append('secondaryButtonTextAr', sliderData.secondaryButtonTextAr);
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add slider');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSlider = createAsyncThunk(
  'slider/updateSlider',
  async ({ id, sliderData, imageFile }, { rejectWithValue, getState }) => {
    // Store the previous state for rollback
    const previousSliders = getState().slider.sliders;
    const previousSlider = previousSliders.find(s => s._id === id || s.id === id);
    
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', sliderData.title || '');
      formData.append('description', sliderData.description || '');
      formData.append('category', 'mainSlider');
      
      // Add optional fields
      if (sliderData.titleAr) formData.append('titleAr', sliderData.titleAr);
      if (sliderData.descriptionAr) formData.append('descriptionAr', sliderData.descriptionAr);
      if (sliderData.badge) formData.append('badge', sliderData.badge);
      if (sliderData.buttonText) formData.append('buttonText', sliderData.buttonText);
      if (sliderData.buttonTextAr) formData.append('buttonTextAr', sliderData.buttonTextAr);
      if (sliderData.secondaryButtonText) formData.append('secondaryButtonText', sliderData.secondaryButtonText);
      if (sliderData.secondaryButtonTextAr) formData.append('secondaryButtonTextAr', sliderData.secondaryButtonTextAr);
      
      // Add new image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: getAuthHeadersForFormData(),
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update slider');
      }
      
      const data = await response.json();
      
      // Return both the updated data and previous slider for potential rollback
      return {
        updatedSlider: data.photo || data,
        previousSlider
      };
    } catch (error) {
      // Return the previous slider data for rollback
      return rejectWithValue({
        message: error.message,
        previousSlider
      });
    }
  }
);

export const deleteSlider = createAsyncThunk(
  'slider/deleteSlider',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete slider');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sliderSlice = createSlice({
  name: 'slider',
  initialState: {
    sliders: [],
    loading: false,
    error: null,
    currentSlide: 0,
  },
  reducers: {
    setCurrentSlide: (state, action) => {
      state.currentSlide = action.payload;
    },
    nextSlide: (state) => {
      state.currentSlide = (state.currentSlide + 1) % state.sliders.length;
    },
    prevSlide: (state) => {
      state.currentSlide = 
        (state.currentSlide - 1 + state.sliders.length) % state.sliders.length;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSliders
      .addCase(fetchSliders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSliders.fulfilled, (state, action) => {
        state.loading = false;
        state.sliders = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchSliders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to load sliders';
      })

      // addSlider
      .addCase(addSlider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSlider.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.photo) {
          state.sliders.unshift(action.payload.photo);
        } else if (action.payload) {
          state.sliders.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(addSlider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to add slider';
      })

      // updateSlider - with rollback on failure
      .addCase(updateSlider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSlider.fulfilled, (state, action) => {
        state.loading = false;
        const { updatedSlider } = action.payload;
        
        if (updatedSlider && updatedSlider._id) {
          const idx = state.sliders.findIndex(s => s._id === updatedSlider._id || s.id === updatedSlider._id);
          if (idx !== -1) {
            // Successfully update the slider
            state.sliders[idx] = updatedSlider;
          }
        }
        state.error = null;
      })
      .addCase(updateSlider.rejected, (state, action) => {
        state.loading = false;
        
        // Rollback: restore the previous slider state
        if (action.payload && action.payload.previousSlider) {
          const previousSlider = action.payload.previousSlider;
          const idx = state.sliders.findIndex(
            s => s._id === previousSlider._id || s.id === previousSlider._id
          );
          
          if (idx !== -1) {
            // Restore the old data
            state.sliders[idx] = previousSlider;
          }
        }
        
        state.error = action.payload?.message || action.error?.message || 'Failed to update slider';
      })

      // deleteSlider
      .addCase(deleteSlider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSlider.fulfilled, (state, action) => {
        state.loading = false;
        state.sliders = state.sliders.filter(s => s._id !== action.payload && s.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSlider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to delete slider';
      });
  },
});

export const { setCurrentSlide, nextSlide, prevSlide } = sliderSlice.actions;
export default sliderSlice.reducer;
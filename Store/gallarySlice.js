// Store/gallarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL - automatically detects local or production
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/api/v1/photo'
  : 'https://api.example.com/api/v1/photo';

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
const getAuthHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers = {};
  
  // Only add Content-Type for JSON requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['accesstoken'] = token;
  }
  
  return headers;
};

// Async thunks for API calls
export const getAllPhotos = createAsyncThunk(
  'gallery/getAllPhotos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getAllphoto`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch photos');

      const data = await response.json();
      // Normalize common shapes
      const photos = Array.isArray(data)
        ? data
        : data?.photos ?? data?.payload?.photos ?? data?.allPhoto ?? data?.results ?? [];
      
      return Array.isArray(photos) ? photos : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPhotosByCategory = createAsyncThunk(
  'gallery/getPhotosByCategory',
  async (category, { rejectWithValue }) => {
    try {
      if (!category) throw new Error('category name is required');

      const url = new URL(`${API_BASE_URL}/getPhotoByCategory`);
      url.searchParams.set('category', category);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch photos by category');

      const data = await response.json();
      const photos = Array.isArray(data?.photos) 
        ? data.photos 
        : data?.payload?.photos ?? [];
      
      return {
        photos: Array.isArray(photos) ? photos : [],
        category,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPhoto = createAsyncThunk(
  'gallery/createPhoto',
  async (photoData, { rejectWithValue }) => {
    try {
      // Check if photoData is FormData
      const isFormData = photoData instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? photoData : JSON.stringify(photoData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create photo');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePhoto = createAsyncThunk(
  'gallery/updatePhoto',
  async ({ id, photoData }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('photoId is required');

      // Check if photoData is FormData
      const isFormData = photoData instanceof FormData;

      const response = await fetch(`${API_BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? photoData : JSON.stringify(photoData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update photo');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'gallery/deletePhoto',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('photoId is required');

      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete photo');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gallerySlice = createSlice({
  name: 'gallary',
  initialState: {
    photos: [],
    isLoading: false,
    loading: false,
    error: null,
    message: null,
    lastCategory: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllPhotos
      .addCase(getAllPhotos.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.photos = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllPhotos.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to load photos';
      })

      // getPhotosByCategory
      .addCase(getPhotosByCategory.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPhotosByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.photos = action.payload.photos;
        state.lastCategory = action.payload.category;
      })
      .addCase(getPhotosByCategory.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to load photos by category';
      })

      // createPhoto
      .addCase(createPhoto.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        const photo = action.payload?.photo || action.payload;
        if (photo) {
          state.photos.unshift(photo);
        }
        state.message = action.payload?.message || 'Photo created successfully';
      })
      .addCase(createPhoto.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to create photo';
      })

      // updatePhoto
      .addCase(updatePhoto.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        const updated = action.payload?.photo || action.payload;
        if (updated && updated._id) {
          const idx = state.photos.findIndex(p => p._id === updated._id);
          if (idx !== -1) state.photos[idx] = updated;
        }
        state.message = action.payload?.message || 'Photo updated successfully';
      })
      .addCase(updatePhoto.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to update photo';
      })

      // deletePhoto
      .addCase(deletePhoto.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.photos = state.photos.filter(p => p._id !== action.payload);
        state.message = 'Photo deleted successfully';
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to delete photo';
      });
  },
});

export const { clearError, clearMessage } = gallerySlice.actions;
export default gallerySlice.reducer;
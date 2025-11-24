// Store/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/services';

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

// 1. Get all categories
export const getAllCategories = createAsyncThunk(
  'category/getAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/all`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch categories');
      }
      
      const data = await response.json();
      return data.serviceCategories || data.payload || data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Create category
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      let body;
      let headers;
      
      // Check if categoryData is FormData
      if (categoryData instanceof FormData) {
        body = categoryData;
        headers = getAuthHeadersForFormData();
      } else {
        body = JSON.stringify(categoryData);
        headers = getAuthHeaders();
      }
      
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create category');
      }
      
      const data = await response.json();
      return data.category || data.payload?.category || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Update category
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }
      
      let body;
      let headers;
      
      // Check if categoryData is FormData
      if (categoryData instanceof FormData) {
        body = categoryData;
        headers = getAuthHeadersForFormData();
      } else {
        body = JSON.stringify(categoryData);
        headers = getAuthHeaders();
      }
      
      const response = await fetch(`${API_BASE_URL}/update/${categoryId}`, {
        method: 'PUT',
        headers: headers,
        body: body,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update category');
      }
      
      const data = await response.json();
      return data.category || data.payload?.category || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Delete category
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    console.log(categoryId);
    
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/delete/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete category');
      }
      
      const data = await response.json();
      return { categoryId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    currentCategory: null,
    loading: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearCategoryState: (state) => {
      state.currentCategory = null;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Categories
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch categories';
      })
      
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentCategory = action.payload;
        state.categories.unshift(action.payload);
        state.message = 'Category created successfully';
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to create category';
        state.success = false;
      })
      
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentCategory = action.payload;
        // Update the category in the array
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.message = 'Category updated successfully';
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to update category';
        state.success = false;
      })
      
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Remove the category from the array
        state.categories = state.categories.filter(c => c._id !== action.payload.categoryId);
        state.message = 'Category deleted successfully';
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to delete category';
        state.success = false;
      });
  },
});

export const { clearCategoryState, clearError, clearSuccess, clearMessage } = categorySlice.actions;
export default categorySlice.reducer;
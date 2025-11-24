// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import authReducer from './authSlice';
import sliderReducer from './sliderSlice';
import categoryReducer from './categorySlice';
import gallaryReducer from './gallarySlice'
import employeesReducer from './employeesSlice';
import bookReducer from './bookSlice';
export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    auth: authReducer,
    slider:sliderReducer,
    category: categoryReducer,
    gallary:gallaryReducer,
    employees: employeesReducer,
    book:bookReducer,
  },
});

export default store;
// app/admin/category/page.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  clearCategoryState,
  clearError,
  clearSuccess 
} from '../../../../Store/categorySlice';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';

export default function CategoriesAdminPage() {
  const dispatch = useDispatch();
  const { categories, loading, error, success, message } = useSelector((state) => state.category);
  const { language = 'en', mode = 'light' } = useSelector((state) => state.settings || {});
  
  const isDark = mode === 'dark';
  const isRTL = language === 'ar';
  
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load categories on mount
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.title || category.name || '',
        description: category.description || '',
        image: null,
      });
      setImagePreview(category.image?.secure_url || category.image || null);
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: null });
      setImagePreview(null);
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: null });
    setImagePreview(null);
    setFormErrors({});
    dispatch(clearCategoryState());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('title', formData.name); // API expects 'title' field
      data.append('description', formData.description);
      
      // Only append image if a new one was selected
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingCategory) {
        // Update existing category
        await dispatch(updateCategory({ 
          categoryId: editingCategory._id, 
          categoryData: data 
        })).unwrap();
      } else {
        // Create new category
        await dispatch(createCategory(data)).unwrap();
      }

      // Close modal on success
      closeModal();
      // Refresh categories list
      dispatch(getAllCategories());
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        dispatch(getAllCategories());
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    }
  };

  return (
    <div 
      className={`min-h-screen py-12 px-4 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-pink-600/20' : 'bg-pink-400/20'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
        }`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/20'
        }`} style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-5xl md:text-7xl font-black mb-4 animate-fade-in ${
            isDark 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
          }`}>
            {isRTL ? 'إدارة الفئات' : 'Category Management'}
          </h1>
          <p className={`text-xl md:text-2xl font-medium mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {isRTL ? 'إدارة فئات الخدمات الخاصة بك' : 'Manage your service categories'}
          </p>
          <button
            onClick={() => openModal()}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة فئة' : 'Add Category'}
          </button>
        </div>

        {/* Success Message */}
        {success && message && (
          <div className={`mb-6 border-2 rounded-2xl p-4 flex items-center gap-3 animate-fade-in ${
            isDark 
              ? 'bg-green-900/40 border-green-600 shadow-green-900/50' 
              : 'bg-green-50 border-green-400'
          }`}>
            <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
              isDark ? 'text-green-300' : 'text-green-600'
            }`} />
            <p className={isDark ? 'text-green-200' : 'text-green-800'}>{message}</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className={`mb-6 border-2 rounded-2xl p-4 flex items-center gap-3 animate-shake ${
            isDark 
              ? 'bg-red-900/40 border-red-600 shadow-red-900/50' 
              : 'bg-red-50 border-red-400'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`} />
            <p className={isDark ? 'text-red-200' : 'text-red-800'}>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !showModal && (
          <div className="text-center py-20">
            <Loader2 className={`w-16 h-16 animate-spin mx-auto mb-4 ${
              isDark ? 'text-purple-400' : 'text-pink-600'
            }`} />
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className={`backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border-2 ${
            isDark 
              ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
              : 'bg-white/90 border-pink-100 shadow-purple-200/50'
          }`}>
            <div className="text-8xl mb-6">📁</div>
            <h3 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {isRTL ? 'لا توجد فئات بعد' : 'No Categories Yet'}
            </h3>
            <p className={`text-lg mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {isRTL ? 'ابدأ بإنشاء فئتك الأولى' : 'Get started by creating your first category'}
            </p>
            <button
              onClick={() => openModal()}
              className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
              {isRTL ? 'إنشاء فئة' : 'Create Category'}
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className={`backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 ${
                  isDark 
                    ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
                    : 'bg-white border-pink-100 shadow-purple-200/50'
                }`}
              >
                <div className="relative h-48 bg-gradient-to-br from-pink-500 to-purple-600">
                  {category.image?.secure_url || category.image ? (
                    <img 
                      src={category.image?.secure_url || category.image} 
                      alt={category.title || category.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {category.title || category.name}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {category.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(category)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                        isDark 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isRTL ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}">
                <h2 className={`text-2xl font-black ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {editingCategory 
                    ? (isRTL ? 'تعديل الفئة' : 'Edit Category') 
                    : (isRTL ? 'إنشاء فئة' : 'Create Category')}
                </h2>
                <button
                  onClick={closeModal}
                  className={`text-2xl ${
                    isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {isRTL ? 'اسم الفئة *' : 'Category Name *'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      formErrors.name 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={isRTL ? 'أدخل اسم الفئة' : 'Enter category name'}
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {isRTL ? 'الوصف' : 'Description'}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={isRTL ? 'أدخل وصف الفئة' : 'Enter category description'}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {isRTL ? 'صورة الفئة' : 'Category Image'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`flex-1 px-6 py-3 font-bold rounded-xl transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      isDark 
                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                      </span>
                    ) : editingCategory ? (
                      isRTL ? 'تحديث' : 'Update'
                    ) : (
                      isRTL ? 'إنشاء' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
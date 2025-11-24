"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllPhotos, 
  createPhoto, 
  updatePhoto, 
  deletePhoto,
  clearError,
  clearMessage 
} from '../../../../Store/gallarySlice';
import { getAllCategories } from '../../../../Store/categorySlice';
import { Camera, Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const dispatch = useDispatch();
  
  // Redux state with fallback values
  const galleryState = useSelector(state => state.gallary) || {};
  const { 
    photos = [], 
    loading = false, 
    error = null, 
    message = null 
  } = galleryState;
  
  // Get categories from Redux store
  const categoryState = useSelector(state => state.category) || {};
  const { 
    categories = [], 
    isLoading: categoriesLoading 
  } = categoryState;
  
  // Get settings from Redux store (language and mode)
  const settingsState = useSelector((state) => state.settings) || {};
  const language = settingsState.language || 'en';
  const mode = settingsState.mode || 'light';
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    tags: ''
  });

  // Translations
  const translations = {
    en: {
      title: 'Photo Gallery Management',
      subtitle: 'Manage your photo collection',
      addPhoto: 'Add Photo',
      editPhoto: 'Edit Photo',
      delete: 'Delete',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save',
      photoTitle: 'Photo Title',
      description: 'Description',
      category: 'Category',
      selectCategory: 'Select Category',
      imageUpload: 'Upload Image',
      chooseFile: 'Choose File',
      changeImage: 'Change Image',
      tags: 'Tags (comma separated)',
      noPhotos: 'No photos available',
      loading: 'Loading...',
      confirmDelete: 'Are you sure you want to delete this photo?',
      dragDrop: 'Drag and drop an image here, or click to select',
      totalPhotos: 'Total Photos'
    },
    ar: {
      title: 'إدارة معرض الصور',
      subtitle: 'إدارة مجموعة الصور الخاصة بك',
      addPhoto: 'إضافة صورة',
      editPhoto: 'تعديل الصورة',
      delete: 'حذف',
      edit: 'تعديل',
      cancel: 'إلغاء',
      save: 'حفظ',
      photoTitle: 'عنوان الصورة',
      description: 'الوصف',
      category: 'الفئة',
      selectCategory: 'اختر الفئة',
      imageUpload: 'تحميل الصورة',
      chooseFile: 'اختر ملف',
      changeImage: 'تغيير الصورة',
      tags: 'الوسوم (مفصولة بفواصل)',
      noPhotos: 'لا توجد صور متاحة',
      loading: 'جاري التحميل...',
      confirmDelete: 'هل أنت متأكد من حذف هذه الصورة؟',
      dragDrop: 'اسحب وأفلت صورة هنا، أو انقر للاختيار',
      totalPhotos: 'إجمالي الصور'
    }
  };

  const t = translations[language] || translations.en;
  const isRTL = language === 'ar';
  const isDark = mode === 'dark';

  // Load photos and categories on mount
  useEffect(() => {
    dispatch(getAllPhotos());
    dispatch(getAllCategories());
  }, [dispatch]);

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => dispatch(clearMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (photo = null) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title || '',
        description: photo.description || '',
        category: photo.category || '',
        imageUrl: photo.imageUrl || photo.url || '',
        tags: Array.isArray(photo.tags) ? photo.tags.join(', ') : ''
      });
      setImagePreview(photo.imageUrl || photo.url || photo.image?.secure_url || null);
    } else {
      setEditingPhoto(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        imageUrl: '',
        tags: ''
      });
      setImagePreview(null);
    }
    setUploadedFile(null);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPhoto(null);
    setImagePreview(null);
    setUploadedFile(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      tags: ''
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const photoData = new FormData();
    photoData.append('title', formData.title);
    photoData.append('description', formData.description);
    photoData.append('category', formData.category);
    
    // If a new file was uploaded, use it; otherwise use the existing URL
    if (uploadedFile) {
      photoData.append('image', uploadedFile);
    } else if (formData.imageUrl) {
      photoData.append('imageUrl', formData.imageUrl);
    }
    
    // Handle tags
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    tagsArray.forEach(tag => photoData.append('tags[]', tag));

    if (editingPhoto) {
      await dispatch(updatePhoto({ id: editingPhoto._id, photoData }));
    } else {
      await dispatch(createPhoto(photoData));
    }
    
    handleCloseModal();
  };

  // Delete photo
  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await dispatch(deletePhoto(id));
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Camera className={`w-12 h-12 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <h1 className={`text-5xl md:text-7xl font-black animate-fade-in transition-all duration-300 ${
              isDark 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' 
                : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
            }`}>
              {t.title}
            </h1>
          </div>
          <p className={`text-xl md:text-2xl font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t.subtitle}
          </p>
        </div>

        {/* Add Photo Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleOpenModal()}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white' 
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
            }`}
          >
            <Plus className="w-6 h-6" />
            {t.addPhoto}
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className={`mb-8 backdrop-blur-xl rounded-2xl p-4 shadow-xl animate-fade-in ${
            isDark ? 'bg-green-900/40 border-2 border-green-600' : 'bg-green-50 border-2 border-green-400'
          }`}>
            <p className={`text-center font-bold ${
              isDark ? 'text-green-300' : 'text-green-700'
            }`}>
              {message}
            </p>
          </div>
        )}
        
        {error && (
          <div className={`mb-8 backdrop-blur-xl rounded-2xl p-4 shadow-xl animate-fade-in ${
            isDark ? 'bg-red-900/40 border-2 border-red-600' : 'bg-red-50 border-2 border-red-400'
          }`}>
            <p className={`text-center font-bold ${
              isDark ? 'text-red-300' : 'text-red-700'
            }`}>
              {error}
            </p>
          </div>
        )}

        {/* Stats Card */}
        <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-8 border-2 transition-all ${
          isDark 
            ? 'bg-slate-800/90 border-pink-700/30 hover:border-pink-600/50 shadow-pink-900/30' 
            : 'bg-white border-pink-100 hover:border-pink-300 shadow-pink-200/50'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isDark 
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-900/50' 
                : 'bg-gradient-to-br from-pink-400 to-purple-500'
            }`}>
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-500'
              }`}>{t.totalPhotos}</p>
              <p className={`text-3xl font-black ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{photos.length}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className={`inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mb-4 ${
              isDark ? 'border-purple-400' : 'border-pink-600'
            }`}></div>
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>{t.loading}</p>
          </div>
        ) : photos.length === 0 ? (
          <div className={`backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border-2 ${
            isDark 
              ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
              : 'bg-white border-pink-100 shadow-purple-200/50'
          }`}>
            <div className="text-8xl mb-6">📸</div>
            <h3 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t.noPhotos}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map(photo => (
              <div 
                key={photo._id} 
                className={`backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 ${
                  isDark 
                    ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50 hover:shadow-purple-700/50' 
                    : 'bg-white border-pink-100 shadow-purple-200/50 hover:shadow-purple-400/50'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={photo.image?.secure_url || photo.imageUrl || photo.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {photo.category && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {photo.category}
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {photo.title}
                  </h3>
                  <p className={`text-sm mb-3 line-clamp-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {photo.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(photo)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isDark 
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isDark 
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white' 
                          : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 ${
            isDark 
              ? 'bg-slate-800/95 border-purple-700/50' 
              : 'bg-white/95 border-pink-200'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b-2 ${
              isDark ? 'border-purple-700/50' : 'border-pink-200'
            }`}>
              <h2 className={`text-2xl font-black ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {editingPhoto ? t.editPhoto : t.addPhoto}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-xl transition-all hover:scale-110 ${
                  isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-6 h-6 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className={`block font-bold mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {t.imageUpload} *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:scale-105 ${
                    isDark 
                      ? 'border-purple-600 bg-slate-700/50 hover:bg-slate-700' 
                      : 'border-pink-400 bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-xl shadow-lg"
                      />
                      <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all hover:scale-105 shadow-lg ${
                        isDark 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                      }`}>
                        <Upload className="w-5 h-5" />
                        {t.changeImage}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <ImageIcon className={`w-16 h-16 mx-auto mb-4 ${
                        isDark ? 'text-purple-400' : 'text-pink-500'
                      }`} />
                      <p className={`text-lg font-bold mb-2 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t.dragDrop}
                      </p>
                      <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 ${
                        isDark 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                      }`}>
                        <Upload className="w-5 h-5" />
                        {t.chooseFile}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className={`block font-bold mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {t.photoTitle} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className={`block font-bold mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {t.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows="3"
                />
              </div>
              
              {/* Category */}
              <div>
                <label className={`block font-bold mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {t.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  disabled={categoriesLoading}
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat.title}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tags */}
              <div>
                <label className={`block font-bold mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {t.tags}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="nature, landscape, sunset"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-gray-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg ${
                    isDark 
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                  }`}
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
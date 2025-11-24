// app/admin/sliders/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSliders,
  addSlider,
  updateSlider,
  deleteSlider,
} from '../../../../Store/sliderSlice';
import Image from 'next/image';
import { translationsSlider } from '../../../../lib/translations';

export default function SliderManagement() {
  const dispatch = useDispatch();
  const { sliders, loading, error } = useSelector((state) => state.slider);
  const { language, mode } = useSelector((state) => state.settings);
  const isDark = mode === "dark";
  const isRTL = language === "ar";
  const t = translationsSlider[language] || translationsSlider.en;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    badge: '',
    buttonText: '',
    buttonTextAr: '',
    secondaryButtonText: '',
    secondaryButtonTextAr: '',
  });

  useEffect(() => {
    dispatch(fetchSliders('mainSlider'));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlider) {
        // Update existing slider
        const updateData = {
          id: editingSlider._id || editingSlider.id,
          sliderData: {
            title: formData.title,
            titleAr: formData.titleAr,
            description: formData.description,
            descriptionAr: formData.descriptionAr,
            badge: formData.badge || '',
            buttonText: formData.buttonText || '',
            buttonTextAr: formData.buttonTextAr || '',
            secondaryButtonText: formData.secondaryButtonText || '',
            secondaryButtonTextAr: formData.secondaryButtonTextAr || '',
          },
          imageFile: imageFile
        };
        
        await dispatch(updateSlider(updateData)).unwrap();
        alert(t.sliderUpdated || 'Slider updated successfully!');
      } else {
        // Add new slider
        const addData = {
          sliderData: {
            title: formData.title,
            titleAr: formData.titleAr,
            description: formData.description,
            descriptionAr: formData.descriptionAr,
            badge: formData.badge || '',
            buttonText: formData.buttonText || '',
            buttonTextAr: formData.buttonTextAr || '',
            secondaryButtonText: formData.secondaryButtonText || '',
            secondaryButtonTextAr: formData.secondaryButtonTextAr || '',
          },
          imageFile: imageFile
        };
        
        await dispatch(addSlider(addData)).unwrap();
        alert(t.sliderAdded || 'Slider added successfully!');
      }
      
      resetForm();
      setIsModalOpen(false);
      // Refresh sliders
      dispatch(fetchSliders('mainSlider'));
    } catch (error) {
      console.error('Failed to save slider:', error);
      alert(`${t.saveError || 'Error'}: ${error}`);
    }
  };

  const handleEdit = (slider) => {
    console.log('Editing slider:', slider);
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      titleAr: slider.titleAr || '',
      description: slider.description || '',
      descriptionAr: slider.descriptionAr || '',
      badge: slider.badge || '',
      buttonText: slider.buttonText || '',
      buttonTextAr: slider.buttonTextAr || '',
      secondaryButtonText: slider.secondaryButtonText || '',
      secondaryButtonTextAr: slider.secondaryButtonTextAr || '',
    });
    setImagePreview(slider.image?.secure_url || null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t.deleteConfirm || 'Are you sure you want to delete this slider?')) {
      try {
        await dispatch(deleteSlider(id)).unwrap();
        alert(t.sliderDeleted || 'Slider deleted successfully!');
        dispatch(fetchSliders('mainSlider'));
      } catch (error) {
        console.error('Failed to delete slider:', error);
        alert(`${t.deleteError || 'Error'}: ${error}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      badge: '',
      buttonText: '',
      buttonTextAr: '',
      secondaryButtonText: '',
      secondaryButtonTextAr: '',
    });
    setEditingSlider(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const getSliderId = (slider) => slider._id || slider.id;

  return (
    <div 
      className={`min-h-screen py-8 px-4 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 ${
          isDark ? 'bg-slate-800/90 shadow-purple-900/50' : 'bg-white/90 shadow-purple-200/50'
        }`}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className={`text-4xl font-black mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {t.pageTitle || 'Slider Management'}
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t.pageDescription || 'Manage your homepage sliders'}
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className={`px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {t.addNewSlider || '+ Add New Slider'}
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${
              isDark ? 'border-purple-400' : 'border-purple-600'
            }`}></div>
          </div>
        )}

        {error && (
          <div className={`rounded-xl p-6 mb-8 ${
            isDark ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-semibold ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sliders.length === 0 && (
          <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center ${
            isDark ? 'bg-slate-800/90 shadow-purple-900/50' : 'bg-white/90 shadow-purple-200/50'
          }`}>
            <div className="text-6xl mb-4">📸</div>
            <h3 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t.noSliders || 'No Sliders Yet'}
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t.startAdding || 'Start by adding your first slider'}
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className={`px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {t.addFirstSlider || 'Add Your First Slider'}
            </button>
          </div>
        )}

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider) => (
            <div
              key={getSliderId(slider)}
              className={`backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
                isDark 
                  ? 'bg-slate-800/90 shadow-purple-900/50 hover:shadow-purple-700/50' 
                  : 'bg-white/90 shadow-purple-200/50 hover:shadow-purple-400/50'
              }`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                {slider.image?.secure_url ? (
                  <Image
                    src={slider.image.secure_url}
                    alt={slider.title || 'Slider image'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {slider.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    {slider.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {isRTL ? slider.titleAr || slider.title : slider.title}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isRTL
                    ? slider.descriptionAr || slider.description
                    : slider.description}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(slider)}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    {t.edit || 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(getSliderId(slider))}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    {t.delete || 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-3xl font-black ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {editingSlider ? (t.editSlider || 'Edit Slider') : (t.addSliderTitle || 'Add New Slider')}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className={`text-2xl ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.titleEN || 'Title (English)'} *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        required
                      />
                    </div>

                    {/* Title Arabic */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.titleAR || 'Title (Arabic)'} *
                      </label>
                      <input
                        type="text"
                        name="titleAr"
                        value={formData.titleAr}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.descriptionEN || 'Description (English)'} *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        required
                      />
                    </div>

                    {/* Description Arabic */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.descriptionAR || 'Description (Arabic)'} *
                      </label>
                      <textarea
                        name="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        required
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.imageUpload || 'Slider Image'} {!editingSlider && '*'}
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className={`px-4 py-3 border-2 border-dashed rounded-xl text-center transition-colors ${
                            isDark 
                              ? 'border-slate-600 hover:border-purple-500 bg-slate-700' 
                              : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                          }`}>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {imageFile ? imageFile.name : (t.chooseFile || 'Choose Image File')}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            required={!editingSlider}
                          />
                        </label>
                      </div>
                      {imagePreview && (
                        <div className="mt-4 relative h-48 rounded-xl overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.badge || 'Badge'} (Optional)
                      </label>
                      <input
                        type="text"
                        name="badge"
                        value={formData.badge}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., NEW, HOT, SALE"
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.buttonTextEN || 'Button Text (English)'}
                      </label>
                      <input
                        type="text"
                        name="buttonText"
                        value={formData.buttonText}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Button Text Arabic */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.buttonTextAR || 'Button Text (Arabic)'}
                      </label>
                      <input
                        type="text"
                        name="buttonTextAr"
                        value={formData.buttonTextAr}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Secondary Button Text */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.secondaryButtonEN || 'Secondary Button (English)'}
                      </label>
                      <input
                        type="text"
                        name="secondaryButtonText"
                        value={formData.secondaryButtonText}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Secondary Button Text Arabic */}
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t.secondaryButtonAR || 'Secondary Button (Arabic)'}
                      </label>
                      <input
                        type="text"
                        name="secondaryButtonTextAr"
                        value={formData.secondaryButtonTextAr}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
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
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t.saving || 'Saving...'}
                        </span>
                      ) : editingSlider ? (
                        t.saveChanges || 'Save Changes'
                      ) : (
                        t.addSlider || 'Add Slider'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className={`px-6 py-3 font-bold rounded-xl transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {t.cancel || 'Cancel'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
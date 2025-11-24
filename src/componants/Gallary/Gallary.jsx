"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Grid, List, AlertCircle, Package, Search } from 'lucide-react';
import { getAllPhotos, getPhotosByCategory } from '../../../Store/gallarySlice';
import { translationsGallery } from '../../../lib/translations';

// Translation object


const ImageGallery = () => {
  const dispatch = useDispatch();

  // Redux state (use settings for language & mode from Navbar)
  const { photos, isLoading, error } = useSelector((state) => state.gallary || {});
  const { language = 'en', mode = 'light' } = useSelector((state) => state.settings || {});

  // Local state
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const t = translationsGallery[language] || translationsGallery.en;
  const isRTL = language === 'ar';
  const isDark = mode === 'dark';

  // Initial load - get all photos
  useEffect(() => {
    dispatch(getAllPhotos());
  }, [dispatch]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      dispatch(getAllPhotos());
    } else {
      dispatch(getPhotosByCategory(category));
    }
  };

  // Filter photos by search query
  useEffect(() => {
    if (!photos) {
      setFilteredPhotos([]);
      return;
    }

    let filtered = Array.isArray(photos) ? photos : [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(photo =>
        (photo.title || '').toString().toLowerCase().includes(q) ||
        (photo.description || '').toString().toLowerCase().includes(q) ||
        (photo.category || '').toString().toLowerCase().includes(q)
      );
    }

    setFilteredPhotos(filtered);
  }, [searchQuery, photos]);

  // Get unique categories from photos
  const categories = ['all', ...new Set(
    (Array.isArray(photos) ? photos.map(p => p.category).filter(Boolean) : [])
  )];

  // Retry loading photos
  const handleRetry = () => {
    if (selectedCategory === 'all') {
      dispatch(getAllPhotos());
    } else {
      dispatch(getPhotosByCategory(selectedCategory));
    }
  };

  const getImageSrc = (photo) =>
    photo?.image?.secure_url ?? photo?.imageUrl ?? photo?.url ?? photo?.image ?? 'https://via.placeholder.com/800x600?text=No+Image';

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
          <h1 className={`text-5xl md:text-7xl font-black mb-4 animate-fade-in transition-all duration-300 ${
            isDark 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
          }`}>
            {t.title}
          </h1>
          <p className={`text-xl md:text-2xl font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t.subtitle}
          </p>
        </div>

        {/* Search and View Controls */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 ${
          isDark ? 'bg-slate-800/90 shadow-purple-900/50' : 'bg-white/90 shadow-purple-200/50'
        }`}>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 relative w-full">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid'
                    ? isDark 
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : isDark 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={t.viewGrid}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list'
                    ? isDark 
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : isDark 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={t.viewList}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                disabled={isLoading}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-bold shadow-lg ${
                  selectedCategory === cat
                    ? isDark 
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-pink-900/50' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : isDark 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border-2 border-slate-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {cat === 'all' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        </div>

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
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-500'
              }`}>{t.totalPhotos}</p>
              <p className={`text-3xl font-black ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{filteredPhotos.length}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-8 border-2 rounded-2xl p-6 animate-shake shadow-lg ${
            isDark 
              ? 'bg-red-900/40 border-red-600 shadow-red-900/50' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className={`w-6 h-6 ${
                  isDark ? 'text-red-300' : 'text-red-600'
                }`} />
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${
                    isDark ? 'text-red-300' : 'text-red-700'
                  }`}>
                    {t.errorTitle}
                  </h3>
                  <p className={isDark ? 'text-red-200' : 'text-red-600'}>
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className={`px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                }`}
              >
                {t.retry}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className={`inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mb-4 ${
              isDark ? 'border-purple-400' : 'border-pink-600'
            }`}></div>
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>{t.loading}</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          /* Empty State */
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
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {searchQuery ? 'Try adjusting your search terms' : 'No photos have been added yet'}
            </p>
          </div>
        ) : (
          /* Photo Grid/List */
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-6'
          }>
            {filteredPhotos.map(photo => (
              <div
                key={photo._id || photo.id}
                className={`backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 ${
                  isDark 
                    ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50 hover:shadow-purple-700/50' 
                    : 'bg-white border-pink-100 shadow-purple-200/50 hover:shadow-purple-400/50'
                } ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}
              >
                <div className={`relative overflow-hidden ${
                  viewMode === 'grid' ? 'h-64' : 'w-64 h-64'
                }`}>
                  <img
                    src={getImageSrc(photo)}
                    alt={photo.title || 'Photo'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {photo.category && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {photo.category}
                    </span>
                  )}
                </div>
                
                <div className="p-6 flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {photo.title || 'Untitled'}
                  </h3>
                  {photo.description && (
                    <p className={`text-sm mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {photo.description}
                    </p>
                  )}
                  {photo.createdAt && (
                    <p className={`text-xs flex items-center gap-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Camera className="w-4 h-4" />
                      {new Date(photo.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ImageGallery;
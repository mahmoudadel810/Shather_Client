"use client"

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { getAllCategories } from '../../../Store/categorySlice';
import Link from 'next/link';

export default function Categories() {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector((state) => state.category);
  const { mode, language } = useSelector((state) => state.settings);
  const isDark = mode === 'dark';
  const isRTL = language === 'ar';

  // Translation object
  const translations = {
    en: {
      loading: 'Loading categories...',
      errorTitle: 'Error Loading Categories',
      pageTitle: 'Our Categories',
      pageSubtitle: 'Explore our wide range of services',
      noCategories: 'No Categories Available',
      checkBack: 'Check back later for updates',
      noDescription: 'No description available',
    },
    ar: {
      loading: 'جاري تحميل الفئات...',
      errorTitle: 'خطأ في تحميل الفئات',
      pageTitle: 'فئاتنا',
      pageSubtitle: 'استكشف مجموعتنا الواسعة من الخدمات',
      noCategories: 'لا توجد فئات متاحة',
      checkBack: 'تحقق لاحقاً للحصول على التحديثات',
      noDescription: 'لا يوجد وصف متاح',
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            isDark ? 'text-cyan-400' : 'text-blue-600'
          }`} />
          <p className={`text-lg font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <div className={`border rounded-xl p-6 max-w-md shadow-xl ${
          isDark 
            ? 'bg-red-900/20 border-red-700 shadow-red-900/50' 
            : 'bg-red-50 border-red-200 shadow-red-300/50'
        }`}>
          <h2 className={`font-semibold text-lg mb-2 ${
            isDark ? 'text-red-400' : 'text-red-800'
          }`}>
            {t.errorTitle}
          </h2>
          <p className={isDark ? 'text-red-300' : 'text-red-600'}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 transition-all duration-300 ${
            isDark 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
          }`}>
            {t.pageTitle}
          </h1>
          <p className={`text-lg md:text-xl transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t.pageSubtitle}
          </p>
        </div>

        {/* Empty State */}
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <div className={`mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-300'
            }`}>
              <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t.noCategories}
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t.checkBack}
            </p>
          </div>
        ) : (
          // Categories Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category._id}
                className={`rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 ${
                  isDark 
                    ? 'bg-slate-800/90 shadow-purple-900/50 hover:shadow-purple-700/50' 
                    : 'bg-white shadow-purple-200/50 hover:shadow-purple-400/50'
                }`}
              >
                {/* Category Image */}
                <div className={`relative h-48 overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600' 
                    : 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400'
                }`}>
                  {category.image ? (
                    <img
                      src={category.image?.secure_url}
                      alt={isRTL ? category.titleAr || category.title : category.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 line-clamp-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {isRTL ? category.titleAr || category.title : category.title}
                  </h3>
                  <p className={`leading-relaxed transition-colors duration-300 line-clamp-3 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {isRTL 
                      ? category.descriptionAr || category.description || t.noDescription
                      : category.description || t.noDescription
                    }
                  </p>
                  
                  {/* Optional: Add a "View More" button */}
                  <Link href="/gallery" className={`mt-4 block text-center  px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  }`}>
                    {isRTL ? 'عرض المزيد' : 'View More'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
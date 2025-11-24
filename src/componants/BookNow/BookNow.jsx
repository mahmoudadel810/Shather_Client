// app/bookNow/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, clearBookingState, getBookingsByEmail, updateBookingStatus, updateBooking, deleteBooking } from '../../../Store/bookSlice.js';
import { getAllCategories } from '../../../Store/categorySlice';
import { bookTranslations } from '../../../lib/translations.js';
import { Loader2, Sparkles, Clock, Award, Calendar, Mail, Phone, User, MessageSquare, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';

export default function BookNowFormat() {
  const dispatch = useDispatch();
  const { language, mode } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading, error, success } = useSelector((state) => state.book);
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.category);
  
  const t = bookTranslations[language] || bookTranslations.en;
  const isRTL = language === 'ar';
  const isDark = mode === 'dark';
  // console.log(isDark);
  

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    employeeName: '',
    services: [],
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [showBookings, setShowBookings] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Fetch user bookings if logged in
  useEffect(() => {
    if (user?.email) {
      dispatch(getBookingsByEmail(user.email));
    }
  }, [dispatch, user]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Handle success
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearBookingState());
        if (!editingBookingId) {
          resetForm();
        } else {
          setEditingBookingId(null);
        }
        // Refresh bookings
        if (user?.email) {
          dispatch(getBookingsByEmail(user.email));
        }
      }, 3000);
    }
  }, [success, dispatch, editingBookingId, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.email.trim()) newErrors.email = t.required;
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = t.invalidEmail;
    if (!formData.phone.trim()) newErrors.phone = t.required;
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = t.invalidPhone;
    if (!formData.date) newErrors.date = t.required;
    else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.date = t.invalidDate;
    }
    if (!formData.time) newErrors.time = t.required;
    else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.time)) newErrors.time = t.invalidTime;
    if (!formData.employeeName.trim()) newErrors.employeeName = t.required;
    if (formData.services.length === 0) newErrors.services = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingBookingId) {
        await dispatch(updateBooking({
          bookingId: editingBookingId,
          bookingData: formData
        })).unwrap();
      } else {
        await dispatch(createBooking(formData)).unwrap();
      }
    } catch (err) {
      console.error('Booking operation failed:', err);
    }
  };

  const handleEditBooking = (booking) => {
    const serviceIds = categories
      .filter(cat => booking.services.includes(cat.title))
      .map(cat => cat._id);

    setFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date.split('T')[0],
      time: booking.time,
      employeeName: booking.employeeId?.name || '',
      services: serviceIds,
      message: booking.message || '',
    });
    setEditingBookingId(booking._id);
    setShowBookings(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await dispatch(deleteBooking(bookingId)).unwrap();
        if (user?.email) {
          dispatch(getBookingsByEmail(user.email));
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      date: '',
      time: '',
      employeeName: '',
      services: [],
      message: '',
    });
    setErrors({});
    setEditingBookingId(null);
  };

  const today = new Date().toISOString().split('T')[0];

  if (categoriesLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50'
      }`}>
        <div className="text-center">
          <Loader2 className={`w-16 h-16 animate-spin mx-auto mb-4 ${
            isDark ? 'text-purple-400' : 'text-pink-600'
          }`} />
          <p className={`text-lg font-semibold ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Loading beauty services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-purple-600/30' : 'bg-pink-400/20'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-indigo-600/30' : 'bg-purple-400/20'
        }`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-pink-600/30' : 'bg-indigo-400/20'
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
            {t.pageTitle || 'Beauty Salon Booking'} 
          </h1>
          <p className={`text-xl md:text-2xl font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t.pageSubtitle || 'Transform Your Look, Book Your Glow!'} 🌸
          </p>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className={`rounded-3xl p-10 shadow-2xl max-w-md w-full text-center transform animate-scale-in border-4 ${
              isDark 
                ? 'bg-slate-800 border-purple-600' 
                : 'bg-white border-pink-400'
            }`}>
              <div className="text-7xl mb-4 animate-bounce">✨</div>
              <h2 className={`text-4xl font-black mb-3 ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600'
              }`}>
                {editingBookingId ? 'Booking Updated!' : (t.successTitle || 'Booking Confirmed!')}
              </h2>
              <p className={`text-lg mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {editingBookingId ? 'Your booking has been updated successfully!' : (t.successMessage || 'Your beauty appointment is confirmed!')}
              </p>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Get ready to shine! ✨
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className={`mb-8 border-2 rounded-2xl p-6 animate-shake shadow-lg ${
            isDark 
              ? 'bg-red-900/30 border-red-600' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">😞</span>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${
                  isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {t.errorTitle || 'Oops! Something went wrong'}
                </h3>
                <p className={isDark ? 'text-red-300' : 'text-red-600'}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle View Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowBookings(false)}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              !showBookings
                ? isDark 
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-xl shadow-purple-900/50 scale-105' 
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xl shadow-purple-400/50 scale-105'
                : isDark 
                  ? 'bg-slate-800 text-gray-300 hover:shadow-lg hover:shadow-purple-900/30' 
                  : 'bg-white text-gray-700 hover:shadow-lg hover:shadow-purple-200/50'
            }`}
          >
            📝 {editingBookingId ? 'Update Booking' : 'New Booking'}
          </button>
          <button
            onClick={() => setShowBookings(true)}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              showBookings
                ? isDark 
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-xl shadow-purple-900/50 scale-105' 
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xl shadow-purple-400/50 scale-105'
                : isDark 
                  ? 'bg-slate-800 text-gray-300 hover:shadow-lg hover:shadow-purple-900/30' 
                  : 'bg-white text-gray-700 hover:shadow-lg hover:shadow-purple-200/50'
            }`}
          >
            📋 My Bookings {bookings.length > 0 && `(${bookings.length})`}
          </button>
        </div>

        {!showBookings ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {[
                { 
                  lucideIcon: <Sparkles className="w-8 h-8" />,
                  title: t.quickBooking || 'Quick Booking', 
                  desc: t.quickBookingDesc || 'Book your beauty appointment in seconds!', 
                  color: 'from-pink-500 via-rose-500 to-red-500',
                  darkColor: 'from-pink-600 via-rose-600 to-red-600'
                },
                { 
                  lucideIcon: <Award className="w-8 h-8" />,
                  title: t.professionalService || 'Expert Stylists', 
                  desc: t.professionalServiceDesc || 'Professional beauty experts at your service', 
                  color: 'from-purple-500 via-violet-500 to-indigo-500',
                  darkColor: 'from-purple-600 via-violet-600 to-indigo-600'
                },
                { 
                  lucideIcon: <Clock className="w-8 h-8" />,
                  title: t.guaranteedSatisfaction || 'Premium Experience', 
                  desc: t.guaranteedSatisfactionDesc || '100% satisfaction guaranteed with luxury treatments', 
                  color: 'from-indigo-500 via-blue-500 to-cyan-500',
                  darkColor: 'from-indigo-600 via-blue-600 to-cyan-600'
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 ${
                    isDark 
                      ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50 hover:shadow-purple-700/50' 
                      : 'bg-white/95 border-pink-100 shadow-purple-200/50 hover:shadow-purple-400/50'
                  }`}
                >
                  <div className={`text-5xl mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br ${isDark ? item.darkColor : item.color} flex items-center justify-center shadow-xl text-white`}>
                    {item.lucideIcon}
                  </div>
                  <h3 className={`text-2xl font-black mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 ${
                isDark 
                  ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
                  : 'bg-white/95 border-pink-100 shadow-purple-200/50'
              }`}>
                <h2 className={`text-4xl font-black mb-8 flex items-center gap-3 ${
                  isDark 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600'
                }`}>
                  <Calendar className={`w-10 h-10 ${
                    isDark ? 'text-purple-400' : 'text-pink-600'
                  }`} />
                  {editingBookingId ? '✏️ Update Your Appointment' : (t.bookingDetails || 'Book Your Appointment')}
                </h2>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <User className="w-4 h-4" />
                      {t.name || 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t.namePlaceholder || "Enter your name"}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.name 
                          ? 'border-red-500' 
                          : isDark 
                            ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white placeholder-gray-500' 
                            : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    {errors.name && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.name}</p>}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Mail className="w-4 h-4" />
                        {t.email || 'Email'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t.emailPlaceholder || "your@email.com"}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                          errors.email 
                            ? 'border-red-500' 
                            : isDark 
                              ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white placeholder-gray-500' 
                              : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      {errors.email && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.email}</p>}
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Phone className="w-4 h-4" />
                        {t.phone || 'Phone'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t.phonePlaceholder || "+123 456 7890"}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                          errors.phone 
                            ? 'border-red-500' 
                            : isDark 
                              ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white placeholder-gray-500' 
                              : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      {errors.phone && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.phone}</p>}
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Calendar className="w-4 h-4" />
                        {t.date || 'Appointment Date'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={today}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                          errors.date 
                            ? 'border-red-500' 
                            : isDark 
                              ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white' 
                              : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900'
                        }`}
                      />
                      {errors.date && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.date}</p>}
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Clock className="w-4 h-4" />
                        {t.time || 'Time'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        placeholder={t.timePlaceholder || "Select time"}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                          errors.time 
                            ? 'border-red-500' 
                            : isDark 
                              ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white' 
                              : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900'
                        }`}
                      />
                      {errors.time && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.time}</p>}
                    </div>
                  </div>

                  {/* Employee Name */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Award className="w-4 h-4" />
                      {t.employeeName || 'Preferred Stylist'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleInputChange}
                      placeholder={t.employeeNamePlaceholder || "Choose your favorite stylist"}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.employeeName 
                          ? 'border-red-500' 
                          : isDark 
                            ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white placeholder-gray-500' 
                            : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    {errors.employeeName && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.employeeName}</p>}
                  </div>

                  {/* Services Selection */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Sparkles className="w-4 h-4" />
                      {t.servicesTitle || 'Select Beauty Services'} <span className="text-red-500">*</span>
                    </label>
                    {categories.length === 0 ? (
                      <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
                        isDark 
                          ? 'bg-slate-700/50 border-purple-800' 
                          : 'bg-pink-50/50 border-pink-300'
                      }`}>
                        <p className={`text-lg ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          💅 No beauty services available
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map((category) => (
                          <button
                            key={category._id}
                            type="button"
                            onClick={() => handleServiceToggle(category._id)}
                            className={`group p-5 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                              formData.services.includes(category._id)
                                ? isDark 
                                  ? 'bg-gradient-to-br from-cyan-600 via-purple-600 to-pink-600 border-transparent text-white shadow-2xl shadow-purple-900/50 scale-105' 
                                  : 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 border-transparent text-white shadow-2xl shadow-purple-400/50 scale-105'
                                : isDark 
                                  ? 'bg-slate-700/50 border-purple-800 text-gray-300 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-900/30' 
                                  : 'bg-pink-50/50 border-pink-200 text-gray-700 hover:border-pink-400 hover:shadow-lg hover:shadow-purple-200/50'
                            }`}
                          >
                            {category.image ? (
                              <img
                                src={category.image.secure_url}
                                alt={category.title}
                                className="w-16 h-16 mx-auto mb-3 rounded-xl object-cover shadow-lg"
                              />
                            ) : (
                              <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-3xl shadow-lg ${
                                isDark 
                                  ? 'bg-gradient-to-br from-cyan-600 via-purple-600 to-pink-600' 
                                  : 'bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400'
                              }`}>
                                💄
                              </div>
                            )}
                            <div className="text-sm font-bold">{category.title}</div>
                            {formData.services.includes(category._id) && (
                              <div className="mt-2 text-2xl">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.services && <p className={`text-sm mt-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️ {errors.services}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <MessageSquare className="w-4 h-4" />
                      {t.message || 'Special Requests'}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t.messagePlaceholder || "Any special requests or preferences? ✨"}
                      rows="4"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 resize-none ${
                        isDark 
                          ? 'bg-slate-700/50 border-purple-800 focus:ring-purple-400 text-white placeholder-gray-500' 
                          : 'bg-pink-50/50 border-pink-200 focus:ring-pink-500 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 px-8 py-5 font-black text-lg rounded-2xl shadow-2xl transform hover:scale-105 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3 ${
                        loading 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : isDark 
                            ? 'bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-purple-900/50 hover:shadow-purple-700/50' 
                            : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-purple-400/50 hover:shadow-pink-500/50'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {editingBookingId ? 'Updating...' : (t.loadingMessage || 'Booking...')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          <span>{editingBookingId ? '✏️ Update Appointment' : (t.submitBooking || 'Book My Appointment')}</span>
                          <span>✨</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={loading}
                      className={`px-8 py-5 font-bold rounded-2xl transition-all duration-300 shadow-lg ${
                        loading 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : isDark 
                            ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {t.clearForm || 'Clear'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* My Bookings View */
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-4xl font-black mb-8 text-center ${
              isDark 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600'
            }`}>
              📋 My Beauty Appointments
            </h2>

            {loading ? (
              <div className="text-center py-20">
                <Loader2 className={`w-16 h-16 animate-spin mx-auto mb-4 ${
                  isDark ? 'text-purple-400' : 'text-pink-600'
                }`} />
                <p className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Loading your bookings...
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div className={`backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border-2 ${
                isDark 
                  ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
                  : 'bg-white/95 border-pink-100 shadow-purple-200/50'
              }`}>
                <div className="text-8xl mb-6">📅</div>
                <h3 className={`text-3xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  No Bookings Yet
                </h3>
                <p className={`text-lg mb-8 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Start your beauty journey by booking your first appointment!
                </p>
                <button
                  onClick={() => setShowBookings(false)}
                  className={`px-8 py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-purple-900/50' 
                      : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-purple-400/50'
                  }`}
                >
                  ✨ Book Now
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${
                      isDark 
                        ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50 hover:shadow-purple-700/50' 
                        : 'bg-white/95 border-pink-100 shadow-purple-200/50 hover:shadow-purple-400/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Booking Info */}
                      <div className="flex-1 space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center gap-3 mb-4">
                          {booking.isOpened ? (
                            <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                              isDark 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              <CheckCircle className="w-4 h-4" />
                              Confirmed
                            </span>
                          ) : (
                            <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                              isDark 
                                ? 'bg-yellow-900/30 text-yellow-400' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              <Clock className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                          <span className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            ID: {booking._id.slice(-8)}
                          </span>
                        </div>

                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <User className={`w-5 h-5 ${
                              isDark ? 'text-purple-400' : 'text-pink-600'
                            }`} />
                            <div>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>Name</p>
                              <p className={`font-bold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{booking.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Mail className={`w-5 h-5 ${
                              isDark ? 'text-purple-400' : 'text-pink-600'
                            }`} />
                            <div>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>Email</p>
                              <p className={`font-bold text-sm ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{booking.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Phone className={`w-5 h-5 ${
                              isDark ? 'text-purple-400' : 'text-pink-600'
                            }`} />
                            <div>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>Phone</p>
                              <p className={`font-bold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{booking.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Award className={`w-5 h-5 ${
                              isDark ? 'text-purple-400' : 'text-pink-600'
                            }`} />
                            <div>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>Stylist</p>
                              <p className={`font-bold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {booking.employeeId?.name || 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                            isDark 
                              ? 'bg-pink-900/20' 
                              : 'bg-pink-50'
                          }`}>
                            <Calendar className={`w-5 h-5 ${
                              isDark ? 'text-pink-400' : 'text-pink-600'
                            }`} />
                            <span className={`font-bold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                            isDark 
                              ? 'bg-purple-900/20' 
                              : 'bg-purple-50'
                          }`}>
                            <Clock className={`w-5 h-5 ${
                              isDark ? 'text-purple-400' : 'text-purple-600'
                            }`} />
                            <span className={`font-bold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{booking.time}</span>
                          </div>
                        </div>

                        {/* Services */}
                        <div>
                          <p className={`text-sm font-bold mb-2 flex items-center gap-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Sparkles className="w-4 h-4" />
                            Services:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {booking.services.map((service, idx) => (
                              <span
                                key={idx}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isDark 
                                    ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30 text-pink-300' 
                                    : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                                }`}
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Message */}
                        {booking.message && (
                          <div className="pt-2">
                            <p className={`text-sm font-bold mb-1 flex items-center gap-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <MessageSquare className="w-4 h-4" />
                              Special Request:
                            </p>
                            <p className={`text-sm p-3 rounded-xl ${
                              isDark 
                                ? 'text-gray-400 bg-slate-700/50' 
                                : 'text-gray-600 bg-gray-50'
                            }`}>
                              {booking.message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex lg:flex-col gap-3 justify-end">
                        <button
                          onClick={() => handleEditBooking(booking)}
                          disabled={loading}
                          className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 ${
                            loading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : isDark 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Edit className="w-5 h-5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          disabled={loading}
                          className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 ${
                            loading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : isDark 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
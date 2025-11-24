// app/employeeBookings/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBookingsByEmployeeId, updateBookingStatus, deleteBooking, clearBookingState } from '../../../Store/bookSlice.js';
import { Loader2, Clock, Award, Calendar, Mail, Phone, User, MessageSquare, CheckCircle, XCircle, Trash2, Bell, Package } from 'lucide-react';
import { translationsEmployeeBookings as translations } from '../../../lib/translations.js';

export default function EmployeeBookings() {
  const dispatch = useDispatch();
  const { language, mode } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading, error, success } = useSelector((state) => state.book);
  
  const isDark = mode === 'dark';

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const t = translations[language] || translations.en;

  // Fetch employee bookings on mount
  useEffect(() => {
    if (user?._id) {
      dispatch(getBookingsByEmployeeId(user._id));
    }
  }, [dispatch, user]);

  // Handle success
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearBookingState());
        if (user?._id) {
          dispatch(getBookingsByEmployeeId(user._id));
        }
      }, 2000);
    }
  }, [success, dispatch, user]);

  // Filter bookings based on isOpened status
  const pendingBookings = bookings.filter(booking => !booking.isOpened);
  const confirmedBookings = bookings.filter(booking => booking.isOpened);

  const handleAcceptBooking = async (bookingId) => {
    try {
      await dispatch(updateBookingStatus(bookingId)).unwrap();
      setSuccessMessage(t.bookingAccepted);
    } catch (err) {
      console.error('Accept booking failed:', err);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (window.confirm(t.confirmReject)) {
      try {
        await dispatch(deleteBooking(bookingId)).unwrap();
        setSuccessMessage(t.bookingRejected);
        if (user?._id) {
          dispatch(getBookingsByEmployeeId(user._id));
        }
      } catch (err) {
        console.error('Reject booking failed:', err);
      }
    }
  };

  const BookingCard = ({ booking, isPending }) => (
    <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${
      isDark 
        ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50 hover:shadow-purple-700/50' 
        : 'bg-white border-pink-100 shadow-purple-200/50 hover:shadow-purple-400/50'
    }`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Booking Info */}
        <div className="flex-1 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-4">
            {booking.isOpened ? (
              <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ${
                isDark 
                  ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-green-100 shadow-green-900/50' 
                  : 'bg-green-100 text-green-700'
              }`}>
                <CheckCircle className="w-4 h-4" />
                {t.confirmed}
              </span>
            ) : (
              <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse shadow-lg ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-700 to-orange-700 text-yellow-100 shadow-yellow-900/50' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <Bell className="w-4 h-4" />
                {t.newBooking}
              </span>
            )}
            <span className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-500'
            }`}>
              {t.id}: {booking._id.slice(-8)}
            </span>
          </div>

          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              isDark 
                ? 'bg-gradient-to-r from-pink-900/20 to-purple-900/20' 
                : 'bg-gradient-to-r from-pink-50 to-purple-50'
            }`}>
              <User className={`w-5 h-5 ${
                isDark ? 'text-pink-400' : 'text-pink-600'
              }`} />
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>{t.customerName}</p>
                <p className={`font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{booking.name}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              isDark 
                ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20' 
                : 'bg-gradient-to-r from-blue-50 to-cyan-50'
            }`}>
              <Mail className={`w-5 h-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>{t.email}</p>
                <p className={`font-bold text-sm break-all ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{booking.email}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              isDark 
                ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50'
            }`}>
              <Phone className={`w-5 h-5 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>{t.phone}</p>
                <p className={`font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{booking.phone}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              isDark 
                ? 'bg-gradient-to-r from-purple-900/20 to-indigo-900/20' 
                : 'bg-gradient-to-r from-purple-50 to-indigo-50'
            }`}>
              <Award className={`w-5 h-5 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>{t.assignedTo}</p>
                <p className={`font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {booking.employeeId?.name || t.you}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md ${
              isDark 
                ? 'bg-gradient-to-r from-pink-800 to-rose-800 shadow-pink-900/50' 
                : 'bg-gradient-to-r from-pink-100 to-rose-100'
            }`}>
              <Calendar className={`w-5 h-5 ${
                isDark ? 'text-pink-200' : 'text-pink-600'
              }`} />
              <span className={`font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {new Date(booking.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md ${
              isDark 
                ? 'bg-gradient-to-r from-purple-800 to-indigo-800 shadow-purple-900/50' 
                : 'bg-gradient-to-r from-purple-100 to-indigo-100'
            }`}>
              <Clock className={`w-5 h-5 ${
                isDark ? 'text-purple-200' : 'text-purple-600'
              }`} />
              <span className={`font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{booking.time}</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className={`text-sm font-bold mb-2 flex items-center gap-2 ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              <Package className="w-4 h-4" />
              {t.requestedServices}:
            </p>
            <div className="flex flex-wrap gap-2">
              {booking.services.map((service, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md ${
                    isDark 
                      ? 'bg-gradient-to-r from-pink-700 to-purple-700 text-pink-100 shadow-pink-900/50' 
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
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <MessageSquare className="w-4 h-4" />
                {t.specialRequest}:
              </p>
              <p className={`text-sm p-3 rounded-xl border ${
                isDark 
                  ? 'text-gray-300 bg-gradient-to-r from-slate-700/70 to-slate-800/70 border-slate-600' 
                  : 'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
              }`}>
                {booking.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex lg:flex-col gap-3 justify-end">
          {isPending ? (
            <>
              <button
                onClick={() => handleAcceptBooking(booking._id)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : isDark 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-900/50' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{t.accept}</span>
              </button>

              <button
                onClick={() => handleRejectBooking(booking._id)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : isDark 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-900/50' 
                      : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{t.reject}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRejectBooking(booking._id)}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : isDark 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-900/50' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">{t.remove}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!user || user.role !== 'employee') {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50'
      }`}>
        <div className={`text-center rounded-3xl p-12 shadow-2xl max-w-md border-2 ${
          isDark 
            ? 'bg-slate-800 border-red-700/50 shadow-red-900/50' 
            : 'bg-white border-red-200'
        }`}>
          <XCircle className={`w-20 h-20 mx-auto mb-4 ${
            isDark ? 'text-red-400' : 'text-red-500'
          }`} />
          <h2 className={`text-3xl font-black mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {t.accessDenied}
          </h2>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {t.accessDeniedDesc}
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
                {t.successTitle}
              </h2>
              <p className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className={`mb-8 border-2 rounded-2xl p-6 animate-shake shadow-lg ${
            isDark 
              ? 'bg-red-900/40 border-red-600 shadow-red-900/50' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">😞</span>
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
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 transition-all ${
            isDark 
              ? 'bg-slate-800/90 border-yellow-700/30 hover:border-yellow-600/50 shadow-yellow-900/30' 
              : 'bg-white border-yellow-100 hover:border-yellow-300 shadow-yellow-200/50'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                isDark 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-900/50' 
                  : 'bg-gradient-to-br from-yellow-400 to-orange-500'
              }`}>
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>{t.pending}</p>
                <p className={`text-3xl font-black ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{pendingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 transition-all ${
            isDark 
              ? 'bg-slate-800/90 border-green-700/30 hover:border-green-600/50 shadow-green-900/30' 
              : 'bg-white border-green-100 hover:border-green-300 shadow-green-200/50'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                isDark 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-900/50' 
                  : 'bg-gradient-to-br from-green-400 to-emerald-500'
              }`}>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>{t.confirmed}</p>
                <p className={`text-3xl font-black ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{confirmedBookings.length}</p>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 transition-all ${
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
                }`}>{t.total}</p>
                <p className={`text-3xl font-black ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'pending'
                ? isDark 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-xl shadow-yellow-900/50 scale-105' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl scale-105'
                : isDark 
                  ? 'bg-slate-800 text-gray-300 hover:shadow-lg border-2 border-slate-700' 
                  : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'
            }`}
          >
            <Bell className="w-5 h-5" />
            {t.pendingRequests} ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'confirmed'
                ? isDark 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl shadow-green-900/50 scale-105' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl scale-105'
                : isDark 
                  ? 'bg-slate-800 text-gray-300 hover:shadow-lg border-2 border-slate-700' 
                  : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {t.confirmedBookings} ({confirmedBookings.length})
          </button>
        </div>

        {/* Bookings Content */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className={`w-16 h-16 animate-spin mx-auto mb-4 ${
              isDark ? 'text-purple-400' : 'text-pink-600'
            }`} />
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>{t.loadingBookings}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'pending' ? (
              pendingBookings.length === 0 ? (
                <div className={`backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border-2 ${
                  isDark 
                    ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
                    : 'bg-white border-pink-100 shadow-purple-200/50'
                }`}>
                  <div className="text-8xl mb-6">🔭</div>
                  <h3 className={`text-3xl font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.noPendingRequests}
                  </h3>
                  <p className={`text-lg ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {t.noPendingDesc}
                  </p>
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} isPending={true} />
                ))
              )
            ) : (
              confirmedBookings.length === 0 ? (
                <div className={`backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border-2 ${
                  isDark 
                    ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
                    : 'bg-white border-pink-100 shadow-purple-200/50'
                }`}>
                  <div className="text-8xl mb-6">📋</div>
                  <h3 className={`text-3xl font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.noConfirmedBookings}
                  </h3>
                  <p className={`text-lg ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {t.noConfirmedDesc}
                  </p>
                </div>
              ) : (
                confirmedBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} isPending={false} />
                ))
              )
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
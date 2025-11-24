'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEmployees, 
  nextEmployee, 
  prevEmployee, 
  setCurrentEmployee,
  clearError 
} from '../../../Store/employeesSlice.js';
import { ChevronLeft, ChevronRight, User, MapPin, Briefcase, Calendar, Star, Mail } from 'lucide-react';
import { translationsEmployeeSlider }  from '../../../lib/translations.js';

// Translation object


export default function EmployeesSlider() {
  
  const dispatch = useDispatch();
  const { employees, loading, error, currentEmployee } = useSelector(state => state.employees);
  const { language, mode } = useSelector(state => state.settings);
  
  const t = translationsEmployeeSlider[language] || translationsEmployeeSlider.en;
  const isDark = mode === 'dark';
  const isRTL = language === 'ar';

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handlePrevious = () => {
    dispatch(prevEmployee());
  };

  const handleNext = () => {
    dispatch(nextEmployee());
  };

  const handleDotClick = (index) => {
    dispatch(setCurrentEmployee(index));
  };

  // Render star rating
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${isDark ? 'border-purple-400' : 'border-indigo-600'}`}></div>
          <p className={`mt-4 text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 to-red-900' : 'bg-gradient-to-br from-red-50 to-pink-50'} flex items-center justify-center p-4`}>
        <div className={`${isDark ? 'bg-slate-800 border-red-900' : 'bg-white border-red-200'} rounded-2xl shadow-2xl p-8 max-w-md w-full border-2`}>
          <div className={`flex items-center justify-center w-16 h-16 ${isDark ? 'bg-red-900' : 'bg-red-100'} rounded-full mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            {t.error}
          </h3>
          <p className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => dispatch(fetchEmployees())}
            className={`w-full ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105`}
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} flex items-center justify-center p-4`}>
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}>
          <div className={`flex items-center justify-center w-20 h-20 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-full mx-auto mb-4`}>
            <User className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            {t.noEmployees}
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.noEmployeesDesc}
          </p>
          <button
            onClick={() => dispatch(fetchEmployees())}
            className={`${isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105`}
          >
            {t.refresh}
          </button>
        </div>
      </div>
    );
  }

  const employee = employees[currentEmployee];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} py-12 px-4 sm:px-6 lg:px-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl font-extrabold mb-2 ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' : 'text-gray-900'}`}>
            {t.ourTeam}
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.subtitle}
          </p>
        </div>

        {/* Employee Card */}
        <div className={`${isDark ? 'bg-slate-800 shadow-purple-900/50' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl`}>
          {/* Profile Header with Gradient */}
          <div className={`${isDark ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'} h-48 relative`}>
            <div className={`absolute -bottom-16 ${isRTL ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}>
              <div className={`w-32 h-32 rounded-full border-8 ${isDark ? 'border-slate-800' : 'border-white'} bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl relative`}>
                {employee.avatar || employee.profileImage ? (
                  <img 
                    src={employee.avatar || employee.profileImage.secure_url} 
                    alt={employee.name || employee.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
                {/* Active Status Indicator */}
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-8 h-8 rounded-full border-4 ${isDark ? 'border-slate-800' : 'border-white'} ${employee.isActive ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="pt-20 pb-8 px-8">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {employee.name || employee.fullName || 'Unknown Employee'}
              </h2>
              <div className={`flex items-center justify-center gap-2 font-semibold text-lg ${isDark ? 'text-purple-400' : 'text-indigo-600'}`}>
                <Briefcase className="w-5 h-5" />
                <span>{employee.position || employee.role || employee.title || 'N/A'}</span>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  employee.isActive 
                    ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                    : isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {employee.isActive ? t.active : t.inactive}
                </span>
              </div>

              {/* Rating and Reviews */}
              {(employee.rating !== undefined || employee.reviewCount !== undefined) && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  {employee.rating !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {renderRating(employee.rating)}
                      </div>
                      <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {employee.reviewCount !== undefined && (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({employee.reviewCount} {t.reviews})
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Email */}
              {employee.email && (
                <div className={`flex items-center gap-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 transition-all`}>
                  <div className={`flex-shrink-0 w-10 h-10 ${isDark ? 'bg-purple-900' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                    <Mail className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.email}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'} truncate`}>
                      {employee.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Job */}
              {(employee.job || employee.jop) && (
                <div className={`flex items-center gap-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 transition-all`}>
                  <div className={`flex-shrink-0 w-10 h-10 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'} rounded-lg flex items-center justify-center`}>
                    <Briefcase className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.job}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {employee.job || employee.jop}
                    </p>
                  </div>
                </div>
              )}

            

              
              {(employee.joinDate || employee.hireDate || employee.startDate) && (
                <div className={`flex items-center gap-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 transition-all`}>
                  <div className={`flex-shrink-0 w-10 h-10 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                    <Calendar className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.joinDate}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {new Date(employee.joinDate || employee.hireDate || employee.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              
            </div>

            
          </div>

          {/* Navigation Controls */}
          <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'} px-8 py-6 border-t`}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevious}
                disabled={employees.length <= 1}
                className={`group flex items-center gap-2 ${isDark ? 'bg-slate-800 hover:bg-purple-600 text-gray-200' : 'bg-white hover:bg-indigo-600 text-gray-700 hover:text-white'} font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>{t.previous}</span>
              </button>

              <div className="text-center">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentEmployee + 1} {t.of} {employees.length}
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={employees.length <= 1}
                className={`group flex items-center gap-2 ${isDark ? 'bg-slate-800 hover:bg-purple-600 text-gray-200' : 'bg-white hover:bg-indigo-600 text-gray-700 hover:text-white'} font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <span>{t.next}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2">
              {employees.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentEmployee
                      ? isDark ? 'bg-purple-500 w-8' : 'bg-indigo-600 w-8'
                      : isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to employee ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => dispatch(fetchEmployees())}
            className={`inline-flex items-center gap-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700'} font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {t.refreshData}
          </button>
        </div>
      </div>
    </div>
  );
}
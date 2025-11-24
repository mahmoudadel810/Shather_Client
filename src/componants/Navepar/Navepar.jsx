'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { setLanguage, toggleMode } from '../../../Store/settingsSlice';
import { logoutUser } from '../../../Store/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { language, mode } = useSelector((state) => state.settings);
  const isDark = mode === 'dark';
  const { user } = useSelector((state) => state.auth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  // Translation object
  const t = {
    en: {
      home: 'Home',
      gallery: 'Gallery',
      about: 'About',
      profile: 'Profile',
      menu: 'Menu',
      offers: 'Offers',
      bookNow: 'Book Now',
      reservations: 'Reservations',
      admin: 'Admin Dashboard',
      sliders: 'Manage Sliders',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      language: 'Language:',
      logo: 'Logo',
    },
    ar: {
      home: 'الرئيسية',
      gallery: 'المعرض',
      about: 'من نحن',
      profile: 'الملف الشخصي',
      menu: 'اسعار الخدمات',
      offers: 'العروض',
      bookNow: 'احجز الآن',
      reservations: 'الحجوزات',
      admin: 'لوحة التحكم',
      sliders: 'إدارة السلايدر',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      language: 'اللغة:',
      logo: 'شعار',
    }
  };

  const translations = t[language] || t.en;

  // Base nav links for all authenticated users
  const baseNavLinks = [
    { name: 'Home', nameAr: translations.home, href: '/' },
    { name: 'Gallery', nameAr: translations.gallery, href: '/gallery' },
    { name: 'About', nameAr: translations.about, href: '/about' },
    { name: 'Menu', nameAr: translations.menu, href: '/menu' },
    { name: 'Offers', nameAr: translations.offers, href: '/offers' },
  ];

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];
    
    const links = [...baseNavLinks];
    
    // Role-based navigation logic:
    // - Admin (role === 'admin'): Only see "Reservations" (NO Book Now)
    // - Employee (role === 'employee'): Only see "Reservations"
    // - Regular users (role === 'user'): Only see "Book Now"
    
    if (user.role === 'admin') {
      links.push({ name: 'Reservations', nameAr: translations.reservations, href: '/reservations' });
    } else if (user.role === 'employee') {
      links.push({ name: 'Reservations', nameAr: translations.reservations, href: '/reservations' });
    } else if (user.role === 'user') {
      links.push({ name: 'Book Now', nameAr: translations.bookNow, href: '/bookNow' });
    }
    
    return links;
  };

  const authenticatedNavLinks = getNavLinks();

  const currentLang = languages.find(lang => lang.code === language);
  const isRTL = language === 'ar';

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    router.push('/');
  };

  return (
    <nav 
      className={`shadow-lg sticky top-0 z-50 transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-purple-900/20' 
          : 'bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-blue-200/50'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold transition-all duration-300 ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                {translations.logo}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden lg:flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
            {user ? (
              <>
                {authenticatedNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isDark 
                        ? 'text-gray-200 hover:text-cyan-400 hover:bg-purple-800/30' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100/50'
                    }`}
                  >
                    {language === 'ar' ? link.nameAr : link.name}
                  </Link>
                ))}
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-900/50' 
                      : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-300/50'
                  }`}
                >
                  {translations.login}
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md ${
                    isDark 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/50' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-300/50'
                  }`}
                >
                  {translations.register}
                </button>
              </>
            )}
          </div>

          {/* Settings Controls - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 shadow-md ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-gray-100 hover:from-purple-700 hover:to-indigo-700 shadow-purple-900/50' 
                    : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 hover:from-purple-200 hover:to-indigo-200 shadow-purple-300/50'
                }`}
              >
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="text-sm font-medium">{currentLang?.code.toUpperCase()}</span>
                <svg className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isLangOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 rounded-lg shadow-lg py-1 ring-1 ring-opacity-5 ${
                  isDark 
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 shadow-purple-900/50 ring-purple-700 ring-opacity-50' 
                    : 'bg-white shadow-purple-300/50 ring-purple-200 ring-opacity-50'
                }`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        dispatch(setLanguage(lang.code));
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                        language === lang.code 
                          ? isDark 
                            ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-cyan-300' 
                            : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                          : isDark 
                            ? 'text-gray-200 hover:bg-purple-800/50' 
                            : 'text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {language === lang.code && (
                        <svg className={`w-4 h-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => dispatch(toggleMode())}
              className={`p-2 rounded-lg transition-all duration-200 shadow-md ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 shadow-orange-900/50' 
                  : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-700 hover:from-yellow-200 hover:to-orange-200 shadow-yellow-300/50'
              }`}
              aria-label="Toggle theme"
            >
              {mounted ? (
                isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )
              ) : null}
            </button>

            {/* Profile Dropdown (Only for logged-in users) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`p-2 rounded-lg transition-all duration-200 shadow-md flex items-center gap-2 ${
                    isDark 
                      ? 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white hover:from-indigo-600 hover:to-purple-600 shadow-purple-900/50' 
                      : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-gray-700 hover:from-indigo-200 hover:to-purple-200 shadow-indigo-300/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 rounded-lg shadow-lg py-1 ring-1 ring-opacity-5 ${
                    isDark 
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 shadow-purple-900/50 ring-purple-700 ring-opacity-50' 
                      : 'bg-white shadow-indigo-300/50 ring-indigo-200 ring-opacity-50'
                  }`}>
                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                        isDark 
                          ? 'text-gray-200 hover:bg-purple-800/50' 
                          : 'text-gray-700 hover:bg-indigo-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>{translations.profile}</span>
                    </Link>

                    {/* Admin Links (Only for admin role) */}
                    {user?.role === "admin" && (
                      <>
                        <div className={`h-px my-1 ${isDark ? 'bg-purple-700' : 'bg-gray-200'}`}></div>
                        
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                            isDark 
                              ? 'text-gray-200 hover:bg-red-800/50' 
                              : 'text-gray-700 hover:bg-red-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          <span>{translations.admin}</span>
                        </Link>

                        <Link
                          href="/admin/sliders"
                          onClick={() => setIsProfileOpen(false)}
                          className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                            isDark 
                              ? 'text-gray-200 hover:bg-purple-800/50' 
                              : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{translations.sliders}</span>
                        </Link>
                      </>
                    )}

                    {/* Logout */}
                    <div className={`h-px my-1 ${isDark ? 'bg-purple-700' : 'bg-gray-200'}`}></div>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900/50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span>{translations.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleMode())}
              className={`p-2 rounded-lg shadow-md transition-all duration-200 ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-orange-900/50' 
                  : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-700 shadow-yellow-300/50'
              }`}
            >
              {mounted ? (
                isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )
              ) : null}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg shadow-md transition-all duration-200 ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-gray-100 shadow-purple-900/50' 
                  : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-purple-300/50'
              }`}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`lg:hidden border-t transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-purple-800' 
            : 'bg-gradient-to-b from-blue-50 to-purple-50 border-purple-200'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {authenticatedNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      isDark 
                        ? 'text-gray-200 hover:text-cyan-400 hover:bg-purple-800/50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100/50'
                    }`}
                  >
                    {language === 'ar' ? link.nameAr : link.name}
                  </Link>
                ))}

                {/* Profile Link */}
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isDark 
                      ? 'text-gray-200 hover:text-cyan-400 hover:bg-purple-800/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100/50'
                  }`}
                >
                  {translations.profile}
                </Link>

                {user?.role === "admin" && (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-md mt-2 ${
                        isDark 
                          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500 shadow-red-900/50' 
                          : 'bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500 shadow-red-300/50'
                      }`}
                    >
                      {translations.admin}
                    </Link>

                    <Link
                      href="/admin/sliders"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-md mt-2 ${
                        isDark 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/50' 
                          : 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-300/50'
                      }`}
                    >
                      {translations.sliders}
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className={`w-full text-${isRTL ? 'right' : 'left'} px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-md mt-2 ${
                    isDark 
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 shadow-red-900/50' 
                      : 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-red-300/50'
                  }`}
                >
                  {translations.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push('/login');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-${isRTL ? 'right' : 'left'} px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-md ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-blue-900/50' 
                      : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 shadow-blue-300/50'
                  }`}
                >
                  {translations.login}
                </button>
                <button
                  onClick={() => {
                    router.push('/register');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-${isRTL ? 'right' : 'left'} px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 mt-2 shadow-md ${
                    isDark 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-green-900/50' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500 shadow-green-300/50'
                  }`}
                >
                  {translations.register}
                </button>
              </>
            )}

            {/* Mobile Language Selector */}
            <div className="px-3 py-2 mt-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-600'
              }`}>
                {translations.language}
              </label>
              <select
                value={language}
                onChange={(e) => dispatch(setLanguage(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 shadow-md transition-all duration-200 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-white border-purple-600 focus:ring-cyan-500 shadow-purple-900/50' 
                    : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-gray-900 border-purple-200 focus:ring-blue-500 shadow-purple-300/50'
                }`}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
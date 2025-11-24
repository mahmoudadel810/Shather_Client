// app/admin/page.jsx
'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Image, 
  UtensilsCrossed, 
  CalendarClock, 
  Users, 
  UserCog,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';

const translations = {
  en: {
    title: 'Admin Dashboard',
    subtitle: 'Manage Your Application',
    welcome: 'Welcome back',
    quickAccess: 'Quick Access',
    categories: 'Categories',
    categoriesDesc: 'Manage product categories',
    photoSettings: 'Photo Settings',
    photoSettingsDesc: 'Manage gallery and sliders',
    menuSettings: 'Menu Settings',
    menuSettingsDesc: 'Configure menu items',
    reservations: 'Reservations Settings',
    reservationsDesc: 'Manage booking settings',
    employees: 'Employees Settings',
    employeesDesc: 'Manage staff members',
    users: 'Users',
    usersDesc: 'Manage user accounts',
    overview: 'System Overview',
    activeUsers: 'Active Users',
    totalBookings: 'Total Bookings',
    revenue: 'Revenue',
  },
  ar: {
    title: 'لوحة تحكم المشرف',
    subtitle: 'إدارة التطبيق الخاص بك',
    welcome: 'مرحباً بعودتك',
    quickAccess: 'الوصول السريع',
    categories: 'الفئات',
    categoriesDesc: 'إدارة فئات المنتجات',
    photoSettings: 'إعدادات الصور',
    photoSettingsDesc: 'إدارة المعرض والشرائح',
    menuSettings: 'إعدادات القائمة',
    menuSettingsDesc: 'تكوين عناصر القائمة',
    reservations: 'إعدادات الحجوزات',
    reservationsDesc: 'إدارة إعدادات الحجز',
    employees: 'إعدادات الموظفين',
    employeesDesc: 'إدارة أعضاء الفريق',
    users: 'المستخدمين',
    usersDesc: 'إدارة حسابات المستخدمين',
    overview: 'نظرة عامة على النظام',
    activeUsers: 'المستخدمون النشطون',
    totalBookings: 'إجمالي الحجوزات',
    revenue: 'الإيرادات',
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { language = 'en', mode = 'light' } = useSelector((state) => state.settings || {});
  const { user } = useSelector((state) => state.auth || {});
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const t = translations[language] || translations.en;
  const isRTL = language === 'ar';
  const isDark = mode === 'dark';

  // Navigation items
  const navItems = [
    {
      title: t.categories,
      description: t.categoriesDesc,
      icon: FolderOpen,
      path: '/admin/category',
      color: 'from-pink-500 to-rose-500',
      darkColor: 'from-pink-600 to-rose-600',
    },
    {
      title: t.photoSettings,
      description: t.photoSettingsDesc,
      icon: Image,
      path: '/admin/photoSiting',
      color: 'from-purple-500 to-indigo-500',
      darkColor: 'from-purple-600 to-indigo-600',
    },
    {
      title: t.menuSettings,
      description: t.menuSettingsDesc,
      icon: UtensilsCrossed,
      path: '/admin/menuSiting',
      color: 'from-orange-500 to-amber-500',
      darkColor: 'from-orange-600 to-amber-600',
    },
    {
      title: t.reservations,
      description: t.reservationsDesc,
      icon: CalendarClock,
      path: '/admin/reservationsSettings',
      color: 'from-cyan-500 to-blue-500',
      darkColor: 'from-cyan-600 to-blue-600',
    },
    {
      title: t.employees,
      description: t.employeesDesc,
      icon: UserCog,
      path: '/admin/employeeSiting',
      color: 'from-emerald-500 to-green-500',
      darkColor: 'from-emerald-600 to-green-600',
    },
    {
      title: t.users,
      description: t.usersDesc,
      icon: Users,
      path: '/admin/users',
      color: 'from-violet-500 to-purple-500',
      darkColor: 'from-violet-600 to-purple-600',
    },
  ];

  // Stats data
  const stats = [
    {
      title: t.activeUsers,
      value: '2,543',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
      darkColor: 'from-pink-600 to-rose-600',
    },
    {
      title: t.totalBookings,
      value: '1,234',
      icon: CalendarClock,
      color: 'from-purple-500 to-indigo-500',
      darkColor: 'from-purple-600 to-indigo-600',
    },
    {
      title: t.revenue,
      value: '$45,678',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      darkColor: 'from-emerald-600 to-green-600',
    },
  ];

  const handleNavigate = (path) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${
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

      {/* Mobile Menu Button */}
      {/* <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-50 lg:hidden p-3 rounded-xl shadow-lg transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800 text-white hover:bg-slate-700' 
            : 'bg-white text-gray-900 hover:bg-gray-100'
        }`}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button> */}

      {/* Sidebar Navigation */}
      <div 
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-72 z-40 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } ${
          isDark 
            ? 'bg-slate-800/95 backdrop-blur-xl border-r border-purple-900/50' 
            : 'bg-white/95 backdrop-blur-xl border-r border-pink-100'
        }`}
      >
        <div className="p-6 mt-14">
          {/* Logo/Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isDark 
                ? 'bg-gradient-to-br from-pink-600 to-purple-600' 
                : 'bg-gradient-to-br from-pink-500 to-purple-500'
            }`}>
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-black ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Admin
              </h2>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Dashboard
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                    isDark 
                      ? 'hover:bg-slate-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-pink-50 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                    isDark ? item.darkColor : item.color
                  } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">{item.title}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                    isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-72 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className={`text-5xl md:text-7xl font-black mb-4 animate-fade-in ${
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
            {user && (
              <p className={`text-lg mt-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {t.welcome}, <span className="font-bold">{user.name}</span>
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 transition-all hover:scale-105 ${
                    isDark 
                      ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
                      : 'bg-white/90 border-pink-100 shadow-purple-200/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                      isDark ? stat.darkColor : stat.color
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-black ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Access Section */}
          <div className={`backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border-2 ${
            isDark 
              ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
              : 'bg-white/90 border-pink-100 shadow-purple-200/50'
          }`}>
            <h2 className={`text-3xl font-black mb-6 flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Activity className="w-8 h-8" />
              {t.quickAccess}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigate(item.path)}
                    className={`backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 ${
                      isDark 
                        ? 'bg-slate-700/50 border-slate-600 hover:border-purple-500' 
                        : 'bg-white/50 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${
                      isDark ? item.darkColor : item.color
                    } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                    <div className={`mt-4 flex items-center gap-2 text-sm font-bold ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {isRTL ? 'الذهاب' : 'Go'}
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                        isRTL ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Overview */}
          <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 ${
            isDark 
              ? 'bg-slate-800/90 border-purple-900/50 shadow-purple-900/50' 
              : 'bg-white/90 border-pink-100 shadow-purple-200/50'
          }`}>
            <h2 className={`text-3xl font-black mb-6 flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <BarChart3 className="w-8 h-8" />
              {t.overview}
            </h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                System analytics and reports will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

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
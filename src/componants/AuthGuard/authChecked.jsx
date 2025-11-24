// componants/AuthGuard/AuthGuard.jsx
'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { restoreSession } from '../../../Store/authSlice';


export default function AuthChecked({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // الصفحات العامة التي لا تحتاج تسجيل دخول
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // استعادة الجلسة عند تحميل التطبيق
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    // إذا كان المستخدم غير مسجل ويحاول الوصول لصفحة محمية
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push('/login');
    }

    // إذا كان المستخدم مسجل ويحاول الوصول لصفحة التسجيل أو تسجيل الدخول
    if (!isLoading && isAuthenticated && isPublicPath) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, isPublicPath, pathname, router]);

  // عرض شاشة تحميل أثناء فحص حالة المصادقة
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم في صفحة عامة أو مسجل دخول، عرض المحتوى
  if (isPublicPath || isAuthenticated) {
    return <>{children}</>;
  }

  // في أي حالة أخرى، عدم عرض شيء (سيتم إعادة التوجيه)
  return null;
}
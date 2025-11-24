'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Joi from 'joi';
import { register, clearError } from '../../../Store/authSlice';
import { translationsRegister } from '../../../lib/translations.js';

// translations object


export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { language ,mode } = useSelector((state) => state.settings);

  const isRTL = language === 'ar';
  const isDark = mode === 'dark';
  const t = translationsRegister[language] || translationsRegister.en;

  const [apiMessage, setApiMessage] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rePassword: '',
    phone: '',
  });

  // validation errors per-field
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // --- Joi schemas ---
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  const fieldSchemas = {
    name: Joi.string()
      .min(3)
      .max(32)
      .trim()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.empty': language === 'ar' ? 'الاسم مطلوب.' : 'Name is required.',
        'string.min': language === 'ar' ? 'يجب أن يكون الاسم 3 أحرف على الأقل.' : 'Name must be at least 3 characters.',
        'string.max': language === 'ar' ? 'يجب ألا يزيد الاسم عن 32 حرفًا.' : 'Name must be at most 32 characters.',
        'string.pattern.base': language === 'ar' ? 'يجب أن يحتوي الاسم على حروف وأرقام وشرطات سفلية فقط.' : 'Name must contain only letters, numbers, and underscores.',
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .required()
      .messages({
        'string.empty': language === 'ar' ? 'البريد الإلكتروني مطلوب.' : 'Email is required.',
        'string.email': language === 'ar' ? 'أدخل عنوان بريد إلكتروني صالح (example@domain.com).' : 'Enter a valid email address (example@domain.com).',
        'string.pattern.base': language === 'ar' ? 'أدخل عنوان بريد إلكتروني صالح (example@domain.com).' : 'Enter a valid email address (example@domain.com).',
      }),
    password: Joi.string().min(6).max(128).pattern(passwordPattern).required().messages({
      'string.empty': language === 'ar' ? 'كلمة المرور مطلوبة.' : 'Password is required.',
      'string.min': language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' : 'Password must be at least 6 characters.',
      'string.max': language === 'ar' ? 'يجب ألا تزيد كلمة المرور عن 128 حرفًا.' : 'Password must be at most 128 characters.',
      'string.pattern.base': language === 'ar' ? 'يجب أن تحتوي كلمة المرور على أحرف كبيرة وصغيرة ورقم وحرف خاص.' : 'Password must include upper & lower case letters, a number and a special character (e.g. Aa1@).',
    }),
    rePassword: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': language === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
      'string.empty': language === 'ar' ? 'الرجاء تأكيد كلمة المرور.' : 'Please confirm your password.',
    }),
    phone: Joi.string().min(10).max(15).required().messages({
      'string.empty': language === 'ar' ? 'رقم الهاتف مطلوب.' : 'Phone number is required.',
      'string.min': language === 'ar' ? 'يجب أن يكون رقم الهاتف 10 أرقام على الأقل.' : 'Phone number must be at least 10 digits.',
      'string.max': language === 'ar' ? 'يجب ألا يزيد رقم الهاتف عن 15 رقمًا.' : 'Phone number must be at most 15 digits.',
    }),
  };

  const fullSchema = Joi.object({
    name: fieldSchemas.name,
    email: fieldSchemas.email,
    password: fieldSchemas.password,
    rePassword: fieldSchemas.rePassword,
    phone: fieldSchemas.phone,
  });

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      setApiMessage({ type: 'error', text: error });
    }
  }, [error]);

  // validate single field on change
  const validateField = (name, value, allValues = {}) => {
    try {
      if (name === 'rePassword') {
        const { error: e } = Joi.object({ password: fieldSchemas.password, rePassword: fieldSchemas.rePassword })
          .validate({ password: allValues.password, rePassword: value }, { abortEarly: true });
        return e ? e.details[0].message : null;
      } else {
        const { error: e } = fieldSchemas[name].validate(value, { abortEarly: true });
        return e ? e.details[0].message : null;
      }
    } catch (e) {
      return t.fieldInvalid;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);

    const message = validateField(name, value, nextData);
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error: validationError } = fullSchema.validate(formData, { abortEarly: false });
    if (validationError) {
      const fieldErrors = {};
      validationError.details.forEach((d) => {
        const key = d.path[0];
        fieldErrors[key] = d.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setApiMessage(null);
    setSuccessMessage('');

    const res = await dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      rePassword: formData.rePassword,
      phone: formData.phone
    }));

    const data = res?.payload ?? res;

    if (data?.errors && typeof data.errors === 'object') {
      setErrors(prev => ({ ...prev, ...data.errors }));
    }

    const success = data?.success === true || data?.user || data?.payload?.user || data?.status === 'success';
    const message = data?.message || data?.error || data?.payload?.message || res?.message || res?.error;

    if (success) {
      const successText = message || t.successDefault;
      setApiMessage({ type: 'success', text: successText });
      setSuccessMessage(successText);
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    const failureText = message || t.failureDefault;
    setApiMessage({ type: 'error', text: failureText });
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 ${isRTL ? 'text-right' : 'text-left'}`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>

          {/* API Message */}
          {apiMessage && (
            <div className={`mb-4 p-4 rounded-lg ${apiMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              <p className="text-sm text-center">{apiMessage.text}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm text-center">{successMessage}</p>
            </div>
          )}

          {/* Redux error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.nameLabel}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder={t.namePlaceholder}
              />
              {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.emailLabel}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder={t.emailPlaceholder}
              />
              {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.phoneLabel}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder={t.phonePlaceholder}
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.passwordLabel}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder={t.passwordLabel}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t.passwordHelp}</p>
              {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.rePasswordLabel}</label>
              <input
                type="password"
                name="rePassword"
                value={formData.rePassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder={t.rePasswordLabel}
              />
              {errors.rePassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.rePassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t.loadingText}</span>
                </>
              ) : (
                <span>{t.submitText}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t.alreadyAccount}{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {t.loginText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
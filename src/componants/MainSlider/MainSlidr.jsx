// components/MainSlider/MainSlider.jsx
'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSliders, setCurrentSlide, nextSlide, prevSlide } from '../../../Store/sliderSlice';
import Image from 'next/image';

export default function MainSlider() {
  const dispatch = useDispatch();
  const { sliders, loading, error, currentSlide } = useSelector((state) => state.slider);
  const { language, mode } = useSelector((state) => state.settings);
  const [isHovering, setIsHovering] = useState(false);
// console.log(sliders);

  const isDark = mode === 'dark';

  useEffect(() => {
    dispatch(fetchSliders('mainSlider'));
  }, [dispatch]);

  useEffect(() => {
    if (!isHovering && sliders.length > 0) {
      const timer = setInterval(() => {
        dispatch(nextSlide());
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovering, sliders.length, dispatch]);

  const handlePrevSlide = () => {
    dispatch(prevSlide());
  };

  const handleNextSlide = () => {
    dispatch(nextSlide());
  };

  const handleDotClick = (index) => {
    dispatch(setCurrentSlide(index));
  };

  if (loading) {
    return (
      <div className={`w-full h-96 rounded-3xl flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800 to-purple-900' 
          : 'bg-gradient-to-br from-blue-100 to-purple-100'
      }`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${
          isDark ? 'border-purple-400' : 'border-purple-600'
        }`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-96 rounded-3xl flex items-center justify-center ${
        isDark ? 'bg-red-900/20' : 'bg-red-50'
      }`}>
        <div className="text-center">
          <p className={`text-xl font-bold mb-2 ${
            isDark ? 'text-red-400' : 'text-red-600'
          }`}>
            ⚠️ Error Loading Sliders
          </p>
          <p className={isDark ? 'text-red-300' : 'text-red-500'}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!sliders || sliders.length === 0) {
    return (
      <div className={`w-full h-96 rounded-3xl flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
        <p className={`text-xl font-semibold ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {language === 'ar' ? 'لا توجد شرائح متاحة' : 'No sliders available'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl group ${
        isDark ? 'shadow-purple-900/50' : 'shadow-purple-200/50'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Slider Images */}
      <div className="relative w-full h-full">
        {sliders.map((slider, index) => {
          // Generate unique key
          const sliderId = slider._id || slider.id || `slider-${index}`;
          
          return (
            <div
              key={sliderId}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-95 z-0'
              }`}
            >
              {/* Background Image */}
              <div className="relative w-full h-full">
                {slider.image?.secure_url ? (
                  <Image
                    src={slider.image.secure_url}
                    alt={slider.title || 'Slider image'}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-2xl">No Image</span>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24">
                <div className="max-w-2xl text-white space-y-6 transform transition-all duration-700 animate-fade-in">
                  {/* Badge */}
                  {slider.badge && (
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-bold shadow-lg">
                      {slider.badge}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-2xl leading-tight">
                    {language === 'ar' ? (slider.titleAr || slider.title) : slider.title}
                  </h2>

                  {/* Description */}
                  <p className="text-lg md:text-xl font-medium drop-shadow-lg max-w-xl">
                    {language === 'ar' ? (slider.descriptionAr || slider.description) : slider.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex gap-4 pt-4">
                    {slider.buttonText && (
                      <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        {language === 'ar' ? (slider.buttonTextAr || slider.buttonText) : slider.buttonText}
                        <span className={language === 'ar' ? 'mr-2' : 'ml-2'}>
                          {language === 'ar' ? '←' : '→'}
                        </span>
                      </button>
                    )}
                    {slider.secondaryButtonText && (
                      <button className="px-8 py-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold rounded-full border-2 border-white/50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        {language === 'ar' ? (slider.secondaryButtonTextAr || slider.secondaryButtonText) : slider.secondaryButtonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-20"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-20"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full z-20">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'bg-white w-12 h-3 shadow-lg'
                : 'bg-white/50 w-3 h-3 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold z-20">
        {currentSlide + 1} / {sliders.length}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
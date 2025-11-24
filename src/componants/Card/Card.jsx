import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

// Mock API fetch - replace with your actual API call
const fetchCategories = async () => {
  const response = await fetch('http://localhost:8080/api/v1/services/');
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

const CategoryCard = ({ category, isDark }) => {
  const router = useRouter();
  
  const handleClick = () => {
    // Navigate to category gallery - adjust route as needed
    router.push(`/gallery/${category.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        isDark 
          ? 'bg-gray-800 shadow-xl hover:shadow-purple-500/50' 
          : 'bg-white shadow-lg hover:shadow-blue-500/50'
      }`}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={category.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
          alt={category.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-2xl font-bold mb-3 transition-colors ${
          isDark ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-blue-600'
        }`}>
          {category.title}
        </h3>
        <p className={`text-sm leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {category.description}
        </p>
      </div>

      {/* Hover Arrow Indicator */}
      <div className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform translate-x-12 group-hover:translate-x-0 ${
        isDark ? 'bg-purple-500' : 'bg-blue-500'
      }`}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

const CategoryCardsDemo = () => {
  const [isDark, setIsDark] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    // Fallback to demo data if API fails
    placeholderData: [
      {
        id: 1,
        title: 'Photography',
        description: 'Explore stunning visual stories captured through the lens. Professional photography services for all occasions.',
        image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'
      },
      {
        id: 2,
        title: 'Web Design',
        description: 'Modern, responsive websites that captivate your audience. Creative design solutions for digital excellence.',
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800'
      },
      {
        id: 3,
        title: 'Consulting',
        description: 'Expert business guidance to elevate your success. Strategic consulting services tailored to your needs.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'
      }
    ]
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
    }`}>
      {/* Header with Theme Toggle */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Our Services
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Discover what we can do for you
            </p>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-lg`}
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl h-80 animate-pulse ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`text-center py-12 rounded-2xl ${
            isDark ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'
          }`}>
            <p className="text-lg">Failed to load categories. Using demo data.</p>
          </div>
        )}

        {/* Category Cards Grid */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCardsDemo;
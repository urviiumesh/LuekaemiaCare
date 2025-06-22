import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState({
    header: false,
    subtitle: false,
    cards: false,
    info: false
  });
  
  // Dark mode state - initialize from localStorage or default to true
  const [darkMode, setDarkMode] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode !== null ? savedMode === 'true' : true;
    }
    return true; // Default to dark mode
  });
  
  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(newMode));
      }
      return newMode;
    });
  };

  useEffect(() => {
    // Staggered animation timing
    setTimeout(() => setIsVisible(prev => ({ ...prev, header: true })), 300);
    setTimeout(() => setIsVisible(prev => ({ ...prev, subtitle: true })), 800);
    setTimeout(() => setIsVisible(prev => ({ ...prev, cards: true })), 1300);
    setTimeout(() => setIsVisible(prev => ({ ...prev, info: true })), 1800);
  }, []);

  // Login card data
  const loginOptions = [
    {
      title: "Doctors",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M12 5 8.5 9.5"></path><path d="M12 5l3.5 4.5"></path><path d="M19 15v6"></path><path d="M16 18h6"></path></svg>,
      description: "Access patient records, treatment plans, and collaborate with healthcare professionals.",
      route: "/login"
    },
    {
      title: "Patients",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      description: "Monitor your treatment progress, schedule appointments, and access resources.",
      route: "/login"
    },
    {
      title: "Family Members",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      description: "Support your loved ones, stay informed about care plans, and find support resources.",
      route: "/login"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-gradient-to-b from-black to-gray-900 text-white' : 'bg-gradient-to-b from-gray-100 to-white text-gray-900'}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`w-full py-4 px-6 shadow-md relative z-10 transition-colors duration-500 ${darkMode ? 'bg-black/80 backdrop-blur-lg text-white' : 'bg-white/80 backdrop-blur-lg text-gray-900 border-b border-gray-200'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
            <span className="text-xl font-semibold">LeukemiaCare</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#about" className={`transition duration-300 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-600'}`}>About</a>
            <a href="#resources" className={`transition duration-300 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-600'}`}>Resources</a>
            <a href="#support" className={`transition duration-300 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-600'}`}>Support</a>
            <a href="#contact" className={`transition duration-300 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-600'}`}>Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full transition duration-300 mr-2 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link to="/login" className={`transition duration-300 ${
              darkMode 
                ? 'text-white hover:text-red-400' 
                : 'text-gray-800 hover:text-red-600'
            }`}>
              Log In
            </Link>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300">
              Emergency Contact
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div 
            className={`transition-all duration-1000 transform ${isVisible.header ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <h1 className={`text-4xl md:text-5xl font-light mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Unified Care for 
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent"> Leukemia </span>
              Patients
            </h1>
          </div>
          
          <div 
            className={`transition-all duration-1000 delay-300 transform ${isVisible.subtitle ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Connecting patients, families, and healthcare providers on a secure platform
              for comprehensive leukemia care management and support.
            </p>
          </div>
        </div>

        {/* Login Options */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 transition-all duration-1000 transform ${isVisible.cards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          {loginOptions.map((option, index) => {
            // Define color scheme based on user type
            const colorScheme = {
              gradient: index === 0 ? 'from-red-800 to-red-600' : 
                        index === 1 ? 'from-blue-800 to-blue-600' : 
                        'from-green-800 to-green-600',
              hoverGradient: index === 0 ? 'from-red-700 to-red-500' : 
                            index === 1 ? 'from-blue-700 to-blue-500' : 
                            'from-green-700 to-green-500',
              iconColor: index === 0 ? 'text-red-500' : 
                        index === 1 ? 'text-blue-500' : 
                        'text-green-500',
              borderColor: index === 0 ? 'border-red-900/50' : 
                          index === 1 ? 'border-blue-900/50' : 
                          'border-green-900/50',
              buttonBg: index === 0 ? 'bg-red-600 hover:bg-red-700' : 
                       index === 1 ? 'bg-blue-600 hover:bg-blue-700' : 
                       'bg-green-600 hover:bg-green-700'
            };
            
            return (
              <div 
                key={index} 
                className={`backdrop-blur-lg rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  darkMode 
                    ? "bg-black/50 border border-gray-800 hover:bg-black/70" 
                    : "bg-white/70 border border-gray-200 hover:bg-white/90"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full shadow-inner border ${
                    darkMode 
                      ? `bg-black/70 backdrop-blur-sm ${colorScheme.borderColor}` 
                      : `bg-white/70 backdrop-blur-sm border-gray-200`
                  }`}>
                    <div className={colorScheme.iconColor}>
                      {option.icon}
                    </div>
                  </div>
                </div>
                <h2 className={`text-xl font-semibold bg-gradient-to-r ${colorScheme.gradient} bg-clip-text text-transparent mb-2`}>
                  {option.title}
                </h2>
                <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{option.description}</p>
                <Link 
                  to={option.route}
                  className={`inline-block ${colorScheme.buttonBg} text-white font-medium py-2 px-6 rounded transition duration-300`}
                >
                  Log In
                </Link>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div 
          className={`backdrop-blur-lg rounded-2xl shadow-2xl p-8 transition-all duration-1000 transform ${
            darkMode 
              ? 'bg-black/80 border border-gray-800' 
              : 'bg-white/80 border border-gray-200'
          } ${isVisible.info ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Understanding Leukemia</h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Leukemia is a cancer of blood-forming tissues, including bone marrow and the lymphatic system. 
                Our platform provides comprehensive resources, treatment tracking, and support networks.
              </p>
              <ul className="space-y-2">
                <li className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Expert medical guidance and resources</span>
                </li>
                <li className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Treatment tracking and appointment scheduling</span>
                </li>
                <li className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Support communities for patients and families</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Our Mission</h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We are dedicated to improving the quality of life for leukemia patients by facilitating 
                communication between all stakeholders in the care process and providing access to cutting-edge 
                research and treatments.
              </p>
              <div className="mt-6">
                <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded mr-4 transition duration-300">
                  Learn More
                </button>
                <button className={`font-medium py-2 px-6 rounded transition duration-300 ${
                  darkMode 
                    ? 'border border-gray-700 bg-black/50 text-gray-300 hover:text-white hover:border-gray-600' 
                    : 'border border-gray-300 bg-white/50 text-gray-700 hover:text-gray-900 hover:border-gray-400'
                }`}>
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-8 px-4 relative z-10 transition-colors duration-500 ${
        darkMode 
          ? 'bg-black/80 backdrop-blur-lg text-white border-t border-gray-800' 
          : 'bg-white/80 backdrop-blur-lg text-gray-800 border-t border-gray-200'
      }`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-light mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">LeukemiaCare</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Comprehensive support for leukemia patients, families, and healthcare providers.
              </p>
            </div>
            <div>
              <h4 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}>About Us</a></li>
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>Resources</a></li>
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}>Support Groups</a></li>
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}>Treatment Options</a></li>
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>Research Updates</a></li>
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}>Financial Support</a></li>
                <li><a href="#" className={`transition ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}>Nutrition Guidance</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subscribe</h4>
              <p className={darkMode ? 'text-gray-400 mb-4' : 'text-gray-600 mb-4'}>Stay updated with the latest research and support resources.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className={`px-4 py-2 w-full rounded-l focus:outline-none ${
                    darkMode 
                      ? 'bg-black/50 border border-gray-800 text-white' 
                      : 'bg-white/50 border border-gray-300 text-gray-800'
                  }`}
                />
                <button className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 rounded-r transition duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className={`mt-8 pt-6 text-center ${
            darkMode 
              ? 'border-t border-gray-800 text-gray-400' 
              : 'border-t border-gray-200 text-gray-600'
          }`}>
            <p>© {new Date().getFullYear()} LeukemiaCare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add animation keyframes with style tag */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
        @keyframes blob {
          0%, 100% { transform: scale(1) translate(0, 0); }
          25% { transform: scale(1.1) translate(20px, -10px); }
          50% { transform: scale(1) translate(0, 10px); }
          75% { transform: scale(0.9) translate(-20px, 0); }
        }
        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
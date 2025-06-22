import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  // State to track the current view (selection or login)
  const [view, setView] = useState('selection'); // 'selection' or 'login'
  
  // State to track the selected user type
  const [userType, setUserType] = useState(null); // 'doctor', 'patient', or 'family'
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [activeField, setActiveField] = useState(null);

  // Function to handle user type selection
  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setView('login');
  };

  // Function to go back to user type selection
  const handleBackToSelection = () => {
    setView('selection');
    setUserType(null);
    // Reset form data when going back to selection
    setFormData({
      email: '',
      password: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setIsSubmitting(true);
    
    // Check credentials based on user type
    const validCredentials = {
      doctor: { email: 'doctor@medicare.com', password: 'Doctor123!' },
      patient: { email: 'patient@medicare.com', password: 'Patient123!' },
      family: { email: 'family@medicare.com', password: 'Family123!' }
    };

    const credentials = validCredentials[userType];
    
    if (formData.email === credentials.email && formData.password === credentials.password) {
      // Successful login
      setTimeout(() => {
        setIsSubmitting(false);
        if (userType === 'doctor') {
          window.location.href = '/doctor';
        } else if (userType === 'patient') {
          window.location.href = '/patients';
        } else if (userType === 'family') {
          window.location.href = '/family';
        }
      }, 1500);
    } else {
      // Failed login
      setIsSubmitting(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getUserTypeDisplay = () => {
    switch(userType) {
      case 'doctor':
        return 'Healthcare Professional';
      case 'patient':
        return 'Patient';
      case 'family':
        return 'Family Member';
      default:
        return 'User';
    }
  };
  
  const getIconByUserType = () => {
    switch(userType) {
      case 'doctor':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        );
      case 'patient':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case 'family':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        );
    }
  };

  // Define user type options with their details
  const userTypeOptions = [
    {
      id: 'doctor',
      title: 'Healthcare Professional',
      description: 'Access patient records, treatment plans, and medical resources',
      icon: (
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      color: 'from-red-800 to-red-600',
      hoverColor: 'from-red-700 to-red-500'
    },
    {
      id: 'patient',
      title: 'Patient',
      description: 'View your medical history, appointments, and treatment information',
      icon: (
        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      color: 'from-blue-800 to-blue-600',
      hoverColor: 'from-blue-700 to-blue-500'
    },
    {
      id: 'family',
      title: 'Family Member',
      description: 'Monitor your loved one\'s care and communicate with healthcare providers',
      icon: (
        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      color: 'from-green-800 to-green-600',
      hoverColor: 'from-green-700 to-green-500'
    }
  ];

  // Get the selected user type details
  const getSelectedUserType = () => {
    return userTypeOptions.find(option => option.id === userType) || userTypeOptions[0];
  };

  // Get background color based on user type
  const getBackgroundGradient = () => {
    if (!userType) return 'from-black to-gray-900';
    
    const selectedType = getSelectedUserType();
    return `from-black to-${selectedType.id === 'doctor' ? 'red' : selectedType.id === 'patient' ? 'blue' : 'green'}-900/30`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${getBackgroundGradient()} relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {userType === 'doctor' && (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </>
        )}
        {userType === 'patient' && (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </>
        )}
        {userType === 'family' && (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </>
        )}
        {!userType && (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </>
        )}
      </div>
      
      {/* User Type Selection View */}
      {view === 'selection' && (
        <div className="max-w-4xl w-full p-8 bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-light text-white mb-2">Welcome to MediCare</h1>
            <p className="text-gray-300">Please select your user type to continue</p>
            <a 
              href="/" 
              className="inline-flex items-center mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Return to Home Page
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userTypeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleUserTypeSelect(option.id)}
                className="bg-black/50 border border-gray-800 rounded-xl p-6 text-center hover:bg-black/70 transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-gray-700"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-black/70 backdrop-blur-sm shadow-inner border border-gray-800">
                    {option.icon}
                  </div>
                </div>
                <h3 className={`text-xl font-semibold bg-gradient-to-r ${option.color} bg-clip-text text-transparent mb-2`}>
                  {option.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-gray-300 hover:text-white transition-colors">
                Sign up now
              </a>
            </p>
          </div>
        </div>
      )}
      
      {/* Login Form View */}
      {view === 'login' && userType && (
        <div 
          id="login-card"
          className={`max-w-md w-full p-8 bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl relative z-10 transition-all duration-200 ${shake ? 'animate-shake' : ''}`}
          style={{ 
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px ${
              userType === 'doctor' ? 'rgba(220, 38, 38, 0.2)' : 
              userType === 'patient' ? 'rgba(37, 99, 235, 0.2)' : 
              'rgba(22, 163, 74, 0.2)'
            } inset`
          }}
        >
          {/* Navigation buttons */}
          <div className="absolute top-4 left-4 flex items-center space-x-4">
            <button 
              onClick={handleBackToSelection}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <a 
              href="/" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </a>
          </div>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`mb-4 p-3 rounded-full bg-black/70 backdrop-blur-sm shadow-inner border ${
              userType === 'doctor' ? 'border-red-900/50' : 
              userType === 'patient' ? 'border-blue-900/50' : 
              'border-green-900/50'
            }`}>
              {getIconByUserType()}
            </div>
            <h2 className="text-3xl font-light text-white">
              Welcome
            </h2>
            <p className={`text-xl font-semibold bg-gradient-to-r ${
              userType === 'doctor' ? 'from-red-500 to-red-700' : 
              userType === 'patient' ? 'from-blue-500 to-blue-700' : 
              'from-green-500 to-green-700'
            } bg-clip-text text-transparent`}>
              {getUserTypeDisplay()}
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Please sign in to access your account
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className={`relative ${activeField === 'email' ? 'transform scale-105 transition-all duration-300' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${
                    userType === 'doctor' ? 'text-red-400' : 
                    userType === 'patient' ? 'text-blue-400' : 
                    'text-green-400'
                  }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-3 border border-gray-800 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    userType === 'doctor' ? 'focus:ring-red-700' : 
                    userType === 'patient' ? 'focus:ring-blue-700' : 
                    'focus:ring-green-700'
                  } focus:border-transparent transition-all duration-300`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                />
              </div>
              
              <div className={`relative ${activeField === 'password' ? 'transform scale-105 transition-all duration-300' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${
                    userType === 'doctor' ? 'text-red-400' : 
                    userType === 'patient' ? 'text-blue-400' : 
                    'text-green-400'
                  }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  className={`appearance-none rounded-lg block w-full pl-10 pr-10 py-3 border border-gray-800 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    userType === 'doctor' ? 'focus:ring-red-700' : 
                    userType === 'patient' ? 'focus:ring-blue-700' : 
                    'focus:ring-green-700'
                  } focus:border-transparent transition-all duration-300`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {isPasswordVisible ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 ${
                    userType === 'doctor' ? 'text-red-600 focus:ring-red-500' : 
                    userType === 'patient' ? 'text-blue-600 focus:ring-blue-500' : 
                    'text-green-600 focus:ring-green-500'
                  } border-gray-700 rounded`}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className={`font-medium ${
                  userType === 'doctor' ? 'text-red-500 hover:text-red-400' : 
                  userType === 'patient' ? 'text-blue-500 hover:text-blue-400' : 
                  'text-green-500 hover:text-green-400'
                } transition-colors`}>
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${
                  userType === 'doctor' 
                    ? 'from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 focus:ring-red-500' 
                    : userType === 'patient'
                    ? 'from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 focus:ring-blue-500'
                    : 'from-green-800 to-green-600 hover:from-green-700 hover:to-green-500 focus:ring-green-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out overflow-hidden`}
                disabled={isSubmitting}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className={`h-5 w-5 ${
                      userType === 'doctor' ? 'text-red-300 group-hover:text-red-200' : 
                      userType === 'patient' ? 'text-blue-300 group-hover:text-blue-200' : 
                      'text-green-300 group-hover:text-green-200'
                    } transition-colors`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className="relative">
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </span>
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="#" className={`font-medium ${
                userType === 'doctor' ? 'text-red-500 hover:text-red-400' : 
                userType === 'patient' ? 'text-blue-500 hover:text-blue-400' : 
                'text-green-500 hover:text-green-400'
              } transition-colors`}>
                Sign up now
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
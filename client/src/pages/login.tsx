import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import wmkLogo from '@/assets/wmk-logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [shouldContactAdmin, setShouldContactAdmin] = useState(false);
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error && !isRateLimited) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, isRateLimited]);

  // Check rate limit status when username changes or page loads
  useEffect(() => {
    const checkRateLimit = async () => {
      if (!username.trim()) {
        setIsRateLimited(false);
        setShouldContactAdmin(false);
        setTimeUntilReset(0);
        setError('');
        return;
      }

      try {
        const response = await fetch('/api/auth/rate-limit-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.rateLimited) {
            setIsRateLimited(true);
            setTimeUntilReset(data.timeUntilReset);
            setShouldContactAdmin(data.shouldContactAdmin);
            
            const minutes = Math.ceil(data.timeUntilReset / (60 * 1000));
            let message = `Too many failed login attempts. Please try again in ${minutes} minute(s).`;
            
            if (data.shouldContactAdmin) {
              message = "Multiple failed login attempts detected. Please contact your system administrator for assistance.";
            }
            
            setError(message);
          } else {
            setIsRateLimited(false);
            setShouldContactAdmin(false);
            setTimeUntilReset(0);
            if (error && (error.includes('Too many failed') || error.includes('Multiple failed'))) {
              setError('');
            }
          }
        }
      } catch (error) {
        console.error('Rate limit check failed:', error);
      }
    };

    // Debounce the rate limit check
    const timer = setTimeout(checkRateLimit, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Countdown timer for rate limiting
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRateLimited && timeUntilReset > 0) {
      timer = setInterval(() => {
        setTimeUntilReset(prev => {
          if (prev <= 1000) {
            setIsRateLimited(false);
            setShouldContactAdmin(false);
            setError('');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRateLimited, timeUntilReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (result.success) {
      setLoginSuccess(true);
      setIsRateLimited(false);
      setShouldContactAdmin(false);
      setTimeUntilReset(0);
      
      // Show success animation for 1.5 seconds then redirect
      setTimeout(() => {
        setLocation('/dashboard');
      }, 1500);
    } else {
      // Check for rate limiting response
      if (result.rateLimited) {
        setIsRateLimited(true);
        setTimeUntilReset(result.timeUntilReset || 300000); // Default to 5 minutes
        setShouldContactAdmin(result.shouldContactAdmin || false);
      }
      
      setError(result.error || 'Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Success Animation Overlay */}
      {loginSuccess && (
        <div className="fixed inset-0 bg-green-600 z-50 flex items-center justify-center">
          <div className="text-center text-white animate-pulse">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 mx-auto text-white animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Login Successful!</h2>
            <p className="text-green-100">Taking you to your dashboard...</p>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.8);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            
            .fixed {
              animation: fadeIn 0.5s ease-out;
            }
          `}</style>
        </div>
      )}
      
      <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
            animation: 'backgroundMove 20s linear infinite'
          }}></div>
        </div>
        
        {/* Additional floating elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '6s'}}></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '8s'}}></div>
          <div className="absolute top-1/2 left-8 w-16 h-16 bg-white rounded-full animate-bounce" style={{animationDelay: '4s', animationDuration: '7s'}}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="text-center max-w-md">
            {/* Floating Logo */}
            <div className="mb-8">
              <img 
                src={wmkLogo} 
                alt="Wrap My Kitchen Logo" 
                className="h-24 w-auto mx-auto filter brightness-0 invert animate-float"
              />
            </div>
            
            {/* Brand Text */}
            <p className="text-xl font-medium mb-6 text-green-100">
              Your Kitchen Solutions Partner
            </p>
            
            {/* Description */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
              <p className="text-green-50 leading-relaxed">
                Manage leads, track installations, and grow your kitchen business with our comprehensive CRM solution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600">
                Welcome back to Wrap My Kitchen
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isRateLimited}
                    className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isRateLimited ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400 text-sm"></i>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isRateLimited}
                    className={`w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isRateLimited ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400 text-sm"></i>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <i 
                      className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 cursor-pointer hover:text-gray-600 text-sm`}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Error/Rate Limit Message */}
              {error && (
                <div className={`border-l-4 rounded-lg p-4 animate-shake ${
                  isRateLimited 
                    ? 'bg-orange-50 border-orange-400' 
                    : shouldContactAdmin 
                      ? 'bg-red-50 border-red-400'
                      : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isRateLimited 
                          ? 'bg-orange-400' 
                          : shouldContactAdmin 
                            ? 'bg-red-500'
                            : 'bg-red-400'
                      }`}>
                        <i className={`fas ${
                          isRateLimited 
                            ? 'fa-clock' 
                            : shouldContactAdmin 
                              ? 'fa-user-shield'
                              : 'fa-exclamation'
                        } text-white text-xs`}></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        isRateLimited 
                          ? 'text-orange-800' 
                          : shouldContactAdmin 
                            ? 'text-red-900'
                            : 'text-red-800'
                      }`}>
                        {isRateLimited 
                          ? 'Account Temporarily Locked' 
                          : shouldContactAdmin 
                            ? 'Contact Administrator'
                            : 'Login Failed'
                        }
                      </h3>
                      <p className={`mt-1 text-sm ${
                        isRateLimited 
                          ? 'text-orange-700' 
                          : shouldContactAdmin 
                            ? 'text-red-800'
                            : 'text-red-700'
                      }`}>
                        {error}
                      </p>
                      {isRateLimited && timeUntilReset > 0 && (
                        <p className="mt-2 text-sm font-medium text-orange-800">
                          Time remaining: {formatTimeRemaining(timeUntilReset)}
                        </p>
                      )}
                      {shouldContactAdmin && (
                        <div className="mt-2 text-sm text-red-800">
                          <p className="font-medium">Please contact your system administrator:</p>
                          <ul className="mt-1 ml-4 list-disc space-y-1">
                            <li>Email: admin@wrapmykitchen.com</li>
                            <li>Phone: (555) 123-4567</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isRateLimited}
                className={`w-full font-medium py-3 px-4 rounded-md transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRateLimited 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing In...
                  </div>
                ) : isRateLimited ? (
                  <div className="flex items-center justify-center">
                    <i className="fas fa-clock mr-2"></i>
                    Account Locked
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setShowSignupModal(true)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign up
                  </button>
                </span>
              </div>

              {/* Debug Info */}
              
            </form>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <i className="fas fa-info-circle text-green-600 text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Account Registration
              </h3>
              <p className="text-gray-600 mb-6">
                Please reach out to the website administrator to create a new account.
              </p>
              <button
                onClick={() => setShowSignupModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

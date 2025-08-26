import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import wmkLogo from '@/assets/wmk-logo.png';

export default function Login() {
  const [username, setUsername] = useState('kim');
  const [password, setPassword] = useState('password');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    
    if (success) {
      setLocation('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="text-center max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src={wmkLogo} 
                alt="Wrap My Kitchen Logo" 
                className="h-24 w-auto mx-auto filter brightness-0 invert"
              />
            </div>
            
            {/* Brand Text */}
            <h1 className="text-4xl font-bold mb-4">
              Wrap My Kitchen
            </h1>
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
            {/* Back Link */}
            <div className="mb-6">
              <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to login options
              </button>
            </div>

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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400 text-sm"></i>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <i className="fas fa-eye-slash text-gray-400 cursor-pointer hover:text-gray-600 text-sm"></i>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <i className="fas fa-exclamation-circle text-red-400 mr-2 mt-0.5 text-sm"></i>
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing In...
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
              <div className="text-center mt-4">
                <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
                  <strong>Test Accounts:</strong><br />
                  kim, patrick, lina (password: password)
                </div>
              </div>
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
  );
}

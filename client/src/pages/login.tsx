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
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card login-card">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center mb-3">
                    <img 
                      src={wmkLogo} 
                      alt="Wrap My Kitchen Logo" 
                      style={{ height: '80px', width: 'auto' }}
                      data-testid="logo-image"
                    />
                  </div>
                  <p className="text-muted" data-testid="app-subtitle">Lead Management CRM</p>
                </div>
                
                <form onSubmit={handleSubmit} data-testid="login-form">
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        data-testid="input-username"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-testid="input-password"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      data-testid="checkbox-remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" data-testid="error-message">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                    data-testid="button-login"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>Login
                      </>
                    )}
                  </button>
                  
                  <div className="text-center mt-3">
                    <small className="text-muted" data-testid="help-text">
                      Default users: kim, patrick, lina (password: password)
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ 
    success: boolean; 
    error?: string;
    rateLimited?: boolean;
    timeUntilReset?: number;
    shouldContactAdmin?: boolean;
  }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('crm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Validate user status periodically if logged in
    if (user) {
      const validateUserStatus = async () => {
        try {
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username }),
          });

          if (!response.ok) {
            // User is no longer valid (inactive or deleted)
            logout();
          }
        } catch (error) {
          console.error('User validation error:', error);
          // On network error, don't logout - just log the error
        }
      };

      // Don't check immediately to avoid blocking page load
      // Check after 2 seconds to allow page to load first
      const initialTimeout = setTimeout(validateUserStatus, 2000);

      // Check every 5 minutes after that
      const interval = setInterval(validateUserStatus, 5 * 60 * 1000);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<{ 
    success: boolean; 
    error?: string;
    rateLimited?: boolean;
    timeUntilReset?: number;
    shouldContactAdmin?: boolean;
  }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('crm_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Login failed',
          rateLimited: errorData.rateLimited || false,
          timeUntilReset: errorData.timeUntilReset,
          shouldContactAdmin: errorData.shouldContactAdmin || false
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
    localStorage.clear(); // Clear all localStorage to ensure clean state
    window.location.reload(); // Force page reload to clear any cached state
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

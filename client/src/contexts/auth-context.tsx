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
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // No valid session
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Validate user status periodically if logged in
    // NOTE: Validation is disabled to prevent infinite loops from stale localStorage
    // Users will need to log in again if their session becomes invalid
    // This can be re-enabled once we implement proper session tokens
    /*
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

      // Check every 5 minutes
      const interval = setInterval(validateUserStatus, 5 * 60 * 1000);

      return () => {
        clearInterval(interval);
      };
    }
    */
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
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null); // Clear user state regardless of API response
    }
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

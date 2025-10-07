import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { MobileProvider, useMobile } from "@/contexts/mobile-context";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { hasPermission } from "@/lib/permissions";
import React, { useState, useEffect, lazy, Suspense } from "react";

// Lazy load the mobile dashboard for better performance
const MobileDashboard = lazy(() => import("@/pages/mobile-dashboard-new"));

// Utility function
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import AddLead from "@/pages/add-lead";
import Followups from "@/pages/followups";
import SampleBooklets from "@/pages/sample-booklets";
import Installations from "@/pages/installations";
import Reports from "@/pages/reports";
import CalendarPage from "@/pages/calendar";
import AdminDashboard from "@/pages/admin-dashboard";
import UserManagement from "@/pages/user-management";
import InstallersManagement from "@/pages/admin/installers-management";

import EmailTemplatesManagement from "@/pages/admin/email-templates-management";
import SMTPSettingsManagement from "@/pages/admin/smtp-settings-management";
import ActivityLogManagement from "@/pages/admin/activity-log-management";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Check if user has permission for the current route
  if (!hasPermission(user, location)) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <i className="fas fa-lock fa-3x text-danger mb-3"></i>
          <h4>Access Denied</h4>
          <p className="text-muted">You don't have permission to access this page.</p>
          <p className="text-muted small">Debug: User {user.username}, Role: {user.role}, Route: {location}</p>
          <p className="text-muted small">Permissions: {Array.isArray(user.permissions) ? user.permissions.join(', ') : 'Invalid permissions data'}</p>
          <button 
            className="btn btn-danger mt-3 me-2"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            Clear Cache & Login
          </button>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isDashboard = location === '/dashboard';
  
  // Import the useMobile hook
  const { isMobile } = useMobile();

  return (
    <div className="app-layout">
      {/* Only show sidebar on desktop */}
      {!isMobile && <Sidebar />}
      
      {/* Main content with adjusted padding for mobile */}
      <main className={`main-content ${isMobile ? 'mobile-content' : ''}`}>
        {isDashboard && (
          <div className="content-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="user-menu">
              </div>
            </div>
          </div>
        )}
        <div className={`${isMobile ? 'p-2 pb-24' : 'p-4'}`}>
          {children}
        </div>
      </main>
      
      {/* Mobile Navigation - only visible on mobile */}
      {isMobile && <MobileNavigation />}
    </div>
  );
}

function AppRouter() {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  
  // Function to determine if we should show the mobile dashboard
  const shouldUseMobileDashboard = () => {
    try {
      const ua = navigator.userAgent.toLowerCase();
      
      // Improved detection for Safari on iOS
      const isIOS = /iphone|ipod|ipad/.test(ua) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Safari detection
      const isSafari = /safari/.test(ua) && !/chrome/.test(ua) && !/chromium/.test(ua);
      
      // Mobile Safari specific detection
      const isMobileSafari = isSafari && (isIOS || /mobile/.test(ua));
      
      // Extra check for iOS devices with potential WebKit issues
      const hasWebKitIssues = /iphone|ipod|ipad/.test(ua) && /version\/1[56]/.test(ua);
      
      // Log for debugging in development only
      if (process.env.NODE_ENV === 'development') {
        console.log("Mobile detection:", { 
          isIOS, 
          isSafari, 
          isMobileSafari, 
          hasWebKitIssues,
          userAgent: ua,
          isMobileContext: isMobile
        });
      }
      
      // ONLY use the ultra-simplified mobile dashboard for devices with 
      // known severe compatibility issues (older iOS Safari versions)
      if (hasWebKitIssues) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Using ultra-simplified mobile dashboard for older iOS Safari");
        }
        return true;
      }
      
      // For all other devices, including modern Safari on iOS, 
      // use the regular dashboard with conditional components
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error in mobile detection:", error);
      }
      // Default to desktop experience if detection fails
      return false;
    }
  };
  
  // Log mobile detection for debugging in development only
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    if (process.env.NODE_ENV === 'development') {
      console.log("User agent:", ua);
      console.log("Is mobile (from context):", isMobile);
    }
    
    // Additional detection for Safari mobile specifically
    const isSafari = /safari/.test(ua) && !/chrome/.test(ua) && !/chromium/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMobileSafari = isSafari && (isIOS || /mobile/.test(ua));
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Is mobile Safari specifically:", isMobileSafari);
    }
    
    // Force mobile dashboard for Safari mobile
    if (isMobileSafari && process.env.NODE_ENV === 'development') {
      console.log("Forcing mobile dashboard for Safari mobile");
      // Do nothing here, we'll handle this in the route
    }
  }, [isMobile]);

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          {shouldUseMobileDashboard() ? (
            <Suspense fallback={<div className="p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading mobile dashboard...</span>
              </div>
              <p className="mt-2">Loading mobile dashboard...</p>
            </div>}>
              <MobileDashboard />
            </Suspense>
          ) : (
            <Dashboard />
          )}
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/user-management">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/installers">
        <ProtectedRoute>
          <InstallersManagement />
        </ProtectedRoute>
      </Route>
      

      
      <Route path="/admin/email-templates">
        <ProtectedRoute>
          <EmailTemplatesManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/smtp-settings">
        <ProtectedRoute>
          <SMTPSettingsManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/activity">
        <ProtectedRoute>
          <ActivityLogManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/leads">
        <ProtectedRoute>
          <Leads />
        </ProtectedRoute>
      </Route>
      
      <Route path="/add-lead">
        <ProtectedRoute>
          <AddLead />
        </ProtectedRoute>
      </Route>
      
      <Route path="/followups">
        <ProtectedRoute>
          <Followups />
        </ProtectedRoute>
      </Route>
      
      <Route path="/sample-booklets">
        <ProtectedRoute>
          <SampleBooklets />
        </ProtectedRoute>
      </Route>
      
      <Route path="/installations">
        <ProtectedRoute>
          <Installations />
        </ProtectedRoute>
      </Route>
      
      <Route path="/calendar">
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <MobileProvider>
            <Toaster />
            <AppRouter />
          </MobileProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

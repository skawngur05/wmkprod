import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { hasPermission } from "@/lib/permissions";

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
          <p className="text-muted small">Permissions: {user.permissions?.join(', ') || 'None'}</p>
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

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {isDashboard && (
          <div className="content-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark">Welcome back, {user ? capitalizeFirst(user.username) : 'User'}</h5>
              <div className="user-menu">
                <span className="text-muted">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}

function AppRouter() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to={(user.role === 'admin' || user.role === 'administrator') ? '/admin' : '/dashboard'} /> : <Login />}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
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
      
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        <Redirect to={user?.role === 'admin' ? '/admin' : '/dashboard'} />
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
          <Toaster />
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

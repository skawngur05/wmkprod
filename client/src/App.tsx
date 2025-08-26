import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/layout/sidebar";

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
        {user ? <Redirect to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />}
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

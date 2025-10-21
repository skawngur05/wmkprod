import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { capitalizeFirst, formatCurrency, formatDate, getStatusColor, getOriginColor } from '@/lib/auth';
import { forceRefreshData, noCacheHeaders, addCacheBuster } from '@/lib/cache-control';
import { Lead } from '@shared/schema';
import { useState, useEffect } from 'react';
import { QuickEditModal } from '@/components/modals/quick-edit-modal';
import { BusinessCalendar } from '@/components/calendar/BusinessCalendar';
import { useToast } from '@/hooks/use-toast';

// Safari compatibility check - improved detection
const isSafari = () => {
  try {
    // More comprehensive Safari detection including mobile
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariDesktop = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/chromium/.test(userAgent);
    const isSafariMobile = /safari/.test(userAgent) && /mobile/.test(userAgent) && !/chrome/.test(userAgent);
    const isWebKit = /webkit/.test(userAgent) && !/chrome/.test(userAgent);
    
    return isSafariDesktop || isSafariMobile || isWebKit;
  } catch (e) {
    return false;
  }
};

// Separate detection for mobile Safari specifically - ONLY returns true for iOS devices
const isMobileSafariOnly = () => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    // Updated detection that doesn't rely on deprecated navigator.platform
    const isIOS = /iphone|ipod|ipad/.test(userAgent) || 
                 (typeof navigator.maxTouchPoints !== 'undefined' && 
                  navigator.maxTouchPoints > 1 && 
                  /macintosh/i.test(userAgent));
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/chromium/.test(userAgent);
    
    // Return true for ANY Safari on iOS, mobile or not
    return isIOS && isSafari;
  } catch (e) {
    return false;
  }
};

// Mobile debug console for Safari
const MobileDebugConsole = ({ logs }: { logs: string[] }) => {
  // Empty implementation, no debugging needed
  return null;
};

// Error boundary for Safari compatibility
const SafeRender = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Safari compatibility error:', event.error);
      setErrorDetails(`Error: ${event.error?.message || 'Unknown error'} at ${event.filename}:${event.lineno}`);
      setHasError(true);
      // Prevent the error from propagating
      event.preventDefault();
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Safely log the error reason
      const reason = event.reason ? 
        (typeof event.reason === 'string' ? 
          event.reason : 
          (event.reason.message || 'Unknown rejection reason')) 
        : 'Undefined rejection reason';
      
      console.error('Promise rejection:', reason);
      setErrorDetails(`Promise rejection: ${reason}`);
      setHasError(true);
      // Prevent the error from propagating
      event.preventDefault();
    };
    
    // Additional error catching for React errors
    const handleReactError = (error: Error, errorInfo: any) => {
      console.error('React error caught:', error, errorInfo);
      setErrorDetails(`React error: ${error.message}`);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  if (hasError) {
    return fallback || <div className="alert alert-danger">
      <i className="fas fa-exclamation-triangle me-2"></i>
      Content temporarily unavailable for this browser.
      {isSafari() && <div className="mt-2 small">
        <strong>Safari detected:</strong> Some features may not be fully compatible.
      </div>}
      {errorDetails && <div className="mt-2 small">
        <strong>Error details:</strong> {errorDetails}
      </div>}
      <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>;
  }
  
  return <>{children}</>;
};

interface DashboardStats {
  totalLeads: number;
  soldLeads: number;
  soldToday: number;
  todayFollowups: number;
  newToday: number;
}

export default function Dashboard() {
  const [debugLogs] = useState<string[]>([]);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // More accurate detection of mobile Safari specifically (not desktop Safari)
  const isMobileSafari = isMobileSafariOnly();
  
  // Animation effect - stagger the appearance of different sections
  useEffect(() => {
    // Skip animations on Safari to test if they're causing the issue
    if (isMobileSafari) {
      setAnimationStep(10); // Set to max to show all content immediately
      return;
    }
    
    // Add a small delay if user just logged in (fresh page load)
    const isNewLogin = !sessionStorage.getItem('dashboard_visited');
    const initialDelay = isNewLogin ? 300 : 0;
    
    if (isNewLogin) {
      sessionStorage.setItem('dashboard_visited', 'true');
    }

    const timer1 = setTimeout(() => setAnimationStep(1), initialDelay + 100);
    const timer2 = setTimeout(() => setAnimationStep(2), initialDelay + 300);
    const timer3 = setTimeout(() => setAnimationStep(3), initialDelay + 500);
    const timer4 = setTimeout(() => setAnimationStep(4), initialDelay + 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats', user?.username],
    queryFn: async () => {
      try {
        // Use current timestamp for aggressive cache busting
        const timestamp = new Date().getTime();
        const url = `/api/dashboard/stats?username=${encodeURIComponent(user?.username || '')}&nocache=${timestamp}&date=${new Date().toISOString().split('T')[0]}`;
        const response = await fetch(url, {
          headers: {
            ...noCacheHeaders,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Cache-Bust': timestamp.toString()
          }
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        // Return a fallback object with empty/zero values
        return {
          totalLeads: 0,
          soldLeads: 0,
          soldToday: 0,
          todayFollowups: 0,
          newToday: 0
        };
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data (updated from cacheTime)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 15000, // Refetch every 15 seconds (reduced from 30s)
    meta: {
      errorMessage: 'Failed to load dashboard statistics'
    }
  });

  // Force refetch stats when dashboard mounts to ensure real-time updates
  useEffect(() => {
    // Use our stronger cache-busting approach
    forceRefreshData(user?.username);
    
    // Additional browser cache clearing
    if (typeof window !== 'undefined') {
      // Clear any service worker cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            if (registration.active) {
              registration.active.postMessage({ type: 'CLEAR_CACHE' });
            }
          });
        });
      }
    }
    
    refetchStats();
    
    // Also refetch when the page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        forceRefreshData(user?.username);
        refetchStats();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchStats, user?.username]);

  const { data: leadsResponse, isLoading: leadsLoading, error: leadsError } = useQuery<{
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ['/api/leads', 1, 10, user?.username], // Get first page with 10 leads for dashboard
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '10');
        if (user?.username) params.append('username', user.username);
        
        const response = await fetch(`/api/leads?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    meta: {
      errorMessage: 'Failed to load recent leads'
    }
  });

  const { data: followupsData, isLoading: followupsLoading, error: followupsError } = useQuery<{
    overdue: Lead[];
    dueToday: Lead[];
    upcoming: Lead[];
    overdueCount?: number;
    dueTodayCount?: number;
    upcomingCount?: number;
    totalPending?: number;
  }>({
    queryKey: ['/api/followups', user?.username],
    queryFn: async () => {
      try {
        // Use current timestamp for aggressive cache busting
        const timestamp = new Date().getTime();
        const url = `/api/followups?username=${encodeURIComponent(user?.username || '')}&nocache=${timestamp}&date=${new Date().toISOString().split('T')[0]}`;
        const response = await fetch(url, {
          headers: {
            ...noCacheHeaders,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Cache-Bust': timestamp.toString()
          }
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        // Return a fallback object with empty arrays
        return {
          overdue: [],
          dueToday: [],
          upcoming: [],
          overdueCount: 0,
          dueTodayCount: 0,
          upcomingCount: 0,
          totalPending: 0
        };
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 15000, // Refetch every 15 seconds
    meta: {
      errorMessage: 'Failed to load followup data'
    }
  });

  const openQuickEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setShowQuickEdit(true);
  };

  const handleStatsCardClick = (cardType: string) => {
    switch (cardType) {
      case 'total-leads':
        setLocation('/leads');
        break;
      case 'sold-leads':
        setLocation('/leads?status=sold');
        break;
      case 'today-followups':
        setLocation('/followups');
        break;
      case 'overdue':
        setLocation('/followups');
        break;
      case 'new-today':
        setLocation('/leads?filter=today');
        break;
      default:
        break;
    }
  };

  const isOverdue = (date: string | Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followupDate = new Date(date);
    return followupDate < today;
  };

  const isDueToday = (date: string | Date | null) => {
    if (!date) return false;
    const today = new Date();
    const followupDate = new Date(date);
    return (
      today.getDate() === followupDate.getDate() &&
      today.getMonth() === followupDate.getMonth() &&
      today.getFullYear() === followupDate.getFullYear()
    );
  };

  // Get recent leads safely
  const recentLeads = (leadsResponse && leadsResponse.leads && leadsResponse.leads.slice(0, 3)) || [];
  // Only include follow-ups that are actually due today, not overdue ones
  const todaysFollowups = followupsData ? [...followupsData.dueToday] : [];
  // Get overdue follow-ups
  const overdueFollowups = followupsData ? [...followupsData.overdue] : [];
  
  if (statsLoading || leadsLoading || followupsLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle any API errors gracefully
  if (statsError || leadsError || followupsError) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Dashboard temporarily unavailable</strong>
          <p className="mb-2 mt-2">Some data could not be loaded. This may be due to:</p>
          <ul className="mb-3">
            <li>Network connectivity issues</li>
            <li>Server maintenance</li>
            {isSafari() && <li>Safari browser compatibility (try Chrome/Firefox)</li>}
          </ul>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <i className="fas fa-refresh me-2"></i>Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <SafeRender fallback={
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Dashboard temporarily unavailable. Please try refreshing the page or use Chrome/Firefox.
          {isSafari() && <div className="mt-2 small">
            <strong>Safari users:</strong> For the best experience, please use Chrome or Firefox, or update to the latest Safari version.
          </div>}
        </div>
      </div>
    }>
      <style>{`
        .fade-in-up {
          opacity: ${isSafari() ? '1' : '0'};
          transform: ${isSafari() ? 'translateY(0)' : 'translateY(20px)'};
          transition: ${isSafari() ? 'none' : 'all 0.6s ease-out'};
        }

        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .stats-card {
          transition: ${isSafari() ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease'};
        }

        .stats-card:hover {
          transform: ${isSafari() ? 'none' : 'translateY(-2px)'};
          box-shadow: ${isSafari() ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'};
        }

        .dashboard-section {
          opacity: ${isSafari() ? '1' : '0'};
          transform: ${isSafari() ? 'translateY(0)' : 'translateY(30px)'};
          transition: ${isSafari() ? 'none' : 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'};
        }

        .dashboard-section.animate {
          opacity: 1;
          transform: translateY(0);
        }

        /* Smooth page entry animation */
        .container-fluid {
          animation: ${isSafari() ? 'none' : 'pageEnter 0.6s ease-out'};
        }

        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .container-fluid {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          
          .stats-card .card-body {
            padding: 0.75rem 0.5rem;
          }
          
          .stats-card h3 {
            font-size: 1.25rem;
          }
          
          .stats-card h6 {
            font-size: 0.75rem;
          }
          
          .stats-card .fa-2x {
            font-size: 1.25em !important;
          }
          
          /* Compact dashboard sections */
          .dashboard-section {
            margin-bottom: 1rem !important;
          }
          
          .card {
            margin-bottom: 1rem;
          }
          
          .card-header h5 {
            font-size: 1rem;
          }
          
          /* Table improvements for mobile */
          .table td, .table th {
            padding: 0.375rem 0.25rem;
            font-size: 0.8rem;
            line-height: 1.2;
          }
          
          .table strong {
            font-size: 0.85rem;
          }
          
          .table small {
            font-size: 0.7rem;
          }
          
          /* Follow-up items mobile improvements */
          .list-group-item {
            padding: 0.75rem 0.5rem;
          }
          
          .list-group-item h6 {
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
          }
          
          .list-group-item p {
            font-size: 0.75rem;
            margin-bottom: 0.25rem;
          }
          
          .list-group-item small {
            font-size: 0.7rem;
          }
          
          /* Mobile-friendly buttons */
          .btn-sm {
            padding: 0.25rem 0.4rem;
            font-size: 0.7rem;
          }
          
          .btn-circle {
            width: 28px;
            height: 28px;
            padding: 0;
            font-size: 0.7rem;
          }
          
          /* Better badge sizing */
          .badge {
            font-size: 0.65rem;
            padding: 0.25rem 0.4rem;
          }
          
          /* Mobile card optimizations */
          .card-footer {
            padding: 0.5rem;
          }
          
          .card-footer .btn-sm {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }
        }

        /* Extra small devices */
        @media (max-width: 576px) {
          .container-fluid {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          h1.h3 {
            font-size: 1.5rem !important;
          }
          
          .stats-card .card-body {
            padding: 0.5rem 0.375rem;
          }
          
          .stats-card h3 {
            font-size: 1.1rem;
          }
          
          .stats-card h6 {
            font-size: 0.7rem;
            line-height: 1.1;
          }
          
          .stats-card .fa-2x {
            font-size: 1.1em !important;
          }
          
          /* Ultra compact table for mobile */
          .table {
            font-size: 0.75rem;
          }
          
          .table td, .table th {
            padding: 0.25rem 0.125rem;
            vertical-align: middle;
          }
          
          .table strong {
            font-size: 0.8rem;
          }
          
          /* Single column layout for very small screens */
          .mobile-stack-xs {
            flex-direction: column;
          }
          
          .mobile-stack-xs > * {
            margin-bottom: 0.5rem;
          }
          
          /* Calendar mobile adjustments */
          .card-body {
            padding: 0.75rem 0.5rem;
          }
          
          /* Action buttons row layout */
          .d-flex.justify-content-between {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .text-end {
            text-align: left !important;
          }
          
          .text-end .btn {
            margin-right: 0.25rem;
          }
        }

        /* Landscape phone orientation */
        @media (max-width: 768px) and (orientation: landscape) {
          .stats-card .card-body {
            padding: 0.5rem;
          }
          
          .stats-card h3 {
            font-size: 1rem;
          }
          
          .stats-card .fa-2x {
            font-size: 1em !important;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .stats-card {
            transition: none;
          }
          
          .stats-card:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
          }
          
          .btn:active {
            transform: scale(0.95);
          }
        }
      `}</style>
      
      <div className="container-fluid py-4">
        
        {/* Welcome Section - Responsive */}
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4 mb-6 dashboard-section ${animationStep >= 1 ? 'animate' : ''}`}>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1" data-testid="dashboard-welcome">
              Welcome back, {user ? capitalizeFirst(user.username) : 'User'}! 👋
            </h1>
            <p className="text-sm md:text-base text-muted" data-testid="dashboard-subtitle">
              Here's your business overview for today
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-outline-primary btn-sm flex items-center gap-2"
              onClick={() => {
                forceRefreshData(user?.username);
                refetchStats();
                window.location.reload();
              }}
              title="Force refresh all data"
              data-testid="button-refresh-dashboard"
            >
              <i className="fas fa-sync-alt"></i>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards - Improved Responsive Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6 dashboard-section ${animationStep >= 2 ? 'animate' : ''}`}>
          {/* Total Leads Card */}
          <div 
            className="card stats-card clickable-card bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="stat-total-leads"
            onClick={() => handleStatsCardClick('total-leads')}
            title="Click to view all leads"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h6 className="text-xs md:text-sm text-muted font-medium uppercase tracking-wide">
                      Total Leads
                    </h6>
                    <i className="fas fa-external-link-alt text-[10px] opacity-50"></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-primary mb-1">{(stats && stats.totalLeads) || 0}</h3>
                  <p className="text-xs text-muted">All leads in system</p>
                </div>
                <div className="text-primary/20 dark:text-primary/30">
                  <i className="fas fa-users text-3xl md:text-4xl"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sold Today Card */}
          <div 
            className="card stats-card clickable-card bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-green-200 dark:border-green-800 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="stat-sold-leads"
            onClick={() => handleStatsCardClick('sold-leads')}
            title="Click to view leads sold today"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h6 className="text-xs md:text-sm text-muted font-medium uppercase tracking-wide">
                      Sold Today
                    </h6>
                    <i className="fas fa-external-link-alt text-[10px] opacity-50"></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-success mb-1">{(stats && stats.soldToday) || 0}</h3>
                  <p className="text-xs text-muted">Closed deals</p>
                </div>
                <div className="text-success/20 dark:text-success/30">
                  <i className="fas fa-handshake text-3xl md:text-4xl"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Due Today Card */}
          <div 
            className="card stats-card clickable-card bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="stat-today-followups"
            onClick={() => handleStatsCardClick('today-followups')}
            title="Click to view follow-ups due today (not including overdue)"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h6 className="text-xs md:text-sm text-muted font-medium uppercase tracking-wide">
                      Due Today
                    </h6>
                    <i className="fas fa-external-link-alt text-[10px] opacity-50"></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-warning mb-1">
                    {(() => {
                      if (followupsData && Array.isArray(followupsData.dueToday)) {
                        return followupsData.dueToday.length;
                      }
                      else if (followupsData && typeof followupsData.dueTodayCount === 'number') {
                        return followupsData.dueTodayCount;
                      }
                      return 0;
                    })()}
                  </h3>
                  <p className="text-xs text-muted">Follow-ups today</p>
                </div>
                <div className="text-warning/20 dark:text-warning/30">
                  <i className="fas fa-calendar-day text-3xl md:text-4xl"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overdue Card */}
          <div 
            className="card stats-card clickable-card bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 border-red-200 dark:border-red-800 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="stat-overdue"
            onClick={() => handleStatsCardClick('overdue')}
            title="Click to view overdue follow-ups"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h6 className="text-xs md:text-sm text-muted font-medium uppercase tracking-wide">
                      Overdue
                    </h6>
                    <i className="fas fa-external-link-alt text-[10px] opacity-50"></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-danger mb-1">
                    {(() => {
                      if (followupsData && Array.isArray(followupsData.overdue)) {
                        return followupsData.overdue.length;
                      }
                      else if (followupsData && typeof followupsData.overdueCount === 'number') {
                        return followupsData.overdueCount;
                      }
                      return 0;
                    })()}
                  </h3>
                  <p className="text-xs text-muted">Needs attention</p>
                </div>
                <div className="text-danger/20 dark:text-danger/30">
                  <i className="fas fa-exclamation-circle text-3xl md:text-4xl"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* New Today Card - Hidden on mobile, shows on lg+ */}
          <div 
            className="card stats-card clickable-card bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-gray-800 border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-all cursor-pointer hidden lg:block" 
            data-testid="stat-new-today"
            onClick={() => handleStatsCardClick('new-today')}
            title="Click to view today's new leads"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h6 className="text-xs md:text-sm text-muted font-medium uppercase tracking-wide">
                      New Today
                    </h6>
                    <i className="fas fa-external-link-alt text-[10px] opacity-50"></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-info mb-1">{(stats && stats.newToday) || 0}</h3>
                  <p className="text-xs text-muted">Fresh leads</p>
                </div>
                <div className="text-info/20 dark:text-info/30">
                  <i className="fas fa-plus-circle text-3xl md:text-4xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Business Calendar Section - Mobile Friendly Navigation */}
      {!isMobileSafari && (
        <div className={`row mb-4 dashboard-section ${animationStep >= 4 ? 'animate' : ''}`}>
          <div className="col-12">
            <div className="card" data-testid="business-calendar-section">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>Business Calendar
                </h5>
              </div>
              <div className="card-body">
                {/* For mobile: Show calendar navigation button */}
                {window.innerWidth < 768 ? (
                  <div className="text-center py-3">
                    <p className="mb-3">View your full business calendar to manage all upcoming events and appointments.</p>
                    <button
                      className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
                      onClick={() => setLocation('/calendar')}
                    >
                      <i className="fas fa-calendar-alt me-2"></i>
                      Open Calendar View
                    </button>
                  </div>
                ) : (
                  /* For desktop: Show embedded mini calendar */
                  <BusinessCalendar mode="mini" height="400px" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`row dashboard-section ${animationStep >= 3 ? 'animate' : ''}`}>
        {/* Overdue Follow-ups */}
        {overdueFollowups.length > 0 && (
          <div className="col-12 col-md-6 col-lg-6 mb-4">
            <div className="card border-danger" data-testid="overdue-followups">
              <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>Overdue Follow-ups
                </h5>
                <span className="badge bg-light text-danger">{overdueFollowups.length} overdue</span>
              </div>
              <div className="card-body p-0">
                {overdueFollowups.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <i className="fas fa-check-circle fa-3x mb-3"></i>
                    <p>No overdue follow-ups!</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {overdueFollowups.slice(0, 3).map((lead) => (
                      <div
                        key={lead.id}
                        className="list-group-item follow-up-overdue"
                        data-testid={`overdue-item-${lead.id}`}
                      >
                        <div className="d-flex justify-content-between align-items-start flex-wrap">
                          <div className="flex-grow-1 me-2">
                            <h6 className="mb-1 text-danger">{lead.name}</h6>
                            <p className="mb-1 text-muted small">Phone: {lead.phone}</p>
                            <small className="text-danger">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Overdue
                            </small>
                          </div>
                          <div className="d-flex gap-2 mt-2 mt-sm-0">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openQuickEdit(lead)}
                              data-testid={`button-edit-overdue-${lead.id}`}
                            >
                              <i className="fas fa-edit"></i>
                              <span className="d-none d-sm-inline ms-1">Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer text-center">
                <a href="/followups" className="btn btn-outline-danger btn-sm" data-testid="view-all-overdue">
                  View All Overdue Follow-ups <i className="fas fa-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Due Today Follow-ups */}
        <div className={`col-12 ${overdueFollowups.length > 0 ? 'col-md-6' : 'col-md-6'} col-lg-6 mb-4`}>
          <div className="card" data-testid="todays-followups">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>Due Today
              </h5>
              <span className="badge bg-warning">{todaysFollowups.length} pending</span>
            </div>
            <div className="card-body p-0">
              {todaysFollowups.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-check-circle fa-3x mb-3"></i>
                  <p>No follow-ups due today!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {todaysFollowups.slice(0, 3).map((lead) => (
                    <div
                      key={lead.id}
                      className={`list-group-item ${
                        isOverdue(lead.next_followup_date) ? 'follow-up-overdue' :
                        isDueToday(lead.next_followup_date) ? 'follow-up-today' : ''
                      }`}
                      data-testid={`followup-item-${lead.id}`}
                    >
                      <div className="d-flex justify-content-between align-items-start flex-wrap">
                        <div className="flex-grow-1 me-2">
                          <h6 className="mb-1">{lead.name}</h6>
                          <p className="mb-1 text-muted small">Phone: {lead.phone}</p>
                          <small className={
                            isOverdue(lead.next_followup_date) ? 'text-danger' : 
                            isDueToday(lead.next_followup_date) ? 'text-warning' : 'text-success'
                          }>
                            <i className={`fas ${
                              isOverdue(lead.next_followup_date) ? 'fa-exclamation-triangle' :
                              isDueToday(lead.next_followup_date) ? 'fa-clock' : 'fa-check'
                            } me-1`}></i>
                            {isOverdue(lead.next_followup_date) ? 'Overdue' :
                             isDueToday(lead.next_followup_date) ? 'Due today' : 'Scheduled'}
                          </small>
                        </div>
                        <div className="d-flex gap-2 mt-2 mt-sm-0">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openQuickEdit(lead)}
                            data-testid={`button-edit-${lead.id}`}
                          >
                            <i className="fas fa-edit"></i>
                            <span className="d-none d-sm-inline ms-1">Edit</span>
                          </button>
                          <button className="btn btn-sm btn-outline-success" data-testid={`button-call-${lead.id}`}>
                            <i className="fas fa-phone"></i>
                            <span className="d-none d-sm-inline ms-1">Call</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer text-center">
              <a href="/followups" className="btn btn-outline-primary btn-sm" data-testid="view-all-followups">
                View All Follow-ups <i className="fas fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className={`col-12 ${overdueFollowups.length > 0 ? 'col-md-6' : 'col-md-6'} col-lg-6 mb-4`}>
          <div className="card" data-testid="recent-leads">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>Recent Leads (Last 7 Days)
              </h5>
              <span className="badge bg-info">{recentLeads.length} new</span>
            </div>
            <div className="card-body p-0">
              {recentLeads.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-inbox fa-3x mb-3"></i>
                  <p>No recent leads</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th className="d-none d-sm-table-cell">Origin</th>
                        <th>Status</th>
                        <th className="d-none d-md-table-cell">Amount</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads.map((lead) => (
                        <tr key={lead.id} data-testid={`recent-lead-${lead.id}`}>
                          <td>
                            <div>
                              <strong className="d-block">{lead.name}</strong>
                              <small className="text-muted d-block">{lead.phone}</small>
                            </div>
                          </td>
                          <td className="d-none d-sm-table-cell">
                            {(() => {
                              const originColors = getOriginColor(lead.lead_origin);
                              return (
                                <div
                                  style={{
                                    backgroundColor: originColors.backgroundColor,
                                    color: originColors.color,
                                    border: `1px solid ${originColors.borderColor}`,
                                    borderRadius: '9999px',
                                    padding: '0.125rem 0.625rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {lead.lead_origin.replace('-', ' ')}
                                </div>
                              );
                            })()}
                          </td>
                          <td>
                            {(() => {
                              const status = lead.remarks;
                              let bgColor = '';
                              let textColor = '';
                              
                              switch (status) {
                                case 'Sold':
                                  bgColor = '#22c55e';  // Green
                                  textColor = '#ffffff';
                                  break;
                                case 'In Progress':
                                  bgColor = '#f59e0b';  // Yellow/orange
                                  textColor = '#ffffff';
                                  break;
                                case 'New':
                                  bgColor = '#3b82f6';  // Blue
                                  textColor = '#ffffff';
                                  break;
                                case 'Not Interested':
                                  bgColor = '#6b7280';  // Gray
                                  textColor = '#ffffff';
                                  break;
                                case 'Not Service Area':
                                  bgColor = '#ea580c';  // Orange
                                  textColor = '#ffffff';
                                  break;
                                case 'Not Compatible':
                                  bgColor = '#dc2626';  // Red
                                  textColor = '#ffffff';
                                  break;
                                default:
                                  bgColor = '#6b7280';  // Gray
                                  textColor = '#ffffff';
                              }
                              
                              return (
                                <div
                                  style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    borderRadius: '9999px',
                                    padding: '0.125rem 0.625rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  {status}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="d-none d-md-table-cell">
                            {lead.project_amount ? formatCurrency(lead.project_amount) : '-'}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-circle btn-outline-primary btn-sm"
                              onClick={() => openQuickEdit(lead)}
                              data-testid={`button-quick-edit-${lead.id}`}
                              title="Edit Lead"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer text-center">
              <a href="/leads" className="btn btn-outline-primary btn-sm" data-testid="view-all-leads">
                View All Leads <i className="fas fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {selectedLead && (
        <QuickEditModal
          lead={selectedLead}
          show={showQuickEdit}
          onHide={() => setShowQuickEdit(false)}
          onSave={() => {
            setShowQuickEdit(false);
            // Refresh data would happen here
          }}
        />
      )}
      </div>
      
      {/* Removed MobileDebugConsole */}
    </SafeRender>
  );
}

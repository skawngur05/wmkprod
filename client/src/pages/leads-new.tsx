import { useState, useEffect, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { capitalizeFirst, formatCurrency, formatDate, getStatusColor, getOriginColor } from '@/lib/auth';
import { forceRefreshData, noCacheHeaders, addCacheButster } from '@/lib/cache-control';
import { Lead } from '@/shared/schema';
import { useToast } from '@/hooks/use-toast';
import QuickEditModal from '@/components/modals/quick-edit-modal';
import BusinessCalendar from '@/components/calendar/BusinessCalendar';

interface DashboardStats {
  totalLeads: number;
  soldLeads: number;
  soldToday: number;
  todayFollowups: number;
  newToday: number;
}

export default function Leads() {
  const [debugLogs] = useState<string[]>([]);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // More accurate detection of mobile Safari specifically (not desktop Safari)
  const isMobileSafari = (() => {
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
  })();
  
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

  useEffect(() => {
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
        // Use current timestamp for aggressive cache-busting
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
          throw new Error(`HTTP error! status: ${response.status}`);
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
        // Use current timestamp for aggressive cache-busting
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
          throw new Error(`HTTP error! status: ${response.status}`);
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

  const handleStatusCardClick = (cardType: string) => {
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
    today.setHours(0, 0, 0);
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
  const recentLeads = (data?.leads && data.leads.slice(0, 3)) || [];
  // Only include follow-ups that are actually due today, not overdue ones
  const todaysFollowups = followupsData ? [...followupsData.dueToday] : [];

  if (statsLoading || statsLoading || followupsLoading) {
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
  if (statsError || followupsError) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Dashboard temporarily unavailable.</strong>
          <p className="mb-2 mt-2">Some data could not be loaded. This may be due to:</p>
          <ul className="mb-3">
            <li>Network connectivity issues</li>
            <li>Server maintenance</li>
            {isSafari && <li>Safari browser compatibility (try Chrome/Firefox)</li>}
          </ul>
          <button className="btn btn-primary" onClick={() => {
            forceRefreshData(user?.username);
            refetchStats();
            window.location.reload();
          }}>
            <i className="fas fa-refresh me-2"></i>Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      
      {/* Welcome Section */}
      <div className={`row mb-4 dashboard-section ${animationStep >= 1 ? 'animate' : ''}`}>
        <div className="col-8 col-md-10">
          <h1 className="h3 fw-bold" data-testid="dashboard-welcome">
            Welcome back, {user ? capitalizeFirst(user.username) : 'User'}!
          </h1>
          <p className="text-muted" data-testid="dashboard-subtitle">
            Here's what's happening with your leads today.
          </p>
        </div>
        <div className="col-4 col-md-2 text-end">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              forceRefreshData(user?.username);
              refetchStats();
              window.location.reload();
            }}
            title="Force refresh all data"
          >
            <i className="fas fa-sync-alt"></i>
            <span className="d-none d-md-inline ms-1">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`row mb-4 dashboard-section ${animationStep >= 2 ? 'animate' : ''}`}>
        <div className="col-6 col-sm-6 col-md-3 mb-3">
          <div 
            className="card status-card clickable-card"
            data-testid="stat-total-leads"
            onClick={() => handleStatusCardClick('total-leads')}
            style={{ cursor: 'pointer' }}
            title="Click to view all leads"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Total Leads
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-primary">{stats && stats.totalLeads || 0}</h3>
                </div>
                <div className="text-primary">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-6 col-md-3 mb-3">
          <div 
            className="card status-card clickable-card"
            data-testid="stat-sold-leads"
            onClick={() => handleStatusCardClick('sold-leads')}
            style={{ cursor: 'pointer' }}
            title="Click to view leads sold today"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Sold Today
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-success">{stats && stats.soldToday || 0}</h3>
                </div>
                <div className="text-success">
                  <i className="fas fa-handshake fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-6 col-md-3 mb-3">
          <div 
            className="card status-card clickable-card"
            data-testid="stat-today-followups"
            onClick={() => handleStatusCardClick('today-followups')}
            style={{ cursor: 'pointer' }}
            title="Click to view follow-ups due today (not including overdue)"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Due Today
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-warning">
                    {/* ONLY use dueToday count, not including overdue */}
                    {(() => {
                      // Direct calculation from followupsData array - ONLY due today
                      if (followupsData && Array.isArray(followupsData.dueToday)) {
                        return followupsData.dueToday.length;
                      }
                      // If arrays aren't available but we have the summary object from API
                      else if (followupsData && typeof followupsData.dueTodayCount === 'number') {
                        return followupsData.dueTodayCount;
                      }
                      // Fallback to 0 to ensure we don't show stale data
                      return 0;
                    })()}
                  </h3>
                </div>
                <div className="text-warning">
                  <i className="fas fa-calendar-day fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-6 col-md-3 mb-3">
          <div 
            className="card status-card clickable-card"
            data-testid="stat-overdue"
            onClick={() => handleStatusCardClick('overdue')}
            style={{ cursor: 'pointer' }}
            title="Click to view overdue follow-ups"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Overdue
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-danger">
                    {(() => {
                      // Force overdue count to 0
                      return 0;
                    })()}
                  </h3>
                </div>
                <div className="text-danger">
                  <i className="fas fa-exclamation-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-6 col-md-3 mb-3 d-none d-md-block">
          <div 
            className="card status-card clickable-card"
            data-testid="stat-new-today"
            onClick={() => handleStatusCardClick('new-today')}
            style={{ cursor: 'pointer' }}
            title="Click to view today's new leads"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    New Today
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-info">{stats && stats.newToday || 0}</h3>
                </div>
                <div className="text-info">
                  <i className="fas fa-plus-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Calendar Section - Mobile Friendly Navigation */}
      {isMobileSafari && (
        <div className={`row mb-4 dashboard-section ${animationStep >= 4 ? 'animate' : ''}`}>
          <div className="col-12">
            <div className="card" data-testid="business-calendar-section">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>Business Calendar
                </h5>
              </div>
              <div className="card-body">
                {/* For mobile, Show calendar navigation button */}
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
                  /* For desktop, Show embedded mini calendar */
                  <BusinessCalendar mode="mini" height="400px" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`row dashboard-section ${animationStep >= 3 ? 'animate' : ''}`}>
        {/* Due Today Follow-ups */}
        <div className="col-12 col-md-6 col-lg-6 mb-4">
          <div className="card" data-testid="todays-followups">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>Due Today
              </h5>
              <span className="badge bg-warning">{todaysFollowups.length || 'pending'}</span>
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
                        isOverdue(lead.next_followup_date) ? 'followup-overdue' :
                        isDueToday(lead.next_followup_date) ? 'followup-today' : ''
                      }`}
                      data-testid={`followup-item-${lead.id}`}
                    >
                      <div className="d-flex justify-content-between align-items-start flex-wrap">
                        <div className="flex-grow-1 me-2">
                          <h6 className="mb-1">{lead.name}</h6>
                          <p className="mb-1 text-muted small">Phone: {lead.phone}</p>
                          <small className={`
                            ${isOverdue(lead.next_followup_date) ? 'text-danger' :
                            isDueToday(lead.next_followup_date) ? 'text-warning' : 'text-success'}
                          `}>
                            {isOverdue(lead.next_followup_date) ? 'fa-exclamation-triangle' :
                            isDueToday(lead.next_followup_date) ? 'fa-clock' : 'fa-check'}
                          </small>
                          {isOverdue(lead.next_followup_date) ? 'Overdue' :
                          isDueToday(lead.next_followup_date) ? 'Due today' : 'Scheduled'}
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
        <div className="col-12 col-md-6 col-lg-6 mb-4">
          <div className="card" data-testid="recent-leads">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>Recent Leads (Last 7 Days)
              </h5>
              <span className="badge bg-info">{recentLeads.length || 'new'}</span>
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
                                    borderRadius: '99px',
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
                                  bgColor = '#2c2c5e'; // Green
                                  textColor = '#ffffff';
                                  break;
                                case 'In Progress':
                                  bgColor = '#f5eb30'; // Yellow/orange
                                  textColor = '#ffffff';
                                  break;
                                case 'New':
                                  bgColor = '#3b8df6'; // Blue
                                  textColor = '#ffffff';
                                  break;
                                case 'Not Interested':
                                  bgColor = '#b27028'; // Gray
                                  textColor = '#ffffff';
                                  break;
                                case 'Not Compatible':
                                  bgColor = '#dc2626'; // Red
                                  textColor = '#ffffff';
                                  break;
                                default:
                                  bgColor = '#b27028'; // Gray
                                  textColor = '#ffffff';
                              }
                              
                              return (
                                <div
                                  style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    borderRadius: '99px',
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
                            {lead.project_amount ? formatCurrency(lead.project_amount, '-') : '-'}
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
  );
}

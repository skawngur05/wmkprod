import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { capitalizeFirst, formatCurrency, formatDate, getStatusColor, getOriginColor } from '@/lib/auth';
import { Lead } from '@shared/schema';
import { useState, useEffect } from 'react';
import { QuickEditModal } from '@/components/modals/quick-edit-modal';
import { BusinessCalendar } from '@/components/calendar/BusinessCalendar';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalLeads: number;
  soldLeads: number;
  todayFollowups: number;
  newToday: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const { toast } = useToast();

  // Check for OAuth success/error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus === 'success') {
      toast({
        title: "Google Calendar Connected!",
        description: "Your Google Calendar has been successfully connected to the system.",
      });
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (authStatus === 'error') {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast]);

  // Animation effect - stagger the appearance of different sections
  useEffect(() => {
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

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: leadsResponse, isLoading: leadsLoading } = useQuery<{
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ['/api/leads', 1, 10], // Get first page with 10 leads for dashboard
    queryFn: async () => {
      const response = await fetch('/api/leads?page=1&limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      return response.json();
    }
  });

  const { data: followupsData, isLoading: followupsLoading } = useQuery<{
    overdue: Lead[];
    dueToday: Lead[];
    upcoming: Lead[];
  }>({
    queryKey: ['/api/followups'],
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

  const recentLeads = leadsResponse?.leads?.slice(0, 3) || [];
  const todaysFollowups = followupsData ? [...followupsData.overdue, ...followupsData.dueToday] : [];

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

  return (
    <>
      <style>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-out;
        }

        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .stats-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .dashboard-section {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .dashboard-section.animate {
          opacity: 1;
          transform: translateY(0);
        }

        /* Smooth page entry animation */
        .container-fluid {
          animation: pageEnter 0.6s ease-out;
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
        {/* Welcome Section */}
        <div className={`row mb-4 dashboard-section ${animationStep >= 1 ? 'animate' : ''}`}>
          <div className="col">
            <h1 className="h3 fw-bold" data-testid="dashboard-welcome">
              Welcome back, {user ? capitalizeFirst(user.username) : 'User'}!
            </h1>
            <p className="text-muted" data-testid="dashboard-subtitle">
              Here's what's happening with your leads today.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={`row mb-4 dashboard-section ${animationStep >= 2 ? 'animate' : ''}`}>
        <div className="col-6 col-sm-6 col-md-3 mb-3">
          <div 
            className="card stats-card clickable-card" 
            data-testid="stat-total-leads"
            onClick={() => handleStatsCardClick('total-leads')}
            style={{ cursor: 'pointer' }}
            title="Click to view all leads"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Total Leads
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-primary">{stats?.totalLeads || 0}</h3>
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
            className="card stats-card clickable-card" 
            data-testid="stat-sold-leads"
            onClick={() => handleStatsCardClick('sold-leads')}
            style={{ cursor: 'pointer' }}
            title="Click to view sold leads"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Sold Leads
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-success">{stats?.soldLeads || 0}</h3>
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
            className="card stats-card clickable-card" 
            data-testid="stat-today-followups"
            onClick={() => handleStatsCardClick('today-followups')}
            style={{ cursor: 'pointer' }}
            title="Click to view today's follow-ups"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    Today's Follow-ups
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-warning">{stats?.todayFollowups || 0}</h3>
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
            className="card stats-card clickable-card" 
            data-testid="stat-new-today"
            onClick={() => handleStatsCardClick('new-today')}
            style={{ cursor: 'pointer' }}
            title="Click to view today's new leads"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">
                    New Today
                    <i className="fas fa-external-link-alt ms-2" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                  </h6>
                  <h3 className="fw-bold text-info">{stats?.newToday || 0}</h3>
                </div>
                <div className="text-info">
                  <i className="fas fa-plus-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`row mb-4 dashboard-section ${animationStep >= 4 ? 'animate' : ''}`}>
        {/* Business Calendar - Full Width */}
        <div className="col-12">
          <div className="card" data-testid="business-calendar">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>Business Calendar
              </h5>
            </div>
            <div className="card-body">
              <BusinessCalendar />
            </div>
          </div>
        </div>
      </div>

      <div className={`row dashboard-section ${animationStep >= 3 ? 'animate' : ''}`}>
        {/* Today's Follow-ups */}
        <div className="col-12 col-md-6 col-lg-6 mb-4">
          <div className="card" data-testid="todays-followups">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>Today's Follow-ups
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
        <div className="col-12 col-md-6 col-lg-6 mb-4">
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
    </>
  );
}

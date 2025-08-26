import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { capitalizeFirst, formatCurrency, formatDate, getStatusColor } from '@/lib/auth';
import { Lead } from '@shared/schema';
import { useState } from 'react';
import { QuickEditModal } from '@/components/modals/quick-edit-modal';
import { BusinessCalendar } from '@/components/calendar/BusinessCalendar';

interface DashboardStats {
  totalLeads: number;
  soldLeads: number;
  todayFollowups: number;
  newToday: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);

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
    <div className="container-fluid py-4">
      <div className="row mb-4">
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
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stats-card" data-testid="stat-total-leads">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Total Leads</h6>
                  <h3 className="fw-bold text-primary">{stats?.totalLeads || 0}</h3>
                </div>
                <div className="text-primary">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card" data-testid="stat-sold-leads">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Sold Leads</h6>
                  <h3 className="fw-bold text-success">{stats?.soldLeads || 0}</h3>
                </div>
                <div className="text-success">
                  <i className="fas fa-handshake fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card" data-testid="stat-today-followups">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Today's Follow-ups</h6>
                  <h3 className="fw-bold text-warning">{stats?.todayFollowups || 0}</h3>
                </div>
                <div className="text-warning">
                  <i className="fas fa-calendar-day fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card" data-testid="stat-new-today">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">New Today</h6>
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

      <div className="row mb-4">
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

      <div className="row">
        {/* Today's Follow-ups */}
        <div className="col-lg-6 mb-4">
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
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
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
                        <div className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => openQuickEdit(lead)}
                            data-testid={`button-edit-${lead.id}`}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-success" data-testid={`button-call-${lead.id}`}>
                            <i className="fas fa-phone"></i>
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
        <div className="col-lg-6 mb-4">
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
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Origin</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads.map((lead) => (
                        <tr key={lead.id} data-testid={`recent-lead-${lead.id}`}>
                          <td>
                            <div>
                              <strong>{lead.name}</strong>
                              <br />
                              <small className="text-muted">{lead.phone}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-primary`}>
                              {lead.lead_origin}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusColor(lead.remarks)} status-badge`}>
                              {lead.remarks}
                            </span>
                          </td>
                          <td>
                            {lead.project_amount ? formatCurrency(lead.project_amount) : '-'}
                          </td>
                          <td>
                            <button
                              className="btn btn-circle btn-outline-primary btn-sm"
                              onClick={() => openQuickEdit(lead)}
                              data-testid={`button-quick-edit-${lead.id}`}
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

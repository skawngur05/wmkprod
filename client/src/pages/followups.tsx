import { useQuery } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { formatDate } from '@/lib/auth';

interface FollowupsData {
  overdue: Lead[];
  dueToday: Lead[];
  upcoming: Lead[];
}

export default function Followups() {
  const { data: followupsData, isLoading } = useQuery<FollowupsData>({
    queryKey: ['/api/followups'],
  });

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p>Loading follow-ups...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overdue = [], dueToday = [], upcoming = [] } = followupsData || {};

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 fw-bold" data-testid="followups-title">Follow-up Management</h1>
          <p className="text-muted">Track and manage all customer follow-ups</p>
        </div>
      </div>

      <div className="row">
        {/* Overdue Follow-ups */}
        <div className="col-lg-4 mb-4">
          <div className="card border-danger" data-testid="overdue-followups">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Overdue ({overdue.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {overdue.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-check-circle fa-3x mb-3"></i>
                  <p>No overdue follow-ups!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {overdue.map((lead) => (
                    <div key={lead.id} className="list-group-item" data-testid={`overdue-lead-${lead.id}`}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">{lead.name}</h6>
                          <p className="mb-1 small text-muted">{lead.phone}</p>
                          <small className="text-danger">
                            {lead.next_followup_date && 
                              Math.ceil((new Date().getTime() - new Date(lead.next_followup_date).getTime()) / (1000 * 3600 * 24))
                            } days overdue
                          </small>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          data-testid={`button-contact-overdue-${lead.id}`}
                        >
                          <i className="fas fa-phone"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Follow-ups */}
        <div className="col-lg-4 mb-4">
          <div className="card border-warning" data-testid="today-followups">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>
                Due Today ({dueToday.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {dueToday.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-calendar-check fa-3x mb-3"></i>
                  <p>No follow-ups due today!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dueToday.map((lead) => (
                    <div key={lead.id} className="list-group-item" data-testid={`today-lead-${lead.id}`}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">{lead.name}</h6>
                          <p className="mb-1 small text-muted">
                            {lead.email || lead.phone}
                          </p>
                          <small className="text-warning">Due today</small>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-warning"
                          data-testid={`button-contact-today-${lead.id}`}
                        >
                          {lead.email ? (
                            <i className="fas fa-envelope"></i>
                          ) : (
                            <i className="fas fa-phone"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="col-lg-4 mb-4">
          <div className="card border-success" data-testid="upcoming-followups">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-calendar-check me-2"></i>
                Upcoming ({upcoming.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {upcoming.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-calendar fa-3x mb-3"></i>
                  <p>No upcoming follow-ups scheduled</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {upcoming.slice(0, 10).map((lead) => (
                    <div key={lead.id} className="list-group-item" data-testid={`upcoming-lead-${lead.id}`}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">{lead.name}</h6>
                          <p className="mb-1 small text-muted">{lead.phone}</p>
                          <small className="text-success">
                            {lead.next_followup_date && formatDate(lead.next_followup_date)}
                          </small>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-success"
                          data-testid={`button-schedule-${lead.id}`}
                        >
                          <i className="fas fa-calendar"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>Follow-up Calendar
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-12">
              <div className="alert alert-info" data-testid="calendar-placeholder">
                <i className="fas fa-info-circle me-2"></i>
                Calendar integration would be implemented here using a library like FullCalendar.js
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

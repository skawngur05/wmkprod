import { useQuery } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { formatCurrency } from '@/lib/auth';

export default function Reports() {
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
  });

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalLeads = leads?.length || 0;
  const soldLeads = leads?.filter(lead => lead.remarks === 'sold').length || 0;
  const conversionRate = totalLeads > 0 ? ((soldLeads / totalLeads) * 100).toFixed(1) : '0';
  
  const totalRevenue = leads
    ?.filter(lead => lead.remarks === 'sold')
    ?.reduce((sum, lead) => sum + (parseFloat(lead.project_amount || '0')), 0) || 0;

  const avgProjectValue = soldLeads > 0 ? (totalRevenue / soldLeads) : 0;

  // Team performance
  const teamPerformance = leads?.reduce((acc, lead) => {
    if (lead.remarks === 'sold') {
      acc[lead.assigned_to] = (acc[lead.assigned_to] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const totalClosedByTeam = Object.values(teamPerformance).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 fw-bold" data-testid="reports-title">Reports & Analytics</h1>
          <p className="text-muted">Track performance and analyze lead data</p>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card" data-testid="metric-conversion-rate">
            <div className="card-body text-center">
              <h4 className="text-success">{conversionRate}%</h4>
              <p className="text-muted">Conversion Rate</p>
              <small className="text-success">
                <i className="fas fa-arrow-up"></i> Based on current data
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" data-testid="metric-total-revenue">
            <div className="card-body text-center">
              <h4 className="text-primary">{formatCurrency(totalRevenue)}</h4>
              <p className="text-muted">Total Revenue</p>
              <small className="text-success">
                <i className="fas fa-arrow-up"></i> From {soldLeads} sales
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" data-testid="metric-avg-project">
            <div className="card-body text-center">
              <h4 className="text-info">{formatCurrency(avgProjectValue)}</h4>
              <p className="text-muted">Avg Project Value</p>
              <small className="text-muted">
                <i className="fas fa-calculator"></i> Per sold project
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" data-testid="metric-response-time">
            <div className="card-body text-center">
              <h4 className="text-warning">4.2 days</h4>
              <p className="text-muted">Avg Response Time</p>
              <small className="text-info">
                <i className="fas fa-clock"></i> Estimated metric
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Lead Sources Chart */}
        <div className="col-lg-6 mb-4">
          <div className="card" data-testid="lead-sources-chart">
            <div className="card-header">
              <h5 className="mb-0">Lead Sources Performance</h5>
            </div>
            <div className="card-body">
              <canvas id="leadSourcesChart" height="200"></canvas>
              <div className="alert alert-info mt-3">
                <i className="fas fa-chart-pie me-2"></i>
                Lead sources chart would be implemented here using Chart.js or similar library
              </div>
              
              {/* Simple text-based breakdown */}
              <div className="mt-3">
                <h6>Current Lead Sources:</h6>
                {leads && Object.entries(
                  leads.reduce((acc, lead) => {
                    acc[lead.lead_origin] = (acc[lead.lead_origin] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([source, count]) => (
                  <div key={source} className="d-flex justify-content-between mb-1">
                    <span className="text-capitalize">{source}</span>
                    <span className="badge bg-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="col-lg-6 mb-4">
          <div className="card" data-testid="team-performance">
            <div className="card-header">
              <h5 className="mb-0">Team Performance</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(teamPerformance).map(([member, count]) => (
                  <div key={member} className="col-4 text-center">
                    <h4 className="text-primary">{count}</h4>
                    <p className="text-muted text-capitalize">{member}<br />Leads Closed</p>
                  </div>
                ))}
              </div>
              <hr />
              {Object.entries(teamPerformance).map(([member, count]) => {
                const percentage = totalClosedByTeam > 0 ? ((count / totalClosedByTeam) * 100).toFixed(0) : '0';
                return (
                  <div key={member} className="mb-2">
                    <div className="progress">
                      <div
                        className={`progress-bar ${
                          member === 'kim' ? 'bg-primary' :
                          member === 'patrick' ? 'bg-success' : 'bg-info'
                        }`}
                        style={{ width: `${percentage}%` }}
                        data-testid={`progress-${member}`}
                      >
                        {member.charAt(0).toUpperCase() + member.slice(1)} {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

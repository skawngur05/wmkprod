import { useQuery } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/auth';

export default function Installations() {
  const { data: installations, isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
  });

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p>Loading installations...</p>
          </div>
        </div>
      </div>
    );
  }

  const thisWeekInstallations = installations?.filter(install => {
    if (!install.installation_date) return false;
    const installDate = new Date(install.installation_date);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return installDate >= startOfWeek && installDate <= endOfWeek;
  }) || [];

  const completedInstallations = installations?.filter(install => 
    install.installation_date && new Date(install.installation_date) < new Date()
  ) || [];

  const pendingInstallations = installations?.filter(install => 
    install.installation_date && new Date(install.installation_date) >= new Date()
  ) || [];

  const installers = ['angel', 'brian', 'luis'];

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 fw-bold" data-testid="installations-title">Installation Management</h1>
          <p className="text-muted">Schedule and track kitchen installations</p>
        </div>
      </div>

      {/* Installation Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center" data-testid="stat-this-week">
            <div className="card-body">
              <i className="fas fa-calendar-day fa-2x text-primary mb-2"></i>
              <h4>{thisWeekInstallations.length}</h4>
              <p className="text-muted">This Week</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" data-testid="stat-completed">
            <div className="card-body">
              <i className="fas fa-tools fa-2x text-success mb-2"></i>
              <h4>{completedInstallations.length}</h4>
              <p className="text-muted">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" data-testid="stat-pending">
            <div className="card-body">
              <i className="fas fa-clock fa-2x text-warning mb-2"></i>
              <h4>{pendingInstallations.length}</h4>
              <p className="text-muted">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" data-testid="stat-installers">
            <div className="card-body">
              <i className="fas fa-user-hard-hat fa-2x text-info mb-2"></i>
              <h4>{installers.length}</h4>
              <p className="text-muted">Installers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Installations Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Scheduled Installations</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" data-testid="installations-table">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Installation Date</th>
                  <th>Installer</th>
                  <th>Project Value</th>
                  <th>Payment Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {installations && installations.length > 0 ? (
                  installations.map((install) => (
                    <tr key={install.id} data-testid={`installation-row-${install.id}`}>
                      <td>
                        <strong>{install.name}</strong>
                        <br />
                        <small className="text-muted">{install.phone}</small>
                      </td>
                      <td>
                        {install.installation_date ? (
                          <>
                            <strong>{formatDate(install.installation_date)}</strong>
                            <br />
                            <small className="text-muted">9:00 AM</small>
                          </>
                        ) : (
                          <span className="text-muted">Not scheduled</span>
                        )}
                      </td>
                      <td>
                        {install.assigned_installer ? (
                          <span className="badge bg-primary">
                            {install.assigned_installer}
                          </span>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        {install.project_amount ? formatCurrency(install.project_amount) : '-'}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <span className={`badge ${install.deposit_paid ? 'bg-success' : 'bg-warning'}`}>
                            Deposit {install.deposit_paid ? '✓' : 'Pending'}
                          </span>
                          <span className={`badge ${install.balance_paid ? 'bg-success' : 'bg-warning'}`}>
                            Balance {install.balance_paid ? '✓' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          install.deposit_paid && install.balance_paid ? 'bg-info' : 'bg-warning'
                        }`}>
                          {install.deposit_paid && install.balance_paid ? 'Scheduled' : 'Pending Payment'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          data-testid={`button-edit-installation-${install.id}`}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <div className="text-muted">
                        <i className="fas fa-calendar fa-3x mb-3"></i>
                        <p>No installations scheduled</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

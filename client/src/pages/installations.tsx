import { useQuery, useMutation } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function Installations() {
  const { data: installations, isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
    queryFn: async () => {
      const response = await fetch('/api/installations');
      if (!response.ok) throw new Error('Failed to fetch installations');
      return response.json();
    }
  });
  
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Lead | null>(null);
  const [emailType, setEmailType] = useState<'client' | 'installer'>('client');
  const [customMessage, setCustomMessage] = useState('');
  
  const { toast } = useToast();
  
  const sendEmailMutation = useMutation({
    mutationFn: async (data: { 
      installationId: string; 
      type: 'client' | 'installer'; 
      customMessage?: string 
    }) => {
      const response = await fetch('/api/installations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: 'Email sent successfully', 
        description: `${variables.type === 'client' ? 'Client' : 'Installer'} has been notified about the installation.`
      });
      setEmailModalOpen(false);
      setCustomMessage('');
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to send email', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
  
  const handleEmailClient = (installation: Lead) => {
    setSelectedInstallation(installation);
    setEmailType('client');
    setEmailModalOpen(true);
  };
  
  const handleEmailInstaller = (installation: Lead) => {
    setSelectedInstallation(installation);
    setEmailType('installer');
    setEmailModalOpen(true);
  };
  
  const handleSendEmail = () => {
    if (!selectedInstallation) return;
    
    sendEmailMutation.mutate({
      installationId: selectedInstallation.id,
      type: emailType,
      customMessage: customMessage.trim() || undefined
    });
  };

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

  // Categorize installations
  const isRepair = (install: Lead) => {
    const notesText = (install.notes || '').toLowerCase();
    const additionalNotesText = (install.additional_notes || '').toLowerCase();
    return notesText.includes('repair') || notesText.includes('fix') || 
           additionalNotesText.includes('repair') || additionalNotesText.includes('fix');
  };

  const upcomingInstallations = installations?.filter(install => 
    install.installation_date && 
    new Date(install.installation_date) >= new Date() &&
    !isRepair(install)
  ) || [];

  const repairJobs = installations?.filter(install => 
    isRepair(install)
  ) || [];

  const completedProjects = installations?.filter(install => 
    install.installation_date && 
    new Date(install.installation_date) < new Date() &&
    !isRepair(install)
  ) || [];

  const thisWeekInstallations = installations?.filter(install => {
    if (!install.installation_date) return false;
    const installDate = new Date(install.installation_date);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return installDate >= startOfWeek && installDate <= endOfWeek;
  }) || [];

  const installers = ['angel', 'brian', 'luis'];

  return (
    <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <div className="row mb-5">
        <div className="col">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h2 fw-bold mb-2" data-testid="installations-title" style={{ color: '#2c3e50' }}>
                <i className="fas fa-tools text-primary me-3"></i>
                Installation Management Hub
              </h1>
              <p className="text-muted fs-5">Streamlined scheduling and tracking for kitchen transformations</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary btn-lg">
                <i className="fas fa-plus me-2"></i>Schedule Installation
              </button>
              <button className="btn btn-primary btn-lg">
                <i className="fas fa-calendar-alt me-2"></i>View Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Installation Stats with Premium Design */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} data-testid="stat-this-week">
            <div className="card-body text-center text-white p-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <i className="fas fa-calendar-week fa-2x"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{thisWeekInstallations.length}</h2>
              <p className="mb-0 opacity-75 fw-medium">This Week</p>
              <small className="opacity-50">Upcoming installs</small>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }} data-testid="stat-completed">
            <div className="card-body text-center text-white p-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <i className="fas fa-check-double fa-2x"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{completedProjects.length}</h2>
              <p className="mb-0 opacity-75 fw-medium">Completed</p>
              <small className="opacity-50">Successful projects</small>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(135deg, #ee5a24 0%, #ffc048 100%)' }} data-testid="stat-repairs">
            <div className="card-body text-center text-white p-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <i className="fas fa-tools fa-2x"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{repairJobs.length}</h2>
              <p className="mb-0 opacity-75 fw-medium">Repair Jobs</p>
              <small className="opacity-50">Service calls</small>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)' }} data-testid="stat-installers">
            <div className="card-body text-center text-white p-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <i className="fas fa-users-cog fa-2x"></i>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{installers.length}</h2>
              <p className="mb-0 opacity-75 fw-medium">Active Installers</p>
              <small className="opacity-50">Team members</small>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Installations with Enhanced Design */}
      <div className="card border-0 shadow-lg mb-5">
        <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 text-white fw-bold">
              <i className="fas fa-calendar-check me-3"></i>
              Upcoming Installations 
              <span className="badge bg-white text-primary ms-2 fs-6">{upcomingInstallations.length}</span>
            </h4>
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm">
                <i className="fas fa-filter me-1"></i>Filter
              </button>
              <button className="btn btn-outline-light btn-sm">
                <i className="fas fa-download me-1"></i>Export
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {upcomingInstallations.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle" data-testid="upcoming-installations-table">
                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <tr>
                    <th className="py-3 px-4 fw-semibold text-dark">
                      <i className="fas fa-user me-2 text-primary"></i>Customer
                    </th>
                    <th className="py-3 px-4 fw-semibold text-dark">
                      <i className="fas fa-calendar me-2 text-success"></i>Installation Date
                    </th>
                    <th className="py-3 px-4 fw-semibold text-dark">
                      <i className="fas fa-hard-hat me-2 text-warning"></i>Installer
                    </th>
                    <th className="py-3 px-4 fw-semibold text-dark">
                      <i className="fas fa-dollar-sign me-2 text-info"></i>Project Value
                    </th>
                    <th className="py-3 px-4 fw-semibold text-dark">
                      <i className="fas fa-credit-card me-2 text-secondary"></i>Payment Status
                    </th>
                    <th className="py-3 px-4 fw-semibold text-dark text-center">
                      <i className="fas fa-cog me-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingInstallations.map((install, index) => (
                    <tr key={install.id} data-testid={`upcoming-installation-${install.id}`} 
                        style={{ borderLeft: index % 2 === 0 ? '4px solid #667eea' : '4px solid #764ba2' }}
                        className="border-start">
                      <td className="py-4 px-4">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-bold text-dark mb-1">{install.name}</div>
                            <small className="text-muted">
                              <i className="fas fa-phone me-1"></i>{install.phone}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {install.installation_date ? (
                          <div>
                            <div className="fw-bold text-success mb-1">
                              {formatDate(install.installation_date)}
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <i className="fas fa-clock me-1"></i>9:00 AM
                            </span>
                          </div>
                        ) : (
                          <span className="badge bg-warning">
                            <i className="fas fa-calendar-times me-1"></i>Not scheduled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {install.assigned_installer ? (
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-2">
                              <i className="fas fa-hard-hat text-warning"></i>
                            </div>
                            <span className="fw-medium text-capitalize">
                              {install.assigned_installer}
                            </span>
                          </div>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-50">
                            <i className="fas fa-user-times me-1"></i>Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="fw-bold text-success fs-5">
                          {install.project_amount ? formatCurrency(install.project_amount) : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="d-flex flex-column gap-1">
                          <span className={`badge ${install.deposit_paid ? 'bg-success' : 'bg-warning text-dark'} d-flex align-items-center justify-content-between`}>
                            <span>Deposit</span>
                            <i className={`fas ${install.deposit_paid ? 'fa-check-circle' : 'fa-clock'} ms-1`}></i>
                          </span>
                          <span className={`badge ${install.balance_paid ? 'bg-success' : 'bg-warning text-dark'} d-flex align-items-center justify-content-between`}>
                            <span>Balance</span>
                            <i className={`fas ${install.balance_paid ? 'fa-check-circle' : 'fa-clock'} ms-1`}></i>
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="d-flex gap-1 justify-content-center">
                          <button 
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            data-testid={`button-view-upcoming-${install.id}`}
                            title="View Installation Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {install.email && install.installation_date && (
                            <button 
                              className="btn btn-sm btn-outline-success rounded-pill"
                              onClick={() => handleEmailClient(install)}
                              data-testid={`button-email-upcoming-client-${install.id}`}
                              title="Email Client Confirmation"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                          {install.assigned_installer && install.installation_date && (
                            <button 
                              className="btn btn-sm btn-outline-info rounded-pill"
                              onClick={() => handleEmailInstaller(install)}
                              data-testid={`button-email-upcoming-installer-${install.id}`}
                              title="Notify Installer"
                            >
                              <i className="fas fa-hard-hat"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="rounded-circle bg-primary bg-opacity-10 p-4 mx-auto mb-4" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-calendar-plus fa-3x text-primary"></i>
              </div>
              <h5 className="text-muted mb-2">No Installations Scheduled</h5>
              <p className="text-muted">Ready to schedule new kitchen transformations!</p>
              <button className="btn btn-primary mt-3">
                <i className="fas fa-plus me-2"></i>Schedule Installation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Repairs Section */}
      <div className="card border-0 shadow-lg mb-5">
        <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #ee5a24 0%, #ffc048 100%)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 text-white fw-bold">
              <i className="fas fa-tools me-3"></i>
              Service & Repair Jobs 
              <span className="badge bg-white text-warning ms-2 fs-6">{repairJobs.length}</span>
            </h4>
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm">
                <i className="fas fa-sort me-1"></i>Priority
              </button>
              <button className="btn btn-outline-light btn-sm">
                <i className="fas fa-plus me-1"></i>Add Repair
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {repairJobs.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0" data-testid="repairs-table">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Scheduled Date</th>
                    <th>Installer</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repairJobs.map((repair) => (
                    <tr key={repair.id} data-testid={`repair-job-${repair.id}`}>
                      <td>
                        <strong>{repair.name}</strong>
                        <br />
                        <small className="text-muted">{repair.phone}</small>
                      </td>
                      <td>
                        {repair.installation_date ? (
                          <>
                            <strong>{formatDate(repair.installation_date)}</strong>
                            <br />
                            <small className="text-muted">Service Call</small>
                          </>
                        ) : (
                          <span className="badge bg-warning">Not Scheduled</span>
                        )}
                      </td>
                      <td>
                        {repair.assigned_installer ? (
                          <span className="badge bg-danger">
                            {repair.assigned_installer}
                          </span>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {repair.notes ? repair.notes.substring(0, 50) + '...' : 'No details'}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${
                          repair.installation_date && new Date(repair.installation_date) <= new Date() 
                            ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {repair.installation_date && new Date(repair.installation_date) <= new Date() 
                            ? 'Urgent' : 'Scheduled'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            data-testid={`button-edit-repair-${repair.id}`}
                            title="Edit Repair"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {repair.email && (
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleEmailClient(repair)}
                              data-testid={`button-email-repair-client-${repair.id}`}
                              title="Email Client"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="rounded-circle bg-warning bg-opacity-10 p-4 mx-auto mb-4" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-tools fa-3x text-warning"></i>
              </div>
              <h5 className="text-muted mb-2">No Service Calls</h5>
              <p className="text-muted">All installations are running smoothly!</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Completed Projects */}
      <div className="card border-0 shadow-lg">
        <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 text-white fw-bold">
              <i className="fas fa-check-double me-3"></i>
              Completed Projects 
              <span className="badge bg-white text-success ms-2 fs-6">{completedProjects.length}</span>
            </h4>
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm">
                <i className="fas fa-chart-bar me-1"></i>Analytics
              </button>
              <button className="btn btn-outline-light btn-sm">
                <i className="fas fa-star me-1"></i>Reviews
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {completedProjects.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0" data-testid="completed-projects-table">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Completion Date</th>
                    <th>Installer</th>
                    <th>Project Value</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedProjects.map((project) => (
                    <tr key={project.id} data-testid={`completed-project-${project.id}`}>
                      <td>
                        <strong>{project.name}</strong>
                        <br />
                        <small className="text-muted">{project.phone}</small>
                      </td>
                      <td>
                        <strong>{formatDate(project.installation_date!)}</strong>
                        <br />
                        <small className="text-success">Completed</small>
                      </td>
                      <td>
                        {project.assigned_installer ? (
                          <span className="badge bg-success">
                            {project.assigned_installer}
                          </span>
                        ) : (
                          <span className="text-muted">Not recorded</span>
                        )}
                      </td>
                      <td>
                        {project.project_amount ? formatCurrency(project.project_amount) : '-'}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <span className={`badge ${project.deposit_paid ? 'bg-success' : 'bg-secondary'}`}>
                            Deposit {project.deposit_paid ? '✓' : 'N/A'}
                          </span>
                          <span className={`badge ${project.balance_paid ? 'bg-success' : 'bg-warning'}`}>
                            Balance {project.balance_paid ? '✓' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            data-testid={`button-view-completed-${project.id}`}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {project.email && (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEmailClient(project)}
                              data-testid={`button-email-completed-client-${project.id}`}
                              title="Send Follow-up Email"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="rounded-circle bg-success bg-opacity-10 p-4 mx-auto mb-4" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-check-double fa-3x text-success"></i>
              </div>
              <h5 className="text-muted mb-2">No Completed Projects</h5>
              <p className="text-muted">Project completions will appear here!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Email {emailType === 'client' ? 'Client' : 'Installer'} - Installation Notification
            </DialogTitle>
          </DialogHeader>
          
          {selectedInstallation && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Installation Details:</h4>
                <p><strong>Customer:</strong> {selectedInstallation.name}</p>
                <p><strong>Date:</strong> {selectedInstallation.installation_date ? formatDate(selectedInstallation.installation_date) : 'Not set'}</p>
                <p><strong>Phone:</strong> {selectedInstallation.phone}</p>
                {emailType === 'client' && selectedInstallation.email && (
                  <p><strong>Email:</strong> {selectedInstallation.email}</p>
                )}
                {emailType === 'installer' && selectedInstallation.assigned_installer && (
                  <p><strong>Installer:</strong> {selectedInstallation.assigned_installer}</p>
                )}
                {selectedInstallation.project_amount && (
                  <p><strong>Project Value:</strong> {formatCurrency(selectedInstallation.project_amount)}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="customMessage">
                  Custom Message (Optional)
                </Label>
                <Textarea 
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Add any additional notes for the ${emailType}...`}
                  className="mt-2"
                  rows={3}
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p><strong>Email Preview:</strong></p>
                <p>
                  {emailType === 'client' 
                    ? `The client will receive installation details, timing, and what to expect on installation day.`
                    : `The installer will receive job details, customer contact info, and any special requirements.`
                  }
                  {customMessage && ' Your custom message will be included.'}
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setEmailModalOpen(false)}
                  disabled={sendEmailMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

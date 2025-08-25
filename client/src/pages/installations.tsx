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
              <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
              <h4>{completedProjects.length}</h4>
              <p className="text-muted">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" data-testid="stat-repairs">
            <div className="card-body">
              <i className="fas fa-wrench fa-2x text-danger mb-2"></i>
              <h4>{repairJobs.length}</h4>
              <p className="text-muted">Repairs</p>
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

      {/* Upcoming Installations */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-calendar-plus me-2"></i>
            Upcoming Installations ({upcomingInstallations.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {upcomingInstallations.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0" data-testid="upcoming-installations-table">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Installation Date</th>
                    <th>Installer</th>
                    <th>Project Value</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingInstallations.map((install) => (
                    <tr key={install.id} data-testid={`upcoming-installation-${install.id}`}>
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
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            data-testid={`button-edit-upcoming-${install.id}`}
                            title="Edit Installation"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {install.email && install.installation_date && (
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleEmailClient(install)}
                              data-testid={`button-email-upcoming-client-${install.id}`}
                              title="Email Client"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                          {install.assigned_installer && install.installation_date && (
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleEmailInstaller(install)}
                              data-testid={`button-email-upcoming-installer-${install.id}`}
                              title="Email Installer"
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
            <div className="text-center py-4">
              <i className="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
              <p className="text-muted">No upcoming installations scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Repairs Section */}
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h5 className="mb-0">
            <i className="fas fa-wrench me-2"></i>
            Repair Jobs ({repairJobs.length})
          </h5>
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
            <div className="text-center py-4">
              <i className="fas fa-tools fa-3x text-muted mb-3"></i>
              <p className="text-muted">No repair jobs scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Projects */}
      <div className="card">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="fas fa-check-circle me-2"></i>
            Completed Projects ({completedProjects.length})
          </h5>
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
            <div className="text-center py-4">
              <i className="fas fa-check-circle fa-3x text-muted mb-3"></i>
              <p className="text-muted">No completed projects yet</p>
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

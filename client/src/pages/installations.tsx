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
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            data-testid={`button-edit-installation-${install.id}`}
                            title="Edit Installation"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {install.email && install.installation_date && (
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleEmailClient(install)}
                              data-testid={`button-email-client-${install.id}`}
                              title="Email Client"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                          {install.assigned_installer && install.installation_date && (
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleEmailInstaller(install)}
                              data-testid={`button-email-installer-${install.id}`}
                              title="Email Installer"
                            >
                              <i className="fas fa-hard-hat"></i>
                            </button>
                          )}
                        </div>
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

import { useQuery, useMutation } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  CalendarDays, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  HardHat, 
  Mail, 
  Phone, 
  Settings, 
  User, 
  Wrench,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';

// Installation Card Component
function InstallationCard({ 
  installation, 
  onEmailClient, 
  onEmailInstaller, 
  colorScheme, 
  type 
}: { 
  installation: Lead; 
  onEmailClient: (installation: Lead) => void; 
  onEmailInstaller: (installation: Lead) => void;
  colorScheme: 'blue' | 'green' | 'yellow' | 'red';
  type: 'upcoming' | 'completed' | 'repair';
}) {
  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount));
  };
  
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentStatusBadge = (installation: Lead) => {
    const depositPaid = installation.deposit_paid;
    const balancePaid = installation.balance_paid;
    
    if (balancePaid) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Paid in Full</Badge>;
    } else if (depositPaid) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Deposit Paid</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Payment Pending</Badge>;
    }
  };

  const colorClasses = {
    blue: 'border-blue-200 shadow-blue-100 hover:shadow-blue-200',
    green: 'border-green-200 shadow-green-100 hover:shadow-green-200',
    yellow: 'border-yellow-200 shadow-yellow-100 hover:shadow-yellow-200',
    red: 'border-red-200 shadow-red-100 hover:shadow-red-200'
  };

  const getTypeIcon = () => {
    switch(type) {
      case 'upcoming': return <CalendarDays className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'repair': return <Wrench className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getPriorityBadge = () => {
    if (type === 'repair' && installation.installation_date) {
      const isOverdue = new Date(installation.installation_date) <= new Date();
      return isOverdue ? 
        <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge> :
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Scheduled</Badge>;
    }
    return null;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${colorClasses[colorScheme]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon()}
              <CardTitle className="text-lg font-semibold text-gray-900">{installation.name}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {getPriorityBadge()}
              {getPaymentStatusBadge(installation)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">{installation.phone}</span>
        </div>
        
        {installation.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{installation.email}</span>
          </div>
        )}

        {/* Installation Date */}
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <div>
            <span className="text-sm font-medium">
              {type === 'repair' ? 'Service Date:' : 'Installation Date:'}
            </span>
            <span className="text-sm ml-2">{formatDate(installation.installation_date)}</span>
          </div>
        </div>

        {/* Project Amount */}
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign className="h-4 w-4" />
          <div>
            <span className="text-sm font-medium">Project Value:</span>
            <span className="text-sm ml-2 font-semibold text-green-600">{formatCurrency(installation.project_amount)}</span>
          </div>
        </div>

        {/* Assigned Installer */}
        {installation.assigned_installer && (
          <div className="flex items-center gap-2 text-gray-700">
            <HardHat className="h-4 w-4" />
            <div>
              <span className="text-sm font-medium">Installer:</span>
              <span className="text-sm ml-2 capitalize font-medium">{installation.assigned_installer}</span>
            </div>
          </div>
        )}

        {/* Notes for repair jobs */}
        {type === 'repair' && installation.notes && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-600 font-medium mb-1">Issue Details:</p>
            <p className="text-sm text-gray-700">{installation.notes.substring(0, 100)}{installation.notes.length > 100 ? '...' : ''}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
            data-testid={`button-view-${installation.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {installation.email && installation.installation_date && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onEmailClient(installation)}
              data-testid={`button-email-client-${installation.id}`}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          )}
          
          {installation.assigned_installer && installation.installation_date && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-orange-600 border-orange-200 hover:bg-orange-50 px-3"
              onClick={() => onEmailInstaller(installation)}
              data-testid={`button-email-installer-${installation.id}`}
              title="Notify Installer"
            >
              <HardHat className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading installation management...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="installations-title">
            Installation Management
          </h1>
          <p className="text-gray-600">Track and manage all your kitchen installations and service calls</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 shadow-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarDays className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{thisWeekInstallations.length}</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-green-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedProjects.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 shadow-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{repairJobs.length}</p>
                  <p className="text-sm text-gray-600">Repair Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-600">{installers.length}</p>
                  <p className="text-sm text-gray-600">Active Installers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Installations */}
        {upcomingInstallations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Installations</h2>
              <Badge className="bg-blue-100 text-blue-700">{upcomingInstallations.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingInstallations.map((installation) => (
                <InstallationCard 
                  key={installation.id} 
                  installation={installation}
                  onEmailClient={handleEmailClient}
                  onEmailInstaller={handleEmailInstaller}
                  colorScheme="blue"
                  type="upcoming"
                />
              ))}
            </div>
          </div>
        )}

        {/* Repair Jobs */}
        {repairJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Service & Repair Jobs</h2>
              <Badge className="bg-yellow-100 text-yellow-700">{repairJobs.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repairJobs.map((repair) => (
                <InstallationCard 
                  key={repair.id} 
                  installation={repair}
                  onEmailClient={handleEmailClient}
                  onEmailInstaller={handleEmailInstaller}
                  colorScheme="yellow"
                  type="repair"
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Completed Projects</h2>
              <Badge className="bg-green-100 text-green-700">{completedProjects.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.slice(0, 6).map((installation) => (
                <InstallationCard 
                  key={installation.id} 
                  installation={installation}
                  onEmailClient={handleEmailClient}
                  onEmailInstaller={handleEmailInstaller}
                  colorScheme="green"
                  type="completed"
                />
              ))}
            </div>
            {completedProjects.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline">
                  View All {completedProjects.length} Completed Projects
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {upcomingInstallations.length === 0 && repairJobs.length === 0 && completedProjects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Installations Yet</h3>
              <p className="text-gray-600 mb-6">Ready to schedule your first kitchen transformation!</p>
              <Button>Schedule Installation</Button>
            </CardContent>
          </Card>
        )}

        {/* Email Modal */}
        <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Send {emailType === 'client' ? 'Client' : 'Installer'} Notification
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Installation Details</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p><strong>Customer:</strong> {selectedInstallation?.name}</p>
                  <p><strong>Date:</strong> {selectedInstallation?.installation_date ? 
                    new Date(selectedInstallation.installation_date).toLocaleDateString() : 'Not scheduled'}</p>
                  {selectedInstallation?.assigned_installer && (
                    <p><strong>Installer:</strong> {selectedInstallation.assigned_installer}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="customMessage">Additional Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Add any special instructions or notes..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.isPending}
                  className="flex-1"
                >
                  {sendEmailMutation.isPending ? 'Sending...' : `Send ${emailType === 'client' ? 'Client' : 'Installer'} Email`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEmailModalOpen(false)}
                  disabled={sendEmailMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
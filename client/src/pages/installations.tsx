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
import { QuickEditModal } from '@/components/modals/quick-edit-modal';
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
  Users,
  Edit
} from 'lucide-react';

// Installation Card Component
function InstallationCard({ 
  installation, 
  onEmailClient, 
  onEmailInstaller,
  onViewDetails,
  colorScheme, 
  type 
}: { 
  installation: Lead; 
  onEmailClient: (installation: Lead) => void; 
  onEmailInstaller: (installation: Lead) => void;
  onViewDetails: (installation: Lead) => void;
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
    <Card className={`transition-all duration-200 hover:shadow-lg border-l-4 cursor-pointer ${colorScheme === 'blue' ? 'border-l-blue-500' : colorScheme === 'green' ? 'border-l-green-500' : colorScheme === 'yellow' ? 'border-l-yellow-500' : 'border-l-red-500'}`}
      onClick={() => onViewDetails(installation)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          {/* Lead Info & Status - 4 columns */}
          <div className="md:col-span-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${colorScheme === 'blue' ? 'bg-blue-50' : colorScheme === 'green' ? 'bg-green-50' : colorScheme === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                {getTypeIcon()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{installation.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {type === 'repair' ? 'Service Job' : type === 'completed' ? 'Completed Project' : 'Installation'}
                </p>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Created: {installation.date_created ? new Date(installation.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {getPriorityBadge()}
                  {getPaymentStatusBadge(installation)}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info - 3 columns */}
          <div className="md:col-span-3">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-green-600" />
                <a href={`tel:${installation.phone}`} className="hover:text-blue-600 transition-colors">
                  {installation.phone}
                </a>
              </div>
              {installation.email && (
                <div className="flex items-center text-sm text-gray-700">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <a href={`mailto:${installation.email}`} className="hover:text-blue-600 transition-colors truncate">
                    {installation.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Installation Details - 3 columns */}
          <div className="md:col-span-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">
                    {type === 'repair' ? 'Service Date' : 'Installation Date'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(installation.installation_date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Project Value</p>
                  <p className="text-sm font-semibold text-green-700">
                    {formatCurrency(installation.project_amount)}
                  </p>
                </div>
              </div>

              {installation.assigned_installer && installation.assigned_installer.length > 0 && (
                <div className="flex items-center space-x-2">
                  <HardHat className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">
                      {Array.isArray(installation.assigned_installer) && installation.assigned_installer.length > 1 ? 'Installers' : 'Installer'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {Array.isArray(installation.assigned_installer) 
                        ? installation.assigned_installer.join(', ') 
                        : installation.assigned_installer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - 2 columns */}
          <div className="md:col-span-2">
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => onViewDetails(installation)}
                data-testid={`button-view-${installation.id}`}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
              
              {installation.email && installation.installation_date && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => onEmailClient(installation)}
                  data-testid={`button-email-client-${installation.id}`}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email Client
                </Button>
              )}
              
              {installation.assigned_installer && installation.installation_date && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => onEmailInstaller(installation)}
                  data-testid={`button-email-installer-${installation.id}`}
                >
                  <HardHat className="h-3 w-3 mr-1" />
                  Notify Installer
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* Notes Section - Full Width */}
        {installation.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-2">
              <div className="p-1 bg-gray-50 rounded">
                <Eye className="h-3 w-3 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {type === 'repair' ? 'Issue Details:' : 'Notes:'}
                </p>
                <p className="text-sm text-gray-600">{installation.notes}</p>
              </div>
            </div>
          </div>
        )}

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  const handleViewDetails = (installation: Lead) => {
    setSelectedInstallation(installation);
    setViewModalOpen(true);
  };

  const handleEditInstallation = (installation: Lead) => {
    setSelectedInstallation(installation);
    setEditModalOpen(true);
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
            <div className="space-y-4">
              {upcomingInstallations.map((installation) => (
                <InstallationCard 
                  key={installation.id} 
                  installation={installation}
                  onEmailClient={handleEmailClient}
                  onEmailInstaller={handleEmailInstaller}
                  onViewDetails={handleViewDetails}
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
            <div className="space-y-4">
              {repairJobs.map((repair) => (
                <InstallationCard 
                  key={repair.id} 
                  installation={repair}
                  onEmailClient={handleEmailClient}
                  onEmailInstaller={handleEmailInstaller}
                  onViewDetails={handleViewDetails}
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
            <div className="space-y-4">
              {completedProjects.slice(0, 6).map((installation) => (
                <InstallationCard 
                  key={installation.id} 
                  installation={installation}
                  onEmailClient={handleEmailClient}
                  onEmailInstaller={handleEmailInstaller}
                  onViewDetails={handleViewDetails}
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

        {/* View Details Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Installation Details
              </DialogTitle>
            </DialogHeader>
            {selectedInstallation && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 border-b pb-1">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedInstallation.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <a href={`tel:${selectedInstallation.phone}`} className="text-blue-600 hover:underline">
                          {selectedInstallation.phone}
                        </a>
                      </div>
                      {selectedInstallation.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <a href={`mailto:${selectedInstallation.email}`} className="text-blue-600 hover:underline">
                            {selectedInstallation.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 border-b pb-1">Project Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">
                          <strong>Installation Date:</strong> {selectedInstallation.installation_date ? 
                            new Date(selectedInstallation.installation_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          <strong>Project Value:</strong> {selectedInstallation.project_amount ? 
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(selectedInstallation.project_amount)) : 'Not set'}
                        </span>
                      </div>
                      {selectedInstallation.assigned_installer && (
                        <div className="flex items-center gap-2">
                          <HardHat className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            <strong>Installer:</strong> {selectedInstallation.assigned_installer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <h3 className="font-semibold text-gray-900 border-b pb-1 mb-3">Payment Status</h3>
                  <div className="flex gap-3">
                    {selectedInstallation.balance_paid ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Paid in Full</Badge>
                    ) : selectedInstallation.deposit_paid ? (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Deposit Paid</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">Payment Pending</Badge>
                    )}
                    <Badge className={`capitalize ${
                      selectedInstallation.remarks === 'sold' ? 'bg-green-100 text-green-700' :
                      selectedInstallation.remarks === 'quoted' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedInstallation.remarks?.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Notes */}
                {selectedInstallation.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 border-b pb-1 mb-3">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInstallation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Lead Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Lead Source:</strong> {selectedInstallation.lead_origin?.replace('-', ' ')}
                  </div>
                  <div>
                    <strong>Assigned to:</strong> {selectedInstallation.assigned_to || 'Unassigned'}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => setViewModalOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewModalOpen(false);
                      handleEditInstallation(selectedInstallation);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Details
                  </Button>
                  {selectedInstallation.email && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setViewModalOpen(false);
                        handleEmailClient(selectedInstallation);
                      }}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email Client
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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

        {/* Edit Modal */}
        <QuickEditModal
          lead={selectedInstallation}
          show={editModalOpen}
          onHide={() => setEditModalOpen(false)}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
            setEditModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
import { useQuery, useMutation } from '@tanstack/react-query';
import { Lead, Installer } from '@shared/schema';
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
import { RepairReportsModal } from '@/components/modals/repair-reports-modal';
import { EditRepairRequestModal } from '@/components/modals/edit-repair-request-modal';
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
  Edit,
  MapPin,
  Palette
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

  // Helper function to get the most recent note
  const getMostRecentNote = (notes: string | null) => {
    if (!notes) return null;
    
    // Split notes by line breaks and filter out empty lines
    const noteLines = notes.split('\n').filter(line => line.trim());
    
    if (noteLines.length === 0) return null;
    
    // Return the last (most recent) note
    return noteLines[noteLines.length - 1].trim();
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

              {(installation as any).selected_colors && (installation as any).selected_colors.length > 0 && (
                <div className="flex items-start space-x-2">
                  <Palette className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Selected Colors</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(installation as any).selected_colors.map((color: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 rounded-md"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
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
        {getMostRecentNote(installation.notes) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-2">
              <div className="p-1 bg-gray-50 rounded">
                <Eye className="h-3 w-3 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {type === 'repair' ? 'Latest Update:' : 'Latest Note:'}
                </p>
                <p className="text-sm text-gray-600">{getMostRecentNote(installation.notes)}</p>
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

  // Fetch repair requests
  const { data: repairRequests, isLoading: isLoadingRepairs } = useQuery({
    queryKey: ['/api/repair-requests'],
    queryFn: async () => {
      const response = await fetch('/api/repair-requests');
      if (!response.ok) throw new Error('Failed to fetch repair requests');
      return response.json();
    }
  });

  // Fetch installers
  const { data: installersData, isLoading: isLoadingInstallers } = useQuery<Installer[]>({
    queryKey: ['/api/admin/installers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/installers');
      if (!response.ok) throw new Error('Failed to fetch installers');
      return response.json();
    }
  });
  
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [editRepairModalOpen, setEditRepairModalOpen] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Lead | null>(null);
  const [selectedRepairRequest, setSelectedRepairRequest] = useState<any>(null);
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

  const markAsDoneMutation = useMutation({
    mutationFn: async (installationId: number) => {
      const response = await fetch(`/api/installations/${installationId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark installation as complete');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      toast({ 
        title: 'Installation completed successfully', 
        description: 'The installation has been moved to completed projects.'
      });
      setViewModalOpen(false);
      
      // Force a refresh after a short delay to ensure the new data is fetched
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      }, 500);
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to complete installation', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleMarkAsDone = (installation: Lead) => {
    if (window.confirm(`Are you sure you want to mark the installation for ${installation.name} as completed? This action cannot be undone.`)) {
      markAsDoneMutation.mutate(installation.id);
    }
  };
  
  const handleSendEmail = () => {
    if (!selectedInstallation) return;
    
    sendEmailMutation.mutate({
      installationId: selectedInstallation.id.toString(),
      type: emailType,
      customMessage: customMessage.trim() || undefined
    });
  };

  // Repair request handlers
  const handleEditRepairRequest = (repairRequest: any) => {
    setSelectedRepairRequest(repairRequest);
    setEditRepairModalOpen(true);
  };

  const handleEmailRepairClient = (repairRequest: any) => {
    if (repairRequest.email) {
      window.open(`mailto:${repairRequest.email}?subject=Repair Request Update&body=Dear ${repairRequest.customer_name},%0D%0A%0D%0ARegarding your repair request reported on ${new Date(repairRequest.date_reported).toLocaleDateString()}...`, '_self');
    } else {
      toast({
        title: "No Email",
        description: "This repair request doesn't have an email address.",
        variant: "destructive",
      });
    }
  };

  const handleViewRepairDetails = (repairRequest: any) => {
    // For now, just open the edit modal to view details
    handleEditRepairRequest(repairRequest);
  };

  if (isLoading || isLoadingInstallers) {
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

  const isCompleted = (install: Lead) => {
    const additionalNotesText = (install.additional_notes || '');
    const isCompletedResult = additionalNotesText.includes('Installation completed and moved to completed projects');
    return isCompletedResult;
  };

  // Helper function to compare dates without time
  const isDateToday = (dateString: string | Date) => {
    const installDate = new Date(dateString);
    const today = new Date();
    return installDate.toDateString() === today.toDateString();
  };

  const isDateInFuture = (dateString: string | Date) => {
    const installDate = new Date(dateString);
    const today = new Date();
    installDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return installDate > today;
  };

  const isDateInPast = (dateString: string | Date) => {
    const installDate = new Date(dateString);
    const today = new Date();
    installDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return installDate < today;
  };

  const upcomingInstallations = installations?.filter(install => {
    const isUpcoming = install.installation_date && 
      (isDateToday(install.installation_date) || isDateInFuture(install.installation_date)) &&
      !isRepair(install) &&
      !isCompleted(install);
    
    return isUpcoming;
  }) || [];

  const repairJobs = installations?.filter(install => {
    const isRepairJob = isRepair(install) && !isCompleted(install);
    return isRepairJob;
  }) || [];

  // Get active repair requests (not completed or cancelled)
  const activeRepairRequests = repairRequests?.filter((request: any) => 
    request.status !== 'Completed' && request.status !== 'Cancelled'
  ) || [];

  // Total repair jobs count (from installations + repair requests)
  const totalRepairJobs = repairJobs.length + activeRepairRequests.length;

  const completedProjects = installations?.filter(install => {
    const isCompletedProject = isCompleted(install) || (
      install.installation_date && 
      isDateInPast(install.installation_date) &&
      !isRepair(install) &&
      !isCompleted(install)
    );
    
    return isCompletedProject;
  }) || [];

  const thisWeekInstallations = installations?.filter(install => {
    if (!install.installation_date) return false;
    const installDate = new Date(install.installation_date);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return installDate >= startOfWeek && installDate <= endOfWeek;
  }) || [];

  // Filter active installers
  const activeInstallers = installersData?.filter(installer => installer.status === 'active') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="installations-title">
                Installation Management
              </h1>
              <p className="text-gray-600">Track and manage all your kitchen installations and service calls</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setRepairModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                Repair Reports
              </Button>
            </div>
          </div>
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
                  <p className="text-2xl font-bold text-yellow-600">{totalRepairJobs}</p>
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
                  <p className="text-2xl font-bold text-gray-600">{activeInstallers.length}</p>
                  <p className="text-sm text-gray-600">Active Installers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Repair Requests */}
        {activeRepairRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Active Repair Requests</h2>
              <Badge className="bg-yellow-100 text-yellow-700">{activeRepairRequests.length}</Badge>
            </div>
            <div className="space-y-4">
              {activeRepairRequests.map((request: any) => (
                <Card 
                  key={request.id} 
                  className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-yellow-500 cursor-pointer"
                  onClick={() => handleViewRepairDetails(request)}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      
                      {/* Customer Info & Status - 4 columns */}
                      <div className="md:col-span-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-full bg-yellow-50">
                            <Wrench className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{request.customer_name}</h3>
                            <p className="text-sm text-gray-600 mb-1">Repair Request</p>
                            <div className="flex gap-2 mt-2">
                              <Badge className={`${
                                request.priority === 'Urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                                request.priority === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                {request.priority}
                              </Badge>
                              <Badge className={`${
                                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                request.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }`}>
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Details - 3 columns */}
                      <div className="md:col-span-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase">Date Reported</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(request.date_reported).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase">Phone</p>
                              <p className="text-sm font-medium text-gray-900">{request.phone}</p>
                            </div>
                          </div>

                          {request.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Email</p>
                                <p className="text-sm font-medium text-gray-900">{request.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address & Issue - 3 columns */}
                      <div className="md:col-span-3">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase">Address</p>
                              <p className="text-sm text-gray-900 leading-tight">{request.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions - 2 columns */}
                      <div className="md:col-span-2">
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRepairDetails(request);
                            }}
                            data-testid={`button-view-repair-${request.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          
                          {request.email && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmailRepairClient(request);
                              }}
                              data-testid={`button-email-repair-${request.id}`}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Email Client
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Issue Description - Full Width */}
                    {request.issue_description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-start space-x-2">
                          <div className="p-1 bg-gray-50 rounded">
                            <AlertTriangle className="h-3 w-3 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Issue Details:</p>
                            <p className="text-sm text-gray-600">{request.issue_description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                      {(selectedInstallation as any).customer_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-orange-600 mt-1" />
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Installation Address</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{(selectedInstallation as any).customer_address}</p>
                          </div>
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
                      selectedInstallation.remarks === 'Sold' ? 'bg-green-100 text-green-700' :
                      selectedInstallation.remarks === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
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
                  <Button 
                    onClick={() => handleMarkAsDone(selectedInstallation)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Done
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

        <RepairReportsModal
          show={repairModalOpen}
          onHide={() => setRepairModalOpen(false)}
        />

        <EditRepairRequestModal
          show={editRepairModalOpen}
          onHide={() => setEditRepairModalOpen(false)}
          repairRequest={selectedRepairRequest}
        />
      </div>
    </div>
  );
}
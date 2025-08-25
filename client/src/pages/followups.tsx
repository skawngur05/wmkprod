import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { QuickFollowupModal } from '@/components/modals/quick-followup-modal';

interface FollowupsData {
  overdue: Lead[];
  dueToday: Lead[];
  upcoming: Lead[];
}

export default function Followups() {
  const { data: followupsData, isLoading } = useQuery<FollowupsData>({
    queryKey: ['/api/followups'],
  });
  
  const { data: installations = [] } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
  });
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string>('');
  const [selectedFollowupLead, setSelectedFollowupLead] = useState<Lead | null>(null);
  const [showQuickFollowup, setShowQuickFollowup] = useState(false);
  
  const overdueRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const installationsRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  
  const updateLeadMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Lead> }) => {
      const response = await fetch('/api/leads/' + data.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: 'Lead updated successfully' });
      setIsEditModalOpen(false);
      setEditingDate(null);
    },
    onError: (error: Error) => {
      console.error('Update mutation error:', error);
      toast({ 
        title: 'Failed to update lead', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section: string) => {
    setActiveSection(section);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => setActiveSection(''), 2000);
  };

  const handleDateEdit = (leadId: string, currentDate: string | null) => {
    setEditingDate(leadId);
    setTempDate(currentDate ? new Date(currentDate).toISOString().split('T')[0] : '');
  };

  const handleDateSave = (leadId: string) => {
    const newDate = tempDate ? tempDate : null;
    updateLeadMutation.mutate({ 
      id: leadId, 
      updates: { next_followup_date: newDate } 
    });
  };

  const handleDateCancel = () => {
    setEditingDate(null);
    setTempDate('');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading follow-up management...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overdue = [], dueToday = [], upcoming = [] } = followupsData || {};
  
  // Filter out inactive leads (not interested, not compatible, not in service area)
  const activeOverdue = overdue.filter(lead => !['not-interested', 'not-compatible', 'not-service-area'].includes(lead.remarks));
  const activeDueToday = dueToday.filter(lead => !['not-interested', 'not-compatible', 'not-service-area'].includes(lead.remarks));
  const activeUpcoming = upcoming.filter(lead => !['not-interested', 'not-compatible', 'not-service-area'].includes(lead.remarks));
  
  // Get next 7 days of upcoming follow-ups
  const today = new Date();
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingWeek = activeUpcoming.filter(lead => {
    if (!lead.next_followup_date) return false;
    const followupDate = new Date(lead.next_followup_date);
    return followupDate <= next7Days;
  });
  
  // Scheduled installations (sold leads with installation dates)
  const scheduledInstallations = installations.filter(lead => lead.installation_date);
  
  const handleQuickEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };
  
  const handleQuickUpdate = (leadId: string, updates: Partial<Lead>) => {
    updateLeadMutation.mutate({ id: leadId, updates });
  };

  const openQuickFollowup = (lead: Lead) => {
    setSelectedFollowupLead(lead);
    setShowQuickFollowup(true);
  };
  
  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount));
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getPaymentStatusBadge = (lead: Lead) => {
    if (lead.remarks !== 'sold') return null;
    
    const depositPaid = lead.deposit_paid;
    const balancePaid = lead.balance_paid;
    
    if (balancePaid) {
      return <Badge className="bg-green-100 text-green-800">Paid in Full</Badge>;
    } else if (depositPaid) {
      return <Badge className="bg-yellow-100 text-yellow-800">Deposit Paid</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Payment Pending</Badge>;
    }
  };
  
  const getTeamMemberName = (assignee: string) => {
    const names: Record<string, string> = {
      'kim': 'Kim',
      'patrick': 'Patrick', 
      'lina': 'Lina'
    };
    return names[assignee] || assignee;
  };
  
  const getLeadOriginDisplay = (origin: string) => {
    return origin.charAt(0).toUpperCase() + origin.slice(1).replace('-', ' ');
  };

  const renderFollowupTable = (leads: Lead[], colorTheme: string, sectionType: string) => {
    const themeClasses = {
      red: {
        headerBg: 'bg-red-50',
        headerBorder: 'border-red-200',
        headerText: 'text-red-900',
        rowBorder: 'border-red-100',
        rowHover: 'hover:bg-red-25',
        rowAlt: 'bg-red-25',
        text: 'text-gray-900' // Changed from text-red-700 to dark gray for better readability
      },
      yellow: {
        headerBg: 'bg-yellow-50',
        headerBorder: 'border-yellow-200',
        headerText: 'text-yellow-900',
        rowBorder: 'border-yellow-100',
        rowHover: 'hover:bg-yellow-25',
        rowAlt: 'bg-yellow-25',
        text: 'text-gray-900' // Changed from text-yellow-700 to dark gray for better readability
      },
      blue: {
        headerBg: 'bg-blue-50',
        headerBorder: 'border-blue-200',
        headerText: 'text-blue-900',
        rowBorder: 'border-blue-100',
        rowHover: 'hover:bg-blue-25',
        rowAlt: 'bg-blue-25',
        text: 'text-gray-900' // Changed from text-blue-700 to dark gray for better readability
      }
    };

    const theme = themeClasses[colorTheme as keyof typeof themeClasses];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={`${theme.headerBg} ${theme.headerBorder} border-b`}>
            <tr>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Date Created</th>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Contact</th>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Lead Origin</th>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Next Follow-up Date</th>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Status</th>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Project Amount</th>
              <th className={`text-left py-4 px-6 font-semibold ${theme.headerText}`}>Assigned To</th>
              <th className={`text-center py-4 px-6 font-semibold ${theme.headerText}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr key={lead.id} className={`${theme.rowBorder} border-b ${theme.rowHover} ${
                index % 2 === 0 ? 'bg-white' : theme.rowAlt
              }`} data-testid={`${sectionType}-lead-${lead.id}`}>
                <td className="py-4 px-6">
                  <span className={theme.text}>
                    {formatDate(lead.date_created)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className={theme.text}>
                    <p className="font-semibold text-base">{lead.name}</p>
                    <p className="text-sm font-medium text-gray-700">{lead.phone}</p>
                    {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`${theme.text} capitalize`}>
                    {getLeadOriginDisplay(lead.lead_origin)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {editingDate === lead.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="date"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        className="w-32"
                        data-testid={`input-date-${lead.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleDateSave(lead.id)}
                        className="px-2 py-1"
                        data-testid={`button-save-date-${lead.id}`}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDateCancel}
                        className="px-2 py-1"
                        data-testid={`button-cancel-date-${lead.id}`}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`${theme.text} cursor-pointer hover:underline`}
                      onClick={() => handleDateEdit(lead.id, lead.next_followup_date)}
                      data-testid={`text-next-followup-${lead.id}`}
                    >
                      {formatDate(lead.next_followup_date ? lead.next_followup_date.toString() : null)}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div>
                    <Badge className={`${colorTheme === 'red' ? 'bg-red-200 text-red-800' : 
                                     colorTheme === 'yellow' ? 'bg-yellow-200 text-yellow-800' : 
                                     'bg-blue-200 text-blue-800'} capitalize`}>
                      {lead.remarks}
                    </Badge>
                    {getPaymentStatusBadge(lead) && (
                      <div className="mt-1">{getPaymentStatusBadge(lead)}</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`font-medium ${theme.text}`}>
                    {formatCurrency(lead.project_amount)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={theme.text}>
                    {getTeamMemberName(lead.assigned_to)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2 justify-center">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`${colorTheme === 'red' ? 'border-red-300 text-red-700 hover:bg-red-100' : 
                                 colorTheme === 'yellow' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' : 
                                 'border-blue-300 text-blue-700 hover:bg-blue-100'}`}
                      onClick={() => openQuickFollowup(lead)}
                      title="Quick Follow-up Update"
                      data-testid={`button-followup-${sectionType}-${lead.id}`}
                    >
                      📅
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`${colorTheme === 'red' ? 'border-red-300 text-red-700 hover:bg-red-100' : 
                                 colorTheme === 'yellow' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' : 
                                 'border-blue-300 text-blue-700 hover:bg-blue-100'}`}
                      onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                      data-testid={`button-call-${sectionType}-${lead.id}`}
                    >
                      📞
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`${colorTheme === 'red' ? 'border-red-300 text-red-700 hover:bg-red-100' : 
                                 colorTheme === 'yellow' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' : 
                                 'border-blue-300 text-blue-700 hover:bg-blue-100'}`}
                      onClick={() => handleQuickEdit(lead)}
                      data-testid={`button-view-${sectionType}-${lead.id}`}
                    >
                      👁️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="followups-title">
          Follow-Up Management
        </h1>
        <p className="text-gray-600 mt-2">
          Revenue-focused lead follow-up system with smart prioritization
        </p>
      </div>
      
      {/* Real-Time Dashboard Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Overdue Statistics Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-red-200 bg-red-50 ${
            activeSection === 'overdue' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() => scrollToSection(overdueRef, 'overdue')}
          data-testid="stats-overdue"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 text-sm font-medium flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              CRITICAL - OVERDUE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800">{activeOverdue.length}</div>
            <p className="text-red-600 text-sm mt-1">Immediate action needed</p>
          </CardContent>
        </Card>
        
        {/* Due Today Statistics Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-yellow-200 bg-yellow-50 ${
            activeSection === 'today' ? 'ring-2 ring-yellow-500' : ''
          }`}
          onClick={() => scrollToSection(todayRef, 'today')}
          data-testid="stats-today"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-700 text-sm font-medium flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              URGENT - DUE TODAY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-800">{activeDueToday.length}</div>
            <p className="text-yellow-600 text-sm mt-1">Today's priorities</p>
          </CardContent>
        </Card>
        
        {/* Upcoming 7 Days Statistics Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-blue-200 bg-blue-50 ${
            activeSection === 'upcoming' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => scrollToSection(upcomingRef, 'upcoming')}
          data-testid="stats-upcoming"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-700 text-sm font-medium flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              UPCOMING - 7 DAYS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{upcomingWeek.length}</div>
            <p className="text-blue-600 text-sm mt-1">Week planning</p>
          </CardContent>
        </Card>
        
        {/* Scheduled Installations Statistics Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-green-200 bg-green-50 ${
            activeSection === 'installations' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => scrollToSection(installationsRef, 'installations')}
          data-testid="stats-installations"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-green-700 text-sm font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              REVENUE - INSTALLATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{scheduledInstallations.length}</div>
            <p className="text-green-600 text-sm mt-1">Revenue delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Follow-ups Table */}
      <div ref={overdueRef} className="mb-12">
        <h2 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
          CRITICAL - Overdue Follow-ups ({activeOverdue.length})
        </h2>
        
        {activeOverdue.length === 0 ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-12">
              <div className="text-6xl text-red-300 mb-4">✓</div>
              <p className="text-red-600 text-lg">Excellent! No overdue follow-ups!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200">
            <CardContent className="p-0">
              {renderFollowupTable(activeOverdue, 'red', 'overdue')}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Due Today Follow-ups Table */}
      <div ref={todayRef} className="mb-12">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
          URGENT - Due Today ({activeDueToday.length})
        </h2>
        
        {activeDueToday.length === 0 ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="text-center py-12">
              <div className="text-6xl text-yellow-300 mb-4">📅</div>
              <p className="text-yellow-600 text-lg">No follow-ups due today!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200">
            <CardContent className="p-0">
              {renderFollowupTable(activeDueToday, 'yellow', 'today')}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Follow-ups Table */}
      <div ref={upcomingRef} className="mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
          UPCOMING - Next 7 Days ({upcomingWeek.length})
        </h2>
        
        {upcomingWeek.length === 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="text-center py-12">
              <div className="text-6xl text-blue-300 mb-4">📈</div>
              <p className="text-blue-600 text-lg">No follow-ups scheduled for the next 7 days!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-200">
            <CardContent className="p-0">
              {renderFollowupTable(upcomingWeek, 'blue', 'upcoming')}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scheduled Installations Table */}
      <div ref={installationsRef} className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
          SCHEDULED INSTALLATIONS ({scheduledInstallations.length})
        </h2>
        
        {scheduledInstallations.length === 0 ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="text-center py-12">
              <div className="text-6xl text-green-300 mb-4">🏗️</div>
              <p className="text-green-600 text-lg">No installations scheduled!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 border-b border-green-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-green-900">Customer</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-900">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-900">Installation Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-900">Installer</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-900">Project Value</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-900">Payment Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-green-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledInstallations.map((lead, index) => (
                      <tr key={lead.id} className={`border-b border-green-100 hover:bg-green-25 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-green-25'
                      }`} data-testid={`installation-lead-${lead.id}`}>
                        <td className="py-4 px-6">
                          <div>
                            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                            <p className="text-gray-700 text-sm">Assigned: {getTeamMemberName(lead.assigned_to)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">
                            <p className="font-medium">{lead.phone}</p>
                            {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-900 font-medium">
                            {formatDate(lead.installation_date ? lead.installation_date.toString() : null)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-900 capitalize font-medium">
                            {lead.assigned_installer || 'Not assigned'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(lead.project_amount)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {getPaymentStatusBadge(lead)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-300 text-green-700 hover:bg-green-100"
                              onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                              data-testid={`button-call-installation-${lead.id}`}
                            >
                              📞
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-300 text-green-700 hover:bg-green-100"
                              onClick={() => handleQuickEdit(lead)}
                              data-testid={`button-edit-installation-${lead.id}`}
                            >
                              ✏️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && <QuickEditForm lead={selectedLead} />}
        </DialogContent>
      </Dialog>

      <QuickFollowupModal
        lead={selectedFollowupLead}
        show={showQuickFollowup}
        onHide={() => {
          setShowQuickFollowup(false);
          setSelectedFollowupLead(null);
        }}
      />
    </div>
  );
}

// Quick Edit Form Component
function QuickEditForm({ lead }: { lead: Lead }) {
  const [formData, setFormData] = useState({
    next_followup_date: lead.next_followup_date ? new Date(lead.next_followup_date).toISOString().split('T')[0] : '',
    remarks: lead.remarks,
    notes: lead.notes || '',
    project_amount: lead.project_amount || '',
    assigned_to: lead.assigned_to,
    installation_date: lead.installation_date ? new Date(lead.installation_date).toISOString().split('T')[0] : '',
    assigned_installer: lead.assigned_installer || '',
    deposit_paid: lead.deposit_paid || false,
    balance_paid: lead.balance_paid || false,
  });

  const { toast } = useToast();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Lead>) => {
      const response = await fetch('/api/leads/' + lead.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: 'Lead updated successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to update lead', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<Lead> = {
      next_followup_date: formData.next_followup_date ? formData.next_followup_date : null,
      remarks: formData.remarks,
      notes: formData.notes || null,
      project_amount: formData.project_amount || null,
      assigned_to: formData.assigned_to,
      installation_date: formData.installation_date ? formData.installation_date : null,
      assigned_installer: formData.assigned_installer || null,
      deposit_paid: formData.deposit_paid,
      balance_paid: formData.balance_paid,
    };

    updateLeadMutation.mutate(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
        <Input
          id="next_followup_date"
          type="date"
          value={formData.next_followup_date}
          onChange={(e) => setFormData(prev => ({ ...prev, next_followup_date: e.target.value }))}
          data-testid="input-next-followup-date"
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.remarks}
          onValueChange={(value) => setFormData(prev => ({ ...prev, remarks: value }))}
        >
          <SelectTrigger data-testid="select-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="not-interested">Not Interested</SelectItem>
            <SelectItem value="not-service-area">Not Service Area</SelectItem>
            <SelectItem value="not-compatible">Not Compatible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="project_amount">Project Amount</Label>
        <Input
          id="project_amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.project_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, project_amount: e.target.value }))}
          data-testid="input-project-amount"
        />
      </div>

      <div>
        <Label htmlFor="assigned_to">Assigned To</Label>
        <Select
          value={formData.assigned_to}
          onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
        >
          <SelectTrigger data-testid="select-assigned-to">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kim">Kim</SelectItem>
            <SelectItem value="patrick">Patrick</SelectItem>
            <SelectItem value="lina">Lina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          data-testid="textarea-notes"
        />
      </div>

      {formData.remarks === 'sold' && (
        <>
          <div>
            <Label htmlFor="installation_date">Installation Date</Label>
            <Input
              id="installation_date"
              type="date"
              value={formData.installation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, installation_date: e.target.value }))}
              data-testid="input-installation-date"
            />
          </div>

          <div>
            <Label htmlFor="assigned_installer">Assigned Installer</Label>
            <Select
              value={formData.assigned_installer}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_installer: value }))}
            >
              <SelectTrigger data-testid="select-assigned-installer">
                <SelectValue placeholder="Select installer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="angel">Angel</SelectItem>
                <SelectItem value="brian">Brian</SelectItem>
                <SelectItem value="luis">Luis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="deposit_paid"
              checked={formData.deposit_paid}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, deposit_paid: checked as boolean }))}
              data-testid="checkbox-deposit-paid"
            />
            <Label htmlFor="deposit_paid">Deposit Paid</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="balance_paid"
              checked={formData.balance_paid}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, balance_paid: checked as boolean }))}
              data-testid="checkbox-balance-paid"
            />
            <Label htmlFor="balance_paid">Balance Paid</Label>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={updateLeadMutation.isPending} data-testid="button-save-lead">
          {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
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
  
  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount));
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
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
  
  const getDaysOverdue = (date: string) => {
    return Math.ceil((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-red-900">Lead Info</th>
                      <th className="text-left py-4 px-6 font-semibold text-red-900">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-red-900">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-red-900">Days Overdue</th>
                      <th className="text-left py-4 px-6 font-semibold text-red-900">Project Value</th>
                      <th className="text-center py-4 px-6 font-semibold text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOverdue.map((lead, index) => (
                      <tr key={lead.id} className={`border-b border-red-100 hover:bg-red-25 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-red-25'
                      }`} data-testid={`overdue-lead-${lead.id}`}>
                        <td className="py-4 px-6">
                          <div>
                            <h3 className="font-semibold text-red-900">{lead.name}</h3>
                            <p className="text-red-700 text-xs">Assigned: {getTeamMemberName(lead.assigned_to)}</p>
                            {lead.notes && (
                              <p className="text-red-600 text-xs italic mt-1">Notes: {lead.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-red-700">
                            <p className="font-medium">{lead.phone}</p>
                            {lead.email && <p className="text-xs">{lead.email}</p>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <Badge className="bg-red-200 text-red-800 capitalize">{lead.remarks}</Badge>
                            {getPaymentStatusBadge(lead) && (
                              <div className="mt-1">{getPaymentStatusBadge(lead)}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className="bg-red-100 text-red-800">
                            {lead.next_followup_date ? `${getDaysOverdue(lead.next_followup_date)} days` : 'Not set'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-red-700">
                            {lead.project_amount ? formatCurrency(lead.project_amount) : 'Not set'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                              data-testid={`button-call-overdue-${lead.id}`}
                            >
                              📞
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => handleQuickEdit(lead)}
                              data-testid={`button-edit-overdue-${lead.id}`}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-yellow-50 border-b border-yellow-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-yellow-900">Lead Info</th>
                      <th className="text-left py-4 px-6 font-semibold text-yellow-900">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-yellow-900">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-yellow-900">Due Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-yellow-900">Project Value</th>
                      <th className="text-center py-4 px-6 font-semibold text-yellow-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDueToday.map((lead, index) => (
                      <tr key={lead.id} className={`border-b border-yellow-100 hover:bg-yellow-25 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-yellow-25'
                      }`} data-testid={`today-lead-${lead.id}`}>
                        <td className="py-4 px-6">
                          <div>
                            <h3 className="font-semibold text-yellow-900">{lead.name}</h3>
                            <p className="text-yellow-700 text-xs">Assigned: {getTeamMemberName(lead.assigned_to)}</p>
                            {lead.notes && (
                              <p className="text-yellow-600 text-xs italic mt-1">Notes: {lead.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-yellow-700">
                            <p className="font-medium">{lead.phone}</p>
                            {lead.email && <p className="text-xs">{lead.email}</p>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <Badge className="bg-yellow-200 text-yellow-800 capitalize">{lead.remarks}</Badge>
                            {getPaymentStatusBadge(lead) && (
                              <div className="mt-1">{getPaymentStatusBadge(lead)}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Due Today
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-yellow-700">
                            {lead.project_amount ? formatCurrency(lead.project_amount) : 'Not set'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                              onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                              data-testid={`button-call-today-${lead.id}`}
                            >
                              📞
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                              onClick={() => handleQuickEdit(lead)}
                              data-testid={`button-edit-today-${lead.id}`}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 border-b border-blue-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-blue-900">Lead Info</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-900">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-900">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-900">Due Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-900">Project Value</th>
                      <th className="text-center py-4 px-6 font-semibold text-blue-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingWeek.map((lead, index) => (
                      <tr key={lead.id} className={`border-b border-blue-100 hover:bg-blue-25 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-blue-25'
                      }`} data-testid={`upcoming-lead-${lead.id}`}>
                        <td className="py-4 px-6">
                          <div>
                            <h3 className="font-semibold text-blue-900">{lead.name}</h3>
                            <p className="text-blue-700 text-xs">Assigned: {getTeamMemberName(lead.assigned_to)}</p>
                            {lead.notes && (
                              <p className="text-blue-600 text-xs italic mt-1">Notes: {lead.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-blue-700">
                            <p className="font-medium">{lead.phone}</p>
                            {lead.email && <p className="text-xs">{lead.email}</p>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <Badge className="bg-blue-200 text-blue-800 capitalize">{lead.remarks}</Badge>
                            {getPaymentStatusBadge(lead) && (
                              <div className="mt-1">{getPaymentStatusBadge(lead)}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className="bg-blue-100 text-blue-800">
                            {lead.next_followup_date ? formatDate(lead.next_followup_date) : 'Not set'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-blue-700">
                            {lead.project_amount ? formatCurrency(lead.project_amount) : 'Not set'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
                              onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                              data-testid={`button-call-upcoming-${lead.id}`}
                            >
                              📞
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
                              onClick={() => handleQuickEdit(lead)}
                              data-testid={`button-edit-upcoming-${lead.id}`}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLead?.remarks === 'sold' ? 'Manage Installation & Payment' : 'Update Follow-Up'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <QuickEditForm 
              lead={selectedLead} 
              onUpdate={handleQuickUpdate}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quick Edit Form Component
function QuickEditForm({ lead, onUpdate, onClose }: {
  lead: Lead;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onClose: () => void;
}) {
  const [followupDate, setFollowupDate] = useState(
    lead.next_followup_date ? new Date(lead.next_followup_date).toISOString().split('T')[0] : ''
  );
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to);
  const [notes, setNotes] = useState(lead.notes || '');
  const [additionalNotes, setAdditionalNotes] = useState(lead.additional_notes || '');
  const [status, setStatus] = useState(lead.remarks);
  const [depositPaid, setDepositPaid] = useState(lead.deposit_paid || false);
  const [balancePaid, setBalancePaid] = useState(lead.balance_paid || false);
  const [installationDate, setInstallationDate] = useState(
    lead.installation_date ? new Date(lead.installation_date).toISOString().split('T')[0] : ''
  );
  const [assignedInstaller, setAssignedInstaller] = useState(lead.assigned_installer || '');
  const [projectAmount, setProjectAmount] = useState(lead.project_amount || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<Lead> = {
      next_followup_date: followupDate ? new Date(followupDate + 'T12:00:00') : null,
      assigned_to: assignedTo,
      notes,
      additional_notes: additionalNotes,
      remarks: status,
      project_amount: projectAmount || null,
    };
    
    // Add payment and installation fields for sold leads
    if (status === 'sold') {
      updates.deposit_paid = depositPaid;
      updates.balance_paid = balancePaid;
      updates.installation_date = installationDate ? new Date(installationDate + 'T12:00:00') : null;
      updates.assigned_installer = assignedInstaller || null;
    }
    
    onUpdate(lead.id, updates);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Lead Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
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
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kim">Kim</SelectItem>
              <SelectItem value="patrick">Patrick</SelectItem>
              <SelectItem value="lina">Lina</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="projectAmount">Project Amount ($)</Label>
        <Input 
          id="projectAmount"
          type="number"
          step="0.01"
          value={projectAmount}
          onChange={(e) => setProjectAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      
      {status !== 'sold' && (
        <div>
          <Label htmlFor="followupDate">Next Follow-up Date</Label>
          <Input 
            id="followupDate"
            type="date"
            value={followupDate}
            onChange={(e) => setFollowupDate(e.target.value)}
          />
        </div>
      )}
      
      {status === 'sold' && (
        <>
          <div className="space-y-3">
            <h4 className="font-medium text-green-800">Payment Tracking</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="depositPaid" 
                checked={depositPaid} 
                onCheckedChange={(checked) => setDepositPaid(checked === true)}
              />
              <Label htmlFor="depositPaid">Deposit Received</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="balancePaid" 
                checked={balancePaid} 
                onCheckedChange={(checked) => setBalancePaid(checked === true)}
              />
              <Label htmlFor="balancePaid">Balance Received</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="installationDate">Installation Date</Label>
              <Input 
                id="installationDate"
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="installer">Assigned Installer</Label>
              <Select value={assignedInstaller} onValueChange={setAssignedInstaller}>
                <SelectTrigger>
                  <SelectValue placeholder="Select installer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="angel">Angel</SelectItem>
                  <SelectItem value="brian">Brian</SelectItem>
                  <SelectItem value="luis">Luis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="installationNotes">Installation Notes</Label>
            <Textarea 
              id="installationNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Special requirements, materials needed, etc."
            />
          </div>
        </>
      )}
      
      <div>
        <Label htmlFor="notes">General Notes</Label>
        <Textarea 
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Call notes, customer preferences, etc."
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Update Lead
        </Button>
      </div>
    </form>
  );
}
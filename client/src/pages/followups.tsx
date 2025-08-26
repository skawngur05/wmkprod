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
import { Phone, Mail, Calendar, User, DollarSign, Clock, Eye, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface FollowupsData {
  overdue: Lead[];
  dueToday: Lead[];
  upcoming: Lead[];
}

// Quick Edit Form Component
function QuickEditForm({ lead, onClose }: { lead: Lead; onClose: () => void }) {
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
      onClose();
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
      next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date) : null,
      remarks: formData.remarks,
      notes: formData.notes || null,
      project_amount: formData.project_amount || null,
      assigned_to: formData.assigned_to,
      installation_date: formData.installation_date ? new Date(formData.installation_date) : null,
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
          value={formData.assigned_to || ''}
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Lead Card Component
function LeadCard({ lead, onQuickEdit, onQuickFollowup, colorScheme }: { 
  lead: Lead; 
  onQuickEdit: (lead: Lead) => void; 
  onQuickFollowup: (lead: Lead) => void;
  colorScheme: 'red' | 'yellow' | 'blue' | 'green';
}) {
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
      return <Badge className="bg-green-100 text-green-700 border-green-200">Paid in Full</Badge>;
    } else if (depositPaid) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Deposit Paid</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Payment Pending</Badge>;
    }
  };

  const colorClasses = {
    red: 'border-red-200 shadow-red-100 hover:shadow-red-200',
    yellow: 'border-yellow-200 shadow-yellow-100 hover:shadow-yellow-200', 
    blue: 'border-blue-200 shadow-blue-100 hover:shadow-blue-200',
    green: 'border-green-200 shadow-green-100 hover:shadow-green-200'
  };

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800', 
    'quoted': 'bg-purple-100 text-purple-800',
    'sold': 'bg-green-100 text-green-800',
    'not-interested': 'bg-gray-100 text-gray-800',
    'not-service-area': 'bg-orange-100 text-orange-800',
    'not-compatible': 'bg-red-100 text-red-800'
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${colorClasses[colorScheme]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{lead.name}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`${statusColors[lead.remarks as keyof typeof statusColors]} font-medium capitalize`}>
                {lead.remarks.replace('-', ' ')}
              </Badge>
              {getPaymentStatusBadge(lead)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">{lead.phone}</span>
        </div>
        
        {lead.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{lead.email}</span>
          </div>
        )}

        {/* Follow-up Date */}
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <div>
            <span className="text-sm font-medium">Next Follow-up:</span>
            <span className="text-sm ml-2">{formatDate(lead.next_followup_date?.toString() || null)}</span>
          </div>
        </div>

        {/* Project Amount */}
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign className="h-4 w-4" />
          <div>
            <span className="text-sm font-medium">Project Value:</span>
            <span className="text-sm ml-2 font-semibold text-green-600">{formatCurrency(lead.project_amount)}</span>
          </div>
        </div>

        {/* Assigned To */}
        {lead.assigned_to && (
          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-4 w-4" />
            <div>
              <span className="text-sm font-medium">Assigned to:</span>
              <span className="text-sm ml-2 capitalize">{lead.assigned_to}</span>
            </div>
          </div>
        )}

        {/* Lead Origin */}
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
          Source: {lead.lead_origin.replace('-', ' ').toUpperCase()}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => onQuickFollowup(lead)}
            data-testid={`button-followup-${lead.id}`}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Follow-up
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-gray-600 border-gray-200 hover:bg-gray-50 px-3"
            onClick={() => onQuickEdit(lead)}
            data-testid={`button-view-${lead.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
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
  const [selectedFollowupLead, setSelectedFollowupLead] = useState<Lead | null>(null);
  const [showQuickFollowup, setShowQuickFollowup] = useState(false);
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading follow-up management...</p>
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

  const openQuickFollowup = (lead: Lead) => {
    setSelectedFollowupLead(lead);
    setShowQuickFollowup(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="followups-title">
            Follow-Up Management
          </h1>
          <p className="text-gray-600">Stay on top of your leads and never miss a follow-up</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-red-200 shadow-red-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{activeOverdue.length}</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 shadow-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{activeDueToday.length}</p>
                  <p className="text-sm text-gray-600">Due Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{upcomingWeek.length}</p>
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
                  <p className="text-2xl font-bold text-green-600">{scheduledInstallations.length}</p>
                  <p className="text-sm text-gray-600">Installations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Follow-ups */}
        {activeOverdue.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Overdue Follow-ups</h2>
              <Badge className="bg-red-100 text-red-700">{activeOverdue.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOverdue.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onQuickEdit={handleQuickEdit}
                  onQuickFollowup={openQuickFollowup}
                  colorScheme="red"
                />
              ))}
            </div>
          </div>
        )}

        {/* Due Today */}
        {activeDueToday.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Due Today</h2>
              <Badge className="bg-yellow-100 text-yellow-700">{activeDueToday.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDueToday.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onQuickEdit={handleQuickEdit}
                  onQuickFollowup={openQuickFollowup}
                  colorScheme="yellow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming This Week */}
        {upcomingWeek.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Upcoming This Week</h2>
              <Badge className="bg-blue-100 text-blue-700">{upcomingWeek.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingWeek.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onQuickEdit={handleQuickEdit}
                  onQuickFollowup={openQuickFollowup}
                  colorScheme="blue"
                />
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Installations */}
        {scheduledInstallations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Scheduled Installations</h2>
              <Badge className="bg-green-100 text-green-700">{scheduledInstallations.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledInstallations.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onQuickEdit={handleQuickEdit}
                  onQuickFollowup={openQuickFollowup}
                  colorScheme="green"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeOverdue.length === 0 && activeDueToday.length === 0 && upcomingWeek.length === 0 && scheduledInstallations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600 mb-6">No follow-ups or installations scheduled at the moment.</p>
              <Button>Add New Lead</Button>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lead Details</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <QuickEditForm 
                lead={selectedLead} 
                onClose={() => setIsEditModalOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <QuickFollowupModal
          lead={selectedFollowupLead}
          show={showQuickFollowup}
          onHide={() => setShowQuickFollowup(false)}
        />
      </div>
    </div>
  );
}
import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Lead, INSTALLERS } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
import { Phone, Mail, Calendar, User, DollarSign, Clock, Eye, AlertCircle, CheckCircle, TrendingUp, Edit, Copy, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FollowupsData {
  overdue: Lead[];
  dueToday: Lead[];
  upcoming: Lead[];
}

// Quick Edit Form Component
function QuickEditForm({ lead, onClose, wmkColors }: { lead: Lead; onClose: () => void; wmkColors: any[] }) {
  const [formData, setFormData] = useState({
    next_followup_date: lead.next_followup_date ? new Date(lead.next_followup_date).toISOString().split('T')[0] : '',
    remarks: lead.remarks,
    notes: lead.notes || '',
    project_amount: lead.project_amount || '',
    assigned_to: lead.assigned_to,
    installation_date: lead.installation_date ? new Date(lead.installation_date).toISOString().split('T')[0] : '',
    assigned_installer: (() => {
      if (!lead.assigned_installer) return [];
      if (Array.isArray(lead.assigned_installer)) return lead.assigned_installer;
      return lead.assigned_installer.split(',').map(s => s.trim()).filter(s => s);
    })(),
    deposit_paid: lead.deposit_paid || false,
    balance_paid: lead.balance_paid || false,
    selected_colors: (lead as any).selected_colors || [],
  });
  const [newNote, setNewNote] = useState('');

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
    
    // Handle new note addition
    let updatedNotes = formData.notes || '';
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newNoteWithTimestamp = `[${timestamp}] ${newNote.trim()}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${newNoteWithTimestamp}` : newNoteWithTimestamp;
    }
    
    // Add installer assignment note if installers are assigned
    if (formData.remarks === 'Sold' && formData.assigned_installer.length > 0) {
      const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const installerNote = `[${timestamp}] Assigned installers: ${formData.assigned_installer.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${installerNote}` : installerNote;
    }
    
    // Add color selection note after payment status if colors are selected
    if (formData.remarks === 'Sold' && formData.selected_colors.length > 0 && (formData.deposit_paid || formData.balance_paid)) {
      const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const colorNote = `[${timestamp}] Selected colors: ${formData.selected_colors.join(', ')}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${colorNote}` : colorNote;
    }

    const updates: Partial<Lead> = {
      next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date) : null,
      remarks: formData.remarks,
      notes: updatedNotes || null,
      project_amount: formData.project_amount || null,
      assigned_to: formData.assigned_to,
      installation_date: formData.installation_date ? new Date(formData.installation_date) : null,
      assigned_installer: formData.assigned_installer,
      deposit_paid: formData.deposit_paid,
      balance_paid: formData.balance_paid,
      selected_colors: formData.selected_colors,
    };

    updateLeadMutation.mutate(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Two Column Layout */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        {/* Left Column */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="next_followup_date" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NEXT FOLLOW-UP DATE
            </Label>
            <Input
              id="next_followup_date"
              type="date"
              value={formData.next_followup_date}
              onChange={(e) => setFormData(prev => ({ ...prev, next_followup_date: e.target.value }))}
              data-testid="input-next-followup-date"
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="project_amount" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              PROJECT AMOUNT
            </Label>
            <Input
              id="project_amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.project_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, project_amount: e.target.value }))}
              data-testid="input-project-amount"
              className="h-11 text-base"
            />
          </div>

          {formData.remarks === 'Sold' && (
            <div className="space-y-1">
              <Label htmlFor="installation_date" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                INSTALLATION DATE
              </Label>
              <Input
                id="installation_date"
                type="date"
                value={formData.installation_date}
                onChange={(e) => setFormData(prev => ({ ...prev, installation_date: e.target.value }))}
                data-testid="input-installation-date"
                className="h-11 text-base"
              />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="status" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              STATUS
            </Label>
            <Select
              value={formData.remarks}
              onValueChange={(value) => setFormData(prev => ({ ...prev, remarks: value }))}
            >
              <SelectTrigger data-testid="select-status" className="h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Not Service Area">Not Service Area</SelectItem>
                <SelectItem value="Not Compatible">Not Compatible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="assigned_to" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ASSIGNED TO
            </Label>
            <Select
              value={formData.assigned_to || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
            >
              <SelectTrigger data-testid="select-assigned-to" className="h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kim">Kim</SelectItem>
                <SelectItem value="Patrick">Patrick</SelectItem>
                <SelectItem value="Lina">Lina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.remarks === 'Sold' && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ASSIGNED INSTALLERS
              </Label>
              <Select
                value=""
                onValueChange={(installer) => {
                  if (installer && !formData.assigned_installer.includes(installer)) {
                    setFormData(prev => ({
                      ...prev,
                      assigned_installer: [...formData.assigned_installer, installer]
                    }));
                  }
                }}
              >
                <SelectTrigger data-testid="select-installer-followups" className="h-11 text-base">
                  <SelectValue placeholder="Select installer to add..." />
                </SelectTrigger>
                <SelectContent>
                  {INSTALLERS.filter(installer => !formData.assigned_installer.includes(installer)).map(installer => (
                    <SelectItem key={installer} value={installer}>
                      {installer.charAt(0).toUpperCase() + installer.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.assigned_installer.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.assigned_installer.map((installer) => (
                    <Badge 
                      key={installer} 
                      variant="secondary" 
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {installer.charAt(0).toUpperCase() + installer.slice(1)}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_installer: formData.assigned_installer.filter(i => i !== installer)
                          }));
                        }}
                        data-testid={`remove-installer-followups-${installer}`}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Color Selection - Only for sold projects */}
          {formData.remarks === 'Sold' && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                COLOR SELECTION (Typically 2 colors)
              </Label>
              <Select
                value=""
                onValueChange={(color) => {
                  if (color && !formData.selected_colors.includes(color)) {
                    setFormData(prev => ({
                      ...prev,
                      selected_colors: [...formData.selected_colors, color]
                    }));
                  }
                }}
              >
                <SelectTrigger data-testid="select-color-followups" className="h-11 text-base">
                  <SelectValue placeholder="Select color to add..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {wmkColors.filter((colorObj: any) => !formData.selected_colors.includes(colorObj.code)).map((colorObj: any) => (
                    <SelectItem key={colorObj.code} value={colorObj.code}>
                      {colorObj.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.selected_colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selected_colors.map((color) => (
                    <Badge 
                      key={color} 
                      variant="outline" 
                      className="flex items-center gap-1 px-2 py-1 border-purple-200 text-purple-700"
                    >
                      {color}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selected_colors: formData.selected_colors.filter(c => c !== color)
                          }));
                        }}
                        data-testid={`remove-color-followups-${color}`}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Status - Only for Sold Status - First Priority */}
      {formData.remarks === 'Sold' && (
        <div className="col-span-2 space-y-3 pt-2 border-t border-gray-200">
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            PAYMENT STATUS
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                formData.deposit_paid 
                  ? 'border-green-500 bg-green-50 shadow-sm' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, deposit_paid: !prev.deposit_paid }))}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  formData.deposit_paid ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {formData.deposit_paid && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Deposit Paid</p>
                  <p className="text-xs text-gray-600">Initial payment received</p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                formData.balance_paid 
                  ? 'border-green-500 bg-green-50 shadow-sm' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, balance_paid: !prev.balance_paid }))}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  formData.balance_paid ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {formData.balance_paid && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Balance Paid</p>
                  <p className="text-xs text-gray-600">Final payment received</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes History and New Note - Full Width at Bottom */}
      <div className="col-span-2 space-y-3 pt-4 border-t border-gray-200">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          MOST RECENT NOTE
        </Label>
        
        {/* Most Recent Note */}
        <div className="space-y-2">
          {formData.notes ? (() => {
            const notes = formData.notes.split('\n').filter(line => line.trim());
            if (notes.length === 0) return null;
            
            // Get the most recent note (last in the array)
            const mostRecentNote = notes[notes.length - 1];
            const match = mostRecentNote.match(/^\[(.+?)\]\s*(.+)$/);
            
            if (match) {
              const [, date, content] = match;
              return (
                <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">[{date}] {content}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{mostRecentNote}</p>
                  </div>
                </div>
              );
            }
          })() : (
            <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">
              No notes available
            </p>
          )}
        </div>

        {/* Quick Note Templates */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            QUICK NOTE TEMPLATES
          </Label>
          <Select onValueChange={(value) => value !== "custom" && setNewNote(value)}>
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder="Select a template or type your own note below" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Type custom note below...</SelectItem>
              <SelectItem value="Sent a text message">Sent a text message</SelectItem>
              <SelectItem value="Sent an email">Sent an email</SelectItem>
              <SelectItem value="Talked to client - interested">Talked to client - interested</SelectItem>
              <SelectItem value="Talked to client - needs time to decide">Talked to client - needs time to decide</SelectItem>
              <SelectItem value="Left voicemail">Left voicemail</SelectItem>
              <SelectItem value="Scheduled callback">Scheduled callback</SelectItem>
              <SelectItem value="Sent quote">Sent quote</SelectItem>
              <SelectItem value="Meeting scheduled">Meeting scheduled</SelectItem>
              <SelectItem value="Waiting for approval">Waiting for approval</SelectItem>
              <SelectItem value="Follow-up call completed">Follow-up call completed</SelectItem>
              <SelectItem value="Site visit scheduled">Site visit scheduled</SelectItem>
              <SelectItem value="Quote requested">Quote requested</SelectItem>
              <SelectItem value="Contract sent">Contract sent</SelectItem>
              <SelectItem value="Payment discussion needed">Payment discussion needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add New Note */}
        <div className="space-y-2">
          <Label htmlFor="new-note" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            ADD NEW NOTE
          </Label>
          <Textarea
            id="new-note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter a new note or select from templates above..."
            rows={2}
            className="resize-none text-base"
          />
        </div>
      </div>

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

// Utility functions
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

const getStatusBadge = (status: string) => {
  const statusColors = {
    'New': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800', 
    'Sold': 'bg-green-100 text-green-800',
    'Not Interested': 'bg-gray-100 text-gray-800',
    'Not Service Area': 'bg-orange-100 text-orange-800',
    'Not Compatible': 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={`${statusColors[status as keyof typeof statusColors]} font-medium capitalize`}>
      {status.replace('-', ' ')}
    </Badge>
  );
};

const getPaymentStatusBadge = (lead: Lead) => {
  if (lead.remarks !== 'Sold') return null;
  
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

// Follow-ups Card Layout Component
function FollowupsTable({ 
  leads, 
  onQuickEdit, 
  onQuickFollowup,
  status = 'upcoming'
}: { 
  leads: Lead[]; 
  onQuickEdit: (lead: Lead) => void; 
  onQuickFollowup: (lead: Lead) => void;
  status?: 'overdue' | 'due-today' | 'upcoming';
}) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No follow-ups scheduled</p>
        <p className="text-sm">Great job staying on top of your leads!</p>
      </div>
    );
  }

  // Get card styling based on status
  const getCardStyling = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 bg-red-50/30 border-red-200';
      case 'due-today':
        return 'hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-500 bg-yellow-50/30 border-yellow-200';
      default:
        return 'hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id} className={`${getCardStyling(status)} cursor-pointer`} onClick={() => onQuickEdit(lead)}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Lead Info - 3 columns */}
              <div className="md:col-span-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{lead.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {lead.lead_origin.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-700 font-medium mt-1">
                      Created: {lead.date_created ? new Date(lead.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info - 2 columns */}
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <div className="group flex items-center text-sm text-gray-700">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <span className="flex-1">{lead.phone}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(lead.phone);
                        // Toast notification would go here if needed
                      }}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-all duration-200 opacity-50 hover:opacity-100"
                      title="Copy phone number"
                    >
                      <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                  {lead.email && (
                    <div className="group flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="flex-1 truncate">{lead.email}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(lead.email || '');
                          // Toast notification would go here if needed
                        }}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition-all duration-200 opacity-50 hover:opacity-100"
                        title="Copy email address"
                      >
                        <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Payment - 2 columns */}
              <div className="md:col-span-2">
                <div className="flex flex-col gap-2">
                  {getStatusBadge(lead.remarks)}
                  {getPaymentStatusBadge(lead)}
                </div>
              </div>

              {/* Follow-up Date - 2 columns */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(lead.next_followup_date?.toString() || null)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Amount & Assigned - 2 columns */}
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {formatCurrency(lead.project_amount)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">
                      {lead.assigned_to || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions - 1 column */}
              <div className="md:col-span-1">
                <div className="flex justify-center">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-10 text-xs font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickEdit(lead);
                    }}
                    data-testid={`button-view-${lead.id}`}
                    title="Edit Lead"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

            </div>

            {/* Notes Section - Full Width */}
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start space-x-2">
                  <div className="p-1 bg-gray-50 rounded">
                    <Eye className="h-3 w-3 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {(() => {
                        const notes = lead.notes.split('\n').filter(line => line.trim());
                        if (notes.length === 0) return lead.notes;
                        // Get the most recent note (last in the array)
                        return notes[notes.length - 1];
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Followups() {
  const { data: followupsData, isLoading } = useQuery<FollowupsData>({
    queryKey: ['/api/followups'],
  });
  
  const { data: installations = [] } = useQuery<Lead[]>({
    queryKey: ['/api/installations'],
  });
  
  // Fetch WMK colors
  const { data: wmkColors = [] } = useQuery({
    queryKey: ['/api/wmk-colors'],
    queryFn: async () => {
      const response = await fetch('/api/wmk-colors');
      if (!response.ok) throw new Error('Failed to fetch WMK colors');
      return response.json();
    }
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
            <FollowupsTable 
              leads={activeOverdue}
              onQuickEdit={handleQuickEdit}
              onQuickFollowup={openQuickFollowup}
              status="overdue"
            />
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
            <FollowupsTable 
              leads={activeDueToday}
              onQuickEdit={handleQuickEdit}
              onQuickFollowup={openQuickFollowup}
              status="due-today"
            />
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
            <FollowupsTable 
              leads={upcomingWeek}
              onQuickEdit={handleQuickEdit}
              onQuickFollowup={openQuickFollowup}
              status="upcoming"
            />
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
            <FollowupsTable 
              leads={scheduledInstallations}
              onQuickEdit={handleQuickEdit}
              onQuickFollowup={openQuickFollowup}
            />
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
              <DialogDescription>
                Update lead information, status, and follow-up details
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <QuickEditForm 
                lead={selectedLead} 
                onClose={() => setIsEditModalOpen(false)} 
                wmkColors={wmkColors}
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
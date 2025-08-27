import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Lead, LEAD_ORIGINS, LEAD_STATUSES, ASSIGNEES, INSTALLERS } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface QuickEditModalProps {
  lead: Lead | null;
  show: boolean;
  onHide: () => void;
  onSave: () => void;
}

export function QuickEditModal({ lead, show, onHide, onSave }: QuickEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lead_origin: '',
    remarks: '',
    assigned_to: '',
    customer_address: '',
    project_amount: '',
    next_followup_date: '',
    notes: '',
    deposit_paid: false,
    balance_paid: false,
    installation_date: '',
    assigned_installer: [] as string[],
    selected_colors: [] as string[]
  });
  const [newNote, setNewNote] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WMK colors
  const { data: wmkColors = [] } = useQuery({
    queryKey: ['/api/wmk-colors'],
    queryFn: async () => {
      const response = await fetch('/api/wmk-colors');
      if (!response.ok) throw new Error('Failed to fetch WMK colors');
      return response.json();
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!lead) throw new Error('No lead selected');
      const response = await apiRequest('PUT', `/api/leads/${lead.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      onSave();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lead", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        lead_origin: lead.lead_origin || '',
        remarks: lead.remarks || '',
        assigned_to: lead.assigned_to || '',
        customer_address: (lead as any).customer_address || '',
        project_amount: lead.project_amount ? lead.project_amount.toString() : '',
        next_followup_date: lead.next_followup_date ? 
          new Date(lead.next_followup_date).toISOString().split('T')[0] : '',
        notes: lead.notes || '',
        deposit_paid: lead.deposit_paid || false,
        balance_paid: lead.balance_paid || false,
        installation_date: lead.installation_date ? new Date(lead.installation_date).toISOString().split('T')[0] : '',
        assigned_installer: (() => {
          if (!lead.assigned_installer) return [];
          if (Array.isArray(lead.assigned_installer)) return lead.assigned_installer;
          return lead.assigned_installer.split(',').map(s => s.trim()).filter(s => s);
        })(),
        selected_colors: (lead as any).selected_colors || []
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle new note addition and color selection note
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

    const updates = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      lead_origin: formData.lead_origin,
      remarks: formData.remarks,
      assigned_to: formData.assigned_to,
      customer_address: formData.customer_address || null,
      project_amount: formData.project_amount ? parseFloat(formData.project_amount) : null,
      next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date) : null,
      notes: updatedNotes || null,
      deposit_paid: formData.deposit_paid,
      balance_paid: formData.balance_paid,
      installation_date: formData.installation_date ? new Date(formData.installation_date) : null,
      assigned_installer: formData.assigned_installer,
      selected_colors: formData.selected_colors
    };

    updateLeadMutation.mutate(updates);
  };

  if (!lead) return null;

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" data-testid="quick-edit-modal">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription className="sr-only">
            Edit lead information including contact details, status, payment information, and project assignments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two Column Layout - Always two columns */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
            {/* Left Column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NAME <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-edit-name"
                  className="h-11 text-base"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  data-testid="input-edit-email"
                  className="h-11 text-base"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="assigned_to" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">ASSIGNED TO</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({...formData, assigned_to: value})}
                >
                  <SelectTrigger data-testid="select-edit-assigned" className="h-11 text-base">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEES.map(assignee => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee.charAt(0).toUpperCase() + assignee.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Customer Address - Only show when status is sold */}
              {formData.remarks === 'Sold' && (
                <div className="space-y-1">
                  <Label htmlFor="customer_address" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    CUSTOMER ADDRESS FOR INSTALLATION
                  </Label>
                  <Textarea
                    id="customer_address"
                    value={formData.customer_address}
                    onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                    data-testid="textarea-edit-customer-address"
                    className="text-base resize-none"
                    rows={3}
                    placeholder="Enter the complete installation address..."
                  />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PHONE <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  data-testid="input-edit-phone"
                  className="h-11 text-base"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.remarks}
                  onValueChange={(value) => setFormData({...formData, remarks: value})}
                >
                  <SelectTrigger data-testid="select-edit-status" className="h-11 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="project_amount" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">PROJECT AMOUNT</Label>
                <Input
                  id="project_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.project_amount}
                  onChange={(e) => setFormData({...formData, project_amount: e.target.value})}
                  data-testid="input-edit-amount"
                  className="h-11 text-base"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="next_followup_date" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">NEXT FOLLOW-UP DATE</Label>
                <Input
                  id="next_followup_date"
                  type="date"
                  value={formData.next_followup_date}
                  onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                  data-testid="input-edit-followup-date"
                  className="h-11 text-base"
                />
              </div>
              
              {formData.remarks === 'Sold' && (
                <div className="space-y-1">
                  <Label htmlFor="installation_date" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">INSTALLATION DATE</Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => setFormData({...formData, installation_date: e.target.value})}
                    data-testid="input-edit-installation-date"
                    className="h-11 text-base"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Status - Only for Sold Status - First Priority */}
          {formData.remarks === 'Sold' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
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
                  onClick={() => setFormData({...formData, deposit_paid: !formData.deposit_paid})}
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
                  onClick={() => setFormData({...formData, balance_paid: !formData.balance_paid})}
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

              {/* Installer Selection - Clean Dropdown */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ASSIGNED INSTALLERS
                </Label>
                <Select
                  value=""
                  onValueChange={(installer) => {
                    if (installer && !formData.assigned_installer.includes(installer)) {
                      setFormData({
                        ...formData,
                        assigned_installer: [...formData.assigned_installer, installer]
                      });
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-installer" className="h-11 text-base">
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
                  <div className="flex flex-wrap gap-2">
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
                            setFormData({
                              ...formData,
                              assigned_installer: formData.assigned_installer.filter(i => i !== installer)
                            });
                          }}
                          data-testid={`remove-installer-${installer}`}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Selection - Clean Dropdown */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  COLOR SELECTION (Typically 2 colors)
                </Label>
                <Select
                  value=""
                  onValueChange={(color) => {
                    if (color && !formData.selected_colors.includes(color)) {
                      setFormData({
                        ...formData,
                        selected_colors: [...formData.selected_colors, color]
                      });
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-color" className="h-11 text-base">
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
                  <div className="flex flex-wrap gap-2">
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
                            setFormData({
                              ...formData,
                              selected_colors: formData.selected_colors.filter(c => c !== color)
                            });
                          }}
                          data-testid={`remove-color-${color}`}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes History and New Note - Full Width at Bottom */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NOTES HISTORY
            </Label>
            
            {/* Existing Notes History */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.notes ? (
                formData.notes.split('\n').filter(line => line.trim()).reverse().map((note, index) => {
                  const match = note.match(/^\[(.+?)\]\s*(.+)$/);
                  if (match) {
                    const [, date, content] = match;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
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
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{note}</p>
                        </div>
                      </div>
                    );
                  }
                })
              ) : (
                <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">
                  No notes history available
                </p>
              )}
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
                placeholder="Enter a new note..."
                rows={2}
                className="resize-none text-base"
              />
            </div>
          </div>

          {/* Action Buttons - Right Aligned */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onHide}
              data-testid="button-cancel-edit"
              className="px-8 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateLeadMutation.isPending}
              data-testid="button-save-edit"
              className="px-8 h-10 bg-green-600 hover:bg-green-700"
            >
              {updateLeadMutation.isPending ? 'Saving...' : 'Update Lead'}
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

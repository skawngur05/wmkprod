import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, LEAD_ORIGINS, LEAD_STATUSES, ASSIGNEES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    project_amount: '',
    next_followup_date: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        project_amount: lead.project_amount ? lead.project_amount.toString() : '',
        next_followup_date: lead.next_followup_date ? 
          new Date(lead.next_followup_date).toISOString().split('T')[0] : '',
        notes: lead.notes || ''
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      lead_origin: formData.lead_origin,
      remarks: formData.remarks,
      assigned_to: formData.assigned_to,
      project_amount: formData.project_amount ? parseFloat(formData.project_amount) : null,
      next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date) : null,
      notes: formData.notes || null
    };

    updateLeadMutation.mutate(updates);
  };

  if (!lead) return null;

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-3xl" data-testid="quick-edit-modal">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  NAME <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-edit-name"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  data-testid="input-edit-email"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">ASSIGNED TO</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({...formData, assigned_to: value})}
                >
                  <SelectTrigger data-testid="select-edit-assigned" className="h-10">
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
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  PHONE <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  data-testid="input-edit-phone"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  STATUS <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.remarks}
                  onValueChange={(value) => setFormData({...formData, remarks: value})}
                >
                  <SelectTrigger data-testid="select-edit-status" className="h-10">
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
              
              <div className="space-y-2">
                <Label htmlFor="project_amount" className="text-sm font-medium text-gray-700">PROJECT AMOUNT</Label>
                <Input
                  id="project_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.project_amount}
                  onChange={(e) => setFormData({...formData, project_amount: e.target.value})}
                  data-testid="input-edit-amount"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Notes - Full Width at Bottom */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">NOTES</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              data-testid="textarea-edit-notes"
              placeholder="Add any additional notes about this lead..."
              className="resize-none"
            />
          </div>

          {/* Action Buttons - Right Aligned */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onHide}
              data-testid="button-cancel-edit"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateLeadMutation.isPending}
              data-testid="button-save-edit"
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {updateLeadMutation.isPending ? 'Saving...' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

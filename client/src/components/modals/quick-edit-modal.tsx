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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="quick-edit-modal">
        <DialogHeader>
          <DialogTitle>Edit Lead Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                data-testid="input-edit-phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                data-testid="input-edit-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_origin">Lead Origin</Label>
              <Select
                value={formData.lead_origin}
                onValueChange={(value) => setFormData({...formData, lead_origin: value})}
              >
                <SelectTrigger data-testid="select-edit-origin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_ORIGINS.map(origin => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.remarks}
                onValueChange={(value) => setFormData({...formData, remarks: value})}
              >
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData({...formData, assigned_to: value})}
              >
                <SelectTrigger data-testid="select-edit-assigned">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNEES.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_amount">Project Amount</Label>
              <Input
                id="project_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.project_amount}
                onChange={(e) => setFormData({...formData, project_amount: e.target.value})}
                data-testid="input-edit-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
              <Input
                id="next_followup_date"
                type="date"
                value={formData.next_followup_date}
                onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                data-testid="input-edit-followup"
              />
            </div>
          </div>

          {/* Notes - Always at the end */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              data-testid="textarea-edit-notes"
              placeholder="Add any additional notes about this lead..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={updateLeadMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onHide}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

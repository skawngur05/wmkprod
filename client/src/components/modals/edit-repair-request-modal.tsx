import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRepairRequestFormChanges } from '@/hooks/use-form-changes';

interface EditRepairRequestModalProps {
  show: boolean;
  onHide: () => void;
  repairRequest: any;
}

export function EditRepairRequestModal({ show, onHide, repairRequest }: EditRepairRequestModalProps) {
  // Helper function to format date without timezone issues
  const formatDateForInput = (dateValue: string | Date | null) => {
    if (!dateValue) return '';
    // If it's already a string in YYYY-MM-DD format, return as-is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // If it's a Date object or other format, convert to YYYY-MM-DD
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    // Use local time methods since we're storing as simple strings
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    issue_description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled',
    date_reported: '',
    completion_date: '',
    notes: '',
  });
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Track form changes
  const { shouldDisableSave } = useRepairRequestFormChanges(formData, originalFormData);

  // Update form when repairRequest changes
  useEffect(() => {
    if (repairRequest) {
      const initialData = {
        customer_name: repairRequest.customer_name || '',
        phone: repairRequest.phone || '',
        email: repairRequest.email || '',
        address: repairRequest.address || '',
        issue_description: repairRequest.issue_description || '',
        priority: repairRequest.priority || 'Medium',
        status: repairRequest.status || 'Pending',
        date_reported: formatDateForInput(repairRequest.date_reported),
        completion_date: formatDateForInput(repairRequest.completion_date),
        notes: repairRequest.notes || '',
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [repairRequest]);

  // Update repair request mutation
  const updateRepairMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/repair-requests/${repairRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update repair request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Repair request updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/repair-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      onHide();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update repair request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      completion_date: formData.completion_date || null,
    };
    
    updateRepairMutation.mutate(updateData);
  };

  const handleMarkAsDone = () => {
    const getTodayDateString = () => {
      const today = new Date();
      return today.getFullYear() + '-' + 
             String(today.getMonth() + 1).padStart(2, '0') + '-' + 
             String(today.getDate()).padStart(2, '0');
    };
    
    const today = getTodayDateString();
    const updateData = {
      ...formData,
      status: 'Completed',
      completion_date: today,
    };
    
    updateRepairMutation.mutate(updateData);
  };

  if (!repairRequest) return null;

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Repair Request #{repairRequest.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="completion_date">Completion Date</Label>
              <Input
                id="completion_date"
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
              />
              {formData.status !== 'Completed' && !formData.completion_date && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  ⚠️ Completion date must be selected before marking as done
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="issue_description">Issue Description *</Label>
            <Textarea
              id="issue_description"
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              placeholder="Describe the issue in detail..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes or updates..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="date_reported">Date Reported</Label>
            <Input
              id="date_reported"
              type="date"
              value={formData.date_reported}
              onChange={(e) => setFormData({ ...formData, date_reported: e.target.value })}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              {formData.status !== 'Completed' && (
                <Button 
                  type="button" 
                  variant="default"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleMarkAsDone}
                  disabled={updateRepairMutation.isPending || !formData.completion_date}
                  title={!formData.completion_date ? "Please fill in the completion date before marking as done" : ""}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {updateRepairMutation.isPending ? 'Marking as Done...' : 'Mark as Done'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onHide}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRepairMutation.isPending || shouldDisableSave} 
                className="disabled:opacity-50 disabled:cursor-not-allowed"
                title={shouldDisableSave ? "No changes to save" : ""}
              >
                {updateRepairMutation.isPending ? 'Updating...' : 'Update Repair Request'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

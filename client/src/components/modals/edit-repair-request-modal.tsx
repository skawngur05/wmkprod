import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRepairRequestFormChanges } from '@/hooks/use-form-changes';
import { AlertTriangle, User, Phone, Mail, MapPin, FileText, Tag, Calendar, CheckCircle2, Edit } from 'lucide-react';

interface EditRepairRequestModalProps {
  show: boolean;
  onHide: () => void;
  repairRequest: any;
}

export function EditRepairRequestModal({ show, onHide, repairRequest }: EditRepairRequestModalProps) {
  const formatDateForInput = (dateValue: string | Date | null) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
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

  const { shouldDisableSave } = useRepairRequestFormChanges(formData, originalFormData);

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

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-blue-100 text-blue-800 border-blue-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Urgent': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0" data-testid="edit-repair-modal">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit className="h-6 w-6 text-orange-600" />
                </div>
                Edit Repair Request #{repairRequest.id}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2 flex items-center gap-3">
                <Badge variant="outline" className={`${getPriorityColor(formData.priority)} border px-3 py-1`}>
                  {formData.priority}
                </Badge>
                <Badge variant="outline" className={`${getStatusColor(formData.status)} border px-3 py-1`}>
                  {formData.status}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <Card className="border-purple-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                      className="h-10"
                      data-testid="input-customer-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="h-10"
                      data-testid="input-phone"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-10"
                      data-testid="input-email"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="min-h-[80px] resize-none"
                      data-testid="textarea-address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Issue Details</h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Issue Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={formData.issue_description}
                    onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="min-h-[100px] resize-none"
                    required
                    data-testid="textarea-issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-orange-600" />
                      Priority
                    </Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="h-10">
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="h-10">
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
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Reported</Label>
                    <Input
                      type="date"
                      value={formData.date_reported}
                      onChange={(e) => setFormData({ ...formData, date_reported: e.target.value })}
                      className="h-10"
                      data-testid="input-date-reported"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Completion Date</Label>
                    <Input
                      type="date"
                      value={formData.completion_date}
                      onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      className="h-10"
                      data-testid="input-completion-date"
                    />
                    {formData.status !== 'Completed' && !formData.completion_date && (
                      <p className="text-amber-600 text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Completion date required to mark as done
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes or updates..."
                    className="min-h-[100px] resize-none"
                    data-testid="textarea-notes"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
            <div>
              {formData.status !== 'Completed' && (
                <Button 
                  type="button" 
                  variant="default"
                  className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 min-w-[140px]"
                  onClick={handleMarkAsDone}
                  disabled={updateRepairMutation.isPending || !formData.completion_date}
                  data-testid="button-mark-done"
                >
                  {updateRepairMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Done
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onHide} className="min-w-[100px]">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateRepairMutation.isPending || shouldDisableSave}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                data-testid="button-submit"
              >
                {updateRepairMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SampleBooklet, UpdateSampleBooklet, updateSampleBookletSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useBookletFormChanges } from '@/hooks/use-form-changes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, User, Phone, Mail, MapPin, FileText, Tag, Truck, Calendar, Edit, CheckCircle2 } from 'lucide-react';

interface EditBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  booklet: SampleBooklet | null;
}

interface FormData extends Omit<UpdateSampleBooklet, 'date_shipped'> {
  date_shipped?: string;
}

export default function EditBookletModal({ isOpen, onClose, booklet }: EditBookletModalProps) {
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

  const getTodayDateString = () => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  };

  const [formData, setFormData] = useState<FormData>({});
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { shouldDisableSave } = useBookletFormChanges(formData, originalFormData);

  useEffect(() => {
    if (booklet) {
      const initialData = {
        order_number: booklet.order_number,
        customer_name: booklet.customer_name,
        address: booklet.address,
        email: booklet.email,
        phone: booklet.phone,
        product_type: booklet.product_type,
        status: booklet.status,
        tracking_number: booklet.tracking_number,
        date_shipped: formatDateForInput(booklet.date_shipped),
        notes: booklet.notes,
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [booklet]);

  const updateBookletMutation = useMutation({
    mutationFn: async (data: UpdateSampleBooklet) => {
      if (!booklet) throw new Error('No booklet selected');
      return await apiRequest('PUT', `/api/sample-booklets/${booklet.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Sample booklet order updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets/stats/dashboard'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating booklet:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update sample booklet order", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const processedData: UpdateSampleBooklet = {
        ...formData,
        tracking_number: formData.tracking_number || null,
        date_shipped: formData.date_shipped ? new Date(formData.date_shipped) : null,
        notes: formData.notes || null
      };
      
      Object.keys(processedData).forEach(key => {
        if (processedData[key as keyof UpdateSampleBooklet] === undefined) {
          delete processedData[key as keyof UpdateSampleBooklet];
        }
      });
      
      const validatedData = updateSampleBookletSchema.parse(processedData);
      updateBookletMutation.mutate(validatedData);
    } catch (error: any) {
      console.error('Validation error:', error);
      let errorMessage = "Please check all fields";
      
      if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      }
      
      toast({ 
        title: "Validation Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleStatusChange = (newStatus: string) => {
    setFormData(prev => ({
      ...prev,
      status: newStatus as "Pending" | "Shipped" | "Delivered" | "Refunded",
      date_shipped: newStatus === 'Shipped' && !prev.date_shipped ? getTodayDateString() : prev.date_shipped
    }));
  };

  if (!isOpen || !booklet) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Shipped': 'bg-blue-100 text-blue-800 border-blue-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Refunded': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0" data-testid="edit-booklet-modal">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                Edit Order #{booklet.order_number}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2 flex items-center gap-3">
                <Badge variant="outline" className={`${getStatusColor(booklet.status)} border px-3 py-1`}>
                  {booklet.status}
                </Badge>
                <span className="text-sm">{booklet.customer_name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Order Number</Label>
                    <Input
                      type="text"
                      name="order_number"
                      value={formData.order_number || ''}
                      onChange={handleInputChange}
                      data-testid="input-edit-order-number"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Product Type</Label>
                    <Select
                      value={formData.product_type || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value as any }))}
                    >
                      <SelectTrigger data-testid="select-edit-product-type" className="h-10">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Demo Kit & Sample Booklet">Demo Kit & Sample Booklet</SelectItem>
                        <SelectItem value="Sample Booklet Only">Sample Booklet Only</SelectItem>
                        <SelectItem value="Trial Kit">Trial Kit</SelectItem>
                        <SelectItem value="Demo Kit Only">Demo Kit Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-orange-600" />
                      Status
                    </Label>
                    <Select
                      value={formData.status || 'Pending'}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger data-testid="select-edit-status" className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Customer Name</Label>
                    <Input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name || ''}
                      onChange={handleInputChange}
                      data-testid="input-edit-customer-name"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      data-testid="input-edit-phone"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      data-testid="input-edit-email"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Address
                    </Label>
                    <Textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      data-testid="textarea-edit-address"
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-5 w-5 text-cyan-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tracking Number</Label>
                    <Input
                      type="text"
                      name="tracking_number"
                      value={formData.tracking_number || ''}
                      onChange={handleInputChange}
                      data-testid="input-edit-tracking-number"
                      className="h-10"
                      placeholder="Enter tracking number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-600" />
                      Date Shipped
                    </Label>
                    <Input
                      type="date"
                      name="date_shipped"
                      value={formData.date_shipped || ''}
                      onChange={handleInputChange}
                      data-testid="input-edit-date-shipped"
                      className="h-10"
                    />
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
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    data-testid="textarea-edit-notes"
                    className="min-h-[100px] resize-none"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateBookletMutation.isPending || shouldDisableSave}
              className="min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              data-testid="button-submit-edit"
            >
              {updateBookletMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Update Order
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

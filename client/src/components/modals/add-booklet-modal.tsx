import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InsertSampleBooklet, PRODUCT_TYPES, insertSampleBookletSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Package, User, Phone, Mail, MapPin, FileText, Tag, Plus } from 'lucide-react';

interface AddBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookletModal({ isOpen, onClose }: AddBookletModalProps) {
  const getTodayDateString = () => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  };

  const [formData, setFormData] = useState<InsertSampleBooklet>({
    order_number: '',
    customer_name: '',
    address: '',
    email: '',
    phone: '',
    product_type: 'Sample Booklet Only',
    status: 'Pending',
    date_ordered: getTodayDateString() as any,
    notes: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addBookletMutation = useMutation({
    mutationFn: async (data: InsertSampleBooklet) => {
      return await apiRequest('POST', '/api/sample-booklets', data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Sample booklet order created successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets/stats/dashboard'] });
      onClose();
      setFormData({
        order_number: '',
        customer_name: '',
        address: '',
        email: '',
        phone: '',
        product_type: 'Sample Booklet Only',
        status: 'Pending',
        date_ordered: getTodayDateString() as any,
        notes: null,
      });
    },
    onError: (error: any) => {
      console.error('Error adding booklet:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create sample booklet order", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = insertSampleBookletSchema.parse(formData);
      addBookletMutation.mutate(validatedData);
    } catch (error: any) {
      toast({ 
        title: "Validation Error", 
        description: "Please check all required fields", 
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0" data-testid="add-booklet-modal">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                New Sample Booklet Order
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Create a new sample booklet order for a customer
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
                    <Label className="text-sm font-medium">
                      Order Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="order_number"
                      value={formData.order_number}
                      onChange={handleInputChange}
                      required
                      data-testid="input-order-number"
                      className="h-10"
                      placeholder="Enter order number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Product Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.product_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value as any }))}
                    >
                      <SelectTrigger data-testid="select-product-type" className="h-10">
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger data-testid="select-status" className="h-10">
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
                    <Label className="text-sm font-medium">
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                      data-testid="input-customer-name"
                      className="h-10"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      data-testid="input-phone"
                      className="h-10"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      data-testid="input-email"
                      className="h-10"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      data-testid="textarea-address"
                      className="min-h-[80px] resize-none"
                      placeholder="Enter shipping address"
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
                  <Label className="text-sm font-medium">Notes (Optional)</Label>
                  <Textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    data-testid="textarea-notes"
                    className="min-h-[100px] resize-none"
                    placeholder="Add any additional notes or special instructions..."
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
              data-testid="button-cancel-add"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addBookletMutation.isPending}
              className="min-w-[140px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              data-testid="button-submit-add"
            >
              {addBookletMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

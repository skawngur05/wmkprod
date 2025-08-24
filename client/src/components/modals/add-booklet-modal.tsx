import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InsertSampleBooklet, PRODUCT_TYPES, insertSampleBookletSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AddBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookletModal({ isOpen, onClose }: AddBookletModalProps) {
  const [formData, setFormData] = useState<InsertSampleBooklet>({
    order_number: '',
    customer_name: '',
    address: '',
    email: '',
    phone: '',
    product_type: 'sample_booklet_only',
    status: 'pending',
    tracking_number: null,
    date_shipped: null,
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
        product_type: 'sample_booklet_only',
        status: 'pending',
        tracking_number: null,
        date_shipped: null,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Sample Booklet Order</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              data-testid="button-close-add-modal"
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Order Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="order_number"
                    value={formData.order_number}
                    onChange={handleInputChange}
                    required
                    data-testid="input-order-number"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Product Type *</label>
                  <select
                    className="form-select"
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleInputChange}
                    required
                    data-testid="select-product-type"
                  >
                    <option value="demo_kit_and_sample_booklet">Demo Kit & Sample Booklet</option>
                    <option value="sample_booklet_only">Sample Booklet Only</option>
                    <option value="trial_kit">Trial Kit</option>
                    <option value="demo_kit_only">Demo Kit Only</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    data-testid="input-customer-name"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    data-testid="select-status"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Address *</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    data-testid="textarea-address"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Tracking Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tracking_number"
                    value={formData.tracking_number || ''}
                    onChange={handleInputChange}
                    data-testid="input-tracking-number"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                data-testid="button-cancel-add"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={addBookletMutation.isPending}
                data-testid="button-submit-add"
              >
                {addBookletMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-1"></i>
                    Creating...
                  </>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
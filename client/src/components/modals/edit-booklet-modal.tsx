import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SampleBooklet, UpdateSampleBooklet, updateSampleBookletSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useBookletFormChanges } from '@/hooks/use-form-changes';

interface EditBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  booklet: SampleBooklet | null;
}

interface FormData extends Omit<UpdateSampleBooklet, 'date_shipped'> {
  date_shipped?: string;
}

export default function EditBookletModal({ isOpen, onClose, booklet }: EditBookletModalProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Track form changes
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
        date_shipped: booklet.date_shipped ? new Date(booklet.date_shipped).toISOString().split('T')[0] : '',
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
        // Convert empty strings to null for optional fields
        tracking_number: formData.tracking_number || null,
        date_shipped: formData.date_shipped ? new Date(formData.date_shipped) : null,
        notes: formData.notes || null
      };
      
      // Remove any undefined values
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      date_shipped: newStatus === 'Shipped' && !prev.date_shipped ? new Date().toISOString().split('T')[0] : prev.date_shipped
    }));
  };

  if (!isOpen || !booklet) return null;

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Sample Booklet Order - {booklet.order_number}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              data-testid="button-close-edit-modal"
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Order Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="order_number"
                    value={formData.order_number || ''}
                    onChange={handleInputChange}
                    data-testid="input-edit-order-number"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Product Type</label>
                  <select
                    className="form-select"
                    name="product_type"
                    value={formData.product_type || ''}
                    onChange={handleInputChange}
                    data-testid="select-edit-product-type"
                  >
                    <option value="Demo Kit & Sample Booklet">Demo Kit & Sample Booklet</option>
                    <option value="Sample Booklet Only">Sample Booklet Only</option>
                    <option value="Trial Kit">Trial Kit</option>
                    <option value="Demo Kit Only">Demo Kit Only</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customer_name"
                    value={formData.customer_name || ''}
                    onChange={handleInputChange}
                    data-testid="input-edit-customer-name"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    data-testid="input-edit-phone"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    data-testid="input-edit-email"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status || 'Pending'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    data-testid="select-edit-status"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    data-testid="textarea-edit-address"
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
                    data-testid="input-edit-tracking-number"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date Shipped</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_shipped"
                    value={formData.date_shipped || ''}
                    onChange={handleInputChange}
                    data-testid="input-edit-date-shipped"
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
                    data-testid="textarea-edit-notes"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                data-testid="button-cancel-edit"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateBookletMutation.isPending || shouldDisableSave}
                data-testid="button-submit-edit"
                title={shouldDisableSave ? "No changes to save" : ""}
                style={{ opacity: shouldDisableSave ? 0.5 : 1, cursor: shouldDisableSave ? 'not-allowed' : 'pointer' }}
              >
                {updateBookletMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-1"></i>
                    Updating...
                  </>
                ) : (
                  'Update Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
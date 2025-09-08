import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LEAD_ORIGINS, ASSIGNEES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AddLeadModalProps {
  show: boolean;
  onHide: () => void;
}

export function AddLeadModal({ show, onHide }: AddLeadModalProps) {
  // Helper function to get today's date in YYYY-MM-DD format (timezone-safe)
  const getTodayDateString = () => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lead_origin: '',
    assigned_to: '',
    project_amount: '',
    notes: '',
    pickup_date: '',
    installation_date: '',
    installation_end_date: '',
    deposit_paid: false,
    balance_paid: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      console.log('Sending lead data:', leadData);
      const response = await apiRequest('POST', '/api/leads', leadData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead created successfully!" });
      // Invalidate multiple query patterns to ensure all lead-related data refreshes
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-page'] }); // For the leads page
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      resetForm();
      onHide();
    },
    onError: (error: any) => {
      console.error('Add lead error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create lead", 
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      lead_origin: '',
      assigned_to: '',
      project_amount: '',
      notes: '',
      pickup_date: '',
      installation_date: '',
      installation_end_date: '',
      deposit_paid: false,
      balance_paid: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data before validation:', formData);
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.lead_origin || !formData.assigned_to) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    // PRODUCTION BULLETPROOF FIX: Ensure all dates are strings
    const ensureDateString = (dateValue: any): string | null => {
      if (!dateValue) return null;
      if (typeof dateValue === 'string') return dateValue;
      if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        const result = `${year}-${month}-${day}`;
        console.log(`🔧 ADD-LEAD PRODUCTION FIX: Converted Date object to string: ${result}`);
        return result;
      }
      return String(dateValue);
    };
    
    const leadData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      lead_origin: formData.lead_origin,
      assigned_to: formData.assigned_to,
      project_amount: formData.project_amount ? formData.project_amount : "0.00",
      notes: formData.notes || null,
      remarks: "New", // Fixed: capital N to match enum
      date_created: getTodayDateString(), // Add required date_created field
      next_followup_date: null,
      additional_notes: null,
      deposit_paid: formData.deposit_paid,
      balance_paid: formData.balance_paid,
      pickup_date: ensureDateString(formData.pickup_date),
      installation_date: ensureDateString(formData.installation_date),
      installation_end_date: ensureDateString(formData.installation_end_date),
      assigned_installer: null
    };

    console.log('Prepared lead data:', leadData);
    createLeadMutation.mutate(leadData);
  };

  return (
    <div 
      className={`modal fade ${show ? 'show' : ''}`} 
      style={{ display: show ? 'block' : 'none' }}
      data-testid="add-lead-modal"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Lead</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              data-testid="button-close-add-modal"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    data-testid="input-add-name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    data-testid="input-add-phone"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    data-testid="input-add-email"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Lead Origin *</label>
                  <select
                    className="form-select"
                    value={formData.lead_origin}
                    onChange={(e) => setFormData({...formData, lead_origin: e.target.value})}
                    required
                    data-testid="select-add-origin"
                  >
                    <option value="">Select Origin</option>
                    {LEAD_ORIGINS.map(origin => (
                      <option key={origin} value={origin}>{origin.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Assigned To *</label>
                  <select
                    className="form-select"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    required
                    data-testid="select-add-assigned"
                  >
                    <option value="">Select Team Member</option>
                    {ASSIGNEES.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    step="0.01"
                    value={formData.project_amount}
                    onChange={(e) => setFormData({...formData, project_amount: e.target.value})}
                    data-testid="input-add-amount"
                  />
                </div>
                
                {/* Payment Status Checkboxes */}
                <div className="col-12 mb-3">
                  <label className="form-label">Payment Status</label>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="deposit_paid"
                          checked={formData.deposit_paid}
                          onChange={(e) => setFormData({...formData, deposit_paid: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="deposit_paid">
                          Deposit Paid
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="balance_paid"
                          checked={formData.balance_paid}
                          onChange={(e) => setFormData({...formData, balance_paid: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="balance_paid">
                          Balance Paid
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Date - Only show if deposit is paid */}
                {formData.deposit_paid && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Pickup Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                      data-testid="input-add-pickup-date"
                    />
                  </div>
                )}
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Installation Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.installation_date}
                    onChange={(e) => setFormData({...formData, installation_date: e.target.value})}
                    data-testid="input-add-installation-date"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Installation End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.installation_end_date}
                    onChange={(e) => setFormData({...formData, installation_end_date: e.target.value})}
                    data-testid="input-add-installation-end-date"
                  />
                  <small className="form-text text-muted">Leave empty for single-day installations</small>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Add any initial notes about this lead..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    data-testid="textarea-add-notes"
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide}
              data-testid="button-cancel-add"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={createLeadMutation.isPending}
              data-testid="button-save-add"
            >
              {createLeadMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Adding...
                </>
              ) : (
                'Add Lead'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

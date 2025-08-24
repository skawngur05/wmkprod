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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lead_origin: '',
    assigned_to: '',
    project_amount: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest('POST', '/api/leads', leadData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead created successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      resetForm();
      onHide();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
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
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.lead_origin || !formData.assigned_to) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const leadData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      lead_origin: formData.lead_origin,
      assigned_to: formData.assigned_to,
      project_amount: formData.project_amount ? parseFloat(formData.project_amount) : null,
      notes: formData.notes || null,
      remarks: "new", // Default status for new leads
      next_followup_date: null,
      additional_notes: null,
      deposit_paid: false,
      balance_paid: false,
      installation_date: null,
      assigned_installer: null
    };

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
                      <option key={origin} value={origin}>{origin}</option>
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

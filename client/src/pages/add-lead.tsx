import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LEAD_ORIGINS, LEAD_STATUSES, ASSIGNEES, insertLeadSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function AddLead() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lead_origin: 'facebook',
    remarks: 'new',
    assigned_to: 'kim',
    project_amount: '',
    next_followup_date: '',
    notes: ''
  });

  const [, setLocation] = useLocation();
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
      setLocation('/leads');
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to create lead", 
        variant: "destructive" 
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const leadData = {
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

      createLeadMutation.mutate(leadData);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Please check your input data", 
        variant: "destructive" 
      });
    }
  };

  const handleCancel = () => {
    setLocation('/leads');
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-user-plus text-success me-2"></i>
                  Add New Lead
                </h4>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                  data-testid="button-back-to-leads"
                >
                  <i className="fas fa-arrow-left me-1"></i>Back to Leads
                </button>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} data-testid="add-lead-form">
                <div className="row">
                  {/* Basic Information */}
                  <div className="col-12 mb-4">
                    <h5 className="text-primary border-bottom pb-2">
                      <i className="fas fa-user me-2"></i>Basic Information
                    </h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label required">
                      <i className="fas fa-user me-1"></i>Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      data-testid="input-lead-name"
                      placeholder="Enter customer's full name"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label required">
                      <i className="fas fa-phone me-1"></i>Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      data-testid="input-lead-phone"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-envelope me-1"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      data-testid="input-lead-email"
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label required">
                      <i className="fas fa-share-alt me-1"></i>Lead Origin
                    </label>
                    <select
                      className="form-select"
                      value={formData.lead_origin}
                      onChange={(e) => handleInputChange('lead_origin', e.target.value)}
                      required
                      data-testid="select-lead-origin"
                    >
                      {LEAD_ORIGINS.map(origin => (
                        <option key={origin} value={origin}>
                          {origin.charAt(0).toUpperCase() + origin.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Management */}
                  <div className="col-12 mb-4 mt-4">
                    <h5 className="text-primary border-bottom pb-2">
                      <i className="fas fa-tasks me-2"></i>Lead Management
                    </h5>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-flag me-1"></i>Status
                    </label>
                    <select
                      className="form-select"
                      value={formData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      data-testid="select-lead-status"
                    >
                      {LEAD_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-user-tag me-1"></i>Assigned To
                    </label>
                    <select
                      className="form-select"
                      value={formData.assigned_to}
                      onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                      data-testid="select-lead-assigned"
                    >
                      {ASSIGNEES.map(assignee => (
                        <option key={assignee} value={assignee}>
                          {assignee.charAt(0).toUpperCase() + assignee.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-dollar-sign me-1"></i>Project Amount
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="0"
                      value={formData.project_amount}
                      onChange={(e) => handleInputChange('project_amount', e.target.value)}
                      data-testid="input-lead-amount"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-calendar-alt me-1"></i>Next Follow-up Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.next_followup_date}
                      onChange={(e) => handleInputChange('next_followup_date', e.target.value)}
                      data-testid="input-lead-followup"
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <i className="fas fa-sticky-note me-1"></i>Initial Notes
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      data-testid="textarea-lead-notes"
                      placeholder="Enter any initial notes about this lead..."
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    data-testid="button-cancel-add-lead"
                  >
                    <i className="fas fa-times me-1"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={createLeadMutation.isPending || !formData.name || !formData.phone}
                    data-testid="button-submit-add-lead"
                  >
                    {createLeadMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Creating Lead...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>Create Lead
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
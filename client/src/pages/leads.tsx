import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { formatCurrency, formatDate, getStatusColor, getOriginColor } from '@/lib/auth';
import { AddLeadModal } from '@/components/modals/add-lead-modal';
import { QuickEditModal } from '@/components/modals/quick-edit-modal';
import { QuickFollowupModal } from '@/components/modals/quick-followup-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Leads() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    origin: '',
    assigned_to: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [selectedFollowupLead, setSelectedFollowupLead] = useState<Lead | null>(null);
  const [showQuickFollowup, setShowQuickFollowup] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leadsResponse, isLoading } = useQuery<{
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: ['/api/leads', filters, currentPage],
    queryFn: async () => {
      // Build query parameters from filters and pagination
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.origin) params.append('origin', filters.origin);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
      
      // Add pagination parameters
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      const url = `/api/leads${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return res.json();
    },
  });

  // Extract leads and pagination info from response
  const leads = leadsResponse?.leads || [];
  const totalPages = leadsResponse?.totalPages || 1;
  const total = leadsResponse?.total || 0;

  // Helper function to update filters and reset pagination
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      await apiRequest('DELETE', `/api/leads/${leadId}`);
    },
    onMutate: async (leadId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['/api/leads'] });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['/api/leads', filters, currentPage]);

      // Optimistically update to the new value
      queryClient.setQueryData(['/api/leads', filters, currentPage], (old: any) => {
        if (!old?.leads) return old;
        return {
          ...old,
          leads: old.leads.filter((lead: any) => lead.id !== leadId),
          total: old.total - 1
        };
      });

      // Return a context object with the snapshotted value
      return { previousLeads };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: Error, leadId: string, context: any) => {
      // If it's a 404 error, the lead might already be deleted
      if (error.message.includes('404')) {
        toast({ title: "Info", description: "Lead was already deleted" });
        // Still refresh the data to reflect the current state
        queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      } else {
        // Rollback the optimistic update on error
        if (context?.previousLeads) {
          queryClient.setQueryData(['/api/leads', filters, currentPage], context.previousLeads);
        }
        toast({ title: "Error", description: "Failed to delete lead", variant: "destructive" });
      }
    }
  });

  const handleDelete = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      // Prevent double-clicks by disabling the button during deletion
      if (!deleteLeadMutation.isPending) {
        deleteLeadMutation.mutate(leadId);
      }
    }
  };

  const openQuickEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setShowQuickEdit(true);
  };

  const openQuickFollowup = (lead: Lead) => {
    setSelectedFollowupLead(lead);
    setShowQuickFollowup(true);
  };

  const isOverdue = (date: string | Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followupDate = new Date(date);
    return followupDate < today;
  };

  const isDueToday = (date: string | Date | null) => {
    if (!date) return false;
    const today = new Date();
    const followupDate = new Date(date);
    return (
      today.getDate() === followupDate.getDate() &&
      today.getMonth() === followupDate.getMonth() &&
      today.getFullYear() === followupDate.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p>Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 fw-bold" data-testid="leads-title">Lead Management</h1>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => window.location.href = '/add-lead'}
                data-testid="button-add-lead"
              >
                <i className="fas fa-plus me-1"></i>Add Lead
              </button>
              <button className="btn btn-outline-primary me-2" data-testid="button-export">
                <i className="fas fa-download me-1"></i>Export CSV
              </button>
              <button className="btn btn-outline-secondary" data-testid="button-import">
                <i className="fas fa-upload me-1"></i>Import CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => updateFilters({...filters, search: e.target.value})}
                data-testid="input-search-leads"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => updateFilters({...filters, status: e.target.value})}
                data-testid="select-filter-status"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="quoted">Quoted</option>
                <option value="sold">Sold</option>
                <option value="not-interested">Not Interested</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Origin</label>
              <select
                className="form-select"
                value={filters.origin}
                onChange={(e) => updateFilters({...filters, origin: e.target.value})}
                data-testid="select-filter-origin"
              >
                <option value="">All Origins</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Referral</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Assigned To</label>
              <select
                className="form-select"
                value={filters.assigned_to}
                onChange={(e) => updateFilters({...filters, assigned_to: e.target.value})}
                data-testid="select-filter-assigned"
              >
                <option value="">All Team</option>
                <option value="kim">Kim</option>
                <option value="patrick">Patrick</option>
                <option value="lina">Lina</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary me-2" data-testid="button-filter">
                <i className="fas fa-search me-1"></i>Filter
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => updateFilters({ search: '', status: '', origin: '', assigned_to: '' })}
                data-testid="button-clear-filters"
              >
                <i className="fas fa-times me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" data-testid="leads-table">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Origin</th>
                  <th>Next Follow-up</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Project Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads && leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id} data-testid={`lead-row-${lead.id}`}>
                      <td>{formatDate(lead.date_created)}</td>
                      <td>
                        <strong>{lead.name}</strong>
                      </td>
                      <td>
                        <div>
                          <i className="fas fa-phone text-muted me-1"></i>{lead.phone}
                          {lead.email && (
                            <>
                              <br />
                              <i className="fas fa-envelope text-muted me-1"></i>{lead.email}
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getOriginColor(lead.lead_origin)}`}>
                          {lead.lead_origin}
                        </span>
                      </td>
                      <td>
                        {lead.next_followup_date ? (
                          <span
                            className={
                              isOverdue(lead.next_followup_date) ? 'text-danger' :
                              isDueToday(lead.next_followup_date) ? 'text-warning' : 'text-success'
                            }
                          >
                            <i className={`fas ${
                              isOverdue(lead.next_followup_date) ? 'fa-exclamation-triangle' :
                              isDueToday(lead.next_followup_date) ? 'fa-clock' : 'fa-check'
                            } me-1`}></i>
                            {isOverdue(lead.next_followup_date) ? 'Overdue' :
                             isDueToday(lead.next_followup_date) ? 'Today' :
                             formatDate(lead.next_followup_date)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{lead.assigned_to}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(lead.remarks)} status-badge`}>
                          {lead.remarks}
                        </span>
                      </td>
                      <td>
                        {lead.project_amount ? formatCurrency(lead.project_amount) : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-circle btn-outline-success btn-sm me-1"
                          onClick={() => openQuickFollowup(lead)}
                          title="Quick Follow-up Update"
                          data-testid={`button-followup-lead-${lead.id}`}
                        >
                          <i className="fas fa-calendar-alt"></i>
                        </button>
                        <button
                          className="btn btn-circle btn-outline-primary btn-sm me-1"
                          onClick={() => openQuickEdit(lead)}
                          title="View Lead Details"
                          data-testid={`button-view-lead-${lead.id}`}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-circle btn-outline-danger btn-sm"
                          onClick={() => handleDelete(lead.id)}
                          disabled={deleteLeadMutation.isPending}
                          title="Delete Lead"
                          data-testid={`button-delete-lead-${lead.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      <div className="text-muted">
                        <i className="fas fa-inbox fa-3x mb-3"></i>
                        <p>No leads found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Showing {leads.length > 0 ? ((currentPage - 1) * 20 + 1) : 0} to {Math.min(currentPage * 20, total)} of {total} leads
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    data-testid="pagination-previous"
                  >
                    Previous
                  </button>
                </li>
                
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const pageNum = startPage + i;
                  if (pageNum <= totalPages) {
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(pageNum)}
                          data-testid={`pagination-${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                  return null;
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    data-testid="pagination-next"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <AddLeadModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      />

      {selectedLead && (
        <QuickEditModal
          lead={selectedLead}
          show={showQuickEdit}
          onHide={() => setShowQuickEdit(false)}
          onSave={() => {
            setShowQuickEdit(false);
          }}
        />
      )}

      <QuickFollowupModal
        lead={selectedFollowupLead}
        show={showQuickFollowup}
        onHide={() => {
          setShowQuickFollowup(false);
          setSelectedFollowupLead(null);
        }}
      />
    </div>
  );
}

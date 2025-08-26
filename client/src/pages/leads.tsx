import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { formatCurrency, formatDate, getStatusColor, getOriginColor } from '@/lib/auth';
import { AddLeadModal } from '@/components/modals/add-lead-modal';
import { QuickEditModal } from '@/components/modals/quick-edit-modal';
import { QuickFollowupModal } from '@/components/modals/quick-followup-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Download, Upload, Search, X, Phone, Mail, Calendar, Eye, Trash2, AlertTriangle, Clock, Check } from 'lucide-react';

export default function Leads() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    origin: 'all',
    assigned_to: 'all'
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
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.origin && filters.origin !== 'all') params.append('origin', filters.origin);
      if (filters.assigned_to && filters.assigned_to !== 'all') params.append('assigned_to', filters.assigned_to);
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="leads-title">Lead Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all your sales leads</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = '/add-lead'}
              data-testid="button-add-lead"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" data-testid="button-import">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={(e) => updateFilters({...filters, search: e.target.value})}
                  data-testid="input-search-leads"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilters({...filters, status: value})}
                >
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="not-interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Origin</label>
                <Select
                  value={filters.origin}
                  onValueChange={(value) => updateFilters({...filters, origin: value})}
                >
                  <SelectTrigger data-testid="select-filter-origin">
                    <SelectValue placeholder="All Origins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="google_text">Google Text</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned To</label>
                <Select
                  value={filters.assigned_to}
                  onValueChange={(value) => updateFilters({...filters, assigned_to: value})}
                >
                  <SelectTrigger data-testid="select-filter-assigned">
                    <SelectValue placeholder="All Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team</SelectItem>
                    <SelectItem value="kim">Kim</SelectItem>
                    <SelectItem value="patrick">Patrick</SelectItem>
                    <SelectItem value="lina">Lina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button className="w-full" data-testid="button-filter">
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Leads Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-testid="leads-table">
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Contact Info</TableHead>
                    <TableHead className="font-semibold text-gray-900">Origin</TableHead>
                    <TableHead className="font-semibold text-gray-900">Next Follow-up</TableHead>
                    <TableHead className="font-semibold text-gray-900">Assigned To</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Project Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads && leads.length > 0 ? (
                    leads.map((lead) => (
                      <TableRow key={lead.id} data-testid={`lead-row-${lead.id}`} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{formatDate(lead.date_created)}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900">{lead.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-700">
                              <Phone className="h-3 w-3 mr-2 text-green-600" />
                              {lead.phone}
                            </div>
                            {lead.email && (
                              <div className="flex items-center text-sm text-gray-700">
                                <Mail className="h-3 w-3 mr-2 text-blue-600" />
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border capitalize ${getOriginColor(lead.lead_origin)}`}>
                            {lead.lead_origin.replace('-', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {lead.next_followup_date ? (
                            <div className="flex items-center space-x-2">
                              <div className={
                                isOverdue(lead.next_followup_date) ? 'text-red-600' :
                                isDueToday(lead.next_followup_date) ? 'text-yellow-600' : 'text-green-600'
                              }>
                                {isOverdue(lead.next_followup_date) ? (
                                  <AlertTriangle className="h-4 w-4" />
                                ) : isDueToday(lead.next_followup_date) ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </div>
                              <span className={
                                isOverdue(lead.next_followup_date) ? 'text-red-600 font-medium' :
                                isDueToday(lead.next_followup_date) ? 'text-yellow-600 font-medium' : 'text-green-600'
                              }>
                                {isOverdue(lead.next_followup_date) ? 'Overdue' :
                                 isDueToday(lead.next_followup_date) ? 'Today' :
                                 formatDate(lead.next_followup_date)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 capitalize">{lead.assigned_to || 'Unassigned'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`capitalize ${
                              lead.remarks === 'sold' ? 'bg-green-100 text-green-800' :
                              lead.remarks === 'quoted' ? 'bg-purple-100 text-purple-800' :
                              lead.remarks === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              lead.remarks === 'new' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {lead.remarks.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-700">
                            {lead.project_amount ? formatCurrency(lead.project_amount) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openQuickFollowup(lead)}
                              title="Quick Follow-up Update"
                              data-testid={`button-followup-lead-${lead.id}`}
                              className="h-8 w-8 p-0"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openQuickEdit(lead)}
                              title="View Lead Details"
                              data-testid={`button-view-lead-${lead.id}`}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(lead.id)}
                              disabled={deleteLeadMutation.isPending}
                              title="Delete Lead"
                              data-testid={`button-delete-lead-${lead.id}`}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium mb-2">No leads found</p>
                          <p className="text-sm">Try adjusting your filters or add a new lead</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 px-2">
          <div className="text-sm text-gray-600">
            Showing {leads.length > 0 ? ((currentPage - 1) * 20 + 1) : 0} to {Math.min(currentPage * 20, total)} of {total} leads
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="pagination-previous"
            >
              Previous
            </Button>
            
            {/* Generate page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const pageNum = startPage + i;
              if (pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    data-testid={`pagination-${pageNum}`}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="pagination-next"
            >
              Next
            </Button>
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
    </div>
  );
}
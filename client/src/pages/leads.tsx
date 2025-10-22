import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Lead, LEAD_STATUSES } from '@shared/schema';
import { formatCurrency, formatDate, getStatusColor, getOriginColor } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Download, Upload, Search, X, Phone, Mail, Calendar, Eye, Trash2, AlertTriangle, Clock, Check } from 'lucide-react';

const formatDateTimezoneAware = (dateString: string, options: Intl.DateTimeFormatOptions) => {
  if (!dateString) return '';
  
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (options.month === 'short' && options.day === 'numeric' && options.year === 'numeric') {
      return `${monthNames[month - 1]} ${day}, ${year}`;
    }
    
    if (options.month === 'short' && options.day === 'numeric' && options.year === '2-digit') {
      const shortYear = String(year).slice(-2);
      return `${monthNames[month - 1]} ${day}, '${shortYear}`;
    }
    
    if (options.month === 'short' && options.day === 'numeric' && !options.year) {
      return `${monthNames[month - 1]} ${day}`;
    }
    
    return dateString;
  }
  
  return String(dateString);
};

export default function Leads() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    origin: 'all',
    assigned_to: 'all'
  });
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [selectedFollowupLead, setSelectedFollowupLead] = useState<Lead | null>(null);
  const [showQuickFollowup, setShowQuickFollowup] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/users/active'],
    queryFn: async () => {
      const response = await fetch('/api/users/active');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const copyToClipboard = async (text: string, type: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type === 'phone' ? 'Phone number' : 'Email address'} copied successfully`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const filter = urlParams.get('filter');
    
    if (status === 'sold') {
      setFilters(prev => ({ ...prev, status: 'sold' }));
    } else if (filter === 'today') {
      setFilters(prev => ({ ...prev, status: 'all' }));
    }
  }, []);

  const queryFilters = useMemo(() => {
    return {
      search: filters.search,
      status: filters.status,
      origin: filters.origin,
      assigned_to: filters.assigned_to
    };
  }, [filters.search, filters.status, filters.origin, filters.assigned_to]);

  const { data: leadsResponse, isLoading, error, isError } = useQuery<{
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: ['leads-page', queryFilters, currentPage, user?.username],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryFilters.search) params.append('search', queryFilters.search);
      if (queryFilters.status && queryFilters.status !== 'all') params.append('status', queryFilters.status);
      if (queryFilters.origin && queryFilters.origin !== 'all') params.append('origin', queryFilters.origin);
      if (queryFilters.assigned_to && queryFilters.assigned_to !== 'all') params.append('assigned_to', queryFilters.assigned_to);
      
      if (user?.username) params.append('username', user.username);
      
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      const url = `/api/leads${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchOnMount: true,
    retry: 3,
  });

  const leads = leadsResponse?.leads || [];
  const totalPages = leadsResponse?.totalPages || 1;
  const total = leadsResponse?.total || 0;

  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    if (newFilters.status !== filters.status || 
        newFilters.origin !== filters.origin || 
        newFilters.assigned_to !== filters.assigned_to) {
      setCurrentPage(1);
    }
  }, [filters.status, filters.origin, filters.assigned_to]);

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      await apiRequest('DELETE', `/api/leads/${leadId}`);
    },
    onMutate: async (leadId: string) => {
      await queryClient.cancelQueries({ queryKey: ['/api/leads'] });
      const previousLeads = queryClient.getQueryData(['/api/leads', filters, currentPage]);

      queryClient.setQueryData(['/api/leads', filters, currentPage], (old: any) => {
        if (!old?.leads) return old;
        return {
          ...old,
          leads: old.leads.filter((lead: any) => lead.id !== leadId),
          total: old.total - 1
        };
      });

      return { previousLeads };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-page'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: Error, leadId: string, context: any) => {
      if (error.message.includes('404')) {
        toast({ title: "Info", description: "Lead has been deleted" });
        queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        queryClient.invalidateQueries({ queryKey: ['leads-page'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      } else {
        if (context?.previousLeads) {
          queryClient.setQueryData(['/api/leads', filters, currentPage], context.previousLeads);
        }
        toast({ title: "Error", description: "Failed to delete lead", variant: "destructive" });
      }
    }
  });

  const handleDelete = (leadId: string) => {
    setLeadToDelete(leadId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete && !deleteLeadMutation.isPending) {
      deleteLeadMutation.mutate(leadToDelete);
      setConfirmDeleteOpen(false);
      setLeadToDelete(null);
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
    
    let followupDate;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      followupDate = new Date(year, month - 1, day);
    } else {
      followupDate = new Date(date);
    }
    
    return followupDate < today;
  };

  const isDueToday = (date: string | Date | null) => {
    if (!date) return false;
    const today = new Date();
    
    let followupDate;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      followupDate = new Date(year, month - 1, day);
    } else {
      followupDate = new Date(date);
    }
    
    return (
      today.getDate() === followupDate.getDate() &&
      today.getMonth() === followupDate.getMonth() &&
      today.getFullYear() === followupDate.getFullYear()
    );
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error loading leads</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error?.message || 'Unknown error occurred'}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="leads-title">Lead Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all your sales leads</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation('/add-lead')}
              data-testid="button-add-lead"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
            <Button variant="outline" data-testid="button-export" className="shadow-md hover:shadow-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" data-testid="button-import" className="shadow-md hover:shadow-lg transition-all duration-200">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInput(value);
                    
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    
                    searchTimeoutRef.current = setTimeout(() => {
                      setFilters(prev => ({ ...prev, search: value }));
                      setCurrentPage(1);
                    }, 300);
                  }}
                  autoComplete="off"
                  data-testid="input-search-leads"
                  className="w-full shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilters({...filters, status: value})}
                >
                  <SelectTrigger data-testid="select-filter-status" className="shadow-sm">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {LEAD_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Origin</label>
                <Select
                  value={filters.origin}
                  onValueChange={(value) => updateFilters({...filters, origin: value})}
                >
                  <SelectTrigger data-testid="select-filter-origin" className="shadow-sm">
                    <SelectValue placeholder="All Origins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="google_text">Google Text</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Assigned To</label>
                <Select
                  value={filters.assigned_to}
                  onValueChange={(value) => updateFilters({...filters, assigned_to: value})}
                >
                  <SelectTrigger data-testid="select-filter-assigned" className="shadow-sm">
                    <SelectValue placeholder="All Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team</SelectItem>
                    {activeUsers.map((user: any) => (
                      <SelectItem key={user.username} value={user.full_name || user.username}>
                        {(user.full_name || user.username).charAt(0).toUpperCase() + (user.full_name || user.username).slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button className="w-full shadow-md hover:shadow-lg transition-all duration-200" data-testid="button-filter">
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Leads Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-testid="leads-table">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:from-gray-100 hover:to-gray-50">
                    <TableHead className="font-bold text-gray-900 dark:text-white">Date</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Name</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Contact</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Origin</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Type</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Follow-up</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Amount</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads && leads.length > 0 ? (
                    leads.map((lead, index) => (
                      <TableRow 
                        key={lead.id} 
                        data-testid={`lead-row-${lead.id}`} 
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 border-b border-gray-100 dark:border-gray-700"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white text-sm">
                          {formatDateTimezoneAware(lead.date_created, { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {lead.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div 
                              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1"
                              onClick={() => lead.phone && copyToClipboard(lead.phone, 'phone')}
                              title={`Click to copy: ${lead.phone}`}
                            >
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{lead.phone}</span>
                            </div>
                            {lead.email && (
                              <div 
                                className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1"
                                title={`Click to copy: ${lead.email}`}
                                onClick={() => lead.email && copyToClipboard(lead.email, 'email')}
                              >
                                <Mail className="h-3 w-3" />
                                <span className="text-xs truncate max-w-[150px]">{lead.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`
                              ${lead.lead_origin === 'Facebook' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300' : ''}
                              ${lead.lead_origin === 'Google Text' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                              ${lead.lead_origin === 'Instagram' ? 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900 dark:text-pink-300' : ''}
                              ${lead.lead_origin === 'WhatsApp' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300' : ''}
                              ${lead.lead_origin === 'Website' ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-300' : ''}
                              ${lead.lead_origin === 'Commercial' ? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300' : ''}
                              ${lead.lead_origin === 'Referral' ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300' : ''}
                              ${lead.lead_origin === 'Trade Show' ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300' : ''}
                              text-xs font-semibold shadow-sm
                            `}
                          >
                            {lead.lead_origin}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`
                              ${lead.project_type === 'Commercial' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                              text-white text-xs font-semibold shadow-md
                            `}
                          >
                            {lead.project_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.next_followup_date ? (
                            <div className={`text-xs font-medium flex items-center gap-1 ${
                              isOverdue(lead.next_followup_date) ? 'text-red-600 dark:text-red-400' :
                              isDueToday(lead.next_followup_date) ? 'text-yellow-600 dark:text-yellow-400' : 
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {isOverdue(lead.next_followup_date) ? <AlertTriangle className="h-3 w-3" /> :
                               isDueToday(lead.next_followup_date) ? <Clock className="h-3 w-3" /> :
                               <Check className="h-3 w-3" />}
                              {isOverdue(lead.next_followup_date) ? 'Overdue' :
                               isDueToday(lead.next_followup_date) ? 'Today' :
                               formatDateTimezoneAware(lead.next_followup_date, { 
                                 month: 'short', 
                                 day: 'numeric'
                               })}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`
                              ${lead.remarks === 'Sold' ? 'bg-green-600 hover:bg-green-700' : ''}
                              ${lead.remarks === 'In Progress' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                              ${lead.remarks === 'New' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                              ${lead.remarks === 'Not Interested' ? 'bg-gray-500 hover:bg-gray-600' : ''}
                              ${lead.remarks === 'Not Service Area' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                              ${lead.remarks === 'Not Compatible' ? 'bg-red-600 hover:bg-red-700' : ''}
                              text-white text-xs font-bold shadow-md px-3 py-1
                            `}
                          >
                            {lead.remarks}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-700 dark:text-green-400 text-sm">
                            {lead.project_amount ? formatCurrency(lead.project_amount) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openQuickFollowup(lead)}
                              title="Quick Follow-up Update"
                              data-testid={`button-followup-lead-${lead.id}`}
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openQuickEdit(lead)}
                              title="View Lead Details"
                              data-testid={`button-view-lead-${lead.id}`}
                              className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(lead.id.toString())}
                              disabled={deleteLeadMutation.isPending}
                              title="Delete Lead"
                              data-testid={`button-delete-lead-${lead.id}`}
                              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
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
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
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
        
        <div className="flex justify-between items-center mt-6 px-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {leads.length > 0 ? ((currentPage - 1) * 20 + 1) : 0} to {Math.min(currentPage * 20, total)} of {total} leads
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="pagination-previous"
              className="shadow-md hover:shadow-lg"
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  data-testid={`pagination-page-${pageNum}`}
                  className={currentPage === pageNum ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg" : "shadow-md hover:shadow-lg"}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="pagination-next"
              className="shadow-md hover:shadow-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showQuickEdit && selectedLead && (
        <QuickEditModal
          lead={selectedLead}
          onClose={() => {
            setShowQuickEdit(false);
            setSelectedLead(null);
          }}
        />
      )}

      {showQuickFollowup && selectedFollowupLead && (
        <QuickFollowupModal
          lead={selectedFollowupLead}
          onClose={() => {
            setShowQuickFollowup(false);
            setSelectedFollowupLead(null);
          }}
        />
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this lead from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

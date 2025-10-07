import { useState, useEffect, useCallback, useMemo, useRef, memo, createElement } from 'react';
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
import { createPortal } from 'react-dom';

// Global persistent search element and state
let globalSearchElement: HTMLDivElement | null = null;
let globalSearchInput: HTMLInputElement | null = null;
let globalDebounceTimeout: NodeJS.Timeout | null = null;

// Create and mount the search element to a permanent location
const initializePermanentSearchElement = () => {
  // Clean up any existing element first
  cleanupPermanentSearchElement();
  
  // Create the search container
  const container = document.createElement('div');
  container.id = 'permanent-search-container';
  container.style.position = 'fixed';
  container.style.top = '120px';
  container.style.left = '20px';
  container.style.zIndex = '1000';
  container.style.backgroundColor = 'white';
  container.style.padding = '12px';
  container.style.border = '1px solid #d1d5db';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  container.style.minWidth = '300px';
  
  const label = document.createElement('label');
  label.className = 'text-sm font-medium text-gray-700 mb-2 block';
  label.textContent = 'Search';
  
  const input = document.createElement('input');
  input.id = 'permanent-search-input';
  input.type = 'text';
  input.placeholder = 'Search leads...';
  input.className = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  input.setAttribute('data-testid', 'input-search-leads');
  input.autocomplete = 'off';
  
  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    console.log('🔍 Search input changed:', value);

    // Clear existing timeout
    if (globalDebounceTimeout) {
      clearTimeout(globalDebounceTimeout);
    }

    // Set new timeout
    globalDebounceTimeout = setTimeout(() => {
      console.log('🔍 Dispatching global search event with:', value);
      
      const searchChangeEvent = new CustomEvent('globalSearchChange', { 
        detail: value,
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(searchChangeEvent);
    }, 300);
  };
  
  input.addEventListener('input', handleInputChange);
  
  container.appendChild(label);
  container.appendChild(input);
  
  // Mount to document body permanently
  document.body.appendChild(container);
  
  globalSearchElement = container;
  globalSearchInput = input;
};

// Clean up the permanent search element
const cleanupPermanentSearchElement = () => {
  if (globalSearchElement && globalSearchElement.parentNode) {
    globalSearchElement.parentNode.removeChild(globalSearchElement);
  }
  if (globalDebounceTimeout) {
    clearTimeout(globalDebounceTimeout);
    globalDebounceTimeout = undefined;
  }
  globalSearchElement = null;
  globalSearchInput = null;
};

// Hide/show the permanent search element
const togglePermanentSearchVisibility = (visible: boolean) => {
  if (globalSearchElement) {
    globalSearchElement.style.display = visible ? 'block' : 'none';
  }
};

// Position the permanent search element over the placeholder
const positionPermanentSearchElement = (placeholderElement: HTMLElement) => {
  if (!globalSearchElement) return;
  
  // Preserve focus before repositioning
  const activeElement = document.activeElement;
  const wasFocused = activeElement === globalSearchInput;
  
  const rect = placeholderElement.getBoundingClientRect();
  globalSearchElement.style.left = `${rect.left + window.scrollX}px`;
  globalSearchElement.style.top = `${rect.top + window.scrollY}px`;
  globalSearchElement.style.width = `${rect.width}px`;
  globalSearchElement.style.height = `${rect.height}px`;
  
  // Restore focus if it was on our input
  if (wasFocused && globalSearchInput) {
    globalSearchInput.focus();
  }
};

// Timezone-safe date formatting function
const UltraStableSearchInput = memo(() => {
  console.log('� UltraStableSearchInput render');
  const [searchValue, setSearchValue] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('� UltraStableSearchInput onChange:', value);
    setSearchValue(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔥 Calling global callback with:', value);
      if (globalSearchCallback) {
        globalSearchCallback(value);
      }
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    console.log('� UltraStableSearchInput mounted');
    return () => {
      console.log('� UltraStableSearchInput cleanup');
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="md:col-span-4">
      <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search leads..."
        value={searchValue}
        onChange={handleInputChange}
        autoComplete="off"
        data-testid="input-search-leads"
        className="w-full"
        onFocus={() => console.log('� UltraStableSearchInput FOCUSED')}
        onBlur={() => console.log('� UltraStableSearchInput LOST FOCUS')}
      />
    </div>
  );
});

UltraStableSearchInput.displayName = 'UltraStableSearchInput';

// Focus-preserving search input component  
const FocusPreservingSearchInput = memo(({ currentSearch }: { currentSearch: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(currentSearch || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout - dispatch custom event
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Dispatching search event:', value);
      
      const searchChangeEvent = new CustomEvent('globalSearchChange', { 
        detail: value,
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(searchChangeEvent);
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Sync localValue with props, but preserve focus
  useEffect(() => {
    if (currentSearch !== localValue) {
      // Only update if the input is not currently focused (to avoid disrupting typing)
      if (document.activeElement !== inputRef.current) {
        setLocalValue(currentSearch || '');
      }
    }
  }, [currentSearch, localValue]);

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Search leads..."
      value={localValue}
      onChange={handleInputChange}
      autoComplete="off"
      data-testid="input-search-leads"
      className="w-full"
    />
  );
});

FocusPreservingSearchInput.displayName = 'FocusPreservingSearchInput';

// Timezone-safe date formatting function
const formatDateTimezoneAware = (dateString: string, options: Intl.DateTimeFormatOptions) => {
  if (!dateString) return '';
  
  // If it's a simple date string like "2025-08-29", parse it without timezone conversion
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Format without timezone conversion
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (options.month === 'short' && options.day === 'numeric' && options.year === 'numeric') {
      return `${monthNames[month - 1]} ${day}, ${year}`;
    }
    
    // Handle "Sep 4" format (month short + day, no year)
    if (options.month === 'short' && options.day === 'numeric' && !options.year) {
      return `${monthNames[month - 1]} ${day}`;
    }
    
    // For other formats, return the simple date string
    return dateString;
  }
  
  // Fallback for other date formats - return as string to avoid timezone conversion
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

  // Fetch active users for filtering
  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/users/active'],
    queryFn: async () => {
      const response = await fetch('/api/users/active');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Function to copy text to clipboard
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

  // Read URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const filter = urlParams.get('filter');
    
    if (status === 'sold') {
      setFilters(prev => ({ ...prev, status: 'sold' }));
    } else if (filter === 'today') {
      // For "new today" filter, we'll need to handle this in the backend query
      // For now, we can set a special search or status value
      setFilters(prev => ({ ...prev, status: 'all' })); // Adjust as needed based on your backend
    }
  }, []); // Only run on mount

  // Listen for search changes from the StableSearchInput
  useEffect(() => {
    const handleSearchChange = (event: CustomEvent) => {
      const searchValue = event.detail;
      console.log('� Received search change event:', searchValue);
      setFilters(prev => ({ ...prev, search: searchValue }));
      setCurrentPage(1);
    };

    window.addEventListener('searchChange', handleSearchChange as EventListener);
    
    return () => {
      window.removeEventListener('searchChange', handleSearchChange as EventListener);
    };
  }, []);

  // Listen for global search changes from the permanent search element
  useEffect(() => {
    const handleGlobalSearchChange = (event: CustomEvent) => {
      const searchValue = event.detail;
      console.log('🌍 Received global search event:', searchValue);
      setFilters(prev => ({ ...prev, search: searchValue }));
      setCurrentPage(1);
    };

    document.addEventListener('globalSearchChange', handleGlobalSearchChange as EventListener);
    
    return () => {
      document.removeEventListener('globalSearchChange', handleGlobalSearchChange as EventListener);
    };
  }, []);

  // Memoize the actual filters used for the query
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
      // Build query parameters from filters and pagination
      const params = new URLSearchParams();
      if (queryFilters.search) params.append('search', queryFilters.search);
      if (queryFilters.status && queryFilters.status !== 'all') params.append('status', queryFilters.status);
      if (queryFilters.origin && queryFilters.origin !== 'all') params.append('origin', queryFilters.origin);
      if (queryFilters.assigned_to && queryFilters.assigned_to !== 'all') params.append('assigned_to', queryFilters.assigned_to);
      
      // Add current user for role-based filtering
      if (user?.username) params.append('username', user.username);
      
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
    staleTime: 30 * 1000,
    refetchOnMount: true,
    retry: 3,
  });

  // Extract leads and pagination info from response
  const leads = leadsResponse?.leads || [];
  const totalPages = leadsResponse?.totalPages || 1;
  const total = leadsResponse?.total || 0;

  // Helper function to update filters and reset pagination only for non-search filters
  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    // Only reset page if it's not just a search change
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
      // Invalidate multiple query patterns to ensure all lead-related data refreshes
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-page'] }); // For the leads page
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: Error, leadId: string, context: any) => {
      // If it's a 404 error, the lead might already be deleted
      if (error.message.includes('404')) {
        toast({ title: "Info", description: "Lead has been deleted" });
        // Still refresh the data to reflect the current state
        queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        queryClient.invalidateQueries({ queryKey: ['leads-page'] }); // For the leads page
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
    
    // Handle simple date strings like "2025-08-29" without timezone conversion
    let followupDate;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      followupDate = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      followupDate = new Date(date);
    }
    
    return followupDate < today;
  };

  const isDueToday = (date: string | Date | null) => {
    if (!date) return false;
    const today = new Date();
    
    // Handle simple date strings like "2025-08-29" without timezone conversion
    let followupDate;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      followupDate = new Date(year, month - 1, day); // month is 0-indexed
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error loading leads</p>
            <p className="text-sm text-gray-600">{error?.message || 'Unknown error occurred'}</p>
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
              onClick={() => setLocation('/add-lead')}
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
                <FocusPreservingSearchInput currentSearch={filters.search} />
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
                    {LEAD_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
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
                    {activeUsers.map((user: any) => (
                      <SelectItem key={user.username} value={user.full_name || user.username}>
                        {(user.full_name || user.username).charAt(0).toUpperCase() + (user.full_name || user.username).slice(1)}
                      </SelectItem>
                    ))}
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
            {/* Make sure table container allows overflow scrolling */}
            <div className="overflow-x-auto max-w-full">
              <Table data-testid="leads-table">
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-900" style={{ width: '100px', minWidth: '100px' }}>Date</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '150px', minWidth: '150px' }}>Name</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '160px', minWidth: '160px' }}>Contact Info</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '120px', minWidth: '120px' }}>Origin</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '100px', minWidth: '100px' }}>Project Type</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '130px', minWidth: '130px' }}>Next Follow-up</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '120px', minWidth: '120px' }}>Status</TableHead>
                      <TableHead className="font-semibold text-gray-900" style={{ width: '130px', minWidth: '130px' }}>Project Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900 sticky right-0 bg-gray-50 z-10" style={{ width: '100px', minWidth: '100px' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {leads && leads.length > 0 ? (
                    leads.map((lead) => (
                      <TableRow key={lead.id} data-testid={`lead-row-${lead.id}`} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900" style={{ width: '100px', maxWidth: '100px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {formatDateTimezoneAware(lead.date_created, { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </TableCell>
                        <TableCell style={{ width: '150px', maxWidth: '150px' }}>
                          <div className="font-semibold text-gray-900" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead.name}>
                            {lead.name}
                          </div>
                        </TableCell>
                        <TableCell style={{ width: '160px', maxWidth: '160px' }}>
                          <div className="text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <div 
                              style={{ fontSize: '0.75rem', lineHeight: '1.2', cursor: 'pointer' }}
                              className="hover:text-blue-600 hover:underline"
                              onClick={() => lead.phone && copyToClipboard(lead.phone, 'phone')}
                              title={`Click to copy: ${lead.phone}`}
                            >
                              {lead.phone}
                            </div>
                            {lead.email && (
                              <div 
                                style={{ fontSize: '0.7rem', color: '#6b7280', lineHeight: '1.2', cursor: 'pointer' }} 
                                className="hover:text-blue-600 hover:underline"
                                title={`Click to copy: ${lead.email}`}
                                onClick={() => lead.email && copyToClipboard(lead.email, 'email')}
                              >
                                {lead.email.length > 15 ? lead.email.substring(0, 15) + '...' : lead.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const origin = lead.lead_origin;
                            let className = '';
                            
                            switch (origin) {
                              case 'Facebook':
                                className = 'badge-facebook';
                                break;
                              case 'Google Text':
                                className = 'badge-google';
                                break;
                              case 'Instagram':
                                className = 'badge-instagram';
                                break;
                              case 'Trade Show':
                                className = 'badge-trade-show';
                                break;
                              case 'WhatsApp':
                                className = 'badge-whatsapp';
                                break;
                              case 'Website':
                                className = 'badge-website';
                                break;
                              case 'Commercial':
                                className = 'badge-commercial';
                                break;
                              case 'Referral':
                                className = 'badge-referral';
                                break;
                              default:
                                className = 'badge-default';
                            }
                            
                            return (
                              <>
                                <style dangerouslySetInnerHTML={{
                                  __html: `
                                    .badge-facebook { background-color: #2563eb !important; color: #ffffff !important; border: 1px solid #2563eb !important; }
                                    .badge-google { background-color: #fef3c7 !important; color: #92400e !important; border: 1px solid #fcd34d !important; }
                                    .badge-instagram { background-color: #ec4899 !important; color: #ffffff !important; border: 1px solid #f472b6 !important; }
                                    .badge-trade-show { background-color: #ede9fe !important; color: #7c3aed !important; border: 1px solid #c4b5fd !important; }
                                    .badge-whatsapp { background-color: #22c55e !important; color: #ffffff !important; border: 1px solid #22c55e !important; }
                                    .badge-website { background-color: #e0f2fe !important; color: #0c4a6e !important; border: 1px solid #7dd3fc !important; }
                                    .badge-commercial { background-color: #f3f4f6 !important; color: #374151 !important; border: 1px solid #d1d5db !important; }
                                    .badge-referral { background-color: #fee2e2 !important; color: #dc2626 !important; border: 1px solid #fca5a5 !important; }
                                    .badge-default { background-color: #f3f4f6 !important; color: #374151 !important; border: 1px solid #d1d5db !important; }
                                    .origin-badge {
                                      display: inline-flex !important;
                                      padding: 0.25rem 0.5rem !important;
                                      font-size: 0.75rem !important;
                                      font-weight: 500 !important;
                                      border-radius: 9999px !important;
                                      text-transform: capitalize !important;
                                      white-space: nowrap !important;
                                    }
                                  `
                                }} />
                                <span className={`origin-badge ${className}`}>
                                  {lead.lead_origin.replace('-', ' ')}
                                </span>
                              </>
                            );
                          })()}
                        </TableCell>
                        <TableCell style={{ width: '100px', maxWidth: '100px' }}>
                          {(() => {
                            const projectType = lead.project_type || 'Residential';
                            const bgColor = projectType === 'Commercial' ? '#3b82f6' : '#22c55e';
                            const textColor = '#ffffff';
                            
                            return (
                              <span 
                                style={{ 
                                  backgroundColor: bgColor,
                                  color: textColor,
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  borderRadius: '9999px',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {projectType === 'Commercial' ? 'Commercial' : 'Residential'}
                              </span>
                            );
                          })()}
                        </TableCell>
                        <TableCell style={{ width: '130px', maxWidth: '130px' }}>
                          {lead.next_followup_date ? (
                            <div style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }} className={
                              isOverdue(lead.next_followup_date) ? 'text-red-600 font-medium' :
                              isDueToday(lead.next_followup_date) ? 'text-yellow-600 font-medium' : 'text-green-600'
                            }>
                              {isOverdue(lead.next_followup_date) ? 'Overdue' :
                               isDueToday(lead.next_followup_date) ? 'Today' :
                               formatDateTimezoneAware(lead.next_followup_date, { 
                                 month: 'short', 
                                 day: 'numeric'
                               })}
                            </div>
                          ) : (
                            <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const status = lead.remarks;
                            let bgColor = '';
                            let textColor = '';
                            
                            switch (status) {
                              case 'Sold':
                                bgColor = '#22c55e';  // Green
                                textColor = '#ffffff';
                                break;
                              case 'In Progress':
                                bgColor = '#f59e0b';  // Yellow/orange
                                textColor = '#ffffff';
                                break;
                              case 'New':
                                bgColor = '#3b82f6';  // Blue
                                textColor = '#ffffff';
                                break;
                              case 'Not Interested':
                                bgColor = '#6b7280';  // Gray
                                textColor = '#ffffff';
                                break;
                              case 'Not Service Area':
                                bgColor = '#ea580c';  // Orange
                                textColor = '#ffffff';
                                break;
                              case 'Not Compatible':
                                bgColor = '#dc2626';  // Red
                                textColor = '#ffffff';
                                break;
                              default:
                                bgColor = '#6b7280';  // Gray
                                textColor = '#ffffff';
                            }
                            
                            const uniqueId = `status-badge-${lead.id}`;
                            
                            return (
                              <>
                                <style dangerouslySetInnerHTML={{
                                  __html: `
                                    #${uniqueId} {
                                      background-color: ${bgColor} !important;
                                      color: ${textColor} !important;
                                    }
                                  `
                                }} />
                                <div
                                  id={uniqueId}
                                  style={{
                                    borderRadius: '9999px',
                                    padding: '0.125rem 0.625rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap',
                                    border: 'none',
                                    outline: 'none'
                                  }}
                                >
                                  {status}
                                </div>
                              </>
                            );
                          })()}
                        </TableCell>
                        <TableCell style={{ width: '100px', maxWidth: '100px' }}>
                          <span className="font-semibold text-green-700" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {lead.project_amount ? formatCurrency(lead.project_amount) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="sticky right-0 bg-white shadow-sm" style={{ width: '120px', maxWidth: '120px' }}>
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openQuickFollowup(lead)}
                              title="Quick Follow-up Update"
                              data-testid={`button-followup-lead-${lead.id}`}
                              className="h-7 w-7 p-0"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openQuickEdit(lead)}
                              title="View Lead Details"
                              data-testid={`button-view-lead-${lead.id}`}
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(lead.id.toString())}
                              disabled={deleteLeadMutation.isPending}
                              title="Delete Lead"
                              data-testid={`button-delete-lead-${lead.id}`}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this lead? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row justify-end space-x-2">
              <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
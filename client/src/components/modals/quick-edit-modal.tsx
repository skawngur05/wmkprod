import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Lead, Installer, LEAD_ORIGINS, LEAD_STATUSES, PROJECT_TYPES, COMMERCIAL_SUBCATEGORIES, MARKETS } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLeadFormChanges } from '@/hooks/use-form-changes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MapPin, Calendar, DollarSign, Building2, Tag, FileText, Users, Palette, Eye, Wrench, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface QuickEditModalProps {
  lead: Lead | null;
  show: boolean;
  onHide: () => void;
  onSave: () => void;
}

export function QuickEditModal({ lead, show, onHide, onSave }: QuickEditModalProps) {
  const formatDateForInput = (dateValue: string | Date | null) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lead_origin: '',
    project_type: '',
    commercial_subcategory: '',
    market: '',
    remarks: '',
    assigned_to: '',
    customer_address: '',
    project_amount: '',
    next_followup_date: '',
    notes: '',
    deposit_paid: false,
    balance_paid: false,
    pickup_date: '',
    installation_date: '',
    installation_end_date: '',
    assigned_installer: [] as string[],
    selected_colors: [] as string[]
  });
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  const [newNote, setNewNote] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { shouldDisableSave } = useLeadFormChanges(formData, originalFormData);
  const shouldDisableSaveButton = shouldDisableSave && !newNote.trim();

  const { data: wmkColors = [] } = useQuery({
    queryKey: ['/api/wmk-colors'],
    queryFn: async () => {
      const response = await fetch('/api/wmk-colors');
      if (!response.ok) throw new Error('Failed to fetch WMK colors');
      return response.json();
    }
  });

  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/users/active'],
    queryFn: async () => {
      const response = await fetch('/api/users/active');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const { data: installersData = [] } = useQuery<Installer[]>({
    queryKey: ['/api/admin/installers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/installers');
      if (!response.ok) throw new Error('Failed to fetch installers');
      return response.json();
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!lead) throw new Error('No lead selected');
      const response = await apiRequest('PUT', `/api/leads/${lead.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-page'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      onSave();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lead", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (lead) {
      const initialData = {
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        lead_origin: lead.lead_origin || '',
        project_type: (lead as any).project_type || 'Residential',
        commercial_subcategory: (lead as any).commercial_subcategory || '',
        market: (lead as any).market || '',
        remarks: lead.remarks || '',
        assigned_to: lead.assigned_to || '',
        customer_address: (lead as any).customer_address || '',
        project_amount: lead.project_amount ? lead.project_amount.toString() : '',
        next_followup_date: formatDateForInput(lead.next_followup_date),
        notes: lead.notes || '',
        deposit_paid: lead.deposit_paid || false,
        balance_paid: lead.balance_paid || false,
        pickup_date: formatDateForInput((lead as any).pickup_date),
        installation_date: formatDateForInput(lead.installation_date),
        installation_end_date: formatDateForInput((lead as any).installation_end_date),
        assigned_installer: (() => {
          if (!lead.assigned_installer) return [];
          if (Array.isArray(lead.assigned_installer)) return lead.assigned_installer;
          return lead.assigned_installer.split(',').map(s => s.trim()).filter(s => s);
        })(),
        selected_colors: (lead as any).selected_colors || []
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedNotes = formData.notes || '';
    if (newNote.trim()) {
      const today = new Date();
      const timestamp = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      const newNoteWithTimestamp = `[${timestamp}] ${newNote.trim()}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${newNoteWithTimestamp}` : newNoteWithTimestamp;
    }
    
    if (formData.remarks === 'Sold' && formData.assigned_installer.length > 0) {
      const today = new Date();
      const timestamp = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      const installerNote = `[${timestamp}] Assigned installers: ${formData.assigned_installer.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${installerNote}` : installerNote;
    }
    
    if (formData.remarks === 'Sold' && formData.selected_colors.length > 0 && (formData.deposit_paid || formData.balance_paid)) {
      const today = new Date();
      const timestamp = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      const colorNote = `[${timestamp}] Selected colors: ${formData.selected_colors.join(', ')}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${colorNote}` : colorNote;
    }

    const ensureDateString = (dateValue: any): string | null => {
      if (!dateValue) return null;
      if (typeof dateValue === 'string') return dateValue;
      if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return String(dateValue);
    };

    const mapAssignedTo = (value: string): string => {
      if (!value || value === '') return '';
      return value;
    };

    const updates = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      lead_origin: formData.lead_origin,
      project_type: formData.project_type || 'Residential',
      market: formData.project_type === 'Commercial' ? formData.market : null,
      commercial_subcategory: formData.commercial_subcategory || null,
      remarks: formData.remarks,
      assigned_to: mapAssignedTo(typeof formData.assigned_to === 'string' ? formData.assigned_to : ''),
      customer_address: formData.customer_address || null,
      project_amount: formData.project_amount ? parseFloat(formData.project_amount) : null,
      next_followup_date: ensureDateString(formData.next_followup_date),
      notes: updatedNotes || null,
      deposit_paid: formData.deposit_paid,
      balance_paid: formData.balance_paid,
      pickup_date: ensureDateString(formData.pickup_date),
      installation_date: ensureDateString(formData.installation_date),
      installation_end_date: ensureDateString(formData.installation_end_date),
      assigned_installer: formData.assigned_installer,
      selected_colors: formData.selected_colors
    };

    updateLeadMutation.mutate(updates);
  };

  if (!lead) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Sold': 'bg-green-100 text-green-800 border-green-200',
      'Not Interested': 'bg-red-100 text-red-800 border-red-200',
      'Not Service Area': 'bg-gray-100 text-gray-800 border-gray-200',
      'Not Compatible': 'bg-orange-100 text-orange-800 border-orange-200',
      'Friendly Partner': 'bg-purple-100 text-purple-800 border-purple-200',
      'Franchise Request': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0" data-testid="quick-edit-modal">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                {lead.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2 flex items-center gap-4">
                <Badge variant="outline" className={`${getStatusColor(formData.remarks)} border px-3 py-1`}>
                  {formData.remarks}
                </Badge>
                <span className="flex items-center text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Created: {formatDateForInput(lead.date_created) ? new Date(lead.date_created).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'Unknown'}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid w-auto grid-cols-4 bg-gray-100">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="project" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Project Details</span>
              </TabsTrigger>
              <TabsTrigger value="installation" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Installation</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-0 space-y-4">
                <Card className="border-blue-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        data-testid="input-edit-name"
                        className="h-10"
                        placeholder="Enter customer name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        data-testid="input-edit-phone"
                        className="h-10"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        data-testid="input-edit-email"
                        className="h-10"
                        placeholder="Enter email address"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Lead Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assigned_to" className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        Assigned To
                      </Label>
                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) => setFormData({...formData, assigned_to: value})}
                      >
                        <SelectTrigger data-testid="select-edit-assigned" className="h-10">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeUsers.map((user: any) => (
                            <SelectItem key={user.username} value={user.full_name || user.username}>
                              {(user.full_name || user.username).charAt(0).toUpperCase() + (user.full_name || user.username).slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-yellow-600" />
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.remarks}
                        onValueChange={(value) => setFormData({...formData, remarks: value})}
                      >
                        <SelectTrigger data-testid="select-edit-status" className="h-10">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lead_origin" className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-orange-600" />
                        Lead Origin
                      </Label>
                      <Select
                        value={formData.lead_origin}
                        onValueChange={(value) => setFormData({...formData, lead_origin: value})}
                      >
                        <SelectTrigger data-testid="select-edit-lead-origin" className="h-10">
                          <SelectValue placeholder="Select lead origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_ORIGINS.map(origin => (
                            <SelectItem key={origin} value={origin}>
                              {origin.charAt(0).toUpperCase() + origin.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next_followup_date" className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-cyan-600" />
                        Next Follow-up
                      </Label>
                      <Input
                        id="next_followup_date"
                        type="date"
                        value={formData.next_followup_date}
                        onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                        data-testid="input-edit-next-followup"
                        className="h-10"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Project Details Tab */}
              <TabsContent value="project" className="mt-0 space-y-4">
                <Card className="border-indigo-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-indigo-600" />
                      Project Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project_type" className="text-sm font-medium">
                        Project Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.project_type}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData, 
                            project_type: value,
                            market: value === 'Commercial' ? formData.market : ''
                          });
                        }}
                      >
                        <SelectTrigger data-testid="select-edit-project-type" className="h-10">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.project_type === 'Commercial' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="market" className="text-sm font-medium">
                            Market <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.market}
                            onValueChange={(value) => setFormData({...formData, market: value})}
                          >
                            <SelectTrigger data-testid="select-edit-market" className="h-10">
                              <SelectValue placeholder="Select market" />
                            </SelectTrigger>
                            <SelectContent>
                              {MARKETS.map(market => (
                                <SelectItem key={market} value={market}>{market}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="commercial_subcategory" className="text-sm font-medium">
                            Commercial Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.commercial_subcategory}
                            onValueChange={(value) => setFormData({...formData, commercial_subcategory: value})}
                          >
                            <SelectTrigger data-testid="select-edit-commercial-subcategory" className="h-10">
                              <SelectValue placeholder="Select commercial category" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMMERCIAL_SUBCATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-green-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project_amount" className="text-sm font-medium">
                        Project Amount
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="project_amount"
                          type="number"
                          step="0.01"
                          value={formData.project_amount}
                          onChange={(e) => setFormData({...formData, project_amount: e.target.value})}
                          data-testid="input-edit-project-amount"
                          className="h-10 pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {formData.remarks === 'Sold' && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="deposit_paid"
                            checked={formData.deposit_paid}
                            onCheckedChange={(checked) => setFormData({...formData, deposit_paid: checked as boolean})}
                            data-testid="checkbox-deposit-paid"
                          />
                          <Label htmlFor="deposit_paid" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Deposit Paid
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="balance_paid"
                            checked={formData.balance_paid}
                            onCheckedChange={(checked) => setFormData({...formData, balance_paid: checked as boolean})}
                            data-testid="checkbox-balance-paid"
                          />
                          <Label htmlFor="balance_paid" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Balance Paid
                          </Label>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Installation Tab */}
              <TabsContent value="installation" className="mt-0 space-y-4">
                {formData.remarks === 'Sold' ? (
                  <>
                    <Card className="border-cyan-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-cyan-600" />
                          Installation Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer_address" className="text-sm font-medium">
                            Customer Address
                          </Label>
                          <Textarea
                            id="customer_address"
                            value={formData.customer_address}
                            onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                            data-testid="textarea-edit-customer-address"
                            className="min-h-[80px] resize-none"
                            placeholder="Enter installation address"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          Installation Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="installation_date" className="text-sm font-medium">
                            Installation Start
                          </Label>
                          <Input
                            id="installation_date"
                            type="date"
                            value={formData.installation_date}
                            onChange={(e) => setFormData({...formData, installation_date: e.target.value})}
                            data-testid="input-edit-installation-date"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="installation_end_date" className="text-sm font-medium">
                            Installation End
                          </Label>
                          <Input
                            id="installation_end_date"
                            type="date"
                            value={formData.installation_end_date}
                            onChange={(e) => setFormData({...formData, installation_end_date: e.target.value})}
                            data-testid="input-edit-installation-end-date"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup_date" className="text-sm font-medium">
                            Pickup Date
                          </Label>
                          <Input
                            id="pickup_date"
                            type="date"
                            value={formData.pickup_date}
                            onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                            data-testid="input-edit-pickup-date"
                            className="h-10"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-purple-600" />
                          Installer Assignment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {installersData.map((installer) => (
                            <div
                              key={installer.id}
                              onClick={() => {
                                const isSelected = formData.assigned_installer.includes(installer.name);
                                setFormData({
                                  ...formData,
                                  assigned_installer: isSelected
                                    ? formData.assigned_installer.filter(name => name !== installer.name)
                                    : [...formData.assigned_installer, installer.name]
                                });
                              }}
                              className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.assigned_installer.includes(installer.name)
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 bg-white hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {formData.assigned_installer.includes(installer.name) && (
                                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                                )}
                                <span className="font-medium">{installer.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-pink-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Palette className="h-5 w-5 text-pink-600" />
                          Color Selection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {wmkColors.map((color: any) => (
                            <div
                              key={color.id}
                              onClick={() => {
                                const isSelected = formData.selected_colors.includes(color.color_name);
                                setFormData({
                                  ...formData,
                                  selected_colors: isSelected
                                    ? formData.selected_colors.filter(name => name !== color.color_name)
                                    : [...formData.selected_colors, color.color_name]
                                });
                              }}
                              className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.selected_colors.includes(color.color_name)
                                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                                  : 'border-gray-200 bg-white hover:border-pink-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {formData.selected_colors.includes(color.color_name) && (
                                  <CheckCircle2 className="h-4 w-4 text-pink-600" />
                                )}
                                <span className="font-medium">{color.color_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="border-gray-200">
                    <CardContent className="py-12 text-center">
                      <Wrench className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">
                        Installation details will be available once the lead status is set to "Sold"
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0 space-y-4">
                <Card className="border-blue-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Add New Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      data-testid="textarea-new-note"
                      placeholder="Add a new note or update..."
                      className="min-h-[100px] resize-none"
                    />
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      Notes History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formData.notes ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {formData.notes.split('\n').map((note, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">No notes available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onHide}
              className="min-w-[100px]"
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateLeadMutation.isPending || shouldDisableSaveButton}
              className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              data-testid="button-save-edit"
            >
              {updateLeadMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LEAD_ORIGINS, LEAD_STATUSES, ASSIGNEES, type Installer } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, Phone, Mail, Share2, Flag, Users, DollarSign, Calendar, FileText, Save, X, Loader2, HardHat } from 'lucide-react';
import { enrichFromDatabase, type InternalEnrichmentData } from '@/lib/internal-enrichment';
import { EnrichmentModal } from '@/components/enrichment-modal';

export default function AddLead() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    lead_origin: 'facebook',
    remarks: 'New', // Fixed: capital N to match enum
    assigned_to: 'kim',
    project_amount: '',
    next_followup_date: '',
    notes: '',
    pickup_date: '',
    installation_date: '',
    installation_end_date: '',
    assigned_installer: [] as string[], // Keep as array for UI, will convert for submission
    deposit_paid: false,
    balance_paid: false,
    date_created: new Date().toISOString().split('T')[0], // Default to today, but allow editing
    selected_colors: [] as string[]
  });
  
  // Internal enrichment state
  const [enrichmentData, setEnrichmentData] = useState<InternalEnrichmentData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WMK colors
  const { data: wmkColors = [] } = useQuery({
    queryKey: ['/api/wmk-colors'],
    queryFn: async () => {
      const response = await fetch('/api/wmk-colors');
      if (!response.ok) throw new Error('Failed to fetch WMK colors');
      return response.json();
    }
  });

  // Fetch installers
  const { data: installersData = [] } = useQuery<Installer[]>({
    queryKey: ['/api/admin/installers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/installers');
      if (!response.ok) throw new Error('Failed to fetch installers');
      return response.json();
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest('POST', '/api/leads', leadData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead created successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
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

  // Internal enrichment effect
  useEffect(() => {
    const enrichEmailData = async () => {
      if (!formData.email || !formData.email.includes('@')) {
        setEnrichmentData(null);
        setShowEnrichmentModal(false);
        return;
      }
      
      setIsEnriching(true);
      
      try {
        const data = await enrichFromDatabase(formData.email);
        setEnrichmentData(data);
        // Show modal only if we found an existing customer
        if (data?.found) {
          setShowEnrichmentModal(true);
        }
      } catch (error) {
        console.error('Internal enrichment error:', error);
        setEnrichmentData(null);
        setShowEnrichmentModal(false);
      } finally {
        setIsEnriching(false);
      }
    };
    
    const timeoutId = setTimeout(enrichEmailData, 1000); // Debounce enrichment
    return () => clearTimeout(timeoutId);
  }, [formData.email]);
  
  const applyEnrichmentData = () => {
    if (!enrichmentData?.found) return;
    
    setFormData(prev => ({
      ...prev,
      name: enrichmentData.name || prev.name,
      phone: enrichmentData.phone || prev.phone
    }));
    
    toast({ 
      title: "Data Applied", 
      description: "Lead information has been updated with existing data from your database." 
    });
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
        project_amount: formData.project_amount ? formData.project_amount : "0.00", // Keep as string for decimal
        next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date).toISOString().split('T')[0] : null,
        notes: formData.notes || null,
        pickup_date: formData.pickup_date ? new Date(formData.pickup_date).toISOString().split('T')[0] : null,
        installation_date: formData.installation_date ? new Date(formData.installation_date).toISOString().split('T')[0] : null,
        installation_end_date: formData.installation_end_date ? new Date(formData.installation_end_date).toISOString().split('T')[0] : null,
        assigned_installer: formData.assigned_installer.length > 0 ? formData.assigned_installer.join(', ') : null, // Convert array to string
        deposit_paid: formData.deposit_paid,
        balance_paid: formData.balance_paid,
        date_created: formData.date_created, // Use the form date instead of always generating new
        additional_notes: null, // Add missing field that might be expected
        selected_colors: formData.selected_colors
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
              data-testid="button-back-to-leads"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Lead
          </h1>
          <p className="text-gray-600">Create a new lead and start building your pipeline</p>
        </div>

        {/* Form Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} data-testid="add-lead-form" className="space-y-8">
                
                {/* Basic Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                    <User className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                        <User className="h-4 w-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        data-testid="input-lead-name"
                        placeholder="Enter customer's full name"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 font-medium">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        data-testid="input-lead-phone"
                        placeholder="(555) 123-4567"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4" />
                        Email Address
                        {isEnriching && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        data-testid="input-lead-email"
                        placeholder="customer@example.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lead_origin" className="flex items-center gap-2 font-medium">
                        <Share2 className="h-4 w-4" />
                        Lead Origin *
                      </Label>
                      <Select
                        value={formData.lead_origin}
                        onValueChange={(value) => handleInputChange('lead_origin', value)}
                      >
                        <SelectTrigger data-testid="select-lead-origin" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_ORIGINS.map(origin => (
                            <SelectItem key={origin} value={origin}>
                              {origin.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_created" className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />
                        Date Created *
                      </Label>
                      <Input
                        id="date_created"
                        type="date"
                        value={formData.date_created}
                        onChange={(e) => handleInputChange('date_created', e.target.value)}
                        required
                        data-testid="input-date-created"
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">
                        Date when this lead was first created (for historical records)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lead Management Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                    <Flag className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Lead Management</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="flex items-center gap-2 font-medium">
                        <Flag className="h-4 w-4" />
                        Status
                      </Label>
                      <Select
                        value={formData.remarks}
                        onValueChange={(value) => handleInputChange('remarks', value)}
                      >
                        <SelectTrigger data-testid="select-lead-status" className="h-11">
                          <SelectValue />
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
                      <Label htmlFor="assigned_to" className="flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4" />
                        Assigned To
                      </Label>
                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) => handleInputChange('assigned_to', value)}
                      >
                        <SelectTrigger data-testid="select-lead-assigned" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNEES.map(assignee => (
                            <SelectItem key={assignee} value={assignee}>
                              {assignee.charAt(0).toUpperCase() + assignee.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project_amount" className="flex items-center gap-2 font-medium">
                        <DollarSign className="h-4 w-4" />
                        Project Amount
                      </Label>
                      <Input
                        id="project_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.project_amount}
                        onChange={(e) => handleInputChange('project_amount', e.target.value)}
                        data-testid="input-lead-amount"
                        placeholder="0.00"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Installation & Payment Section (Only for Sold Status) */}
                {formData.remarks === 'Sold' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                      <HardHat className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Installation & Payment Details</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {formData.deposit_paid && (
                        <div className="space-y-2">
                          <Label htmlFor="pickup_date" className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4" />
                            Pickup Date
                          </Label>
                          <Input
                            id="pickup_date"
                            type="date"
                            value={formData.pickup_date}
                            onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                            data-testid="input-pickup-date"
                            className="h-11"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="installation_date" className="flex items-center gap-2 font-medium">
                          <Calendar className="h-4 w-4" />
                          Installation Start Date
                        </Label>
                        <Input
                          id="installation_date"
                          type="date"
                          value={formData.installation_date}
                          onChange={(e) => handleInputChange('installation_date', e.target.value)}
                          data-testid="input-installation-date"
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="installation_end_date" className="flex items-center gap-2 font-medium">
                          <Calendar className="h-4 w-4" />
                          Installation End Date
                        </Label>
                        <Input
                          id="installation_end_date"
                          type="date"
                          value={formData.installation_end_date}
                          onChange={(e) => handleInputChange('installation_end_date', e.target.value)}
                          data-testid="input-installation-end-date"
                          className="h-11"
                        />
                        <p className="text-xs text-gray-500">Leave empty for single-day installations</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-medium">
                          <Users className="h-4 w-4" />
                          Assigned Installers
                        </Label>
                        <Select
                          value=""
                          onValueChange={(installer) => {
                            if (installer && !formData.assigned_installer.includes(installer)) {
                              setFormData({
                                ...formData,
                                assigned_installer: [...formData.assigned_installer, installer]
                              });
                            }
                          }}
                        >
                          <SelectTrigger data-testid="select-installer" className="h-11 text-base">
                            <SelectValue placeholder="Select installer to add..." />
                          </SelectTrigger>
                          <SelectContent>
                            {installersData.filter((installerObj: Installer) => !formData.assigned_installer.includes(installerObj.name)).map((installerObj: Installer) => (
                              <SelectItem key={installerObj.name} value={installerObj.name}>
                                {installerObj.name.charAt(0).toUpperCase() + installerObj.name.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.assigned_installer.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.assigned_installer.map((installer) => (
                              <Badge 
                                key={installer} 
                                variant="secondary" 
                                className="flex items-center gap-1 px-2 py-1"
                              >
                                {installer.charAt(0).toUpperCase() + installer.slice(1)}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      assigned_installer: formData.assigned_installer.filter(i => i !== installer)
                                    });
                                  }}
                                  data-testid={`remove-installer-${installer}`}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Payment Status */}
                      <div className="md:col-span-2 space-y-3 pt-2 border-t border-gray-200">
                        <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Payment Status
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              formData.deposit_paid 
                                ? 'border-green-500 bg-green-50 shadow-sm' 
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, deposit_paid: !prev.deposit_paid }))}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                formData.deposit_paid ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`}>
                                {formData.deposit_paid && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Deposit Paid</p>
                                <p className="text-xs text-gray-600">Initial payment received</p>
                              </div>
                            </div>
                          </div>

                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              formData.balance_paid 
                                ? 'border-green-500 bg-green-50 shadow-sm' 
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, balance_paid: !prev.balance_paid }))}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                formData.balance_paid ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`}>
                                {formData.balance_paid && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Balance Paid</p>
                                <p className="text-xs text-gray-600">Final payment received</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Color Selection Section */}
                      <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-200">
                        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          COLOR SELECTION (Typically 2 colors)
                        </Label>
                        <Select
                          value=""
                          onValueChange={(color) => {
                            if (color && !formData.selected_colors.includes(color)) {
                              setFormData({
                                ...formData,
                                selected_colors: [...formData.selected_colors, color]
                              });
                            }
                          }}
                        >
                          <SelectTrigger data-testid="select-color" className="h-11 text-base">
                            <SelectValue placeholder="Select color to add..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {wmkColors.filter((colorObj: any) => !formData.selected_colors.includes(colorObj.code)).map((colorObj: any) => (
                              <SelectItem key={colorObj.code} value={colorObj.code}>
                                {colorObj.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.selected_colors.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.selected_colors.map((color) => (
                              <Badge 
                                key={color} 
                                variant="outline" 
                                className="flex items-center gap-1 px-2 py-1 border-purple-200 text-purple-700"
                              >
                                {color}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      selected_colors: formData.selected_colors.filter(c => c !== color)
                                    });
                                  }}
                                  data-testid={`remove-color-${color}`}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="next_followup_date" className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />
                        Next Follow-up Date
                      </Label>
                      <Input
                        id="next_followup_date"
                        type="date"
                        value={formData.next_followup_date}
                        onChange={(e) => handleInputChange('next_followup_date', e.target.value)}
                        data-testid="input-lead-followup"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes" className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        Initial Notes
                      </Label>
                      <Textarea
                        id="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        data-testid="textarea-lead-notes"
                        placeholder="Enter any initial notes about this lead..."
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCancel}
                    data-testid="button-cancel-add-lead"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createLeadMutation.isPending || !formData.name || !formData.phone}
                    data-testid="button-submit-add-lead"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {createLeadMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Lead...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Lead
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Enrichment Modal */}
      <EnrichmentModal
        isOpen={showEnrichmentModal}
        onClose={() => setShowEnrichmentModal(false)}
        enrichmentData={enrichmentData}
        onApplyData={applyEnrichmentData}
      />
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Mail, Eye } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EMAIL_TYPES = [
  { value: 'shipping_notification', label: 'Shipping Notification' },
  { value: 'installer_notification', label: 'Installer Notification' },
  { value: 'customer_info', label: 'Customer Installation Info' },
  { value: 'followup_reminder', label: 'Follow-up Reminder' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'appointment_reminder', label: 'Appointment Reminder' }
];

const AVAILABLE_VARIABLES = [
  '{{customer_name}}', '{{customer_email}}', '{{customer_phone}}',
  '{{order_number}}', '{{tracking_number}}', '{{installation_date}}',
  '{{installer_name}}', '{{installer_phone}}', '{{project_amount}}',
  '{{company_name}}', '{{company_phone}}', '{{company_email}}'
];

export default function EmailTemplatesManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subject: '',
    body: '',
    variables: [] as string[],
    is_active: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email-templates'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/email-templates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({ title: "Success", description: "Email template created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create email template", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest('PUT', `/api/admin/email-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsEditModalOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast({ title: "Success", description: "Email template updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update email template", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({ title: "Success", description: "Email template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete email template", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      subject: '',
      body: '',
      variables: [],
      is_active: true
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      variables: template.variables || [],
      is_active: template.is_active
    });
    setIsEditModalOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleDelete = (template: EmailTemplate) => {
    if (confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleSubmit = (isEdit: boolean) => {
    if (!formData.name || !formData.type || !formData.subject || !formData.body) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    // Extract variables from body text
    const extractedVariables = AVAILABLE_VARIABLES.filter(variable => 
      formData.body.includes(variable) || formData.subject.includes(variable)
    );

    const templateData = {
      ...formData,
      variables: extractedVariables
    };

    if (isEdit && editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, ...templateData });
    } else {
      createMutation.mutate(templateData);
    }
  };

  const toggleStatus = (template: EmailTemplate) => {
    updateMutation.mutate({ 
      id: template.id, 
      is_active: !template.is_active 
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body;
      const newText = text.substring(0, start) + variable + text.substring(end);
      setFormData(prev => ({ ...prev, body: newText }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    }
  };

  const getTypeLabel = (type: string) => {
    return EMAIL_TYPES.find(t => t.value === type)?.label || type;
  };

  const FormModal = ({ isOpen, setIsOpen, title, onSubmit, isEdit }: any) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-template-name"
              />
            </div>
            <div>
              <Label htmlFor="type">Template Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger data-testid="select-template-type">
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              data-testid="input-template-subject"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                rows={12}
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                data-testid="textarea-template-body"
                className="font-mono"
              />
            </div>
            <div>
              <Label>Available Variables</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                {AVAILABLE_VARIABLES.map(variable => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => insertVariable(variable)}
                    data-testid={`button-variable-${variable.replace(/[{}]/g, '')}`}
                  >
                    {variable}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Click to insert into email body</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              data-testid="switch-template-active"
            />
            <Label htmlFor="is_active">Template Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onSubmit(isEdit)}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-template"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const PreviewModal = () => (
    <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
        </DialogHeader>
        {previewTemplate && (
          <div className="space-y-4">
            <div>
              <Label>Subject:</Label>
              <div className="border rounded p-3 bg-gray-50">
                {previewTemplate.subject}
              </div>
            </div>
            <div>
              <Label>Email Body:</Label>
              <div className="border rounded p-4 bg-white whitespace-pre-wrap">
                {previewTemplate.body}
              </div>
            </div>
            {previewTemplate.variables.length > 0 && (
              <div>
                <Label>Variables Used:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewTemplate.variables.map(variable => (
                    <Badge key={variable} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Templates Management
          </h1>
          <p className="text-gray-600 mt-1">Configure email templates for notifications and communication</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-template">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates ({templates.length})</CardTitle>
          <CardDescription>
            Manage templates for shipping notifications, installer communications, and customer updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
                <p>Loading email templates...</p>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center p-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No email templates found. Create your first template to start sending automated emails.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{getTypeLabel(template.type)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={template.subject}>
                      {template.subject}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => toggleStatus(template)}
                          disabled={updateMutation.isPending}
                          data-testid={`switch-template-status-${template.id}`}
                        />
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          data-testid={`button-preview-template-${template.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          data-testid={`button-edit-template-${template.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template)}
                          data-testid={`button-delete-template-${template.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FormModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        title="Add New Email Template"
        onSubmit={(isEdit: boolean) => handleSubmit(isEdit)}
        isEdit={false}
      />

      <FormModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title="Edit Email Template"
        onSubmit={(isEdit: boolean) => handleSubmit(isEdit)}
        isEdit={true}
      />

      <PreviewModal />
    </div>
  );
}
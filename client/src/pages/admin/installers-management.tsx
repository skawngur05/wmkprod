import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, UserCog } from 'lucide-react';

interface Installer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  hire_date?: string;
  hourly_rate?: number;
  specialty?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function InstallersManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInstaller, setEditingInstaller] = useState<Installer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active',
    hire_date: '',
    hourly_rate: '',
    specialty: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: installers = [], isLoading } = useQuery<Installer[]>({
    queryKey: ['/api/admin/installers'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null
      };
      return apiRequest('POST', '/api/admin/installers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/installers'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({ title: "Success", description: "Installer created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create installer", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const payload = {
        ...data,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null
      };
      return apiRequest('PUT', `/api/admin/installers/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/installers'] });
      setIsEditModalOpen(false);
      setEditingInstaller(null);
      resetForm();
      toast({ title: "Success", description: "Installer updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update installer", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/installers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/installers'] });
      toast({ title: "Success", description: "Installer deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete installer", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      status: 'active',
      hire_date: '',
      hourly_rate: '',
      specialty: '',
      notes: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = (installer: Installer) => {
    setEditingInstaller(installer);
    setFormData({
      name: installer.name,
      phone: installer.phone || '',
      email: installer.email || '',
      status: installer.status,
      hire_date: installer.hire_date || '',
      hourly_rate: installer.hourly_rate?.toString() || '',
      specialty: installer.specialty || '',
      notes: installer.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (installer: Installer) => {
    if (confirm(`Are you sure you want to delete installer "${installer.name}"?`)) {
      deleteMutation.mutate(installer.id);
    }
  };

  const handleSubmit = (isEdit: boolean) => {
    if (!formData.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    if (isEdit && editingInstaller) {
      updateMutation.mutate({ id: editingInstaller.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      on_leave: "secondary",
      terminated: "destructive"
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const FormModal = ({ isOpen, setIsOpen, title, onSubmit, isEdit }: any) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="input-installer-name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                data-testid="input-installer-phone"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                data-testid="input-installer-email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-installer-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                data-testid="input-installer-hire-date"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                placeholder="25.00"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                data-testid="input-installer-hourly-rate"
              />
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                data-testid="input-installer-specialty"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              data-testid="textarea-installer-notes"
            />
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
              data-testid="button-save-installer"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8" />
            Installer Management
          </h1>
          <p className="text-gray-600 mt-1">Manage installer profiles and information</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-installer">
          <Plus className="h-4 w-4 mr-2" />
          Add Installer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installers ({installers.length})</CardTitle>
          <CardDescription>
            Manage your installation team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
                <p>Loading installers...</p>
              </div>
            </div>
          ) : installers.length === 0 ? (
            <div className="text-center p-8">
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No installers found. Add your first installer to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installers.map((installer) => (
                  <TableRow key={installer.id} data-testid={`row-installer-${installer.id}`}>
                    <TableCell className="font-medium">{installer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {installer.email && <div>{installer.email}</div>}
                        {installer.phone && <div className="text-gray-500">{installer.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(installer.status)}</TableCell>
                    <TableCell>
                      {installer.hourly_rate ? `$${installer.hourly_rate}/hr` : 'Not set'}
                    </TableCell>
                    <TableCell>{installer.specialty || 'General'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(installer)}
                          data-testid={`button-edit-installer-${installer.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(installer)}
                          data-testid={`button-delete-installer-${installer.id}`}
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
        title="Add New Installer"
        onSubmit={(isEdit: boolean) => handleSubmit(isEdit)}
        isEdit={false}
      />

      <FormModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title="Edit Installer"
        onSubmit={(isEdit: boolean) => handleSubmit(isEdit)}
        isEdit={true}
      />
    </div>
  );
}
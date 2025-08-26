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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Globe } from 'lucide-react';

interface LeadOrigin {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function LeadOriginsManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState<LeadOrigin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    is_active: true,
    sort_order: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: origins = [], isLoading } = useQuery<LeadOrigin[]>({
    queryKey: ['/api/admin/lead-origins'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/lead-origins', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lead-origins'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({ title: "Success", description: "Lead origin created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create lead origin", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest(`/api/admin/lead-origins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lead-origins'] });
      setIsEditModalOpen(false);
      setEditingOrigin(null);
      resetForm();
      toast({ title: "Success", description: "Lead origin updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lead origin", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/lead-origins/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lead-origins'] });
      toast({ title: "Success", description: "Lead origin deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete lead origin", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = (origin: LeadOrigin) => {
    setEditingOrigin(origin);
    setFormData({
      name: origin.name,
      display_name: origin.display_name,
      is_active: origin.is_active,
      sort_order: origin.sort_order
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (origin: LeadOrigin) => {
    if (confirm(`Are you sure you want to delete lead origin "${origin.display_name}"?`)) {
      deleteMutation.mutate(origin.id);
    }
  };

  const handleSubmit = (isEdit: boolean) => {
    if (!formData.name || !formData.display_name) {
      toast({ title: "Error", description: "Name and display name are required", variant: "destructive" });
      return;
    }

    if (isEdit && editingOrigin) {
      updateMutation.mutate({ id: editingOrigin.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleStatus = (origin: LeadOrigin) => {
    updateMutation.mutate({ 
      id: origin.id, 
      is_active: !origin.is_active 
    });
  };

  const FormModal = ({ isOpen, setIsOpen, title, onSubmit, isEdit }: any) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Internal Name *</Label>
            <Input
              id="name"
              placeholder="e.g., facebook_ads"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              data-testid="input-origin-name"
            />
            <p className="text-xs text-gray-500 mt-1">Used internally, no spaces or special characters</p>
          </div>
          
          <div>
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              placeholder="e.g., Facebook Ads"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              data-testid="input-origin-display-name"
            />
            <p className="text-xs text-gray-500 mt-1">Name shown to users in dropdowns</p>
          </div>

          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              data-testid="input-origin-sort-order"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in lists</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              data-testid="switch-origin-active"
            />
            <Label htmlFor="is_active">Active</Label>
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
              data-testid="button-save-origin"
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
            <Globe className="h-8 w-8" />
            Lead Origins Management
          </h1>
          <p className="text-gray-600 mt-1">Configure lead sources and marketing channels</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-origin">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead Origin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Origins ({origins.length})</CardTitle>
          <CardDescription>
            Manage where your leads come from - social media, referrals, advertising channels, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
                <p>Loading lead origins...</p>
              </div>
            </div>
          ) : origins.length === 0 ? (
            <div className="text-center p-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No custom lead origins found. Add your first lead origin to track where leads come from.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Internal Name</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {origins
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((origin) => (
                    <TableRow key={origin.id} data-testid={`row-origin-${origin.id}`}>
                      <TableCell className="font-medium">{origin.display_name}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">{origin.name}</TableCell>
                      <TableCell>{origin.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={origin.is_active}
                            onCheckedChange={() => toggleStatus(origin)}
                            disabled={updateMutation.isPending}
                            data-testid={`switch-origin-status-${origin.id}`}
                          />
                          <Badge variant={origin.is_active ? "default" : "secondary"}>
                            {origin.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(origin)}
                            data-testid={`button-edit-origin-${origin.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(origin)}
                            data-testid={`button-delete-origin-${origin.id}`}
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
        title="Add New Lead Origin"
        onSubmit={(isEdit: boolean) => handleSubmit(isEdit)}
        isEdit={false}
      />

      <FormModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title="Edit Lead Origin"
        onSubmit={(isEdit: boolean) => handleSubmit(isEdit)}
        isEdit={true}
      />
    </div>
  );
}
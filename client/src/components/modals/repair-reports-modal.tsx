import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Phone, Mail, MapPin, Calendar, User, AlertTriangle, Plus } from 'lucide-react';
import { Lead } from '@shared/schema';

interface RepairReportsModalProps {
  show: boolean;
  onHide: () => void;
}

export function RepairReportsModal({ show, onHide }: RepairReportsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Lead | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    issue_description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    date_reported: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search for completed projects
  const { data: searchResults, isLoading: isSearching } = useQuery<Lead[]>({
    queryKey: ['/api/completed-projects/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const response = await fetch(`/api/completed-projects/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to search projects');
      return response.json();
    },
    enabled: searchTerm.length >= 3, // Only search when we have at least 3 characters
  });

  // Fetch existing repair requests
  const { data: repairRequests, isLoading: isLoadingRepairs } = useQuery({
    queryKey: ['/api/repair-requests'],
    queryFn: async () => {
      const response = await fetch('/api/repair-requests');
      if (!response.ok) throw new Error('Failed to fetch repair requests');
      return response.json();
    },
    enabled: show,
  });

  // Create repair request mutation
  const createRepairMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/repair-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create repair request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Repair request created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/repair-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create repair request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      customer_name: '',
      phone: '',
      email: '',
      address: '',
      issue_description: '',
      priority: 'Medium',
      date_reported: new Date().toISOString().split('T')[0],
    });
    setSelectedProject(null);
    setShowCreateForm(false);
    setSearchTerm('');
  };

  const handleSelectProject = (project: Lead) => {
    setSelectedProject(project);
    setFormData({
      ...formData,
      customer_name: project.name,
      phone: project.phone || '',
      email: project.email || '',
      address: project.address || '',
    });
    setShowCreateForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const repairData = {
      ...formData,
      project_id: selectedProject?.id || null,
    };
    
    createRepairMutation.mutate(repairData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Repair Reports Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showCreateForm ? (
            <>
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Label>Search for existing customer (by email or phone)</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter customer email or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Report
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Searching...</p>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-3">
                  <Label>Found {searchResults.length} completed project(s):</Label>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {searchResults.map((project) => (
                      <Card key={project.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSelectProject(project)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{project.name}</span>
                              </div>
                              {project.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {project.phone}
                                </div>
                              )}
                              {project.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  {project.email}
                                </div>
                              )}
                              {project.address && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {project.address}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <div>Project Amount: ${project.project_amount}</div>
                              {project.installation_date && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(project.installation_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {searchTerm.length >= 3 && searchResults?.length === 0 && !isSearching && (
                <div className="text-center py-6 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No completed projects found for "{searchTerm}"</p>
                  <p className="text-sm">Try a different search term or create a new repair report</p>
                </div>
              )}
            </>
          ) : (
            /* Create Repair Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Create Repair Request</h3>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Back to Search
                </Button>
              </div>

              {selectedProject && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Creating repair request for: <strong>{selectedProject.name}</strong>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="issue_description">Issue Description *</Label>
                <Textarea
                  id="issue_description"
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date_reported">Date Reported</Label>
                <Input
                  id="date_reported"
                  type="date"
                  value={formData.date_reported}
                  onChange={(e) => setFormData({ ...formData, date_reported: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onHide}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRepairMutation.isPending}>
                  {createRepairMutation.isPending ? 'Creating...' : 'Create Repair Request'}
                </Button>
              </div>
            </form>
          )}

          {/* Existing Repair Requests */}
          {repairRequests && repairRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Repair Requests</h3>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {repairRequests.slice(0, 5).map((request: any) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{request.customer_name}</span>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{request.issue_description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>📞 {request.phone}</span>
                            {request.email && <span>✉️ {request.email}</span>}
                            <span>📅 {new Date(request.date_reported).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

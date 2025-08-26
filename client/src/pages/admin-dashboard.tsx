import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserCog, 
  Settings, 
  Mail, 
  Database, 
  Activity,
  Shield,
  Wrench,
  MessageSquare,
  Globe,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { Redirect, useLocation } from 'wouter';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  // Detect current admin page
  const getCurrentPage = () => {
    if (location === '/admin/users') return 'users';
    if (location === '/admin/installers') return 'installers';
    if (location === '/admin/lead-origins') return 'lead-origins';
    if (location === '/admin/email-templates') return 'email-templates';
    if (location === '/admin/smtp-settings') return 'smtp-settings';
    if (location === '/admin/activity') return 'activity';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
    enabled: user?.role === 'admin'
  });

  // Conditional rendering based on current page
  if (currentPage === 'users') {
    return <UserManagement />;
  }
  
  if (currentPage === 'installers') {
    return <InstallerManagement />;
  }
  
  if (currentPage === 'lead-origins') {
    return <LeadOriginsManagement />;
  }
  
  if (currentPage === 'email-templates') {
    return <EmailTemplatesManagement />;
  }
  
  if (currentPage === 'smtp-settings') {
    return <SMTPSettingsManagement />;
  }
  
  if (currentPage === 'activity') {
    return <ActivityLogManagement />;
  }

  // User Management Component
  const UserManagement = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'sales_rep' });
    const [showPassword, setShowPassword] = useState(false);

    const { data: users = [], isLoading: loadingUsers } = useQuery({
      queryKey: ['/api/admin/users'],
      enabled: currentPage === 'users'
    });

    const createUserMutation = useMutation({
      mutationFn: async (userData: any) => {
        return apiRequest('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setIsCreateDialogOpen(false);
        setNewUser({ username: '', password: '', role: 'sales_rep' });
        toast({ title: "User created successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to create user", variant: "destructive" })
    });

    const updateUserMutation = useMutation({
      mutationFn: async ({ id, data }: any) => {
        return apiRequest(`/api/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setEditingUser(null);
        toast({ title: "User updated successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to update user", variant: "destructive" })
    });

    const deleteUserMutation = useMutation({
      mutationFn: async (id: string) => {
        return apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        toast({ title: "User deleted successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to delete user", variant: "destructive" })
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_rep">Sales Rep</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => createUserMutation.mutate(newUser)}
                  disabled={!newUser.username || !newUser.password || createUserMutation.isPending}
                  className="w-full"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                          {user.role === 'admin' ? 'Administrator' : 'Sales Rep'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={user.username === 'admin'}
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

        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User: {editingUser.username}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_rep">Sales Rep</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => updateUserMutation.mutate({ id: editingUser.id, data: editingUser })}
                  disabled={updateUserMutation.isPending}
                  className="w-full"
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  // Installer Management Component
  const InstallerManagement = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingInstaller, setEditingInstaller] = useState<any>(null);
    const [newInstaller, setNewInstaller] = useState({ name: '', phone: '', email: '', status: 'active' });

    const { data: installers = [], isLoading: loadingInstallers } = useQuery({
      queryKey: ['/api/admin/installers'],
      enabled: currentPage === 'installers'
    });

    const createInstallerMutation = useMutation({
      mutationFn: async (installerData: any) => {
        return apiRequest('/api/admin/installers', {
          method: 'POST',
          body: JSON.stringify(installerData)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/installers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setIsCreateDialogOpen(false);
        setNewInstaller({ name: '', phone: '', email: '', status: 'active' });
        toast({ title: "Installer created successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to create installer", variant: "destructive" })
    });

    const updateInstallerMutation = useMutation({
      mutationFn: async ({ id, data }: any) => {
        return apiRequest(`/api/admin/installers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/installers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setEditingInstaller(null);
        toast({ title: "Installer updated successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to update installer", variant: "destructive" })
    });

    const deleteInstallerMutation = useMutation({
      mutationFn: async (id: string) => {
        return apiRequest(`/api/admin/installers/${id}`, { method: 'DELETE' });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/installers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        toast({ title: "Installer deleted successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to delete installer", variant: "destructive" })
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Installer Management
            </h1>
            <p className="text-gray-600 mt-1">Manage installer profiles and status</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Installer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Installer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="installer-name">Name</Label>
                  <Input
                    id="installer-name"
                    value={newInstaller.name}
                    onChange={(e) => setNewInstaller({ ...newInstaller, name: e.target.value })}
                    placeholder="Enter installer name"
                  />
                </div>
                <div>
                  <Label htmlFor="installer-phone">Phone</Label>
                  <Input
                    id="installer-phone"
                    value={newInstaller.phone}
                    onChange={(e) => setNewInstaller({ ...newInstaller, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="installer-email">Email</Label>
                  <Input
                    id="installer-email"
                    type="email"
                    value={newInstaller.email}
                    onChange={(e) => setNewInstaller({ ...newInstaller, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="installer-status">Status</Label>
                  <Select value={newInstaller.status} onValueChange={(value) => setNewInstaller({ ...newInstaller, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => createInstallerMutation.mutate(newInstaller)}
                  disabled={!newInstaller.name || createInstallerMutation.isPending}
                  className="w-full"
                >
                  {createInstallerMutation.isPending ? 'Adding...' : 'Add Installer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installers</CardTitle>
            <CardDescription>Manage installer information and status</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInstallers ? (
              <div className="text-center py-8">Loading installers...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installers.map((installer: any) => (
                    <TableRow key={installer.id}>
                      <TableCell className="font-medium">{installer.name}</TableCell>
                      <TableCell>{installer.phone}</TableCell>
                      <TableCell>{installer.email}</TableCell>
                      <TableCell>
                        <Badge variant={installer.status === 'active' ? 'default' : 'secondary'}>
                          {installer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingInstaller(installer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteInstallerMutation.mutate(installer.id)}
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

        {editingInstaller && (
          <Dialog open={!!editingInstaller} onOpenChange={() => setEditingInstaller(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Installer: {editingInstaller.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-installer-name">Name</Label>
                  <Input
                    id="edit-installer-name"
                    value={editingInstaller.name}
                    onChange={(e) => setEditingInstaller({ ...editingInstaller, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-installer-phone">Phone</Label>
                  <Input
                    id="edit-installer-phone"
                    value={editingInstaller.phone}
                    onChange={(e) => setEditingInstaller({ ...editingInstaller, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-installer-email">Email</Label>
                  <Input
                    id="edit-installer-email"
                    type="email"
                    value={editingInstaller.email}
                    onChange={(e) => setEditingInstaller({ ...editingInstaller, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-installer-status">Status</Label>
                  <Select value={editingInstaller.status} onValueChange={(value) => setEditingInstaller({ ...editingInstaller, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => updateInstallerMutation.mutate({ id: editingInstaller.id, data: editingInstaller })}
                  disabled={updateInstallerMutation.isPending}
                  className="w-full"
                >
                  {updateInstallerMutation.isPending ? 'Updating...' : 'Update Installer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  // Lead Origins Management Component
  const LeadOriginsManagement = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingOrigin, setEditingOrigin] = useState<any>(null);
    const [newOrigin, setNewOrigin] = useState({ origin_name: '', is_active: true });

    const { data: origins = [], isLoading: loadingOrigins } = useQuery({
      queryKey: ['/api/admin/lead-origins'],
      enabled: currentPage === 'lead-origins'
    });

    const createOriginMutation = useMutation({
      mutationFn: async (originData: any) => {
        return apiRequest('/api/admin/lead-origins', {
          method: 'POST',
          body: JSON.stringify(originData)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/lead-origins'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setIsCreateDialogOpen(false);
        setNewOrigin({ origin_name: '', is_active: true });
        toast({ title: "Lead origin created successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to create lead origin", variant: "destructive" })
    });

    const updateOriginMutation = useMutation({
      mutationFn: async ({ id, data }: any) => {
        return apiRequest(`/api/admin/lead-origins/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/lead-origins'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setEditingOrigin(null);
        toast({ title: "Lead origin updated successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to update lead origin", variant: "destructive" })
    });

    const deleteOriginMutation = useMutation({
      mutationFn: async (id: string) => {
        return apiRequest(`/api/admin/lead-origins/${id}`, { method: 'DELETE' });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/lead-origins'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        toast({ title: "Lead origin deleted successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to delete lead origin", variant: "destructive" })
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Lead Origins
            </h1>
            <p className="text-gray-600 mt-1">Configure lead sources and channels</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Origin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead Origin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="origin-name">Origin Name</Label>
                  <Input
                    id="origin-name"
                    value={newOrigin.origin_name}
                    onChange={(e) => setNewOrigin({ ...newOrigin, origin_name: e.target.value })}
                    placeholder="Enter lead origin name"
                  />
                </div>
                <Button 
                  onClick={() => createOriginMutation.mutate(newOrigin)}
                  disabled={!newOrigin.origin_name || createOriginMutation.isPending}
                  className="w-full"
                >
                  {createOriginMutation.isPending ? 'Adding...' : 'Add Lead Origin'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lead Origins</CardTitle>
            <CardDescription>Manage lead sources and channels</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrigins ? (
              <div className="text-center py-8">Loading lead origins...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origins.map((origin: any) => (
                    <TableRow key={origin.id}>
                      <TableCell className="font-medium">{origin.origin_name}</TableCell>
                      <TableCell>
                        <Badge variant={origin.is_active ? 'default' : 'secondary'}>
                          {origin.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingOrigin(origin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteOriginMutation.mutate(origin.id)}
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

        {editingOrigin && (
          <Dialog open={!!editingOrigin} onOpenChange={() => setEditingOrigin(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Lead Origin: {editingOrigin.origin_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-origin-name">Origin Name</Label>
                  <Input
                    id="edit-origin-name"
                    value={editingOrigin.origin_name}
                    onChange={(e) => setEditingOrigin({ ...editingOrigin, origin_name: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-origin-active"
                    checked={editingOrigin.is_active}
                    onChange={(e) => setEditingOrigin({ ...editingOrigin, is_active: e.target.checked })}
                  />
                  <Label htmlFor="edit-origin-active">Active</Label>
                </div>
                <Button 
                  onClick={() => updateOriginMutation.mutate({ id: editingOrigin.id, data: editingOrigin })}
                  disabled={updateOriginMutation.isPending}
                  className="w-full"
                >
                  {updateOriginMutation.isPending ? 'Updating...' : 'Update Lead Origin'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  // Email Templates Management Component
  const EmailTemplatesManagement = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [newTemplate, setNewTemplate] = useState({ 
      template_name: '', 
      subject: '', 
      body_content: '', 
      template_type: 'followup',
      is_active: true 
    });

    const { data: templates = [], isLoading: loadingTemplates } = useQuery({
      queryKey: ['/api/admin/email-templates'],
      enabled: currentPage === 'email-templates'
    });

    const createTemplateMutation = useMutation({
      mutationFn: async (templateData: any) => {
        return apiRequest('/api/admin/email-templates', {
          method: 'POST',
          body: JSON.stringify(templateData)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setIsCreateDialogOpen(false);
        setNewTemplate({ template_name: '', subject: '', body_content: '', template_type: 'followup', is_active: true });
        toast({ title: "Email template created successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to create email template", variant: "destructive" })
    });

    const updateTemplateMutation = useMutation({
      mutationFn: async ({ id, data }: any) => {
        return apiRequest(`/api/admin/email-templates/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        setEditingTemplate(null);
        toast({ title: "Email template updated successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to update email template", variant: "destructive" })
    });

    const deleteTemplateMutation = useMutation({
      mutationFn: async (id: string) => {
        return apiRequest(`/api/admin/email-templates/${id}`, { method: 'DELETE' });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
        toast({ title: "Email template deleted successfully", variant: "default" });
      },
      onError: () => toast({ title: "Failed to delete email template", variant: "destructive" })
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Email Templates
            </h1>
            <p className="text-gray-600 mt-1">Manage email templates for automated communications</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Email Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.template_name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <Select value={newTemplate.template_type} onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-subject">Subject</Label>
                  <Input
                    id="template-subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="template-body">Email Content</Label>
                  <Textarea
                    id="template-body"
                    value={newTemplate.body_content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, body_content: e.target.value })}
                    placeholder="Enter email content..."
                    rows={8}
                  />
                </div>
                <Button 
                  onClick={() => createTemplateMutation.mutate(newTemplate)}
                  disabled={!newTemplate.template_name || !newTemplate.subject || createTemplateMutation.isPending}
                  className="w-full"
                >
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Manage automated email templates</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTemplates ? (
              <div className="text-center py-8">Loading templates...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template: any) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.template_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.template_type}</Badge>
                      </TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
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
      </div>
    );
  };

  // Activity Log Component
  const ActivityLogManagement = () => {
    const { data: activities = [], isLoading: loadingActivities } = useQuery({
      queryKey: ['/api/admin/activity-log'],
      enabled: currentPage === 'activity'
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Activity Log
            </h1>
            <p className="text-gray-600 mt-1">Monitor system usage and user activity</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>System activity and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <div className="text-center py-8">Loading activity log...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity: any) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.username || 'System'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.action}</Badge>
                      </TableCell>
                      <TableCell>{activity.entity_type || '-'}</TableCell>
                      <TableCell>{activity.description || '-'}</TableCell>
                      <TableCell>{new Date(activity.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // SMTP Settings Component  
  const SMTPSettingsManagement = () => {
    const [settings, setSettings] = useState({
      smtp_host: '',
      smtp_port: '587',
      email_user: '',
      email_pass: '',
      smtp_secure: false
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              SMTP Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure email server settings</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Server Configuration</CardTitle>
            <CardDescription>Configure SMTP settings for sending emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                  placeholder="587"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email-user">Email Username</Label>
              <Input
                id="email-user"
                value={settings.email_user}
                onChange={(e) => setSettings({ ...settings, email_user: e.target.value })}
                placeholder="your-email@domain.com"
              />
            </div>
            <div>
              <Label htmlFor="email-pass">Email Password</Label>
              <Input
                id="email-pass"
                type="password"
                value={settings.email_pass}
                onChange={(e) => setSettings({ ...settings, email_pass: e.target.value })}
                placeholder="App password or email password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smtp-secure"
                checked={settings.smtp_secure}
                onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.checked })}
              />
              <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
            </div>
            <Button className="w-full">
              Save SMTP Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Main Dashboard Component
  const MainDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Badge variant="destructive">Administrator</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const adminCards = [
    {
      title: "User Management",
      description: "Manage system users and permissions",
      icon: Users,
      value: stats?.totalUsers || 0,
      subtext: `${stats?.adminUsers || 0} admins, ${stats?.activeUsers || 0} sales reps`,
      href: "/admin/users",
      color: "text-blue-600"
    },
    {
      title: "Installer Management", 
      description: "Manage installer profiles and status",
      icon: UserCog,
      value: stats?.totalInstallers || 0,
      subtext: `${stats?.activeInstallers || 0} active installers`,
      href: "/admin/installers",
      color: "text-green-600"
    },
    {
      title: "Lead Origins",
      description: "Configure lead sources and channels",
      icon: Globe,
      value: stats?.totalLeadOrigins || 0,
      subtext: `${stats?.activeLeadOrigins || 0} active origins`,
      href: "/admin/lead-origins",
      color: "text-purple-600"
    },
    {
      title: "Email Templates",
      description: "Manage email templates",
      icon: Mail,
      value: stats?.totalEmailTemplates || 0,
      subtext: `${stats?.activeEmailTemplates || 0} active templates`,
      href: "/admin/email-templates",
      color: "text-orange-600"
    },
    {
      title: "SMTP Configuration",
      description: "Configure email settings",
      icon: Settings,
      value: "Setup",
      subtext: "Email server configuration",
      href: "/admin/smtp-settings",
      color: "text-red-600"
    },
    {
      title: "System Activity",
      description: "Monitor system usage and activity",
      icon: Activity,
      value: "Monitor",
      subtext: "View recent system activity",
      href: "/admin/activity",
      color: "text-indigo-600"
    },
    {
      title: "Database Management",
      description: "Database backup and maintenance",
      icon: Database,
      value: stats?.totalLeads || 0,
      subtext: "Total leads in system",
      href: "/admin/database",
      color: "text-gray-600"
    },
    {
      title: "System Settings",
      description: "Global system configuration",
      icon: Wrench,
      value: "Config",
      subtext: "Application settings",
      href: "/admin/settings",
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System administration and configuration</p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Administrator
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`admin-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {card.title}
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardTitle>
                <div className="text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-xs">
                  {card.subtext}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  {card.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = card.href}
                  data-testid={`button-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" data-testid="button-create-user">
              <Users className="h-4 w-4 mr-2" />
              Create New User
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-add-installer">
              <UserCog className="h-4 w-4 mr-2" />
              Add Installer
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-backup-database">
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <Badge variant="secondary" className="mb-1">System</Badge>
                <p className="text-muted-foreground">Admin user created successfully</p>
              </div>
              <div className="text-sm">
                <Badge variant="outline" className="mb-1">Database</Badge>
                <p className="text-muted-foreground">All tables migrated successfully</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="secondary">Test Mode</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  };

  // Default to main dashboard  
  return <MainDashboard />;
}
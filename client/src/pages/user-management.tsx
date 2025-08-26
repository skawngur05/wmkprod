import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  User,
  Settings,
  Key
} from 'lucide-react';
import { Redirect } from 'wouter';

// Define user role hierarchy (higher number = higher authority)
const ROLE_HIERARCHY = {
  'installer': 1,
  'sales_rep': 2,
  'manager': 3,
  'owner': 4,
  'admin': 5,
  'administrator': 5
} as const;

// Define all available permissions
const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard', description: 'View main dashboard and statistics', minRole: 1 },
  { id: 'leads', label: 'Leads Management', description: 'View, create, edit and manage leads', minRole: 2 },
  { id: 'followups', label: 'Follow-ups', description: 'View and manage follow-up tasks', minRole: 2 },
  { id: 'installations', label: 'Installations', description: 'View and manage installation schedules', minRole: 1 },
  { id: 'sample-booklets', label: 'Sample Booklets', description: 'Manage sample booklet orders', minRole: 2 },
  { id: 'reports', label: 'Reports & Analytics', description: 'View reports and business analytics', minRole: 3 },
  { id: 'admin', label: 'Admin Panel', description: 'Access administrative functions', minRole: 4 },
  { id: 'user-management', label: 'User Management', description: 'Create and manage user accounts', minRole: 4 },
  { id: 'system-settings', label: 'System Settings', description: 'Configure system-wide settings', minRole: 5 },
] as const;

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: string;
  permissions?: string[];
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'sales_rep',
    permissions: [] as string[],
    is_active: true
  });

  // Redirect non-admin users
  if (!user || (user.role !== 'admin' && user.role !== 'administrator')) {
    return <Redirect to="/dashboard" />;
  }

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest('POST', '/api/admin/users', userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
      setIsCreateDialogOpen(false);
      setNewUser({ username: '', name: '', email: '', password: '', role: 'sales_rep', permissions: [], is_active: true });
      toast({ title: "User created successfully", variant: "default" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create user", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${id}`, data);
      return response.json();
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
      const response = await apiRequest('DELETE', `/api/admin/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
      toast({ title: "User deleted successfully", variant: "default" });
    },
    onError: () => toast({ title: "Failed to delete user", variant: "destructive" })
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/reset-password`, { password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setResetPasswordUser(null);
      setNewPassword('');
      toast({ title: "Password reset successfully", variant: "default" });
    },
    onError: () => toast({ title: "Failed to reset password", variant: "destructive" })
  });

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password) {
      toast({ title: "Username and password are required", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handlePermissionToggle = (permission: string, isEditing = false) => {
    if (isEditing && editingUser) {
      const currentPermissions = editingUser.permissions || [];
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];
      
      setEditingUser({ ...editingUser, permissions: newPermissions });
    } else {
      const newPermissions = newUser.permissions.includes(permission)
        ? newUser.permissions.filter(p => p !== permission)
        : [...newUser.permissions, permission];
      
      setNewUser({ ...newUser, permissions: newPermissions });
    }
  };

  const handleRoleChange = (role: string, isEditing = false) => {
    const roleLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
    // Auto-assign permissions based on role hierarchy
    const defaultPermissions = AVAILABLE_PERMISSIONS
      .filter(p => roleLevel >= p.minRole)
      .map(p => p.id);

    if (isEditing && editingUser) {
      setEditingUser({ ...editingUser, role, permissions: defaultPermissions });
    } else {
      setNewUser({ ...newUser, role, permissions: defaultPermissions });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Users className="h-8 w-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage user accounts and their permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-create-user">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role-based permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                    data-testid="input-username"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    data-testid="input-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                      data-testid="input-password"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => handleRoleChange(value)}>
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installer">Installer</SelectItem>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={newUser.is_active}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, is_active: checked })}
                    data-testid="switch-active"
                  />
                  <Label htmlFor="is_active">Active User</Label>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Page Permissions</Label>
                <p className="text-sm text-gray-600 mb-3">Select which pages this user can access</p>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={permission.id}
                        checked={newUser.permissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                        disabled={newUser.role === 'admin' || newUser.role === 'owner'} // Admins and Owners get all permissions
                        data-testid={`checkbox-${permission.id}`}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {(newUser.role === 'admin' || newUser.role === 'owner') && (
                  <p className="text-sm text-blue-600 mt-2">
                    <Shield className="h-4 w-4 inline mr-1" />
                    {newUser.role === 'admin' ? 'Administrators' : 'Owners'} have access to all pages by default
                  </p>
                )}
                {newUser.role && newUser.role !== 'admin' && newUser.role !== 'owner' && (
                  <p className="text-sm text-gray-600 mt-2">
                    Permissions automatically assigned based on role hierarchy. You can customize them below.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  disabled={createUserMutation.isPending}
                  data-testid="button-save-user"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage all user accounts and their access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{user.name || user.username}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                        {user.email && <div className="text-xs text-blue-600">{user.email}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'admin' ? 'destructive' : 
                      user.role === 'owner' ? 'destructive' :
                      user.role === 'manager' ? 'default' :
                      'secondary'
                    }>
                      {user.role === 'admin' && <><Shield className="h-3 w-3 mr-1" />Administrator</>}
                      {user.role === 'owner' && <><Key className="h-3 w-3 mr-1" />Owner</>}
                      {user.role === 'manager' && <><Settings className="h-3 w-3 mr-1" />Manager</>}
                      {user.role === 'sales_rep' && <><User className="h-3 w-3 mr-1" />Sales Rep</>}
                      {user.role === 'installer' && <><User className="h-3 w-3 mr-1" />Installer</>}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(user.role === 'admin' || user.role === 'owner') ? (
                        <Badge variant="outline" className="text-xs">All Permissions</Badge>
                      ) : (
                        (user.permissions || []).slice(0, 2).map(perm => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                          </Badge>
                        ))
                      )}
                      {user.permissions && user.permissions.length > 2 && user.role !== 'admin' && user.role !== 'owner' && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.username !== 'admin' && ( // Don't allow deleting admin user
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          data-testid={`button-delete-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User Account
            </DialogTitle>
            <DialogDescription>
              Modify user information, role, and permissions for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-8">
              
              {/* User Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                      placeholder="Enter username"
                      data-testid="input-edit-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editingUser.name || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      placeholder="Enter full name"
                      data-testid="input-edit-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      placeholder="Enter email address"
                      data-testid="input-edit-email"
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-6">
                    <Switch
                      checked={editingUser.is_active}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_active: checked })}
                      data-testid="switch-edit-active"
                    />
                    <Label className="text-sm font-medium">
                      {editingUser.is_active ? 'Active User' : 'Inactive User'}
                    </Label>
                    <Badge variant={editingUser.is_active ? 'default' : 'secondary'} className="ml-2">
                      {editingUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Role & Access Section */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role & Access Control
                </h3>
                <div className="mb-4">
                  <Label htmlFor="edit-role">User Role</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value) => handleRoleChange(value, true)}
                  >
                    <SelectTrigger data-testid="select-edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installer">Installer</SelectItem>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Page Permissions</Label>
                  <p className="text-sm text-gray-600 mb-4">Select which pages this user can access</p>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
                        <Checkbox
                          checked={(editingUser.permissions || []).includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id, true)}
                          disabled={editingUser.role === 'admin' || editingUser.role === 'owner'}
                          data-testid={`checkbox-edit-${permission.id}`}
                        />
                        <div className="flex-1">
                          <Label className="font-medium cursor-pointer text-sm">
                            {permission.label}
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(editingUser.role === 'admin' || editingUser.role === 'owner') && (
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        {editingUser.role === 'admin' ? 'Administrators' : 'Owners'} have access to all pages by default
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Management
                </h3>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setResetPasswordUser(editingUser.id)}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    data-testid="button-reset-password"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                  <p className="text-sm text-gray-600">
                    Click to generate a new password for this user account
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel Changes
                </Button>
                <Button 
                  onClick={() => updateUserMutation.mutate({ 
                    id: editingUser.id, 
                    data: { 
                      username: editingUser.username,
                      name: editingUser.name,
                      email: editingUser.email,
                      role: editingUser.role, 
                      permissions: editingUser.permissions,
                      is_active: editingUser.is_active 
                    } 
                  })}
                  disabled={updateUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-save-edit-user"
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={() => setResetPasswordUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset User Password
            </DialogTitle>
            <DialogDescription>
              Enter a new password for this user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  data-testid="input-new-password"
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
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setResetPasswordUser(null);
                  setNewPassword('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => resetPasswordUser && resetPasswordMutation.mutate({
                  userId: resetPasswordUser, 
                  password: newPassword
                })}
                disabled={!newPassword || resetPasswordMutation.isPending}
                data-testid="button-confirm-reset"
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
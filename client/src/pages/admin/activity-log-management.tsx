import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Search, Filter, RefreshCw, User, FileText, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_name?: string; // This might be joined from user table
}

export default function ActivityLogManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7'); // days
  
  const { data: activityLogs = [], isLoading, refetch } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs', { search: searchTerm, entity: entityFilter, action: actionFilter, days: dateRange }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (entityFilter !== 'all') params.append('entity_type', entityFilter);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (dateRange !== 'all') params.append('days', dateRange);
      
      const response = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, "default" | "secondary" | "destructive"> = {
      'create': 'default',
      'update': 'secondary',
      'delete': 'destructive',
      'login': 'default',
      'logout': 'secondary',
      'view': 'secondary',
      'export': 'default'
    };
    
    const actionType = action.toLowerCase().split('_')[0];
    return (
      <Badge variant={actionColors[actionType] || "secondary"}>
        {action.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, any> = {
      'user': User,
      'lead': FileText,
      'installer': Settings,
      'sample_booklet': FileText,
      'email_template': FileText,
      'smtp_settings': Settings,
      'lead_origin': Settings
    };
    
    const Icon = icons[entityType] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Unknown';
    
    // Simple browser detection
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Other';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEntityFilter('all');
    setActionFilter('all');
    setDateRange('7');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Log
          </h1>
          <p className="text-gray-600 mt-1">Monitor system usage and user activities</p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline" data-testid="button-refresh-logs">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="input-search-activities"
              />
            </div>
            
            <div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger data-testid="select-entity-filter">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="installer">Installers</SelectItem>
                  <SelectItem value="sample_booklet">Sample Booklets</SelectItem>
                  <SelectItem value="email_template">Email Templates</SelectItem>
                  <SelectItem value="smtp_settings">SMTP Settings</SelectItem>
                  <SelectItem value="lead_origin">Lead Origins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger data-testid="select-action-filter">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger data-testid="select-date-range">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 Hours</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
                data-testid="button-clear-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities ({activityLogs.length})</CardTitle>
          <CardDescription>
            System and user activity logs - Updates automatically every 30 seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
                <p>Loading activity logs...</p>
              </div>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center p-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found for the selected filters.</p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="mt-2"
                data-testid="button-clear-filters-empty"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-activity-${log.id}`}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {log.user_name || log.user_id || 'System'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(log.entity_type)}
                          <span className="capitalize">
                            {log.entity_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.details}>
                          {log.details || 'No details'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatUserAgent(log.user_agent)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {log.ip_address || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {activityLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {activityLogs.filter(log => log.action.toLowerCase().includes('create')).length}
              </div>
              <p className="text-sm text-gray-600">Items Created</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {activityLogs.filter(log => log.action.toLowerCase().includes('update')).length}
              </div>
              <p className="text-sm text-gray-600">Items Updated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {activityLogs.filter(log => log.action.toLowerCase().includes('login')).length}
              </div>
              <p className="text-sm text-gray-600">Login Events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {new Set(activityLogs.map(log => log.user_id).filter(Boolean)).size}
              </div>
              <p className="text-sm text-gray-600">Active Users</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
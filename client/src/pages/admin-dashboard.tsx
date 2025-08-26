import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  UserCog, 
  Settings, 
  Mail, 
  Database, 
  Activity,
  Shield,
  Wrench,
  Globe
} from 'lucide-react';
import { Redirect } from 'wouter';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
    enabled: user?.role === 'admin'
  });

  const adminCards = [
    {
      title: "User Management", 
      description: "Manage user accounts and permissions",
      icon: Users,
      value: stats?.totalUsers || 0,
      subtext: `${stats?.adminUsers || 0} admins, ${stats?.activeUsers || 0} sales reps`,
      href: "/user-management",
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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
    </div>
  );
}
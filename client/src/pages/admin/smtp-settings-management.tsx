import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Settings, Mail, TestTube, Save, Eye, EyeOff } from 'lucide-react';

interface SMTPSettings {
  id?: string;
  name?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  secure: boolean;
  is_active: boolean;
  test_email?: string;
  created_at?: string;
  updated_at?: string;
}

export default function SMTPSettingsManagement() {
  const [formData, setFormData] = useState<SMTPSettings>({
    name: 'Default SMTP',
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: 'WMK Kitchen Solutions',
    secure: true,
    is_active: false,
    test_email: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SMTPSettings[]>({
    queryKey: ['/api/admin/smtp-settings'],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: SMTPSettings) => {
      const hasExistingSettings = settings && settings.length > 0 && settings[0].id;
      const method = hasExistingSettings ? 'PUT' : 'POST';
      const url = hasExistingSettings 
        ? `/api/admin/smtp-settings/${settings[0].id}` 
        : '/api/admin/smtp-settings';
      
      // Remove test_email field and ensure name field exists
      const { test_email, ...dataToSave } = {
        ...data,
        name: data.name || 'Default SMTP Configuration'
      };
      
      return apiRequest(method, url, dataToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/smtp-settings'] });
      setHasChanges(false);
      toast({ title: "Success", description: "SMTP settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save SMTP settings", variant: "destructive" });
    }
  });

  const testMutation = useMutation({
    mutationFn: async (testEmail: string) => {
      return apiRequest('POST', '/api/admin/smtp-settings/test', { 
        ...formData,
        test_email: testEmail 
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Test email sent successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Test Failed", 
        description: error.message || "Failed to send test email", 
        variant: "destructive" 
      });
    }
  });

  // Load existing settings into form
  useEffect(() => {
    if (settings && settings.length > 0) {
      const currentSettings = settings[0];
      setFormData({
        ...currentSettings,
        secure: currentSettings.secure ?? true,
        is_active: currentSettings.is_active ?? false,
        test_email: currentSettings.test_email || ''
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof SMTPSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.host || !formData.username || !formData.password || !formData.from_email) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.from_email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleTest = () => {
    if (!formData.test_email) {
      toast({ title: "Error", description: "Please enter a test email address", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.test_email)) {
      toast({ title: "Error", description: "Please enter a valid test email address", variant: "destructive" });
      return;
    }

    testMutation.mutate(formData.test_email);
  };

  const presetConfigurations = [
    {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      use_tls: true,
      note: 'Use App Password instead of regular password'
    },
    {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      use_tls: true,
      note: 'Microsoft 365 and Outlook.com'
    },
    {
      name: 'Yahoo',
      host: 'smtp.mail.yahoo.com',
      port: 587,
      use_tls: true,
      note: 'Enable "Less secure app access"'
    }
  ];

  const applyPreset = (preset: typeof presetConfigurations[0]) => {
    setFormData(prev => ({
      ...prev,
      host: preset.host,
      port: preset.port,
      use_tls: preset.use_tls
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            SMTP Configuration
          </h1>
          <p className="text-gray-600 mt-1">Configure email server settings for automated notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {settings && settings.length > 0 && settings[0].is_active && (
            <Badge className="bg-green-100 text-green-800">
              <Mail className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Server Configuration</CardTitle>
              <CardDescription>
                Configure your email server settings to send automated notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
                    <p>Loading SMTP settings...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="host">SMTP Host *</Label>
                      <Input
                        id="host"
                        value={formData.host}
                        onChange={(e) => handleInputChange('host', e.target.value)}
                        placeholder="smtp.gmail.com"
                        data-testid="input-smtp-host"
                      />
                    </div>
                    <div>
                      <Label htmlFor="port">Port *</Label>
                      <Input
                        id="port"
                        type="number"
                        value={formData.port}
                        onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                        data-testid="input-smtp-port"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="your-email@example.com"
                      data-testid="input-smtp-username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="your-app-password"
                        data-testid="input-smtp-password"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from_email">From Email *</Label>
                      <Input
                        id="from_email"
                        type="email"
                        value={formData.from_email}
                        onChange={(e) => handleInputChange('from_email', e.target.value)}
                        placeholder="noreply@yourcompany.com"
                        data-testid="input-smtp-from-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="from_name">From Name *</Label>
                      <Input
                        id="from_name"
                        value={formData.from_name}
                        onChange={(e) => handleInputChange('from_name', e.target.value)}
                        placeholder="WMK Kitchen Solutions"
                        data-testid="input-smtp-from-name"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="secure"
                      checked={formData.secure}
                      onCheckedChange={(checked) => handleInputChange('secure', checked)}
                      data-testid="switch-smtp-tls"
                    />
                    <Label htmlFor="secure">Use TLS/STARTTLS</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                      data-testid="switch-smtp-active"
                    />
                    <Label htmlFor="is_active">Enable SMTP (Activate email sending)</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={saveMutation.isPending || !hasChanges}
                      data-testid="button-save-smtp"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Configuration</CardTitle>
              <CardDescription>
                Send a test email to verify your settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="test_email">Test Email Address</Label>
                <Input
                  id="test_email"
                  type="email"
                  value={formData.test_email}
                  onChange={(e) => handleInputChange('test_email', e.target.value)}
                  placeholder="test@example.com"
                  data-testid="input-test-email"
                />
              </div>
              <Button 
                onClick={handleTest}
                disabled={testMutation.isPending || !formData.test_email}
                className="w-full"
                variant="outline"
                data-testid="button-test-smtp"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testMutation.isPending ? 'Sending...' : 'Send Test Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Preset Configurations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Setup</CardTitle>
              <CardDescription>
                Common email provider configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {presetConfigurations.map((preset) => (
                <div key={preset.name} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{preset.name}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyPreset(preset)}
                      data-testid={`button-preset-${preset.name.toLowerCase()}`}
                    >
                      Use
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">{preset.note}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {preset.host}:{preset.port}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
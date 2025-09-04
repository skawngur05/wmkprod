import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HardHat, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { InstallerPerformanceTable } from '@/components/reports/installer-performance-table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  executiveDashboard: {
    totalLeads: number;
    soldLeads: number;
    conversionRate: number;
    totalRevenue: number;
    averageDealSize: number;
  };
  leadOriginPerformance: Array<{
    origin: string;
    totalLeads: number;
    soldLeads: number;
    conversionRate: number;
    totalRevenue: number;
    averageDealSize: number;
  }>;
  teamPerformance: Array<{
    member: string;
    totalLeads: number;
    soldLeads: number;
    conversionRate: number;
    totalRevenue: number;
    averageDealSize: number;
  }>;
  monthlyBreakdown: Array<{
    month: number;
    monthName: string;
    totalLeads: number;
    soldLeads: number;
    conversionRate: number;
    totalRevenue: number;
    averageDealSize: number;
  }>;
  filterInfo: {
    year: number | null;
    month: number | null;
    period: string;
  };
}

interface InstallerData {
  installerName: string;
  totalInstallations: number;
  totalValue: number;
  averageProjectValue: number;
  completedInstallations: number;
  pendingInstallations: number;
  installations: Array<{
    projectId: number;
    customerName: string;
    projectValue: number;
    installationDate: string;
    status: 'completed' | 'pending';
  }>;
}

interface InstallerReportsData {
  installers: InstallerData[];
  totalInstallations: number;
  totalValue: number;
  filterInfo: {
    year: number | null;
    month: number | null;
    period: string;
  };
}

interface YearsData {
  availableYears: number[];
}

export default function Reports() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('analytics');
  const [animationStep, setAnimationStep] = useState(0);

  // Animation effect - stagger the appearance of different sections
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 100);
    const timer2 = setTimeout(() => setAnimationStep(2), 300);
    const timer3 = setTimeout(() => setAnimationStep(3), 500);
    const timer4 = setTimeout(() => setAnimationStep(4), 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  
  const { data: yearsData } = useQuery<YearsData>({
    queryKey: ['/api/reports/years'],
    queryFn: async () => {
      const response = await fetch('/api/reports/years');
      if (!response.ok) throw new Error('Failed to fetch years data');
      return response.json();
    }
  });
  
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ['analytics', selectedYear, selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth);
      
      const response = await fetch(`/api/reports/analytics?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      return response.json();
    },
    enabled: reportType === 'analytics' || reportType === 'lead-origin-pie'
  });

  const { data: installerData, isLoading: isLoadingInstallers } = useQuery<InstallerReportsData>({
    queryKey: ['installer-reports', selectedYear, selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth);
      
      const response = await fetch(`/api/reports/installers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch installer data');
      return response.json();
    },
    enabled: reportType === 'installers'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };
  
  const getTeamMemberName = (member: string) => {
    const names: Record<string, string> = {
      'kim': 'Kim',
      'patrick': 'Patrick',
      'lina': 'Lina'
    };
    return names[member] || member;
  };
  
  const formatOriginName = (origin: string) => {
    return origin.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const isLoading = reportType === 'analytics' || reportType === 'lead-origin-pie' ? isLoadingAnalytics : isLoadingInstallers;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {reportType === 'analytics' ? 'analytics' : reportType === 'installers' ? 'installer' : 'lead origin pie chart'} data...</p>
          </div>
        </div>
      </div>
    );
  }

  if ((reportType === 'analytics' || reportType === 'lead-origin-pie') && !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  if (reportType === 'installers' && !installerData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">No installer data available</p>
        </div>
      </div>
    );
  }
  
  const analyticsDataExists = reportType === 'analytics' && analyticsData;
  const { executiveDashboard, leadOriginPerformance = [], teamPerformance, monthlyBreakdown } = analyticsDataExists ? analyticsData : { executiveDashboard: null, leadOriginPerformance: [], teamPerformance: null, monthlyBreakdown: null };

  return (
    <>
      <style>{`
        .dashboard-section {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .dashboard-section.animate {
          opacity: 1;
          transform: translateY(0);
        }

        /* Smooth page entry animation */
        .reports-container {
          animation: pageEnter 0.6s ease-out;
        }

        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-8 reports-container">
      {/* Header with Report Type and Time-Based Filtering */}
      <div className={`mb-8 dashboard-section ${animationStep >= 1 ? 'animate' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="reports-title">
              Reports & Analytics MVP
            </h1>
            <p className="text-gray-600 mt-2">
              Business intelligence with data-driven insights
            </p>
          </div>
          
          {/* Report Type and Time-Based Filtering Controls */}
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytics">Lead Analytics</SelectItem>
                  <SelectItem value="installers">Installer Reports</SelectItem>
                  <SelectItem value="lead-origin-pie">Lead Origin Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearsData?.availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedMonth && selectedMonth !== 'all' && (
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedMonth('all')}
                  className="h-10"
                >
                  Clear Month
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Badge variant="outline" className="text-sm">
            Showing data for: {
              (reportType === 'analytics' || reportType === 'lead-origin-pie') && analyticsData ? 
                (analyticsData.filterInfo.period === 'all-time' ? 'All Time' : 
                  (selectedMonth && selectedMonth !== 'all') ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : selectedYear
                ) :
              reportType === 'installers' && installerData ?
                (installerData.filterInfo.period === 'all-time' ? 'All Time' : 
                  (selectedMonth && selectedMonth !== 'all') ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : selectedYear
                ) :
                'No Data'
            }
          </Badge>
        </div>
      </div>
      
      {/* Analytics Reports */}
      {reportType === 'analytics' && analyticsDataExists && (
        <>
          {/* Executive Dashboard - Summary Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 dashboard-section ${animationStep >= 2 ? 'animate' : ''}`}>
            <Card data-testid="metric-total-leads">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{executiveDashboard!.totalLeads.toLocaleString()}</div>
                <p className="text-gray-500 text-sm mt-1">Complete lead count</p>
              </CardContent>
        </Card>
        
        <Card data-testid="metric-conversion-rate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Sold Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatPercentage(executiveDashboard!.conversionRate)}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {executiveDashboard!.soldLeads} of {executiveDashboard!.totalLeads} leads
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="metric-total-revenue">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(executiveDashboard!.totalRevenue)}
            </div>
            <p className="text-gray-500 text-sm mt-1">Total revenue generated</p>
          </CardContent>
        </Card>
        
        <Card data-testid="metric-avg-deal-size">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(executiveDashboard!.averageDealSize)}
            </div>
            <p className="text-gray-500 text-sm mt-1">Revenue per sold lead</p>
          </CardContent>
        </Card>
      </div>
      
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 dashboard-section ${animationStep >= 3 ? 'animate' : ''}`}>
        {/* Lead Origin Performance Analysis */}
        <Card data-testid="lead-origin-performance">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Lead Origin Performance</CardTitle>
            <p className="text-gray-600 text-sm">Marketing optimization & ROI tracking</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadOriginPerformance.slice(0, 8).map((origin) => (
                <div key={origin.origin} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{formatOriginName(origin.origin)}</h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{origin.totalLeads} leads</span>
                        <span>{origin.soldLeads} sold</span>
                        <span className="font-medium text-green-600">{formatCurrency(origin.totalRevenue)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPercentage(origin.conversionRate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: {formatCurrency(origin.averageDealSize)}
                      </div>
                    </div>
                  </div>
                  <Progress value={origin.conversionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Team Performance Metrics */}
        <Card data-testid="team-performance">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Team Performance</CardTitle>
            <p className="text-gray-600 text-sm">Individual accountability & comparative analysis</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {teamPerformance!.map((member, index) => (
                <div key={member.member} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {getTeamMemberName(member.member)}
                        {index === 0 && <Badge className="bg-yellow-100 text-yellow-800">🏆 Top Performer</Badge>}
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-1">
                        <div>
                          <div className="font-medium">{member.totalLeads}</div>
                          <div>Total Leads</div>
                        </div>
                        <div>
                          <div className="font-medium">{member.soldLeads}</div>
                          <div>Sold</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600">{formatCurrency(member.totalRevenue)}</div>
                          <div>Revenue</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        {formatPercentage(member.conversionRate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: {formatCurrency(member.averageDealSize)}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={member.conversionRate} 
                    className="h-3"
                    data-testid={`progress-${member.member}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Breakdown - Annual View */}
      {!selectedMonth && monthlyBreakdown && monthlyBreakdown.length > 0 && (
        <Card className={`mb-8 dashboard-section ${animationStep >= 4 ? 'animate' : ''}`} data-testid="monthly-breakdown">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Monthly Breakdown - {selectedYear === 'all' ? new Date().getFullYear() : selectedYear}
            </CardTitle>
            <p className="text-gray-600 text-sm">Trend analysis & seasonal insights</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium text-gray-700">Month</th>
                    <th className="text-center py-3 font-medium text-gray-700">Total Leads</th>
                    <th className="text-center py-3 font-medium text-gray-700">Sold</th>
                    <th className="text-center py-3 font-medium text-gray-700">Conversion %</th>
                    <th className="text-center py-3 font-medium text-gray-700">Revenue</th>
                    <th className="text-center py-3 font-medium text-gray-700">Avg Deal</th>
                    <th className="text-center py-3 font-medium text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown!.map((month, index) => {
                    const prevMonth = index > 0 ? monthlyBreakdown![index - 1] : null;
                    const revenueTrend = prevMonth ? 
                      ((month.totalRevenue - prevMonth.totalRevenue) / Math.max(prevMonth.totalRevenue, 1)) * 100 : 0;
                    
                    return (
                      <tr key={month.month} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">
                          <button 
                            onClick={() => setSelectedMonth(month.month.toString())}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {month.monthName}
                          </button>
                        </td>
                        <td className="text-center py-3">{month.totalLeads}</td>
                        <td className="text-center py-3 font-medium">{month.soldLeads}</td>
                        <td className="text-center py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            month.conversionRate >= 30 ? 'bg-green-100 text-green-800' :
                            month.conversionRate >= 20 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formatPercentage(month.conversionRate)}
                          </span>
                        </td>
                        <td className="text-center py-3 font-medium text-green-600">
                          {formatCurrency(month.totalRevenue)}
                        </td>
                        <td className="text-center py-3">{formatCurrency(month.averageDealSize)}</td>
                        <td className="text-center py-3">
                          {prevMonth && (
                            <span className={`text-xs font-medium ${
                              revenueTrend > 0 ? 'text-green-600' : 
                              revenueTrend < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {revenueTrend > 0 ? '↗' : revenueTrend < 0 ? '↘' : '→'} {Math.abs(revenueTrend).toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Business Intelligence Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Peak Month:</strong> {monthlyBreakdown!.reduce((max, month) => 
                    month.totalRevenue > max.totalRevenue ? month : max
                  ).monthName} ({formatCurrency(Math.max(...monthlyBreakdown!.map(m => m.totalRevenue)))})
                </div>
                <div>
                  <strong>Best Conversion:</strong> {monthlyBreakdown!.reduce((max, month) => 
                    month.conversionRate > max.conversionRate ? month : max
                  ).monthName} ({formatPercentage(Math.max(...monthlyBreakdown!.map(m => m.conversionRate)))})
                </div>
                <div>
                  <strong>Total Year Revenue:</strong> {formatCurrency(monthlyBreakdown!.reduce((sum, month) => sum + month.totalRevenue, 0))}
                </div>
                <div>
                  <strong>Average Monthly:</strong> {formatCurrency(monthlyBreakdown!.reduce((sum, month) => sum + month.totalRevenue, 0) / Math.max(monthlyBreakdown!.filter(m => m.totalLeads > 0).length, 1))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
      
      {/* Installer Reports */}
      {reportType === 'installers' && installerData && (
        <>
          {/* Installer Summary Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 dashboard-section ${animationStep >= 2 ? 'animate' : ''}`}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <HardHat className="h-4 w-4" />
                  Total Installers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{installerData.installers.length}</div>
                <p className="text-gray-500 text-sm mt-1">Active installers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Total Installations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{installerData.totalInstallations}</div>
                <p className="text-gray-500 text-sm mt-1">Completed projects</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(installerData.totalValue)}</div>
                <p className="text-gray-500 text-sm mt-1">Combined project value</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Average Project Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(installerData.totalValue / Math.max(installerData.totalInstallations, 1))}
                </div>
                <p className="text-gray-500 text-sm mt-1">Per installation</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Installer Performance Table */}
          <div className="animate-in fade-in slide-in-from-left duration-700 ease-out delay-400">
            <InstallerPerformanceTable 
              installers={installerData.installers}
              totalInstallations={installerData.totalInstallations}
              totalValue={installerData.totalValue}
            />
          </div>
          
          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom duration-700 ease-out delay-600">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Top Performer by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                {installerData.installers.length > 0 && (
                  <div className="space-y-3">
                    {installerData.installers
                      .sort((a, b) => b.totalInstallations - a.totalInstallations)
                      .slice(0, 3)
                      .map((installer, index) => (
                        <div key={installer.installerName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{installer.installerName}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{installer.totalInstallations} installations</div>
                            <div className="text-sm text-gray-600">{formatCurrency(installer.totalValue)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>💰 Top Performer by Value</CardTitle>
              </CardHeader>
              <CardContent>
                {installerData.installers.length > 0 && (
                  <div className="space-y-3">
                    {installerData.installers
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 3)
                      .map((installer, index) => (
                        <div key={installer.installerName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-green-500' : index === 1 ? 'bg-gray-400' : 'bg-green-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{installer.installerName}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{formatCurrency(installer.totalValue)}</div>
                            <div className="text-sm text-gray-600">{installer.totalInstallations} installations</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Lead Origin Pie Chart */}
      {reportType === 'lead-origin-pie' && analyticsData && (
        <>
          <div className={`mb-8 dashboard-section ${animationStep >= 2 ? 'animate' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Lead Origin Performance - Pie Chart
                </CardTitle>
                <p className="text-gray-600">Visual breakdown of lead sources and their conversion rates</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        ...analyticsData.leadOriginPerformance.reduce((acc, origin, index) => {
                          const colors = [
                            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
                          ];
                          acc[origin.origin] = {
                            label: formatOriginName(origin.origin),
                            color: colors[index % colors.length]
                          };
                          return acc;
                        }, {} as Record<string, { label: string; color: string }>)
                      }}
                    >
                      <PieChart>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded-lg shadow-lg">
                                  <p className="font-semibold">{formatOriginName(data.origin)}</p>
                                  <p className="text-blue-600">Total Leads: {data.totalLeads}</p>
                                  <p className="text-green-600">Sold: {data.soldLeads}</p>
                                  <p className="text-purple-600">Conversion: {formatPercentage(data.conversionRate)}</p>
                                  <p className="text-orange-600">Revenue: {formatCurrency(data.totalRevenue)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Pie
                          data={analyticsData.leadOriginPerformance}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ origin, percent }) => 
                            percent > 0.05 ? `${formatOriginName(origin)} (${(percent * 100).toFixed(1)}%)` : ''
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="totalLeads"
                        >
                          {analyticsData.leadOriginPerformance.map((entry, index) => {
                            const colors = [
                              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                              '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
                            ];
                            return (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            );
                          })}
                        </Pie>
                        <ChartLegend
                          content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                              {payload?.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-gray-600">{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </PieChart>
                    </ChartContainer>
                  </div>

                  {/* Lead Origin Statistics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {analyticsData.leadOriginPerformance
                        .sort((a, b) => b.totalLeads - a.totalLeads)
                        .map((origin, index) => (
                          <div key={origin.origin} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {formatOriginName(origin.origin)}
                              </h4>
                              <Badge className={
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                #{index + 1}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total Leads:</span>
                                <span className="font-medium ml-2">{origin.totalLeads}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Sold:</span>
                                <span className="font-medium ml-2 text-green-600">{origin.soldLeads}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Conversion:</span>
                                <span className="font-medium ml-2 text-blue-600">
                                  {formatPercentage(origin.conversionRate)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Revenue:</span>
                                <span className="font-medium ml-2 text-purple-600">
                                  {formatCurrency(origin.totalRevenue)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-gray-600 text-sm">Avg Deal Size:</span>
                              <span className="font-medium ml-2 text-orange-600">
                                {formatCurrency(origin.averageDealSize)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Origin Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Best Converting Source</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.leadOriginPerformance.length > 0 && (() => {
                  const bestConverter = [...analyticsData.leadOriginPerformance]
                    .sort((a, b) => b.conversionRate - a.conversionRate)[0];
                  return (
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatOriginName(bestConverter.origin)}
                      </div>
                      <div className="text-lg text-green-500">
                        {formatPercentage(bestConverter.conversionRate)} conversion
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {bestConverter.soldLeads} of {bestConverter.totalLeads} leads converted
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 Highest Volume Source</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.leadOriginPerformance.length > 0 && (() => {
                  const highestVolume = [...analyticsData.leadOriginPerformance]
                    .sort((a, b) => b.totalLeads - a.totalLeads)[0];
                  return (
                    <div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatOriginName(highestVolume.origin)}
                      </div>
                      <div className="text-lg text-blue-500">
                        {highestVolume.totalLeads} total leads
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {formatPercentage((highestVolume.totalLeads / analyticsData.executiveDashboard.totalLeads) * 100)} of all leads
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💰 Highest Revenue Source</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.leadOriginPerformance.length > 0 && (() => {
                  const highestRevenue = [...analyticsData.leadOriginPerformance]
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
                  return (
                    <div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {formatOriginName(highestRevenue.origin)}
                      </div>
                      <div className="text-lg text-purple-500">
                        {formatCurrency(highestRevenue.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {formatPercentage((highestRevenue.totalRevenue / analyticsData.executiveDashboard.totalRevenue) * 100)} of total revenue
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
    </>
  );
}
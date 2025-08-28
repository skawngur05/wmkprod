import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HardHat, TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';

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

interface InstallerPerformanceTableProps {
  installers: InstallerData[];
  totalInstallations: number;
  totalValue: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number, total: number) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return `${percentage.toFixed(1)}%`;
};

export function InstallerPerformanceTable({ installers, totalInstallations, totalValue }: InstallerPerformanceTableProps) {
  const sortedInstallers = [...installers].sort((a, b) => b.totalValue - a.totalValue);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardHat className="h-5 w-5" />
          Installer Performance Analysis
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comprehensive performance metrics for all installers
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">Installer</th>
                <th className="text-center p-4 font-semibold text-gray-700">Total Jobs</th>
                <th className="text-center p-4 font-semibold text-gray-700">Completed</th>
                <th className="text-center p-4 font-semibold text-gray-700">Pending</th>
                <th className="text-center p-4 font-semibold text-gray-700">Completion Rate</th>
                <th className="text-right p-4 font-semibold text-gray-700">Total Value</th>
                <th className="text-right p-4 font-semibold text-gray-700">Avg. Value</th>
                <th className="text-center p-4 font-semibold text-gray-700">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedInstallers.map((installer, index) => {
                const completionRate = installer.totalInstallations > 0 
                  ? (installer.completedInstallations / installer.totalInstallations) * 100 
                  : 0;
                const marketShare = totalInstallations > 0 
                  ? (installer.totalInstallations / totalInstallations) * 100 
                  : 0;
                const valueShare = totalValue > 0 
                  ? (installer.totalValue / totalValue) * 100 
                  : 0;

                return (
                  <tr 
                    key={installer.installerName} 
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-blue-50 to-transparent' : ''
                    }`}
                  >
                    {/* Installer Name with Ranking */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                        }`}>
                          {index < 3 ? index + 1 : installer.installerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{installer.installerName}</span>
                          {index < 3 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {index === 0 ? '🥇 Top' : index === 1 ? '🥈 2nd' : '🥉 3rd'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Jobs */}
                    <td className="text-center p-4">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{installer.totalInstallations}</span>
                      </div>
                    </td>

                    {/* Completed */}
                    <td className="text-center p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {installer.completedInstallations}
                      </span>
                    </td>

                    {/* Pending */}
                    <td className="text-center p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {installer.pendingInstallations}
                      </span>
                    </td>

                    {/* Completion Rate */}
                    <td className="text-center p-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{completionRate.toFixed(1)}%</div>
                        <Progress 
                          value={completionRate} 
                          className="h-2 w-16 mx-auto" 
                        />
                      </div>
                    </td>

                    {/* Total Value */}
                    <td className="text-right p-4">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-700">
                          {formatCurrency(installer.totalValue)}
                        </span>
                      </div>
                    </td>

                    {/* Average Value */}
                    <td className="text-right p-4">
                      <span className="text-gray-700">
                        {formatCurrency(installer.averageProjectValue)}
                      </span>
                    </td>

                    {/* Market Share */}
                    <td className="text-center p-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          Jobs: {marketShare.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          Value: {valueShare.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">TOTALS</td>
                <td className="text-center p-4 font-semibold text-blue-600">
                  {totalInstallations}
                </td>
                <td className="text-center p-4 font-semibold text-green-600">
                  {installers.reduce((sum, installer) => sum + installer.completedInstallations, 0)}
                </td>
                <td className="text-center p-4 font-semibold text-yellow-600">
                  {installers.reduce((sum, installer) => sum + installer.pendingInstallations, 0)}
                </td>
                <td className="text-center p-4 font-semibold">
                  {totalInstallations > 0 
                    ? ((installers.reduce((sum, installer) => sum + installer.completedInstallations, 0) / totalInstallations) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="text-right p-4 font-semibold text-green-700">
                  {formatCurrency(totalValue)}
                </td>
                <td className="text-right p-4 font-semibold">
                  {formatCurrency(totalInstallations > 0 ? totalValue / totalInstallations : 0)}
                </td>
                <td className="text-center p-4 font-semibold">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 Performance Leader</h4>
            {sortedInstallers.length > 0 && (
              <div className="text-sm text-blue-800">
                <strong>{sortedInstallers[0].installerName}</strong> leads with{' '}
                {formatCurrency(sortedInstallers[0].totalValue)} in project value
              </div>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">✅ Completion Rate</h4>
            <div className="text-sm text-green-800">
              Overall completion rate:{' '}
              <strong>
                {totalInstallations > 0 
                  ? ((installers.reduce((sum, installer) => sum + installer.completedInstallations, 0) / totalInstallations) * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">💰 Average Project</h4>
            <div className="text-sm text-purple-800">
              System average:{' '}
              <strong>
                {formatCurrency(totalInstallations > 0 ? totalValue / totalInstallations : 0)}
              </strong>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

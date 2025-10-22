import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SampleBooklet, PRODUCT_TYPES, BOOKLET_STATUSES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddBookletModal from '@/components/modals/add-booklet-modal';
import EditBookletModal from '@/components/modals/edit-booklet-modal';
import TrackingModal from '@/components/modals/tracking-modal';
import { Package, Download, Plus, Edit, Trash2, Truck, Calendar, User, Tag, FileText, DollarSign } from 'lucide-react';

interface BookletStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  inTransitOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  thisWeekOrders: number;
}

export default function SampleBooklets() {
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooklet, setSelectedBooklet] = useState<SampleBooklet | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [bookletToDelete, setBookletToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: booklets, isLoading } = useQuery<SampleBooklet[]>({
    queryKey: ['/api/sample-booklets', filter],
    queryFn: async () => {
      const url = filter ? `/api/sample-booklets?status=${filter}` : '/api/sample-booklets';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch sample booklets: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: stats } = useQuery<BookletStats>({
    queryKey: ['/api/sample-booklets/stats/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/sample-booklets/stats/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      return response.json();
    }
  });

  const deleteBookletMutation = useMutation({
    mutationFn: async (bookletId: string) => {
      try {
        await apiRequest('DELETE', `/api/sample-booklets/${bookletId}`);
      } catch (error: any) {
        if (error.status === 404 || error.message?.includes('404')) {
          console.log(`Booklet ${bookletId} was already deleted`);
          return;
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Sample booklet deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets/stats/dashboard'] });
      queryClient.removeQueries({ queryKey: ['/api/sample-booklets'] });
      
      setShowEditModal(false);
      setShowTrackingModal(false);
      setSelectedBooklet(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete sample booklet", variant: "destructive" });
    }
  });

  const handleDelete = (bookletId: string) => {
    setBookletToDelete(bookletId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (bookletToDelete) {
      deleteBookletMutation.mutate(bookletToDelete);
      setConfirmDeleteOpen(false);
      setBookletToDelete(null);
    }
  };

  const handleEdit = (booklet: SampleBooklet) => {
    setSelectedBooklet(booklet);
    setShowEditModal(true);
  };

  const handleAddTracking = (booklet: SampleBooklet) => {
    setSelectedBooklet(booklet);
    setShowTrackingModal(true);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString();
    }
    
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading sample booklets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="booklets-title">
              Sample Booklets Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage partner and designer profiles with sample booklets</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              data-testid="button-add-booklet"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Order
            </Button>
            <Button variant="outline" data-testid="button-export-booklets" className="shadow-md hover:shadow-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: 'Total Orders', value: stats.totalOrders, color: 'from-blue-500 to-blue-600', icon: Package },
              { label: 'Pending', value: stats.pendingOrders, color: 'from-yellow-500 to-yellow-600', icon: Calendar },
              { label: 'Shipped', value: stats.shippedOrders, color: 'from-cyan-500 to-cyan-600', icon: Truck },
              { label: 'In Transit', value: stats.inTransitOrders, color: 'from-purple-500 to-purple-600', icon: Truck },
              { label: 'Delivered', value: stats.deliveredOrders, color: 'from-green-500 to-green-600', icon: Package },
              { label: 'This Week', value: stats.thisWeekOrders, color: 'from-pink-500 to-pink-600', icon: Calendar },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <select
                className="form-select flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                data-testid="select-filter-status"
              >
                <option value="">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Refunded">Refunded</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setFilter('')}
                data-testid="button-clear-filter"
                className="shadow-md hover:shadow-lg transition-all duration-200"
              >
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Partner & Designer Profiles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-testid="booklets-table" className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:from-gray-100 hover:to-gray-50">
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[110px]">Order #</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[180px]">Partner/Designer</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[100px]">Type</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[140px]">Product</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[90px]">Status</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[110px]">Purchase</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[110px]">Date Given</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[100px]">Given By</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[140px]">Tracking</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white w-[180px]">Notes</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-center w-[110px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booklets && booklets.length > 0 ? (
                    booklets.map((booklet) => (
                      <TableRow 
                        key={booklet.id} 
                        data-testid={`booklet-row-${booklet.id}`}
                        className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 border-b border-gray-100 dark:border-gray-700"
                      >
                        <TableCell className="font-bold text-gray-900 dark:text-white">{booklet.order_number}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 dark:text-white">{booklet.customer_name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{booklet.phone}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">{booklet.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`
                              ${booklet.booklet_type === 'Infeel' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}
                              text-white text-xs font-semibold shadow-md
                            `}
                          >
                            {booklet.booklet_type || 'Wrap My Kitchen'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`
                              ${booklet.product_type === 'Demo Kit & Sample Booklet' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300' : ''}
                              ${booklet.product_type === 'Sample Booklet Only' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300' : ''}
                              ${booklet.product_type === 'Trial Kit' ? 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-300' : ''}
                              ${booklet.product_type === 'Demo Kit Only' ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300' : ''}
                              text-xs font-semibold shadow-sm
                            `}
                          >
                            {booklet.product_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`
                              ${booklet.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                              ${booklet.status === 'Shipped' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                              ${booklet.status === 'Delivered' ? 'bg-green-600 hover:bg-green-700' : ''}
                              ${booklet.status === 'Refunded' ? 'bg-red-600 hover:bg-red-700' : ''}
                              text-white text-xs font-bold shadow-md px-3 py-1
                            `}
                          >
                            {booklet.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`
                              ${booklet.purchase_status === 'Purchased' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300' : ''}
                              ${booklet.purchase_status === 'Free' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300' : ''}
                              ${booklet.purchase_status === 'Returned' ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300' : ''}
                              text-xs font-semibold shadow-sm flex items-center gap-1
                            `}
                          >
                            {booklet.purchase_status === 'Purchased' && <DollarSign className="h-3 w-3" />}
                            {booklet.purchase_status || 'Free'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                          {booklet.date_given ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-purple-600" />
                              {formatDate(booklet.date_given)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                          {booklet.given_by ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-purple-600" />
                              {booklet.given_by}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {booklet.tracking_number ? (
                            <div>
                              <a
                                href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${booklet.tracking_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs font-medium"
                                data-testid={`tracking-link-${booklet.id}`}
                              >
                                <Truck className="h-3 w-3" />
                                {booklet.tracking_number}
                              </a>
                              <small className="text-gray-500 text-xs block mt-1">
                                Auto-updating
                              </small>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {booklet.notes ? (
                            <div className="flex items-start gap-1 max-w-[200px]">
                              <FileText className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{booklet.notes}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(booklet)}
                              data-testid={`button-edit-booklet-${booklet.id}`}
                              className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(booklet.status === 'Pending' || booklet.status === 'Shipped') && !booklet.tracking_number && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAddTracking(booklet)}
                                title="Add tracking number"
                                data-testid={`button-add-tracking-${booklet.id}`}
                                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-400"
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(booklet.id.toString())}
                              disabled={deleteBookletMutation.isPending}
                              data-testid={`button-delete-booklet-${booklet.id}`}
                              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-12">
                        <div className="text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium mb-2">No sample booklet orders found</p>
                          <p className="text-sm">Add a new order to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddModal && (
        <AddBookletModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && selectedBooklet && (
        <EditBookletModal
          booklet={selectedBooklet}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBooklet(null);
          }}
        />
      )}

      {showTrackingModal && selectedBooklet && (
        <TrackingModal
          booklet={selectedBooklet}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedBooklet(null);
          }}
        />
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this sample booklet order from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

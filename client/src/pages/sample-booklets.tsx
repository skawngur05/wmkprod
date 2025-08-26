import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SampleBooklet, PRODUCT_TYPES, BOOKLET_STATUSES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AddBookletModal from '@/components/modals/add-booklet-modal';
import EditBookletModal from '@/components/modals/edit-booklet-modal';

interface BookletStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  inTransitOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  thisWeekOrders: number;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  deliveryDate?: string;
  lastUpdated: string;
  trackingEvents: Array<{
    eventDate: string;
    eventTime: string;
    eventDescription: string;
    eventCity?: string;
    eventState?: string;
    eventZip?: string;
  }>;
}

export default function SampleBooklets() {
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooklet, setSelectedBooklet] = useState<SampleBooklet | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
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
      await apiRequest('DELETE', `/api/sample-booklets/${bookletId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Sample booklet deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets/stats/dashboard'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete sample booklet", variant: "destructive" });
    }
  });

  const handleDelete = (bookletId: string) => {
    if (window.confirm('Are you sure you want to delete this sample booklet order?')) {
      deleteBookletMutation.mutate(bookletId);
    }
  };

  const handleEdit = (booklet: SampleBooklet) => {
    setSelectedBooklet(booklet);
    setShowEditModal(true);
  };

  const getProductTypeBadge = (productType: string) => {
    const badges: Record<string, string> = {
      'demo_kit_and_sample_booklet': 'success',
      'sample_booklet_only': 'primary', 
      'trial_kit': 'info',
      'demo_kit_only': 'warning'
    };
    return badges[productType] || 'secondary';
  };

  const getProductTypeLabel = (productType: string) => {
    const labels: Record<string, string> = {
      'demo_kit_and_sample_booklet': 'Demo Kit & Sample Booklet',
      'sample_booklet_only': 'Sample Booklet Only',
      'trial_kit': 'Trial Kit',
      'demo_kit_only': 'Demo Kit Only'
    };
    return labels[productType] || productType;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'pending': 'warning',
      'shipped': 'info',
      'in-transit': 'primary',
      'out-for-delivery': 'info',
      'delivered': 'success',
      'refunded': 'danger',
      'unknown': 'secondary'
    };
    return badges[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'shipped': 'Shipped',
      'in-transit': 'In Transit',
      'out-for-delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'refunded': 'Refunded',
      'unknown': 'Unknown'
    };
    return labels[status] || status;
  };





  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p>Loading sample booklets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 fw-bold" data-testid="booklets-title">Sample Booklets Management</h1>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => setShowAddModal(true)}
                data-testid="button-add-booklet"
              >
                <i className="fas fa-plus me-1"></i>Add New Order
              </button>

              <button className="btn btn-outline-secondary" data-testid="button-export-booklets">
                <i className="fas fa-download me-1"></i>Export Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-2 mb-3">
            <div className="stats-card card text-center">
              <div className="card-body">
                <h3 className="text-primary">{stats.totalOrders}</h3>
                <p className="mb-0">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="stats-card card text-center">
              <div className="card-body">
                <h3 className="text-warning">{stats.pendingOrders}</h3>
                <p className="mb-0">Pending</p>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="stats-card card text-center">
              <div className="card-body">
                <h3 className="text-info">{stats.shippedOrders}</h3>
                <p className="mb-0">Shipped</p>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="stats-card card text-center">
              <div className="card-body">
                <h3 className="text-success">{stats.deliveredOrders}</h3>
                <p className="mb-0">Delivered</p>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="stats-card card text-center">
              <div className="card-body">
                <h3 className="text-danger">{stats.refundedOrders || 0}</h3>
                <p className="mb-0">Refunded</p>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="stats-card card text-center">
              <div className="card-body">
                <h3 className="text-primary">{stats.thisWeekOrders}</h3>
                <p className="mb-0">This Week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Filter by Status</label>
              <select
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                data-testid="select-filter-status"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="in-transit">In Transit</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setFilter('')}
                data-testid="button-clear-filter"
              >
                <i className="fas fa-times me-1"></i>Clear Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" data-testid="booklets-table">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Product Type</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Tracking</th>
                  <th>Ship Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {booklets && booklets.length > 0 ? (
                  booklets.map((booklet) => (
                    <tr key={booklet.id} data-testid={`booklet-row-${booklet.id}`}>
                      <td><strong>{booklet.order_number}</strong></td>
                      <td>
                        <div>
                          <strong>{booklet.customer_name}</strong>
                          <br />
                          <small className="text-muted">{booklet.phone}</small>
                          <br />
                          <small className="text-muted">{booklet.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getProductTypeBadge(booklet.product_type)}`}>
                          {getProductTypeLabel(booklet.product_type)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(booklet.status)} status-badge`}>
                          {getStatusLabel(booklet.status)}
                        </span>
                      </td>
                      <td>{formatDate(booklet.date_ordered)}</td>
                      <td>
                        {booklet.tracking_number ? (
                          <div>
                            <a
                              href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${booklet.tracking_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary d-block"
                              data-testid={`tracking-link-${booklet.id}`}
                            >
                              {booklet.tracking_number}
                            </a>
                            <small className="text-muted d-block mt-1">
                              Auto-updating every 5 min
                            </small>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {booklet.date_shipped ? formatDate(booklet.date_shipped) : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-circle btn-outline-primary btn-sm me-1"
                          onClick={() => {
                            setSelectedBooklet(booklet);
                            setShowEditModal(true);
                          }}
                          data-testid={`button-edit-booklet-${booklet.id}`}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {booklet.status === 'pending' && (
                          <button
                            className="btn btn-circle btn-outline-info btn-sm me-1"
                            onClick={() => {
                              handleEdit(booklet);
                            }}
                            title="Mark as shipped and add tracking number"
                            data-testid={`button-ship-booklet-${booklet.id}`}
                          >
                            <i className="fas fa-shipping-fast"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-circle btn-outline-danger btn-sm"
                          onClick={() => handleDelete(booklet.id)}
                          disabled={deleteBookletMutation.isPending}
                          data-testid={`button-delete-booklet-${booklet.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="text-muted">
                        <i className="fas fa-inbox fa-3x mb-3"></i>
                        <p>No sample booklet orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddBookletModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      <EditBookletModal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setSelectedBooklet(null);
        }}
        booklet={selectedBooklet}
      />
    </div>
  );
}
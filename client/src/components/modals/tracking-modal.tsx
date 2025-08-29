import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SampleBooklet } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booklet: SampleBooklet | null;
}

export default function TrackingModal({ isOpen, onClose, booklet }: TrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTrackingMutation = useMutation({
    mutationFn: async (data: { tracking_number: string; status: string }) => {
      if (!booklet) throw new Error('No booklet selected');
      return await apiRequest('PUT', `/api/sample-booklets/${booklet.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sample-booklets/stats/dashboard'] });
    },
    onError: (error: any) => {
      console.error('Error updating tracking:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update tracking information", 
        variant: "destructive" 
      });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailType: string) => {
      if (!booklet) throw new Error('No booklet selected');
      return await apiRequest('POST', `/api/sample-booklets/${booklet.id}/email`, { emailType });
    },
    onError: (error: any) => {
      console.error('Error sending email:', error);
      toast({ 
        title: "Error", 
        description: "Failed to send email notification", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a tracking number", 
        variant: "destructive" 
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Update the booklet with tracking number and set status to Shipped
      await updateTrackingMutation.mutateAsync({
        tracking_number: trackingNumber.trim(),
        status: 'Shipped'
      });

      // Send email notification if requested
      if (sendNotification && booklet?.email) {
        try {
          await sendEmailMutation.mutateAsync('tracking_notification');
          toast({ 
            title: "Success", 
            description: "Tracking number added and customer notified!" 
          });
        } catch (emailError) {
          toast({ 
            title: "Partial Success", 
            description: "Tracking number added but email notification failed", 
            variant: "destructive" 
          });
        }
      } else {
        toast({ 
          title: "Success", 
          description: "Tracking number added successfully!" 
        });
      }

      // Reset form and close modal
      setTrackingNumber('');
      setSendNotification(true);
      onClose();

    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update tracking information", 
        variant: "destructive" 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setTrackingNumber('');
      setSendNotification(true);
      onClose();
    }
  };

  if (!isOpen || !booklet) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} data-testid="tracking-modal">
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-truck me-2 text-primary"></i>
              Add Tracking Information
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              disabled={isUpdating}
              data-testid="button-close-tracking-modal"
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                  <div className="me-3">
                    <i className="fas fa-box fa-2x text-primary"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Order #{booklet.order_number}</h6>
                    <p className="mb-0 text-muted">{booklet.customer_name}</p>
                    <small className="text-muted">{booklet.email}</small>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-barcode me-1"></i>
                  Tracking Number *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter USPS tracking number"
                  disabled={isUpdating}
                  data-testid="input-tracking-number"
                  autoFocus
                />
                <div className="form-text">
                  Example: 9400109205568123456789
                </div>
              </div>

              {booklet.email && (
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sendNotification"
                      checked={sendNotification}
                      onChange={(e) => setSendNotification(e.target.checked)}
                      disabled={isUpdating}
                      data-testid="checkbox-send-notification"
                    />
                    <label className="form-check-label" htmlFor="sendNotification">
                      <i className="fas fa-envelope me-1"></i>
                      Send tracking notification email to customer
                    </label>
                  </div>
                  <div className="form-text">
                    An email with tracking information will be sent to {booklet.email}
                  </div>
                </div>
              )}

              {!booklet.email && (
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <div>
                    No email address available for this order. Customer notification will be skipped.
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={handleClose}
                disabled={isUpdating}
                data-testid="button-cancel-tracking"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isUpdating || !trackingNumber.trim()}
                data-testid="button-save-tracking"
              >
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    {sendNotification && booklet.email ? 'Save & Notify Customer' : 'Save Tracking Number'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Phone, X } from 'lucide-react';
import type { InternalEnrichmentData } from '@/lib/internal-enrichment';

interface EnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrichmentData: InternalEnrichmentData | null;
  onApplyData: () => void;
}

export function EnrichmentModal({ isOpen, onClose, enrichmentData, onApplyData }: EnrichmentModalProps) {
  if (!enrichmentData?.found) return null;

  const handleApply = () => {
    onApplyData();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Existing Customer Found!
              </DialogTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              In Database
            </Badge>
          </div>
          <DialogDescription className="text-gray-600">
            We found an existing customer with this email address. Would you like to use their information?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-3">
              {enrichmentData.name && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Name:</span>
                    <div className="text-lg font-semibold text-gray-900">{enrichmentData.name}</div>
                  </div>
                </div>
              )}
              
              {enrichmentData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <div className="text-lg font-semibold text-gray-900">{enrichmentData.phone}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Skip
            </Button>
            <Button onClick={handleApply} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Apply Information
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

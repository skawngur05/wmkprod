import { z } from "zod";

// USPS Tracking Response Schema
const uspsTrackingResponseSchema = z.object({
  trackingNumber: z.string(),
  status: z.string(),
  statusDescription: z.string(),
  deliveryDate: z.string().optional(),
  lastUpdated: z.string(),
  trackingEvents: z.array(z.object({
    eventDate: z.string(),
    eventTime: z.string(),
    eventDescription: z.string(),
    eventCity: z.string().optional(),
    eventState: z.string().optional(),
    eventZip: z.string().optional(),
  })),
});

export type USPSTrackingResponse = z.infer<typeof uspsTrackingResponseSchema>;

export class USPSService {
  // Simple service that only returns mock data
  
  constructor() {
    // No longer using USPS API or web scraping - always use mock data
    console.log("USPS Service initialized - using mock data only");
  }

  async trackPackage(trackingNumber: string): Promise<USPSTrackingResponse> {
    // Always return mock data - no API calls or web scraping
    console.log(`📦 Returning mock tracking data for: ${trackingNumber}`);
    return this.getMockTrackingData(trackingNumber);
  }

  private mapUSPSStatus(uspsStatus: string): string {
    const status = uspsStatus?.toLowerCase() || '';
    
    if (status.includes('delivered')) return 'delivered';
    if (status.includes('out for delivery') || status.includes('on vehicle')) return 'out-for-delivery';
    if (status.includes('in transit') || status.includes('transit')) return 'in-transit';
    if (status.includes('shipped') || status.includes('accepted') || status.includes('processed')) return 'shipped';
    if (status.includes('label created') || status.includes('pre-shipment')) return 'pending';
    
    return 'pending';
  }

  private getMockTrackingData(trackingNumber: string): USPSTrackingResponse {
    // Use hash of tracking number to get consistent mock data (not random)
    const hash = trackingNumber.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Simulate realistic progression based on time
    const daysSinceTrackingCreated = Math.abs(hash) % 7; // Simulate 0-6 days since tracking
    let status = 'pending';
    
    if (daysSinceTrackingCreated >= 1) status = 'shipped';
    if (daysSinceTrackingCreated >= 3) status = 'in-transit';
    if (daysSinceTrackingCreated >= 5) status = 'out-for-delivery';
    if (daysSinceTrackingCreated >= 6) status = 'delivered';
    
    return {
      trackingNumber,
      status,
      statusDescription: this.getStatusDescription(status),
      deliveryDate: status === 'delivered' ? new Date().toISOString() : undefined,
      lastUpdated: new Date().toISOString(),
      trackingEvents: [
        {
          eventDate: new Date().toISOString().split('T')[0],
          eventTime: new Date().toTimeString().split(' ')[0],
          eventDescription: this.getStatusDescription(status),
          eventCity: 'Miami',
          eventState: 'FL',
          eventZip: '33101',
        },
      ],
    };
  }

  private getStatusDescription(status: string): string {
    const descriptions = {
      pending: 'Package information received',
      shipped: 'Package accepted and processed',
      'in-transit': 'Package in transit to destination',
      'out-for-delivery': 'Out for delivery',
      delivered: 'Package delivered successfully',
    };
    return descriptions[status as keyof typeof descriptions] || 'Status unknown';
  }

  async trackMultiplePackages(trackingNumbers: string[]): Promise<USPSTrackingResponse[]> {
    const results = await Promise.allSettled(
      trackingNumbers.map(number => this.trackPackage(number))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to track ${trackingNumbers[index]}:`, result.reason);
        // Return a fallback for failed tracking
        return {
          trackingNumber: trackingNumbers[index],
          status: 'unknown',
          statusDescription: 'Unable to retrieve tracking information',
          lastUpdated: new Date().toISOString(),
          trackingEvents: [],
        };
      }
    });
  }
}

export const uspsService = new USPSService();
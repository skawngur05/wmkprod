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
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly baseUrl = "https://api.usps.com";
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.consumerKey = process.env.USPS_CONSUMER_KEY!;
    this.consumerSecret = process.env.USPS_CONSUMER_SECRET!;
    
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("USPS API credentials not configured");
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth2/v3/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.consumerKey,
          client_secret: this.consumerSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get USPS access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Set expiry to 50 minutes from now (tokens usually expire in 1 hour)
      this.tokenExpiry = new Date(Date.now() + 50 * 60 * 1000);
      
      return this.accessToken!;
    } catch (error) {
      console.error('Error getting USPS access token:', error);
      throw new Error('Failed to authenticate with USPS API');
    }
  }

  async trackPackage(trackingNumber: string): Promise<USPSTrackingResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/tracking/v3/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Tracking number ${trackingNumber} not found`);
        }
        throw new Error(`USPS API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Map USPS response to our schema
      const trackingInfo: USPSTrackingResponse = {
        trackingNumber: data.trackingNumber || trackingNumber,
        status: this.mapUSPSStatus(data.status),
        statusDescription: data.statusSummary || data.status || 'Unknown',
        deliveryDate: data.deliveryDate,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        trackingEvents: (data.trackingEvents || []).map((event: any) => ({
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          eventDescription: event.eventDescription,
          eventCity: event.eventCity,
          eventState: event.eventState,
          eventZip: event.eventZip,
        })),
      };

      return trackingInfo;
    } catch (error) {
      console.error('Error tracking package:', error);
      
      // Return a fallback response for development/testing
      if (process.env.NODE_ENV === 'development') {
        return this.getMockTrackingData(trackingNumber);
      }
      
      throw error;
    }
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
    // Mock data for development - simulates different tracking statuses
    const mockStatuses = ['pending', 'shipped', 'in-transit', 'out-for-delivery', 'delivered'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    return {
      trackingNumber,
      status: randomStatus,
      statusDescription: this.getStatusDescription(randomStatus),
      deliveryDate: randomStatus === 'delivered' ? new Date().toISOString() : undefined,
      lastUpdated: new Date().toISOString(),
      trackingEvents: [
        {
          eventDate: new Date().toISOString().split('T')[0],
          eventTime: new Date().toTimeString().split(' ')[0],
          eventDescription: this.getStatusDescription(randomStatus),
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
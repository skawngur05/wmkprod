import * as cheerio from 'cheerio';
import axios from 'axios';

export interface USPSTrackingInfo {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  deliveryDate?: string;
  lastUpdated: string;
  trackingEvents: Array<{
    date: string;
    time: string;
    description: string;
    location?: string;
  }>;
}

export class USPSWebScraper {
  private readonly baseUrl = 'https://tools.usps.com/go/TrackConfirmAction';
  
  constructor() {
    console.log('USPS Web Scraper initialized - using public tracking website');
  }

  async trackPackage(trackingNumber: string): Promise<USPSTrackingInfo> {
    console.log(`🔍 Scraping USPS tracking for: ${trackingNumber}`);
    
    try {
      const url = `${this.baseUrl}?tLabels=${trackingNumber}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000, // 10 second timeout
        maxRedirects: 5,
      });

      return this.parseTrackingHTML(response.data, trackingNumber);
      
    } catch (error) {
      console.error(`❌ Error scraping tracking for ${trackingNumber}:`, error);
      
      // Return fallback data instead of throwing
      return {
        trackingNumber,
        status: 'unknown',
        statusDescription: 'Unable to retrieve tracking information',
        lastUpdated: new Date().toISOString(),
        trackingEvents: [],
      };
    }
  }

  private parseTrackingHTML(html: string, trackingNumber: string): USPSTrackingInfo {
    const $ = cheerio.load(html);
    
    // Look for common USPS tracking page elements
    let status = 'unknown';
    let statusDescription = 'Status information not available';
    let deliveryDate: string | undefined;
    const trackingEvents: USPSTrackingInfo['trackingEvents'] = [];

    try {
      // Try to find the main status (multiple selectors for different page layouts)
      const statusSelectors = [
        '.delivery_status',
        '.tracking-summary-text',
        '.status_category',
        '[class*="status"]',
        '.tb-row .tb-cell:first-child',
        'h1 + p',
        '.tracking_results .status'
      ];

      for (const selector of statusSelectors) {
        const statusElement = $(selector).first();
        if (statusElement.length && statusElement.text().trim()) {
          statusDescription = statusElement.text().trim();
          status = this.mapStatusFromDescription(statusDescription);
          break;
        }
      }

      // Look for delivery date
      const deliverySelectors = [
        '[class*="delivery-date"]',
        '[class*="delivered"]',
        '.delivery_date',
        'span:contains("Delivered")'
      ];

      for (const selector of deliverySelectors) {
        const deliveryElement = $(selector);
        if (deliveryElement.length) {
          const text = deliveryElement.text();
          const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
          if (dateMatch) {
            deliveryDate = new Date(dateMatch[0]).toISOString();
            break;
          }
        }
      }

      // Try to extract tracking events from the tracking history table
      $('table tr, .tracking-event, .tb-row').each((_i: number, element: any) => {
        const $row = $(element);
        const cells = $row.find('td, .tb-cell');
        
        if (cells.length >= 2) {
          const dateTimeText = $(cells[0]).text().trim();
          const descriptionText = $(cells[1]).text().trim();
          const locationText = cells.length > 2 ? $(cells[2]).text().trim() : '';

          if (dateTimeText && descriptionText && dateTimeText.length > 5) {
            // Try to parse date and time
            const dateMatch = dateTimeText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
            const timeMatch = dateTimeText.match(/(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/);

            if (dateMatch) {
              trackingEvents.push({
                date: dateMatch[1],
                time: timeMatch ? timeMatch[1] : '12:00 PM',
                description: descriptionText,
                location: locationText || undefined,
              });
            }
          }
        }
      });

      // If no events found, try alternative selectors
      if (trackingEvents.length === 0) {
        $('.tracking_results tr, .history-item').each((_i: number, element: any) => {
          const $element = $(element);
          const text = $element.text().trim();
          
          if (text && text.length > 10 && !text.toLowerCase().includes('tracking number')) {
            // Simple parsing for basic status updates
            trackingEvents.push({
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              description: text.substring(0, 200), // Limit description length
              location: undefined,
            });
          }
        });
      }

      console.log(`✅ Parsed tracking info: ${status} - ${statusDescription}`);
      
    } catch (parseError) {
      console.error('Error parsing tracking HTML:', parseError);
    }

    return {
      trackingNumber,
      status,
      statusDescription,
      deliveryDate,
      lastUpdated: new Date().toISOString(),
      trackingEvents: trackingEvents.slice(0, 10), // Limit to 10 most recent events
    };
  }

  private mapStatusFromDescription(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('delivered')) return 'delivered';
    if (desc.includes('out for delivery') || desc.includes('on vehicle')) return 'out-for-delivery';
    if (desc.includes('in transit') || desc.includes('transit')) return 'in-transit';
    if (desc.includes('shipped') || desc.includes('accepted') || desc.includes('processed')) return 'shipped';
    if (desc.includes('label created') || desc.includes('pre-shipment')) return 'pending';
    if (desc.includes('pick up') || desc.includes('pickup')) return 'shipped';
    if (desc.includes('arrival') || desc.includes('arrived')) return 'in-transit';
    
    return 'pending';
  }

  async trackMultiplePackages(trackingNumbers: string[]): Promise<USPSTrackingInfo[]> {
    console.log(`🔄 Tracking ${trackingNumbers.length} packages via web scraping...`);
    
    const results = await Promise.allSettled(
      trackingNumbers.map(async (number, index) => {
        // Add small delay between requests to be respectful
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return this.trackPackage(number);
      })
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to track ${trackingNumbers[index]}:`, result.reason);
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

export const uspsWebScraper = new USPSWebScraper();

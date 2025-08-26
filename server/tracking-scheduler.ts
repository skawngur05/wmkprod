import { storage } from "./storage";
import { uspsService } from "./usps-service";

export class TrackingScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  constructor(private intervalMinutes: number = 15) {}

  start() {
    if (this.isRunning) {
      console.log("Tracking scheduler is already running");
      return;
    }

    console.log(`Starting USPS tracking scheduler - will sync every ${this.intervalMinutes} minutes`);
    
    // Run immediately on start
    this.syncTracking();
    
    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.syncTracking();
    }, this.intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("Tracking scheduler stopped");
  }

  private async syncTracking() {
    try {
      console.log("Starting automatic tracking sync...");
      
      const allBooklets = await storage.getSampleBooklets();
      const bookletsWithTracking = allBooklets.filter(b => 
        b.tracking_number && 
        b.status !== 'delivered' && 
        b.status !== 'unknown'
      );

      if (bookletsWithTracking.length === 0) {
        console.log("No booklets with tracking numbers to sync");
        return;
      }

      console.log(`Syncing tracking for ${bookletsWithTracking.length} booklets...`);
      
      let updatedCount = 0;
      let errorCount = 0;

      for (const booklet of bookletsWithTracking) {
        try {
          const tracking = await uspsService.trackPackage(booklet.tracking_number!);
          
          if (tracking.status !== booklet.status) {
            await storage.updateSampleBooklet(booklet.id, { 
              status: tracking.status as any 
            });
            updatedCount++;
            console.log(`Updated booklet ${booklet.order_number} status from ${booklet.status} to ${tracking.status}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Failed to track booklet ${booklet.order_number}:`, error);
        }
      }

      console.log(`Tracking sync completed: ${updatedCount} updated, ${errorCount} errors`);
    } catch (error) {
      console.error("Error during automatic tracking sync:", error);
    }
  }

  // Manual sync method for API endpoint
  async manualSync() {
    return this.syncTracking();
  }
}

// Create singleton instance
export const trackingScheduler = new TrackingScheduler(15); // Sync every 15 minutes
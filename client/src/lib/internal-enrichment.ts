// Internal email enrichment using existing database records
import { apiRequest } from '@/lib/queryClient';

export interface InternalEnrichmentData {
  name: string;
  phone: string;
  email: string;
  found: boolean;
}

export async function enrichFromDatabase(email: string): Promise<InternalEnrichmentData | null> {
  if (!email || !email.includes('@')) {
    return null;
  }

  try {
    const response = await apiRequest('GET', `/api/leads/enrich?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (data.found) {
      return {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email,
        found: true
      };
    }
    
    return { name: '', phone: '', email, found: false };
  } catch (error) {
    console.error('Internal enrichment error:', error);
    return null;
  }
}

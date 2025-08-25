// Email enrichment service - simulates real enrichment APIs like Clearbit, ZeroBounce, etc.
// In production, you would replace this with real API calls

export interface EnrichmentData {
  name?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  location?: string;
  confidence: number; // 0-100
}

// Mock data for common domains to simulate enrichment
const mockEnrichmentData: Record<string, EnrichmentData> = {
  'gmail.com': {
    confidence: 30,
    industry: 'Consumer'
  },
  'yahoo.com': {
    confidence: 25,
    industry: 'Consumer'
  },
  'hotmail.com': {
    confidence: 25,
    industry: 'Consumer'
  },
  'microsoft.com': {
    company: 'Microsoft Corporation',
    companyWebsite: 'https://microsoft.com',
    companySize: '10,000+',
    industry: 'Technology',
    location: 'Redmond, WA',
    confidence: 95
  },
  'apple.com': {
    company: 'Apple Inc.',
    companyWebsite: 'https://apple.com',
    companySize: '10,000+',
    industry: 'Technology',
    location: 'Cupertino, CA',
    confidence: 95
  },
  'google.com': {
    company: 'Google LLC',
    companyWebsite: 'https://google.com',
    companySize: '10,000+',
    industry: 'Technology',
    location: 'Mountain View, CA',
    confidence: 95
  },
  'amazon.com': {
    company: 'Amazon.com Inc.',
    companyWebsite: 'https://amazon.com',
    companySize: '10,000+',
    industry: 'E-commerce & Cloud',
    location: 'Seattle, WA',
    confidence: 95
  },
  'salesforce.com': {
    company: 'Salesforce Inc.',
    companyWebsite: 'https://salesforce.com',
    companySize: '10,000+',
    industry: 'Software & CRM',
    location: 'San Francisco, CA',
    confidence: 95
  },
  'shopify.com': {
    company: 'Shopify Inc.',
    companyWebsite: 'https://shopify.com',
    companySize: '1,000-10,000',
    industry: 'E-commerce Platform',
    location: 'Ottawa, Canada',
    confidence: 90
  }
};

// Generate mock data based on email patterns
function generateMockData(email: string): EnrichmentData {
  const [localPart, domain] = email.split('@');
  const baseDomainData = mockEnrichmentData[domain] || { confidence: 60 };
  
  // Generate realistic job titles based on email patterns
  const jobTitles = [
    'Marketing Manager', 'Sales Director', 'Software Engineer', 'Product Manager',
    'Business Development', 'Operations Manager', 'Customer Success', 'VP of Sales'
  ];
  
  const names = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
    'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
  ];
  
  // Simple hash function to consistently generate same data for same email
  const hash = email.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const nameIndex = Math.abs(hash) % names.length;
  const titleIndex = Math.abs(hash >> 8) % jobTitles.length;
  
  return {
    name: names[nameIndex],
    jobTitle: jobTitles[titleIndex],
    linkedinUrl: `https://linkedin.com/in/${localPart.toLowerCase()}`,
    ...baseDomainData
  };
}

export async function enrichEmail(email: string): Promise<EnrichmentData | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  if (!email || !email.includes('@')) {
    return null;
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return null;
  }
  
  // Simulate API failure rate
  if (Math.random() < 0.1) {
    throw new Error('Enrichment service temporarily unavailable');
  }
  
  // Check if we have specific data for this domain
  if (mockEnrichmentData[domain]) {
    return {
      ...generateMockData(email),
      ...mockEnrichmentData[domain]
    };
  }
  
  // Generate general enrichment data
  return generateMockData(email);
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-green-600';
  if (confidence >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'High Confidence';
  if (confidence >= 60) return 'Medium Confidence';
  return 'Low Confidence';
}
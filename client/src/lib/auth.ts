export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  // If it's a simple date string like "2025-08-29", parse it without timezone conversion
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day); // month is 0-indexed
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Fallback for other date formats or Date objects
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'New': 'primary',           // Blue
    'In Progress': 'warning',   // Yellow  
    'Sold': 'success',          // Green - ONLY for sold
    'Not Interested': 'secondary',
    'Not Service Area': 'danger',
    'Not Compatible': 'danger',
    'Friendly Partner': 'info',
    'Franchise Request': 'info' // Light blue
  };
  return statusColors[status] || 'secondary';
}

export function getOriginColor(origin: string): { backgroundColor: string; color: string; borderColor: string } {
  const originColors: Record<string, { backgroundColor: string; color: string; borderColor: string }> = {
    'facebook': { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' },
    'google_text': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' },
    'instagram': { backgroundColor: '#ec4899', color: '#ffffff', borderColor: '#f472b6' },
    'trade_show': { backgroundColor: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' },
    'whatsapp': { backgroundColor: '#22c55e', color: '#ffffff', borderColor: '#22c55e' },
    'website': { backgroundColor: '#e0f2fe', color: '#0c4a6e', borderColor: '#7dd3fc' },
    'commercial': { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' },
    'referral': { backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }
  };
  return originColors[origin] || { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
}

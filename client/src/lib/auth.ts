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
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'new': 'success',
    'in-progress': 'warning', 
    'quoted': 'info',
    'sold': 'success',
    'not-interested': 'secondary',
    'not-service-area': 'secondary',
    'not-compatible': 'secondary'
  };
  return statusColors[status] || 'secondary';
}

export function getOriginColor(origin: string): string {
  const originColors: Record<string, string> = {
    'facebook': 'bg-blue-100 text-blue-800 border-blue-200',
    'google': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'instagram': 'bg-pink-100 text-pink-800 border-pink-200',
    'referral': 'bg-red-100 text-red-800 border-red-200',
    'whatsapp': 'bg-green-100 text-green-800 border-green-200',
    'trade-show': 'bg-violet-100 text-violet-800 border-violet-200',
    'commercial': 'bg-gray-100 text-gray-800 border-gray-200',
    'website': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return originColors[origin] || 'bg-gray-100 text-gray-800 border-gray-200';
}

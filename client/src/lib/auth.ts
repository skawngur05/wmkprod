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
    'facebook': 'bg-blue-600 text-white border-blue-600',
    'google_text': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'instagram': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-400',
    'trade_show': 'bg-violet-100 text-violet-800 border-violet-200',
    'whatsapp': 'bg-green-500 text-white border-green-500',
    'website': 'bg-sky-100 text-sky-800 border-sky-200',
    'commercial': 'bg-gray-100 text-gray-800 border-gray-200',
    'referral': 'bg-red-100 text-red-800 border-red-200'
  };
  return originColors[origin] || 'bg-gray-100 text-gray-800 border-gray-200';
}

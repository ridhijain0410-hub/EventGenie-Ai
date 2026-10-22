import { SupportedCurrency, EventType } from '../types/event';

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD'
): string {
  const num = amount || 0;
  try {
    switch (currency) {
      case 'INR':
        // Indian numbering system (Lakhs and Crores)
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(num);

      case 'EUR':
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(num);

      case 'GBP':
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          maximumFractionDigits: 0,
        }).format(num);

      case 'AED':
        return `AED ${new Intl.NumberFormat('en-AE', {
          maximumFractionDigits: 0,
        }).format(num)}`;

      case 'CAD':
        return new Intl.NumberFormat('en-CA', {
          style: 'currency',
          currency: 'CAD',
          maximumFractionDigits: 0,
        }).format(num);

      case 'AUD':
        return new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
          maximumFractionDigits: 0,
        }).format(num);

      case 'USD':
      default:
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(num);
    }
  } catch {
    return `${currency} ${num.toLocaleString()}`;
  }
}

export function formatDate(dateString: string, formatStyle: 'standard' | 'indian' = 'standard'): string {
  if (!dateString) return 'TBD';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);

      if (formatStyle === 'indian') {
        const dd = String(day).padStart(2, '0');
        const mm = String(month + 1).padStart(2, '0');
        return `${dd}/${mm}/${year}`;
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(targetDate: string): number {
  if (!targetDate) return 0;
  try {
    const [year, month, day] = targetDate.split('-');
    const target = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function getEventTypeBadge(type: string): { label: string; color: string; bg: string } {
  switch (type) {
    case 'indian_wedding':
      return { label: 'Indian Wedding (Shaadi)', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200' };
    case 'sangeet_mehendi':
      return { label: 'Sangeet & Mehendi', color: 'text-amber-800', bg: 'bg-amber-100 border-amber-200' };
    case 'haldi':
      return { label: 'Haldi Ceremony', color: 'text-yellow-800', bg: 'bg-yellow-100 border-yellow-200' };
    case 'wedding':
      return { label: 'Wedding', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200' };
    case 'birthday':
      return { label: 'Birthday Celebration', color: 'text-pink-700', bg: 'bg-pink-100 border-pink-200' };
    case 'community':
      return { label: 'Community Festival / Utsav', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200' };
    case 'corporate':
      return { label: 'Corporate Gala', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' };
    case 'anniversary':
      return { label: 'Anniversary Milestone', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' };
    case 'baby_shower':
      return { label: 'Baby Shower / Godh Bharai', color: 'text-teal-700', bg: 'bg-teal-100 border-teal-200' };
    default:
      return { label: 'Special Celebration', color: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-200' };
  }
}

// Compute an ISO date relative to an event date by subtracting days
export function calculateMilestoneDate(eventDateIso: string, daysBefore: number): string {
  try {
    const parts = eventDateIso.split('-');
    if (parts.length !== 3) return eventDateIso;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    date.setDate(date.getDate() - daysBefore);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return eventDateIso;
  }
}

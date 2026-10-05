/**
 * Utility functions for formatting and deep linking
 */

export function getWhatsAppLink(rawPhone: string, message?: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits without country code, default to Indian country code 91
  const fullNumber = digits.length === 10 ? `91${digits}` : digits;
  const baseUrl = `https://wa.me/${fullNumber}`;

  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export function formatPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return rawPhone;
}

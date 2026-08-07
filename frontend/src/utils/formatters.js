/**
 * Formats phone number for WhatsApp deep-links.
 * Strips spaces, hyphens, country code prefixes (+91, 91), and leading zeros.
 * Returns a valid WhatsApp URL string: https://wa.me/91XXXXXXXXXX
 */
export function getWhatsAppUrl(phone, message = '') {
  if (!phone) return '#';
  let digits = String(phone).replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  const encodedText = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/91${digits}${encodedText}`;
}

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

/**
 * Generates a detailed, professional pre-filled WhatsApp message for Housing listings.
 */
export function buildHousingWhatsAppMsg(listing) {
  if (!listing) return 'Hi! I saw your housing listing on CampusHub.';
  const typeStr = listing.listing_type === 'room_available' ? 'Room Available' : 'Roommate Needed';
  const sharingStr = listing.sharing_type ? `${listing.sharing_type.charAt(0).toUpperCase() + listing.sharing_type.slice(1)} Sharing` : '';
  const priceStr = listing.rent_per_person ? `₹${listing.rent_per_person.toLocaleString('en-IN')}/month` : 'Contact for Rent';
  const locationStr = listing.location ? `${listing.location}${listing.distance_km ? ` (${listing.distance_km} km from campus)` : ''}` : 'N/A';
  const dateStr = listing.available_from ? new Date(listing.available_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Immediate';

  return `Hi! I saw your housing post on CampusHub 🏠

📌 Details:
• Type: ${typeStr} ${sharingStr ? `(${sharingStr})` : ''}
• Rent: ${priceStr}
• Location: ${locationStr}
• Available From: ${dateStr}

Is this still available? I would like to connect!`;
}

/**
 * Generates a detailed, professional pre-filled WhatsApp message for Marketplace items.
 */
export function buildMarketplaceWhatsAppMsg(item) {
  if (!item) return 'Hi! I saw your item on CampusHub.';
  const priceStr = item.listing_type === 'free' ? '🎁 Free' : item.listing_type === 'rent' ? `🔑 Rent (₹${item.price.toLocaleString('en-IN')})` : `₹${item.price.toLocaleString('en-IN')}`;
  const categoryStr = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '';
  const conditionStr = item.condition ? item.condition.charAt(0).toUpperCase() + item.condition.slice(1) : '';

  return `Hi! I am interested in your item on CampusHub 🛒

📌 Item: ${item.title}
• Price: ${priceStr}
${categoryStr ? `• Category: ${categoryStr}\n` : ''}${conditionStr ? `• Condition: ${conditionStr}\n` : ''}
Is this still available for purchase?`;
}

/**
 * Generates a detailed, professional pre-filled WhatsApp message for Lost & Found posts.
 */
export function buildLostFoundWhatsAppMsg(post) {
  if (!post) return 'Hi! I saw your Lost & Found post on CampusHub.';
  const typeStr = post.post_type === 'lost' ? 'Lost Item 😔' : 'Found Item ✅';
  const dateStr = post.incident_date ? new Date(post.incident_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return `Hi! Reaching out regarding your Lost & Found post on CampusHub 🔍

📌 Post: ${post.title} (${typeStr})
${post.location ? `• Location: ${post.location}\n` : ''}${dateStr ? `• Date: ${dateStr}\n` : ''}
Can you please share more details?`;
}

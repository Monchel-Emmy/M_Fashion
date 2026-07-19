// Format FRW currency
export const formatFRW = (amount) => {
  if (amount === undefined || amount === null) return 'FRW 0';
  return `FRW ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// Format date + time
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Get relative time
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

// Get status badge class
export const getStatusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-purple',
    shipped: 'badge-blue',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    unpaid: 'badge-danger',
    partial: 'badge-warning',
    stock_in: 'badge-success',
    stock_out: 'badge-pink',
  };
  return map[status] || 'badge-gray';
};

// Category emoji
export const getCategoryEmoji = (category) => {
  const map = {
    Shirts: '👔', Pants: '👖', Dresses: '👗', Skirts: '🩱',
    Jackets: '🧥', Shoes: '👟', Accessories: '👒', Underwear: '🩲',
    Sportswear: '🏋️', Other: '🛍️',
  };
  return map[category] || '🛍️';
};

// Truncate text
export const truncate = (str, n = 50) => (str?.length > n ? str.slice(0, n) + '…' : str || '');

// Generate placeholder color for products without image
export const categoryColor = (category) => {
  const colors = {
    Shirts: '#ff6eb4', Pants: '#74b3f8', Dresses: '#b87ff5',
    Skirts: '#ffd166', Jackets: '#4dd9c0', Shoes: '#ff8c6b',
    Accessories: '#ff6eb4', Underwear: '#b87ff5', Sportswear: '#4dd9c0', Other: '#a0a0be',
  };
  return colors[category] || '#a0a0be';
};

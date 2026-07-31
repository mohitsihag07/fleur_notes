const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3131';
export const backendUrl = rawApiUrl.replace(/\/api\/?$/, '');

export const getFormattedImage = (rawImg) => {
  const fallback = '';
  if (!rawImg) return fallback;

  if (typeof rawImg === 'object') {
    if (rawImg.image) rawImg = rawImg.image;
    else if (rawImg.url) rawImg = rawImg.url;
    else if (rawImg.src) rawImg = rawImg.src;
  }

  if (typeof rawImg !== 'string' || !rawImg.trim()) return fallback;

  let cleanPath = rawImg.trim();
  if (cleanPath.includes('localhost:') || cleanPath.includes('127.0.0.1:')) {
    try {
      const urlObj = new URL(cleanPath);
      cleanPath = urlObj.pathname;
    } catch (e) {
      cleanPath = cleanPath.replace(/^https?:\/\/[^\/]+/, '');
    }
  }

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('data:')) {
    return cleanPath;
  }

  if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('uploads/')) {
    const formatted = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${backendUrl}${formatted}`;
  }

  if (!cleanPath.includes('/images/')) {
    cleanPath = `/images/products/${cleanPath.replace(/^\//, '')}`;
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  return `${backendUrl}${cleanPath}`;
};

export const extractProductImage = (item) => {
  if (!item) return getFormattedImage(null);
  if (typeof item === 'string') return getFormattedImage(item);

  if (item.image) return getFormattedImage(item.image);
  if (item.product?.image) return getFormattedImage(item.product.image);

  if (Array.isArray(item.images) && item.images.length > 0) {
    const thumb = item.images.find((i) => i && (i.is_thumbnail || i.isThumbnail)) || item.images[0];
    return getFormattedImage(thumb);
  }

  if (item.product && Array.isArray(item.product.images) && item.product.images.length > 0) {
    const thumb = item.product.images.find((i) => i && (i.is_thumbnail || i.isThumbnail)) || item.product.images[0];
    return getFormattedImage(thumb);
  }

  if (item.thumbnail) return getFormattedImage(item.thumbnail);
  if (item.product_image) return getFormattedImage(item.product_image);

  return getFormattedImage(null);
};

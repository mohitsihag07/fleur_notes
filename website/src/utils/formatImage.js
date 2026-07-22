const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3131';
export const backendUrl = rawApiUrl.replace(/\/api\/?$/, '');

export const getFormattedImage = (rawImg) => {
  const fallback = 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600';
  if (!rawImg) return fallback;
  if (typeof rawImg === 'object' && rawImg.image) rawImg = rawImg.image;
  if (typeof rawImg !== 'string' || !rawImg.trim()) return fallback;
  if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) return rawImg;

  let cleanPath = rawImg.trim();
  if (!cleanPath.includes('/images/')) {
    cleanPath = `/images/products/${cleanPath.replace(/^\//, '')}`;
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  return `${backendUrl}${cleanPath}`;
};

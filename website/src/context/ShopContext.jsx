'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFormattedImage } from '@/utils/formatImage';

const ShopContext = createContext({
  cartCount: 0,
  wishlistCount: 0,
  setCartCount: () => {},
  setWishlistCount: () => {},
  refreshCounts: () => {},
  addToCart: () => {},
  toggleWishlist: () => false,
  isInWishlist: () => false,
});

export const ShopProvider = ({ children }) => {
  const [cartCount, setCartCountState] = useState(0);
  const [wishlistCount, setWishlistCountState] = useState(0);

  const refreshCounts = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      if (!token) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart_items');
          localStorage.removeItem('wishlist_items');
        }
        setCartCountState(0);
        setWishlistCountState(0);
        return;
      }

      const savedCart = localStorage.getItem('cart_items');
      const savedWishlist = localStorage.getItem('wishlist_items');

      if (savedCart !== null) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          const totalQty = parsedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCountState(totalQty);
        } else {
          setCartCountState(0);
        }
      } else {
        setCartCountState(0);
      }

      if (savedWishlist !== null) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setWishlistCountState(parsedWishlist.length);
        } else {
          setWishlistCountState(0);
        }
      } else {
        setWishlistCountState(0);
      }
    } catch (e) {
      console.error('Failed to sync cart/wishlist count:', e);
    }
  };

  useEffect(() => {
    refreshCounts();
    const handleStorageChange = () => {
      refreshCounts();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  const setCartCount = (count) => {
    setCartCountState(count);
  };

  const setWishlistCount = (count) => {
    setWishlistCountState(count);
  };

  const addToCart = (product, quantity = 1) => {
    try {
      const savedCart = localStorage.getItem('cart_items');
      let currentCart = savedCart ? JSON.parse(savedCart) : [];
      if (!Array.isArray(currentCart)) currentCart = [];

      const pId = product.id || product._id;
      const existingIndex = currentCart.findIndex((item) => item.id === pId || item.productId === pId);

      if (existingIndex > -1) {
        currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + quantity;
      } else {
        const newItem = {
          id: pId,
          productId: pId,
          name: product.name,
          slug: product.slug || pId,
          price: product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price || 0),
          originalPrice: product.sale_price ? parseFloat(product.price) : null,
          quantity: quantity,
          image: getFormattedImage(product.image || (product.images && product.images[0]?.image) || null),
          color: product.color || product.category_id?.name || 'Artisanal',
          inStock: true
        };
        currentCart.push(newItem);
      }

      localStorage.setItem('cart_items', JSON.stringify(currentCart));
      refreshCounts();
      return true;
    } catch (e) {
      console.error('Failed to add to cart:', e);
      return false;
    }
  };

  const toggleWishlist = (product) => {
    try {
      const savedWishlist = localStorage.getItem('wishlist_items');
      let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      if (!Array.isArray(currentWishlist)) currentWishlist = [];

      const pId = product.id || product._id;
      const index = currentWishlist.findIndex((item) => item.id === pId || item.productId === pId);

      let isAdded = false;
      if (index > -1) {
        currentWishlist.splice(index, 1);
        isAdded = false;
      } else {
        const newItem = {
          id: pId,
          productId: pId,
          name: product.name,
          slug: product.slug || pId,
          price: product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price || 0),
          originalPrice: product.sale_price ? parseFloat(product.price) : null,
          image: getFormattedImage(product.image || (product.images && product.images[0]?.image) || null),
          isNew: Boolean(product.isNew || product.is_new_arrival),
          isBestSeller: Boolean(product.isBestSeller || product.is_best_seller),
          rating: product.rating || 4.8
        };
        currentWishlist.push(newItem);
        isAdded = true;
      }

      localStorage.setItem('wishlist_items', JSON.stringify(currentWishlist));
      refreshCounts();
      return isAdded;
    } catch (e) {
      console.error('Failed to toggle wishlist:', e);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    try {
      const savedWishlist = localStorage.getItem('wishlist_items');
      if (!savedWishlist) return false;
      const parsed = JSON.parse(savedWishlist);
      if (!Array.isArray(parsed)) return false;
      return parsed.some((item) => item.id === productId || item.productId === productId);
    } catch (e) {
      return false;
    }
  };

  return (
    <ShopContext.Provider
      value={{
        cartCount,
        wishlistCount,
        setCartCount,
        setWishlistCount,
        refreshCounts,
        addToCart,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);

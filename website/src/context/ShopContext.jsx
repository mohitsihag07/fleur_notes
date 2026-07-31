'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFormattedImage, extractProductImage } from '@/utils/formatImage';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';

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

  const refreshCounts = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const [apiCartItems, apiWishlistItems] = await Promise.all([
            cartService.getCart(),
            wishlistService.getWishlist()
          ]);

          if (Array.isArray(apiCartItems)) {
            const totalQty = apiCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCountState(totalQty);
            localStorage.setItem('cart_items', JSON.stringify(apiCartItems));
          }

          if (Array.isArray(apiWishlistItems)) {
            setWishlistCountState(apiWishlistItems.length);
            localStorage.setItem('wishlist_items', JSON.stringify(apiWishlistItems));
          }
          return;
        } catch (apiErr) {
          console.warn('API cart/wishlist sync failed:', apiErr);
        }
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

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      const pId = product.id || product._id;

      if (token && pId) {
        const apiCart = await cartService.addToCart(pId, quantity);
        if (Array.isArray(apiCart)) {
          localStorage.setItem('cart_items', JSON.stringify(apiCart));
          const totalQty = apiCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCountState(totalQty);
          return true;
        }
      }

      const savedCart = localStorage.getItem('cart_items');
      let currentCart = savedCart ? JSON.parse(savedCart) : [];
      if (!Array.isArray(currentCart)) currentCart = [];

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
          image: extractProductImage(product),
          color: product.color || product.category_id?.name || '',
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

  const toggleWishlist = async (product) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      const pId = product.id || product._id;

      if (token && pId) {
        const result = await wishlistService.toggleWishlist(pId);
        if (result && Array.isArray(result.items)) {
          localStorage.setItem('wishlist_items', JSON.stringify(result.items));
          setWishlistCountState(result.items.length);
          return Boolean(result.isAdded);
        }
      }

      const savedWishlist = localStorage.getItem('wishlist_items');
      let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      if (!Array.isArray(currentWishlist)) currentWishlist = [];

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
          image: extractProductImage(product),
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

  const removeFromCart = async (productId) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      const cleanId = String(productId).replace(/^cart-/, '');

      if (token && cleanId) {
        const apiCart = await cartService.removeFromCart(cleanId);
        if (Array.isArray(apiCart)) {
          localStorage.setItem('cart_items', JSON.stringify(apiCart));
          const totalQty = apiCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCountState(totalQty);
          return apiCart;
        }
      }

      const savedCart = localStorage.getItem('cart_items');
      let currentCart = savedCart ? JSON.parse(savedCart) : [];
      if (!Array.isArray(currentCart)) currentCart = [];

      currentCart = currentCart.filter(
        (item) => String(item.id) !== String(productId) && String(item.productId) !== String(cleanId)
      );

      localStorage.setItem('cart_items', JSON.stringify(currentCart));
      const totalQty = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCountState(totalQty);
      return currentCart;
    } catch (e) {
      console.error('Failed to remove from cart:', e);
      return null;
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      const cleanId = String(productId).replace(/^cart-/, '');

      if (token && cleanId) {
        const apiCart = await cartService.updateCartItem(cleanId, quantity);
        if (Array.isArray(apiCart)) {
          localStorage.setItem('cart_items', JSON.stringify(apiCart));
          const totalQty = apiCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCountState(totalQty);
          return apiCart;
        }
      }

      const savedCart = localStorage.getItem('cart_items');
      let currentCart = savedCart ? JSON.parse(savedCart) : [];
      if (!Array.isArray(currentCart)) currentCart = [];

      const idx = currentCart.findIndex(
        (item) => String(item.id) === String(productId) || String(item.productId) === String(cleanId)
      );

      if (idx > -1) {
        if (quantity <= 0) {
          currentCart.splice(idx, 1);
        } else {
          currentCart[idx].quantity = quantity;
        }
      }

      localStorage.setItem('cart_items', JSON.stringify(currentCart));
      const totalQty = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCountState(totalQty);
      return currentCart;
    } catch (e) {
      console.error('Failed to update cart quantity:', e);
      return null;
    }
  };

  const clearCart = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      if (token) {
        await cartService.clearCart();
      }
      localStorage.removeItem('cart_items');
      setCartCountState(0);
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
  };

  const getCartItemQuantity = (productId) => {
    try {
      const savedCart = typeof window !== 'undefined' ? localStorage.getItem('cart_items') : null;
      if (!savedCart) return 0;
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) return 0;
      const cleanId = String(productId).replace(/^cart-/, '');
      const found = parsed.find(
        (item) => String(item.id).replace(/^cart-/, '') === cleanId || String(item.productId).replace(/^cart-/, '') === cleanId
      );
      return found ? (found.quantity || 1) : 0;
    } catch (e) {
      return 0;
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
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartItemQuantity,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);

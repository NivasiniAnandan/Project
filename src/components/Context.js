'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AppContext = createContext();

export function AppProvider({ children }) {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cart and auth token from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('bommal_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }

    const storedToken = localStorage.getItem('bommal_token');
    const storedUser = localStorage.getItem('bommal_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user/token from localStorage', e);
      }
    }
    setLoading(false);
  }, []);

  // Sync cart to localStorage
  const saveCartToStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('bommal_cart', JSON.stringify(newCart));
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      // Check stock limit
      const newQty = newCart[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        alert(`Cannot add more. Available stock: ${product.stock}`);
        return false;
      }
      newCart[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        alert(`Cannot add. Available stock: ${product.stock}`);
        return false;
      }
      newCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.images[0],
        stock: product.stock,
        categoryId: product.categoryId,
        quantity,
      });
    }
    saveCartToStorage(newCart);
    return true;
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    saveCartToStorage(newCart);
  };

  const updateCartQty = (productId, quantity) => {
    const newCart = cart.map((item) => {
      if (item.id === productId) {
        if (quantity > item.stock) {
          alert(`Cannot update quantity. Available stock: ${item.stock}`);
          return item;
        }
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    saveCartToStorage(newCart);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  // Auth operations
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('bommal_token', data.token);
      localStorage.setItem('bommal_user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, phone, address) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password, phone, address }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('bommal_token', data.token);
      localStorage.setItem('bommal_user', JSON.stringify(data.user));

      router.push('/');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bommal_token');
    localStorage.removeItem('bommal_user');
    router.push('/login');
  };

  const updateProfile = async (updatedUser) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setUser(data.user);
      localStorage.setItem('bommal_user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        user,
        token,
        loading,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

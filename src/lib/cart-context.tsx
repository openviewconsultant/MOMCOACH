'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import type { Product } from './types';

export interface BookingSelection {
  start: string;
  end: string;
  label: string;
  buyerName: string;
  calendarId: string | null;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  /** Presente solo en servicios/asesorías con cita: lleva la fecha y hora elegidas. */
  booking?: BookingSelection;
}

interface CartContextValue {
  items: CartItem[];
  addBook: (product: Product) => void;
  addBooking: (product: Pick<Product, 'id' | 'title' | 'price'>, booking: BookingSelection) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  checkoutEmail: string;
  setCheckoutEmail: (email: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'tienda-carrito-libros';
const EMPTY_CART: CartItem[] = [];

let cartItems: CartItem[] = EMPTY_CART;
let storeInitialized = false;
let listeners: (() => void)[] = [];

function ensureStoreInitialized() {
  if (storeInitialized || typeof window === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    cartItems = stored ? JSON.parse(stored) : EMPTY_CART;
  } catch {
    cartItems = EMPTY_CART;
  }
  storeInitialized = true;
}

function getSnapshot(): CartItem[] {
  ensureStoreInitialized();
  return cartItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function setCartItems(updater: (prev: CartItem[]) => CartItem[]) {
  ensureStoreInitialized();
  cartItems = updater(cartItems);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.): se ignora
  }
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [checkoutEmail, setCheckoutEmail] = React.useState('');

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addBook = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, title: product.title, price: product.price, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const addBooking = useCallback((product: Pick<Product, 'id' | 'title' | 'price'>, booking: BookingSelection) => {
    setCartItems((prev) => {
      const rest = prev.filter((item) => item.id !== product.id);
      return [...rest, { id: product.id, title: product.title, price: product.price, quantity: 1, booking }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems((prev) => {
      const target = prev.find((item) => item.id === id);
      // Las citas son siempre 1: no se ajusta cantidad.
      if (target?.booking) return prev;
      if (quantity < 1) return prev.filter((item) => item.id !== id);
      return prev.map((item) => (item.id === id ? { ...item, quantity } : item));
    });
  }, []);

  const clear = useCallback(() => setCartItems(() => EMPTY_CART), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addBook,
        addBooking,
        removeItem,
        updateQuantity,
        clear,
        totalItems,
        totalPrice,
        isCartOpen,
        openCart,
        closeCart,
        checkoutEmail,
        setCheckoutEmail,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de un CartProvider');
  return ctx;
}

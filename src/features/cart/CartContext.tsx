import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, MerchantOffer, PurchaseAuthorization, PriceLedger } from '../../types';
import { primaryProduct, mockOffer, PRIMARY_CUSTOMER_INTENT } from '../../data/mockData';

export interface CartContextValue {
  items: CartItem[];
  appliedOffer: MerchantOffer | null;
  customerIntent: string;
  authorization: PurchaseAuthorization | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  ledger: PriceLedger;
  addToCart: (product: Product, quantity?: number, selectedSize?: number, selectedColor?: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  resetDefaultCart: () => void;
  authorizePurchase: () => PurchaseAuthorization;
  clearAuthorization: () => void;
}

const defaultCartItem: CartItem = {
  id: 'cart-item-aerorun-x',
  product: {
    ...primaryProduct,
    originalPrice: 2999, // Base catalog price as specified in Stitch & Phase 5
    finalPrice: 2799,
  },
  quantity: 1,
  selectedSize: 9,
  selectedColor: 'Chalk & Stone Grey',
  appliedOffer: mockOffer,
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY_CART = 'shoppilot_cart_items_v1';
const STORAGE_KEY_AUTH = 'shoppilot_purchase_auth_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cart items initialized from localStorage or default AeroRun X item
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
    }
    return [defaultCartItem];
  });

  // Applied offer
  const [appliedOffer, setAppliedOffer] = useState<MerchantOffer | null>(mockOffer);

  // Customer Intent query
  const [customerIntent] = useState<string>(PRIMARY_CUSTOMER_INTENT);

  // Purchase Authorization state - initially NULL until customer clicks confirm
  const [authorization, setAuthorization] = useState<PurchaseAuthorization | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse auth from localStorage:', e);
    }
    return null;
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  // Sync authorization to localStorage
  useEffect(() => {
    try {
      if (authorization) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authorization));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }
  }, [authorization]);

  // Dynamic calculations
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.id === 'aerorun-x' ? 2999 : item.product.finalPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const discount = appliedOffer && items.length > 0 ? appliedOffer.discountAmount : 0;
  const shipping = 0; // Express 24h FREE
  const tax = 0; // 18% included in base price
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const ledger: PriceLedger = {
    basePrice: subtotal,
    merchantDiscount: discount,
    logisticsFee: shipping,
    gstAmount: tax,
    totalSettlement: total,
    currency: 'INR',
  };

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedSize: number = 9,
    selectedColor: string = 'Chalk & Stone Grey'
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-item-${product.id}-${Date.now()}`,
          product,
          quantity,
          selectedSize,
          selectedColor,
          appliedOffer: mockOffer,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    // Invalidate authorization if cart changes
    setAuthorization(null);
  };

  const clearCart = () => {
    setItems([]);
    setAuthorization(null);
  };

  const resetDefaultCart = () => {
    setItems([defaultCartItem]);
    setAppliedOffer(mockOffer);
    setAuthorization(null);
  };

  const authorizePurchase = (): PurchaseAuthorization => {
    if (items.length === 0) {
      throw new Error('Cannot authorize purchase: Cart is empty.');
    }

    const primary = items[0];
    const newAuth: PurchaseAuthorization = {
      status: 'authorized',
      amount: total,
      currency: 'INR',
      productId: primary.product.id,
      productName: primary.product.name,
      offerCode: appliedOffer?.code || 'RT-SUMMER200',
      timestamp: new Date().toISOString(),
      signature: '0x3a9f' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...81c2',
      nodeId: 'NODE BLR-04',
      txId: '9814-DF7B-AG',
    };

    setAuthorization(newAuth);
    return newAuth;
  };

  const clearAuthorization = () => {
    setAuthorization(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        appliedOffer,
        customerIntent,
        authorization,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        ledger,
        addToCart,
        removeFromCart,
        clearCart,
        resetDefaultCart,
        authorizePurchase,
        clearAuthorization,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

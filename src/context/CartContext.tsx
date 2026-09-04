import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types";

interface CartContextType {
  item: Product | null;
  addToCart: (product: Product) => { success: boolean; message?: string };
  removeFromCart: () => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  recheckAvailability: () => Promise<boolean>;
  sessionId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [item, setItem] = useState<Product | null>(() => {
    try {
      const saved = localStorage.getItem("sc_cart_item");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("sc_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem("sc_session_id", sid);
    }
    return sid;
  });

  useEffect(() => {
    if (item) {
      localStorage.setItem("sc_cart_item", JSON.stringify(item));
    } else {
      localStorage.removeItem("sc_cart_item");
    }
  }, [item]);

  const addToCart = (product: Product) => {
    if (product.is_sold || product.status === "SOLD") {
      return { success: false, message: "This unique item has already been sold." };
    }

    if (item && item.id === product.id) {
      setIsCartOpen(true);
      return { success: true, message: "Item is already in your basket (Limit 1 per unique piece)." };
    }

    // Replace basket with current unique piece
    setItem(product);
    setIsCartOpen(true);

    // Reserve item on backend
    fetch(`/api/products/${product.id}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    }).catch(err => console.error("Reservation hold error:", err));

    return { success: true };
  };

  const removeFromCart = () => {
    if (item) {
      fetch(`/api/products/${item.id}/reserve`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      }).catch(err => console.error("Release reservation error:", err));
    }
    setItem(null);
  };

  const clearCart = () => {
    setItem(null);
  };

  const recheckAvailability = async (): Promise<boolean> => {
    if (!item) return false;
    try {
      const res = await fetch(`/api/products/${item.id}`);
      if (!res.ok) {
        removeFromCart();
        return false;
      }
      const data = await res.json();
      if (data.product.is_sold || data.product.status === "SOLD") {
        removeFromCart();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        item,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        recheckAvailability,
        sessionId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

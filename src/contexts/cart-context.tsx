"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, ProductType } from "@/types";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (bookId: string, selectedType: "EBOOK" | "PHYSICAL") => void;
  updateQuantity: (
    bookId: string,
    selectedType: "EBOOK" | "PHYSICAL",
    quantity: number
  ) => void;
  clearCart: () => void;
  itemsBySeller: Record<string, CartItem[]>;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "mesclar-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.bookId === item.bookId && i.selectedType === item.selectedType
        );
        if (existing) {
          return prev.map((i) =>
            i.bookId === item.bookId && i.selectedType === item.selectedType
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...item, quantity: item.quantity ?? 1 }];
      });
    },
    []
  );

  const removeItem = useCallback(
    (bookId: string, selectedType: "EBOOK" | "PHYSICAL") => {
      setItems((prev) =>
        prev.filter((i) => !(i.bookId === bookId && i.selectedType === selectedType))
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (bookId: string, selectedType: "EBOOK" | "PHYSICAL", quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) =>
        prev.map((i) =>
          i.bookId === bookId && i.selectedType === selectedType ? { ...i, quantity } : i
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    [items]
  );

  const itemsBySeller = useMemo(() => {
    return items.reduce<Record<string, CartItem[]>>((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      return acc;
    }, {});
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemsBySeller,
    }),
    [items, itemCount, total, addItem, removeItem, updateQuantity, clearCart, itemsBySeller]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function productTypeLabel(type: ProductType): string {
  switch (type) {
    case "EBOOK":
      return "eBook";
    case "PHYSICAL":
      return "Livro físico";
    case "BOTH":
      return "eBook + Físico";
    default:
      return type;
  }
}

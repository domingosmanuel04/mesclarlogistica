"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { MockBook } from "@/types";
import { CheckoutModal } from "@/components/checkout/checkout-modal";

type CheckoutStep =
  | "product"
  | "buyer"
  | "delivery"
  | "payment"
  | "proof"
  | "done";

export interface CheckoutState {
  book: MockBook;
  selectedType: "EBOOK" | "PHYSICAL";
  quantity: number;
  deliveryMethod?: "EMAIL" | "WHATSAPP";
  physicalFulfillment?: "DELIVERY" | "PICKUP";
  pickupPointId?: string;
  address?: {
    fullName: string;
    phone: string;
    whatsapp: string;
    province: string;
    municipality: string;
    neighborhood: string;
    street: string;
    houseNumber: string;
    referencePoint: string;
  };
  buyer?: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
  orderNumber?: string;
}

interface CheckoutContextValue {
  openCheckout: (opts: {
    book: MockBook;
    selectedType?: "EBOOK" | "PHYSICAL";
  }) => void;
  closeCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("product");
  const [state, setState] = useState<CheckoutState | null>(null);

  const openCheckout = useCallback(
    (opts: { book: MockBook; selectedType?: "EBOOK" | "PHYSICAL" }) => {
      const selectedType =
        opts.selectedType ??
        (opts.book.productType === "PHYSICAL" ? "PHYSICAL" : "EBOOK");
      setState({
        book: opts.book,
        selectedType,
        quantity: 1,
      });
      setStep("product");
      setOpen(true);
    },
    []
  );

  const closeCheckout = useCallback(() => {
    setOpen(false);
    setState(null);
  }, []);

  const value = useMemo(
    () => ({ openCheckout, closeCheckout }),
    [openCheckout, closeCheckout]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
      {open && state && (
        <CheckoutModal
          state={state}
          setState={setState}
          step={step}
          setStep={setStep}
          onClose={closeCheckout}
        />
      )}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}

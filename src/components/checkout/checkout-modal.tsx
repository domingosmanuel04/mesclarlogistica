"use client";

import Image from "next/image";
import Link from "next/link";
import {
  X,
  Copy,
  Check,
  ChevronRight,
  Upload,
  CircleCheck,
  Smartphone,
  Receipt,
  Building2,
  Tag,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CheckoutState } from "@/contexts/checkout-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { MockPickupPoint } from "@/types";

type CheckoutStep =
  | "product"
  | "buyer"
  | "delivery"
  | "payment"
  | "proof"
  | "done";

type PaymentMethod = "MCX" | "REFERENCE" | "TRANSFER";

interface Props {
  state: CheckoutState;
  setState: React.Dispatch<React.SetStateAction<CheckoutState | null>>;
  step: CheckoutStep;
  setStep: (s: CheckoutStep) => void;
  onClose: () => void;
}

function unitPrice(state: CheckoutState): number {
  if (state.selectedType === "PHYSICAL") {
    return state.book.pricePhysical ?? 0;
  }
  return state.book.priceEbook;
}

export function CheckoutModal({ state, setState, step, setStep, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<MockPickupPoint[]>([]);
  const [bank, setBank] = useState<{
    bankName: string;
    accountHolder: string;
    iban: string;
    expressPhone?: string | null;
    accountNumber: string;
  } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [downloadToken, setDownloadToken] = useState<string | null>(null);

  // New features: Payment method & Coupon
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MCX");
  const [mcxPhone, setMcxPhone] = useState("");
  const [mcxSent, setMcxSent] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const price = unitPrice(state);
  const subtotal = price * state.quantity;
  const total = Math.max(0, subtotal - discountAmount);
  const orderNumber = state.orderNumber ?? "—";

  // Formatted MCX 9-digit reference based on orderNumber
  const numericSeed = (orderNumber.replace(/\D/g, "") || "102456789").padEnd(9, "7").slice(0, 9);
  const mcxReference = `${numericSeed.slice(0, 3)} ${numericSeed.slice(3, 6)} ${numericSeed.slice(6, 9)}`;

  useEffect(() => {
    void fetch("/api/catalog?kind=pickup-points")
      .then((r) => r.json())
      .then((d) => setPickupPoints(Array.isArray(d) ? d : []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (state.buyer?.phone && !mcxPhone) {
      setMcxPhone(state.buyer.phone);
    }
  }, [state.buyer?.phone, mcxPhone]);

  const bankText = bank
    ? `Banco: ${bank.bankName}\nTitular: ${bank.accountHolder}\nIBAN: ${bank.iban}\nConta: ${bank.accountNumber}\nValor: ${formatPrice(total)}\nRef: #${orderNumber}`
    : "";

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponMsg(data.error || "Cupão inválido.");
        setDiscountAmount(0);
      } else {
        setDiscountAmount(data.discount || 0);
        setCouponMsg(`Cupão aplicado! Desconto de ${formatPrice(data.discount)}`);
      }
    } catch {
      setCouponMsg("Erro ao validar cupão.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleConfirmOrder() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: state.book.id,
        productType: state.selectedType,
        quantity: state.quantity,
        deliveryMethod: state.deliveryMethod,
        physicalFulfillment: state.physicalFulfillment,
        pickupPointId: state.pickupPointId,
        buyer: state.buyer,
        address:
          state.physicalFulfillment === "DELIVERY"
            ? {
                fullName: state.buyer?.name ?? "",
                phone: state.buyer?.phone ?? "",
                whatsapp: state.buyer?.whatsapp,
                province: "Luanda",
                municipality: "Luanda",
                neighborhood: "Centro",
                street: "A confirmar",
                houseNumber: "s/n",
              }
            : undefined,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Erro ao criar pedido.");
      return;
    }

    setState((prev) =>
      prev ? { ...prev, orderNumber: json.orderNumber as string } : prev
    );
    setOrderId(json.orderId as string);

    if (json.free || total === 0) {
      setDownloadToken(json.downloadToken as string);
      setStep("done");
      return;
    }

    setBank(json.bank);
    setStep("payment");
  }

  async function handleMcxPay() {
    setBusy(true);
    setError("");
    setMcxSent(true);

    // In demo/dev environment: simulate instant payment verification after 2s
    setTimeout(async () => {
      try {
        if (!orderId) return;
        // Approve order immediately for seamless instant demo flow
        const approveRes = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }),
        });

        if (approveRes.ok) {
          // fetch download token for user
          const dlRes = await fetch(`/api/books/free-download`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId: state.book.id }),
          });
          const dlData = await dlRes.json().catch(() => ({}));
          if (dlData.downloadToken) {
            setDownloadToken(dlData.downloadToken);
          }
          setStep("done");
        } else {
          setStep("done");
        }
      } catch {
        setStep("done");
      } finally {
        setBusy(false);
      }
    }, 2000);
  }

  async function handleProofUpload() {
    if (!orderId || !proofFile) {
      setError("Seleccione o ficheiro do comprovativo.");
      return;
    }
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("proof", proofFile);
    const res = await fetch(`/api/orders/${orderId}`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Erro ao enviar comprovativo.");
      return;
    }
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-mesclar-border/80 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold tracking-tight text-mesclar-black">
          Finalizar compra
        </h2>
        <p className="text-xs text-mesclar-muted">
          Passo {step === "product" ? "1" : step === "buyer" ? "2" : step === "delivery" ? "3" : step === "payment" ? "4" : step === "proof" ? "5" : "6"} de 6
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {step === "product" && (
            <>
              <div className="flex gap-4 rounded-xl border border-mesclar-border/70 p-3.5 bg-mesclar-cream/20">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <Image
                    src={state.book.coverUrl}
                    alt={state.book.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-sm text-mesclar-black">
                    {state.book.title}
                  </p>
                  <p className="text-xs text-mesclar-muted">{state.book.authorName}</p>
                  <p className="mt-1 text-sm font-black text-mesclar-gold-dark">
                    {price === 0 ? "Gratuito" : formatPrice(price)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-mesclar-muted">
                  Formato desejado
                </label>
                <div className="mt-1.5 flex gap-2">
                  <Button
                    variant={state.selectedType === "EBOOK" ? "gold" : "secondary"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setState({ ...state, selectedType: "EBOOK" })}
                  >
                    eBook Digital
                  </Button>
                  {state.book.productType !== "EBOOK" && state.book.pricePhysical != null && (
                    <Button
                      variant={state.selectedType === "PHYSICAL" ? "gold" : "secondary"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setState({ ...state, selectedType: "PHYSICAL" })}
                    >
                      Livro Físico
                    </Button>
                  )}
                </div>
              </div>

              {state.selectedType === "PHYSICAL" && (
                <div>
                  <label className="text-xs font-semibold text-mesclar-muted">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    className="mt-1 w-full rounded-lg border border-mesclar-border px-3 py-2 text-sm"
                    value={state.quantity}
                    onChange={(e) =>
                      setState({ ...state, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                  />
                </div>
              )}

              {/* Coupon Box */}
              <div className="rounded-xl border border-dashed border-mesclar-border p-3 bg-mesclar-cream/30">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-mesclar-muted" />
                    <input
                      type="text"
                      placeholder="Código do Cupão (ex: MESCLAR10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-mesclar-border pl-8 pr-3 py-1.5 text-xs uppercase font-semibold"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </Button>
                </div>
                {couponMsg && (
                  <p className={`mt-2 text-[11px] font-medium ${discountAmount > 0 ? "text-emerald-700" : "text-amber-800"}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-mesclar-cream/40 p-3 space-y-1 text-xs">
                <div className="flex justify-between text-mesclar-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Desconto</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-mesclar-border/60 pt-1 text-sm font-black text-mesclar-black">
                  <span>Total</span>
                  <span className="text-mesclar-gold-dark">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full"
                rightIcon={ChevronRight}
                onClick={() => setStep("buyer")}
              >
                Prosseguir para Dados do Comprador
              </Button>
            </>
          )}

          {step === "buyer" && (
            <>
              {(
                [
                  ["name", "Nome completo", "text"],
                  ["email", "Email para recepção", "email"],
                  ["phone", "Telefone (Angola)", "tel"],
                  ["whatsapp", "WhatsApp (opcional para envio imediato)", "tel"],
                ] as const
              ).map(([field, label, type]) => (
                <label key={field} className="block text-xs font-semibold text-mesclar-black">
                  {label}
                  <input
                    type={type}
                    required={field !== "whatsapp"}
                    className="mt-1 w-full rounded-lg border border-mesclar-border px-3 py-2 text-sm font-normal focus:border-mesclar-gold focus:outline-none"
                    value={state.buyer?.[field] ?? ""}
                    onChange={(e) =>
                      setState({
                        ...state,
                        buyer: {
                          name: state.buyer?.name ?? "",
                          email: state.buyer?.email ?? "",
                          phone: state.buyer?.phone ?? "",
                          whatsapp: state.buyer?.whatsapp ?? "",
                          [field]: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
              <Button
                variant="gold"
                className="w-full"
                rightIcon={ChevronRight}
                onClick={() => {
                  if (!state.buyer?.name || !state.buyer?.email || !state.buyer?.phone) {
                    setError("Preencha nome, email e telefone.");
                    return;
                  }
                  setError("");
                  setStep("delivery");
                }}
              >
                Continuar para Envio / Entrega
              </Button>
            </>
          )}

          {step === "delivery" && (
            <>
              {state.selectedType === "EBOOK" ? (
                <>
                  <p className="font-semibold text-sm">Como prefere receber a notificação do eBook?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["EMAIL", "WHATSAPP"] as const).map((m) => (
                      <Button
                        key={m}
                        variant={state.deliveryMethod === m ? "gold" : "secondary"}
                        size="sm"
                        onClick={() => setState({ ...state, deliveryMethod: m })}
                      >
                        {m === "EMAIL" ? "Via Email" : "Via WhatsApp"}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[11px] text-mesclar-muted">
                    Após a confirmação, o livro também ficará acessível imediatamente no seu <strong>Leitor Web</strong> na sua conta.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm">Modalidade de entrega física:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={state.physicalFulfillment === "DELIVERY" ? "gold" : "secondary"}
                      size="sm"
                      onClick={() => setState({ ...state, physicalFulfillment: "DELIVERY" })}
                    >
                      Entrega ao domicílio
                    </Button>
                    <Button
                      variant={state.physicalFulfillment === "PICKUP" ? "gold" : "secondary"}
                      size="sm"
                      onClick={() => setState({ ...state, physicalFulfillment: "PICKUP" })}
                    >
                      Ponto de recolha
                    </Button>
                  </div>
                  {state.physicalFulfillment === "PICKUP" && (
                    <ul className="space-y-2 text-xs">
                      {pickupPoints.map((p) => (
                        <li key={p.id}>
                          <label className="flex cursor-pointer gap-2 rounded-lg border border-mesclar-border p-3 hover:border-mesclar-gold transition-colors">
                            <input
                              type="radio"
                              name="pickup"
                              checked={state.pickupPointId === p.id}
                              onChange={() => setState({ ...state, pickupPointId: p.id })}
                            />
                            <span>
                              <strong className="text-mesclar-black">{p.name}</strong>
                              <br />
                              <span className="text-mesclar-muted">{p.address}, {p.municipality}</span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              <Button
                variant="gold"
                className="w-full"
                leftIcon={Check}
                disabled={busy}
                onClick={() => void handleConfirmOrder()}
              >
                {busy ? "A criar pedido..." : "Confirmar e Ir para Pagamento"}
              </Button>
            </>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-mesclar-black">
                Selecione o método de pagamento
              </h3>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-mesclar-border p-1 bg-mesclar-cream/30 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("MCX")}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                    paymentMethod === "MCX"
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm"
                      : "text-mesclar-muted hover:text-mesclar-black"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>MCX Express</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("REFERENCE")}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                    paymentMethod === "REFERENCE"
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm"
                      : "text-mesclar-muted hover:text-mesclar-black"
                  }`}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Referência</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                    paymentMethod === "TRANSFER"
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm"
                      : "text-mesclar-muted hover:text-mesclar-black"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Transferência</span>
                </button>
              </div>

              {/* Tab 1: Multicaixa Express */}
              {paymentMethod === "MCX" && (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Pagamento Instantâneo via Multicaixa Express
                  </div>
                  <p className="text-xs text-mesclar-muted leading-relaxed">
                    Introduza o telemóvel associado ao seu cartão Multicaixa Express. Receberá uma notificação imediata para autorizar com o seu PIN.
                  </p>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-mesclar-muted">
                      Número de Telemóvel MCX
                    </label>
                    <input
                      type="tel"
                      className="mt-1 w-full rounded-lg border border-mesclar-border bg-white px-3 py-2 text-sm font-bold text-mesclar-black focus:border-emerald-500 focus:outline-none"
                      placeholder="923 456 789"
                      value={mcxPhone}
                      onChange={(e) => setMcxPhone(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60 text-xs">
                    <span className="text-mesclar-muted">Total a debitar:</span>
                    <span className="text-base font-black text-emerald-800">{formatPrice(total)}</span>
                  </div>

                  <Button
                    variant="gold"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                    disabled={busy || !mcxPhone.trim()}
                    onClick={handleMcxPay}
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validando no Multicaixa Express...
                      </span>
                    ) : (
                      "Pagar com Multicaixa Express"
                    )}
                  </Button>
                </div>
              )}

              {/* Tab 2: Referência Multicaixa */}
              {paymentMethod === "REFERENCE" && (
                <div className="space-y-3 rounded-xl border border-mesclar-border bg-mesclar-black p-4 text-white">
                  <p className="text-xs text-mesclar-gold font-semibold">
                    Pagamento em Caixa Multicaixa (ATM) ou Homebanking:
                  </p>
                  <div className="space-y-1.5 text-xs font-mono bg-white/10 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white/70">Entidade:</span>
                      <span className="font-bold text-mesclar-gold">10245</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Referência:</span>
                      <span className="font-bold text-mesclar-gold">{mcxReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Montante:</span>
                      <span className="font-bold text-white">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-white/50 pt-1 border-t border-white/10">
                      <span>Validade:</span>
                      <span>24 Horas</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={copied ? Check : Copy}
                    onClick={() => {
                      void navigator.clipboard.writeText(`Entidade: 10245\nReferência: ${mcxReference}\nValor: ${formatPrice(total)}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Referência copiada!" : "Copiar Dados da Referência"}
                  </Button>
                  <Button
                    variant="gold"
                    className="w-full text-xs"
                    onClick={() => setStep("done")}
                  >
                    Já efetuei o pagamento
                  </Button>
                </div>
              )}

              {/* Tab 3: Transferência Bancária */}
              {paymentMethod === "TRANSFER" && bank && (
                <div className="space-y-3">
                  <div className="space-y-1 rounded-xl bg-mesclar-black p-4 text-xs text-white/90 font-mono">
                    <p>Banco: <strong className="text-white">{bank.bankName}</strong></p>
                    <p>Titular: <strong className="text-white">{bank.accountHolder}</strong></p>
                    <p>IBAN: <strong className="text-mesclar-gold">{bank.iban}</strong></p>
                    {bank.expressPhone && (
                      <p>Express: <strong className="text-emerald-400">{bank.expressPhone}</strong></p>
                    )}
                    <p>Conta: {bank.accountNumber}</p>
                    <p className="pt-2 text-mesclar-gold font-bold">Valor: {formatPrice(total)}</p>
                    <p>Ref: #{orderNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={copied ? Check : Copy}
                      onClick={() => {
                        void navigator.clipboard.writeText(bankText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? "Copiado!" : "Copiar IBAN"}
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={Upload}
                      onClick={() => setStep("proof")}
                    >
                      Enviar comprovativo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "proof" && (
            <>
              <h3 className="font-semibold text-sm">Enviar comprovativo de pagamento</h3>
              <p className="text-xs text-mesclar-muted">Formatos aceites: PDF, JPG ou PNG</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-xs border rounded-lg p-2"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              />
              <Button
                variant="gold"
                className="w-full"
                leftIcon={Upload}
                disabled={busy || !proofFile}
                onClick={() => void handleProofUpload()}
              >
                {busy ? "A enviar comprovativo..." : "Enviar Comprovativo"}
              </Button>
            </>
          )}

          {step === "done" && (
            <div className="py-4 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Check className="h-8 w-8" />
              </div>

              {downloadToken ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-mesclar-black">
                    eBook Disponível para Acesso Imediato!
                  </h3>
                  <p className="text-xs text-mesclar-muted max-w-sm mx-auto">
                    O seu conteúdo foi licenciado com sucesso. Pode ler agora diretamente no navegador ou transferir o PDF protegido.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <Link href={`/leitor/${downloadToken}`} target="_blank">
                      <Button variant="gold" leftIcon={BookOpen} className="w-full sm:w-auto">
                        Ler Online no Navegador
                      </Button>
                    </Link>
                    <a href={`/api/download/${downloadToken}`}>
                      <Button variant="secondary" leftIcon={Upload} className="w-full sm:w-auto">
                        Descarregar PDF
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-mesclar-black">
                    Pedido Registado com Sucesso!
                  </h3>
                  <p className="text-xs text-mesclar-muted max-w-sm mx-auto">
                    Pedido <strong>#{orderNumber}</strong>. Assim que o pagamento for liquidado, o eBook será liberado automaticamente na sua conta e enviado por email/WhatsApp.
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-4"
                leftIcon={CircleCheck}
                onClick={onClose}
              >
                Concluir e Voltar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

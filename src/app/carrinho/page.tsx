"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, CreditCard, Check, Copy, Upload } from "lucide-react";
import type { MockPickupPoint } from "@/types";

type Step = "cart" | "buyer" | "payment" | "proof" | "done";

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, itemsBySeller, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("cart");
  const [buyer, setBuyer] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    whatsapp: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("PICKUP");
  const [pickupPoints, setPickupPoints] = useState<MockPickupPoint[]>([]);
  const [pickupPointId, setPickupPointId] = useState("");
  const [addresses, setAddresses] = useState<
    {
      id: string;
      fullName: string;
      phone: string;
      whatsapp?: string | null;
      province: string;
      municipality: string;
      neighborhood: string;
      street: string;
      houseNumber: string;
      reference?: string | null;
    }[]
  >([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [orders, setOrders] = useState<
    {
      orderId: string;
      orderNumber: string;
      total: number;
      bank: {
        bankName: string;
        accountHolder: string;
        iban: string;
        expressPhone?: string | null;
        accountNumber: string;
      } | null;
      free?: boolean;
      downloadTokens?: string[];
    }[]
  >([]);
  const [proofOrderId, setProofOrderId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const payable = Math.max(0, total - discount);

  if (items.length === 0 && step === "cart") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Carrinho</h1>
        <p className="mt-4 text-mesclar-muted">O seu carrinho está vazio.</p>
        <Link href="/ebooks" className="mt-6 inline-block">
          <Button variant="gold" leftIcon={BookOpen}>
            Explorar eBooks
          </Button>
        </Link>
      </div>
    );
  }

  async function startCheckout() {
    setError("");
    if (!isAuthenticated) {
      window.location.href = `/entrar?redirect=${encodeURIComponent("/carrinho")}`;
      return;
    }
    const pts = await fetch("/api/catalog?kind=pickup-points").then((r) => r.json());
    setPickupPoints(Array.isArray(pts) ? pts : []);
    if (Array.isArray(pts) && pts[0]) setPickupPointId(pts[0].id);
    const addrs = await fetch("/api/account/addresses").then((r) => r.json()).catch(() => []);
    setAddresses(Array.isArray(addrs) ? addrs : []);
    if (Array.isArray(addrs) && addrs[0]) {
      setSelectedAddressId(addrs[0].id);
      const a = addrs[0];
      setBuyer((b) => ({
        ...b,
        name: a.fullName || b.name || user?.name || "",
        email: b.email || user?.email || "",
        phone: a.phone || b.phone,
        whatsapp: a.whatsapp || b.whatsapp,
      }));
    } else {
      setBuyer((b) => ({
        ...b,
        name: b.name || user?.name || "",
        email: b.email || user?.email || "",
      }));
    }
    setStep("buyer");
  }

  async function submitOrders() {
    if (!buyer.name || !buyer.email || !buyer.phone) {
      setError("Preencha nome, email e telefone.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          bookId: i.bookId,
          productType: i.selectedType,
          quantity: i.quantity,
        })),
        deliveryMethod,
        physicalFulfillment: fulfillment,
        pickupPointId: fulfillment === "PICKUP" ? pickupPointId : undefined,
        couponCode: discount > 0 ? couponCode : undefined,
        buyer,
        address:
          fulfillment === "DELIVERY"
            ? (() => {
                const a = addresses.find((x) => x.id === selectedAddressId);
                return {
                  fullName: a?.fullName ?? buyer.name,
                  phone: a?.phone ?? buyer.phone,
                  whatsapp: a?.whatsapp ?? buyer.whatsapp,
                  province: a?.province ?? "Luanda",
                  municipality: a?.municipality ?? "Luanda",
                  neighborhood: a?.neighborhood ?? "Centro",
                  street: a?.street ?? "A confirmar",
                  houseNumber: a?.houseNumber ?? "s/n",
                  referencePoint: a?.reference ?? undefined,
                };
              })()
            : undefined,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Erro ao criar pedidos.");
      return;
    }
    setOrders(json.orders || []);
    clearCart();
    const paid = (json.orders || []).filter((o: { free?: boolean }) => !o.free);
    if (paid.length === 0) {
      setStep("done");
    } else {
      setProofOrderId(paid[0].orderId);
      setStep("payment");
    }
  }

  async function uploadProof() {
    if (!proofOrderId || !proofFile) {
      setError("Seleccione o comprovativo.");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("proof", proofFile);
    const res = await fetch(`/api/orders/${proofOrderId}`, { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      setError("Erro ao enviar comprovativo.");
      return;
    }
    setStep("done");
  }

  const bankText = orders
    .filter((o) => o.bank)
    .map(
      (o) =>
        `Pedido #${o.orderNumber}\nBanco: ${o.bank!.bankName}\nTitular: ${o.bank!.accountHolder}\nIBAN: ${o.bank!.iban}${o.bank!.expressPhone ? `\nExpress: ${o.bank!.expressPhone}` : ""}\nConta: ${o.bank!.accountNumber}\nValor: ${formatPrice(o.total)}`
    )
    .join("\n\n");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="text-2xl font-bold">
        {step === "cart" && "Carrinho"}
        {step === "buyer" && "Dados do comprador"}
        {step === "payment" && "Pagamento"}
        {step === "proof" && "Comprovativo"}
        {step === "done" && "Pedido concluído"}
      </h1>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "cart" && (
        <>
          <p className="mt-2 text-sm text-mesclar-muted">
            Pedidos são agrupados por profissional no checkout.
          </p>
          {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => (
            <div key={sellerId} className="mt-8 rounded-xl border border-mesclar-border p-4">
              <p className="mb-4 text-sm font-semibold text-mesclar-gold-dark">
                Profissional: {sellerItems[0]?.sellerName}
              </p>
              <ul className="space-y-4">
                {sellerItems.map((item) => (
                  <li key={`${item.bookId}-${item.selectedType}`} className="flex gap-4">
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image src={item.coverUrl} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-mesclar-muted">
                        {item.selectedType === "EBOOK" ? "eBook" : "Físico"} ·{" "}
                        {formatPrice(item.unitPrice)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.bookId,
                              item.selectedType,
                              Number(e.target.value)
                            )
                          }
                          className="w-16 rounded border px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          className="text-xs text-red-600"
                          onClick={() => removeItem(item.bookId, item.selectedType)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold">{formatPrice(payable)}</span>
          </div>
          {discount > 0 && (
            <p className="mt-1 text-right text-sm text-mesclar-gold-dark">
              Desconto: −{formatPrice(discount)}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Cupão (ex: MESCLAR10)"
              className="min-w-[160px] flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                void (async () => {
                  setCouponMsg("");
                  const res = await fetch("/api/coupons", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: couponCode, orderTotal: total }),
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setDiscount(0);
                    setCouponMsg(json.error || "Cupão inválido");
                    return;
                  }
                  setDiscount(json.discount as number);
                  setCouponMsg(`Cupão ${json.code} aplicado.`);
                })();
              }}
            >
              Aplicar cupão
            </Button>
          </div>
          {couponMsg && <p className="mt-2 text-sm text-mesclar-muted">{couponMsg}</p>}
          <Button
            variant="gold"
            className="mt-6 w-full sm:w-auto"
            leftIcon={CreditCard}
            onClick={() => void startCheckout()}
          >
            Finalizar compra
          </Button>
        </>
      )}

      {step === "buyer" && (
        <div className="mt-6 max-w-lg space-y-4">
          {(["name", "email", "phone", "whatsapp"] as const).map((f) => (
            <label key={f} className="block text-sm font-medium">
              {f === "name" ? "Nome" : f === "whatsapp" ? "WhatsApp" : f}
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={buyer[f]}
                onChange={(e) => setBuyer({ ...buyer, [f]: e.target.value })}
                required={f !== "whatsapp"}
              />
            </label>
          ))}
          <div>
            <p className="mb-2 text-sm font-medium">Receber eBooks por</p>
            <div className="flex gap-2">
              {(["EMAIL", "WHATSAPP"] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={deliveryMethod === m ? "gold" : "secondary"}
                  onClick={() => setDeliveryMethod(m)}
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>
          {items.some((i) => i.selectedType === "PHYSICAL") && (
            <div>
              <p className="mb-2 text-sm font-medium">Livros físicos</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={fulfillment === "PICKUP" ? "gold" : "secondary"}
                  onClick={() => setFulfillment("PICKUP")}
                >
                  Levantamento
                </Button>
                <Button
                  size="sm"
                  variant={fulfillment === "DELIVERY" ? "gold" : "secondary"}
                  onClick={() => setFulfillment("DELIVERY")}
                >
                  Entrega
                </Button>
              </div>
              {fulfillment === "PICKUP" && (
                <ul className="mt-3 space-y-2 text-sm">
                  {pickupPoints.map((p) => (
                    <li key={p.id}>
                      <label className="flex gap-2 rounded-md border p-3">
                        <input
                          type="radio"
                          checked={pickupPointId === p.id}
                          onChange={() => setPickupPointId(p.id)}
                        />
                        <span>
                          <strong>{p.name}</strong>
                          <br />
                          {p.address}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              {fulfillment === "DELIVERY" && addresses.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {addresses.map((a) => (
                    <li key={a.id}>
                      <label className="flex gap-2 rounded-md border p-3">
                        <input
                          type="radio"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                        />
                        <span>
                          <strong>{a.fullName}</strong>
                          <br />
                          {a.street} {a.houseNumber}, {a.municipality}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              {fulfillment === "DELIVERY" && addresses.length === 0 && (
                <p className="mt-2 text-xs text-mesclar-muted">
                  Guarde um endereço em Conta → Meus dados, ou usaremos dados básicos.
                </p>
              )}
            </div>
          )}
          <Button
            variant="gold"
            disabled={busy}
            onClick={() => void submitOrders()}
          >
            {busy ? "A processar..." : "Confirmar pedidos"}
          </Button>
        </div>
      )}

      {step === "payment" && (
        <div className="mt-6 space-y-4">
          {orders
            .filter((o) => o.bank)
            .map((o) => (
              <div key={o.orderId} className="rounded-lg bg-mesclar-black p-4 text-sm text-white/90">
                <p className="font-semibold text-mesclar-gold-light">#{o.orderNumber}</p>
                <p>Banco: {o.bank!.bankName}</p>
                <p>Titular: {o.bank!.accountHolder}</p>
                <p>IBAN: {o.bank!.iban}</p>
                {o.bank!.expressPhone && (
                  <p>Express: <strong className="text-mesclar-gold">{o.bank!.expressPhone}</strong></p>
                )}
                <p>Conta: {o.bank!.accountNumber}</p>
                <p className="mt-2">Valor: {formatPrice(o.total)}</p>
              </div>
            ))}
          <Button
            variant="secondary"
            leftIcon={copied ? Check : Copy}
            onClick={() => {
              void navigator.clipboard.writeText(bankText);
              setCopied(true);
            }}
          >
            Copiar dados
          </Button>
          <Button variant="gold" leftIcon={Upload} onClick={() => setStep("proof")}>
            Enviar comprovativo
          </Button>
        </div>
      )}

      {step === "proof" && (
        <div className="mt-6 max-w-md space-y-4">
          {orders.filter((o) => !o.free).length > 1 && (
            <label className="block text-sm font-medium">
              Pedido
              <select
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={proofOrderId ?? ""}
                onChange={(e) => setProofOrderId(e.target.value)}
              >
                {orders
                  .filter((o) => !o.free)
                  .map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      #{o.orderNumber} — {formatPrice(o.total)}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="gold" disabled={busy} onClick={() => void uploadProof()}>
            {busy ? "A enviar..." : "Enviar"}
          </Button>
        </div>
      )}

      {step === "done" && (
        <div className="mt-8 text-center">
          <Check className="mx-auto h-12 w-12 text-green-600" />
          <p className="mt-4 font-semibold">Obrigado!</p>
          <p className="text-sm text-mesclar-muted">
            {orders.some((o) => o.free)
              ? "Downloads gratuitos libertados."
              : "Comprovativo enviado — aguarda validação."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {orders.flatMap((o) =>
              (o.downloadTokens ?? []).map((t) => (
                <a key={t} href={`/api/download/${t}`}>
                  <Button size="sm" variant="gold">
                    Descarregar
                  </Button>
                </a>
              ))
            )}
          </div>
          <Link href="/conta/pedidos" className="mt-6 inline-block">
            <Button variant="secondary">Ver meus pedidos</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * WhatsApp Business API — stub em dev; POST real se WHATSAPP_API_URL + TOKEN.
 */

export async function sendWhatsAppMessage(params: {
  to: string;
  body: string;
}): Promise<boolean> {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!url || !token) {
    console.info("[whatsapp]", params.to, params.body.slice(0, 120));
    return true;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to.replace(/\D/g, ""),
        type: "text",
        text: { body: params.body },
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[whatsapp]", e);
    return false;
  }
}

export async function sendEbookWhatsApp(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  bookTitle: string;
  downloadUrl: string;
}) {
  const body = `Olá, ${params.customerName}.

Pagamento do pedido #${params.orderNumber} aprovado.

eBook: ${params.bookTitle}

Descarregar:
${params.downloadUrl}`;

  return sendWhatsAppMessage({ to: params.to, body });
}

export async function sendOrderStatusWhatsApp(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  message: string;
}) {
  return sendWhatsAppMessage({
    to: params.to,
    body: `Olá, ${params.customerName}.\n\nPedido #${params.orderNumber}\n${params.message}`,
  });
}

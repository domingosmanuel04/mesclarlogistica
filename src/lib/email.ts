/**
 * Email: stub em dev; Resend se RESEND_API_KEY; SMTP log se SMTP_HOST.
 */

export type EmailTemplate =
  | "welcome"
  | "professional_registration"
  | "order_created"
  | "proof_received"
  | "payment_approved"
  | "ebook_released"
  | "book_shipped"
  | "pickup_ready"
  | "password_reset";

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  data: Record<string, string>;
  subject?: string;
}

const subjects: Record<EmailTemplate, string> = {
  welcome: "Bem-vindo à Mesclar Logística",
  professional_registration: "O seu ID de Registo — Mesclar Logística",
  order_created: "Pedido criado — Mesclar",
  proof_received: "Comprovativo recebido",
  payment_approved: "Pagamento aprovado",
  ebook_released: "O seu eBook está disponível",
  book_shipped: "Livro enviado",
  pickup_ready: "Livro pronto para levantamento",
  password_reset: "Redefinir palavra-passe — Mesclar",
};

function renderBody(template: EmailTemplate, data: Record<string, string>): string {
  switch (template) {
    case "professional_registration":
      return `Olá ${data.name},\n\nA sua conta de profissional na plataforma Mesclar Logística foi criada com sucesso!\n\n========================================\nO SEU ID DE REGISTO PARA LOGIN: ${data.registrationNumber}\n========================================\n\nComo aceder à sua conta:\n1. Aceda a: ${data.loginUrl || "https://mesclar.ao/entrar"}\n2. No campo "ID de Registo", insira: ${data.registrationNumber}\n3. Introduza a sua palavra-passe\n\nGuarde esta mensagem para futuras consultas.\n\nCom os melhores cumprimentos,\nEquipa Mesclar Logística`;
    case "password_reset":
      return `Olá,\n\nUse este link para redefinir a palavra-passe (válido 1h):\n${data.resetUrl}\n\nSe não pediu, ignore este email.`;
    case "ebook_released":
      return `Olá,\n\nO eBook "${data.bookTitle}" está disponível.\nPedido #${data.orderNumber}\n\nDescarregar:\n${data.downloadUrl}`;
    case "payment_approved":
      return `Olá,\n\nO pagamento do pedido #${data.orderNumber} foi aprovado.\n${data.message ?? ""}`;
    case "order_created":
      return `Olá,\n\nPedido #${data.orderNumber} criado. Total: ${data.total}\nEfectue a transferência e envie o comprovativo.`;
    case "book_shipped":
      return `Olá,\n\nO pedido #${data.orderNumber} foi enviado.\n${data.notes ?? ""}`;
    case "pickup_ready":
      return `Olá,\n\nO pedido #${data.orderNumber} está pronto para levantamento.\n${data.pickup ?? ""}`;
    default:
      return Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
  }
}

export async function sendEmail({ to, template, data, subject }: SendEmailParams): Promise<boolean> {
  const subj = subject ?? subjects[template];
  const body = renderBody(template, data);

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Mesclar <onboarding@resend.dev>",
          to: [to],
          subject: subj,
          text: body,
        }),
      });
      return res.ok;
    } catch (e) {
      console.error("[email:resend]", e);
      return false;
    }
  }

  console.info("[email]", template, to, subj, data);
  return true;
}

export async function sendEbookDownloadEmail(params: {
  to: string;
  bookTitle: string;
  authorName: string;
  orderNumber: string;
  downloadUrl: string;
}) {
  return sendEmail({
    to: params.to,
    template: "ebook_released",
    data: {
      bookTitle: params.bookTitle,
      downloadUrl: params.downloadUrl,
    },
  });
}

export async function sendProfessionalRegistrationEmail(params: {
  to: string;
  name: string;
  registrationNumber: string;
  loginUrl?: string;
}) {
  return sendEmail({
    to: params.to,
    template: "professional_registration",
    data: {
      name: params.name,
      registrationNumber: params.registrationNumber,
      loginUrl: params.loginUrl || "/entrar",
    },
  });
}


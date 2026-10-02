import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export const metadata = { title: "Contactos" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 lg:px-8">
      <h1 className="text-3xl font-bold">Contactos</h1>
      <p className="mt-4 text-mesclar-muted">Email: suporte@mesclarlogistica.com</p>
      <p className="text-mesclar-muted flex items-center gap-1.5 mt-1">
        WhatsApp:{" "}
        <a
          href="https://wa.me/244921522885"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
        >
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
          +244 921 522 885
        </a>
      </p>
      <form className="mt-10 space-y-4">
        <label className="block text-sm font-medium">
          Nome
          <input className="mt-1 w-full rounded-md border border-mesclar-border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Mensagem
          <textarea rows={5} className="mt-1 w-full rounded-md border border-mesclar-border px-3 py-2" />
        </label>
        <Button type="button" variant="gold" leftIcon={Send}>
          Enviar
        </Button>
      </form>
    </div>
  );
}

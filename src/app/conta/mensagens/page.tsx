"use client";

import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { ChatFullView } from "@/components/chat/chat-full-view";

export default function CustomerMensagensPage() {
  return (
    <DashboardShell
      title="Mensagens & Suporte"
      subtitle="Converse directamente com o suporte da Mesclar, autores e profissionais da plataforma."
      nav={customerNav}
      roleLabel="Membro"
    >
      <ChatFullView />
    </DashboardShell>
  );
}

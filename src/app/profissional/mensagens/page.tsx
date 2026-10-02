"use client";

import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { ChatFullView } from "@/components/chat/chat-full-view";

export default function ProfessionalMensagensPage() {
  return (
    <DashboardShell
      title="Mensagens da Conta Profissional"
      subtitle="Gerencie conversas com clientes, leitores e administração da Mesclar Logística."
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <ChatFullView />
    </DashboardShell>
  );
}

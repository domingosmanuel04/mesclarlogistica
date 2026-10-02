"use client";

import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { ChatFullView } from "@/components/chat/chat-full-view";

export default function AdminMensagensPage() {
  return (
    <DashboardShell
      title="Atendimento & Chat da Administração"
      subtitle="Responda às mensagens de suporte dos utilizadores e converse com profissionais registados."
      nav={adminNav}
      roleLabel="Administrador"
    >
      <ChatFullView />
    </DashboardShell>
  );
}

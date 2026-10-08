import { prisma } from "@/lib/prisma";

/**
 * Extrai as duas letras iniciais do nome de forma limpa (sem acentos, em maiúsculas).
 * Ex: "Daniel Camalando" -> "DA"
 *     "Álvaro Mendes" -> "AL"
 *     "João Silva" -> "JO"
 */
export function extractNameInitials(name: string): string {
  const clean = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  if (clean.length >= 2) {
    return clean.slice(0, 2);
  }
  return (clean + "XX").slice(0, 2).toUpperCase();
}

/**
 * Gera o próximo número de registo sequencial na plataforma com a máscara:
 * MESC.{2_LETRAS_INICIAIS}{4_DIGITOS_SEQUENCIAIS}
 * A numeração sequencial inicia em 0100 (0100, 0101, 0102, 0103, ...).
 */
export async function generateNextRegistrationNumber(name: string): Promise<string> {
  const initials = extractNameInitials(name);
  try {
    // Procura todos os utilizadores que já têm número de registo atribuído
    const usersWithReg = await prisma.user.findMany({
      where: { registrationNumber: { not: null } },
      select: { registrationNumber: true },
    });

    let maxSeq = 99; // Se for o primeiro, 99 + 1 = 100 -> "0100"
    for (const u of usersWithReg) {
      if (u.registrationNumber) {
        // Captura os últimos 4 dígitos no formato de registo
        const match = u.registrationNumber.match(/(\d{4})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }

    const nextSeq = maxSeq + 1;
    const seqPadded = String(nextSeq).padStart(4, "0");
    return `MESC.${initials}${seqPadded}`;
  } catch {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    return `MESC.${initials}0${randomSeq}`;
  }
}

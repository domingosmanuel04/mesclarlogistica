import { ShieldCheck, BookMarked, BadgeCheck } from "lucide-react";

const items = [
  {
    icon: BookMarked,
    title: "Logística, Procurement e Transporte",
    desc: "Curadoria temática — não loja genérica",
  },
  {
    icon: BadgeCheck,
    title: "Profissionais verificados",
    desc: "Conteúdo aprovado pela Mesclar",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    desc: "eBooks com download protegido",
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-[#162a45] bg-[#0a192f] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 lg:px-8">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mesclar-gold/40 bg-mesclar-gold/10 text-mesclar-gold">
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/75">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

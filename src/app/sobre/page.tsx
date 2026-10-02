import { prisma } from "@/lib/prisma";

export const metadata = { title: "Sobre" };

const DEFAULT_ABOUT = `Mesclar Logística é uma plataforma digital de marketplace pertencente à empresa Licenciados do Atlântico criada para reunir Know-How e Consultoria especializada em logística, procurement, importação, armazém, frotas, supply chain e tecnologia aplicada ao sector.

Expomos nesta plataforma, elementos de realce promocional e direcionado da área como, os perfis de profissionais do sector como parte de galeria de consulta para os recrutadores e pessoas com interesse de exploração do capital humano rolados no sector, bem como a publicação e divulgações de e-books e livros físicos e seus autores ligados aos temas da cadeia logística, higiene e segurança de trabalho, Plataformas de Produção, Tecnologias Integradas à Gestão Interna e Melhorias de Processos, desde Normas ISO e Leads que figuram a cadeia de abastecimento, com processo de aprovação administrativa e fluxo operacional.

Nossa missão, passa pela expansão dos elementos que agregam a maturidade operacional e de decisão institucional sobre a área.

Os nossos valores elevam-se na qualidade de resultados que sustentam valores operacionais e sociais. Tal que, a promoção do conhecimento e seus actores revelam o nosso compromisso em alinhar a academia junto das instituições operantes para revitalizar esta qualidade que se recomenda e se procura dia a dia no fluxo e na dinâmica operacional.

Por fim os nossos alvos são todos autores e instituições que estejam comprometidas na revolução operacional e no seguimento de modelos que precisam encontrar espaços de ação, medindo sua métrica científica e a elevada eficiência recomendada.`;

export default async function AboutPage() {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "default" } })
    .catch(() => null);

  const aboutText = settings?.aboutText || DEFAULT_ABOUT;
  const paragraphs = aboutText.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="text-3xl font-bold">Sobre a Mesclar</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-mesclar-muted text-justify">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-justify">{p}</p>
        ))}
      </div>
    </div>
  );
}

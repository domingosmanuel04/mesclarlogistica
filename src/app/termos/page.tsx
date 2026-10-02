import { Metadata } from "next";
import {
  FileText,
  AlertOctagon,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso",
  description:
    "Termos e Condições de Uso da Plataforma MESCLAR LOGÍSTICA para Utilizadores.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mesclar-cream/40 via-white to-mesclar-cream/20 dark:from-[#060d1a] dark:via-[#0A192F] dark:to-[#060d1a] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* CABEÇALHO */}
        <div className="surface-card p-8 sm:p-10 text-center relative overflow-hidden rounded-3xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] shadow-md transition-colors">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-mesclar-gold/10 blur-3xl" />
          <div className="inline-flex items-center gap-2 rounded-full bg-mesclar-gold/15 dark:bg-mesclar-gold/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mesclar-black dark:text-mesclar-gold border border-mesclar-gold/30">
            <FileText className="h-4 w-4 text-mesclar-gold-dark dark:text-mesclar-gold" />
            Regulamento Legal & Condições de Serviço
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight text-mesclar-black dark:text-white leading-tight">
            Termos e Condições de Uso da Plataforma MESCLAR LOGÍSTICA para Utilizadores
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-mesclar-muted dark:text-slate-300 max-w-2xl mx-auto">
            Plataforma MESCLAR LOGÍSTICA para Utilizadores e Empresas.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-mesclar-cream/60 dark:bg-[#0E223F] px-4 py-2 text-xs font-semibold text-mesclar-black dark:text-slate-200 border border-mesclar-border/70 dark:border-[#1e3a5f]">
            <Calendar className="h-4 w-4 text-mesclar-gold-dark" />
            <span>Última atualização: <strong>10 de Outubro de 2026</strong></span>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="surface-card p-6 sm:p-10 rounded-3xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] shadow-sm space-y-10 dark:text-slate-200 text-mesclar-black">
          
          {/* CLAÚSULA 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                1
              </span>
              Aceitação dos Termos
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                Ao criar uma conta profissional, aceder ou utilizar a plataforma MESCLAR LOGÍSTICA, o utilizador declara que leu, compreendeu e aceita integralmente os presentes Termos e Condições de Uso.
              </p>
              <p>
                A pessoa responsável pelo registo declara possuir poderes suficientes para se auto representar e aceitar estes Termos em seu próprio nome.
              </p>
              <p>
                Caso a pessoa não concorde com qualquer disposição destes Termos, deverá interromper imediatamente a utilização da plataforma.
              </p>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 font-medium">
                A MESCLAR LOGÍSTICA poderá atualizar estes Termos periodicamente, sendo responsabilidade do utilizador consultar a versão mais recente disponível.
              </p>
            </div>
          </section>

          {/* CLAÚSULA 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                2
              </span>
              Sobre a Plataforma
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A MESCLAR LOGÍSTICA é uma plataforma tecnológica B2C/C2B/C2C comunicacional e comercial destinada a facilitar a descoberta, apresentação, comunicação e conexão entre profissionais, autores, centros de formações, eventos, parceiros comerciais e outros participantes do ecossistema.
              </p>
              <p className="font-semibold text-mesclar-black dark:text-white">
                A plataforma permite, entre outras funcionalidades:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 text-xs font-medium">
                {[
                  "Apresentação de perfil de profissionais da área Logística, compras, armazém e transportes.",
                  "Divulgação de produtos e serviços individuais.",
                  "Criação de perfis profissionais digitais.",
                  "Pesquisa e descoberta de fornecedores de consultorias.",
                  "Comunicação entre empresas e profissionais.",
                  "Geração de oportunidades comerciais de materiais digitais.",
                  "Acesso a funcionalidades comerciais e analíticas.",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl border border-mesclar-border/60 dark:border-[#1e3a5f] p-3 bg-slate-50/50 dark:bg-[#0E223F]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-mesclar-gold-dark mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <p className="rounded-xl border border-mesclar-gold/30 bg-mesclar-gold/5 dark:bg-[#0E223F] p-4 text-xs font-medium dark:text-slate-200">
                A MESCLAR LOGÍSTICA atua como estrutura virtual de conexão profissional e não como distribuidor, comprador ou vendedor dos produtos e serviços apresentados pelos utilizadores registados na plataforma. Qualquer negociação comercial, contrato, pagamento, entrega, garantia ou relação jurídica estabelecida entre utilizadores ocorre exclusivamente entre as partes envolvidas.
              </p>
            </div>
          </section>

          {/* CLAÚSULA 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                3
              </span>
              Cadastro e Conta
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                Para utilizar determinados serviços da plataforma, a pessoa individual deverá criar uma conta e fornecer informações corretas, completas e atualizadas.
              </p>
              <p className="font-semibold text-mesclar-black dark:text-white">A pessoa individual poderá fornecer informações como:</p>
              <ul className="text-xs space-y-1.5 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200 bg-slate-50/50 dark:bg-[#0E223F] p-4 rounded-2xl border border-mesclar-border/60 dark:border-[#1e3a5f]">
                <li>Nome Individual</li>
                <li>Dados institucionais anteriores ou actuais</li>
                <li>Produtos e serviços</li>
                <li>Capacidade produtiva</li>
                <li>Fotografias</li>
                <li>Certificações</li>
                <li>Documentação empresarial</li>
                <li>Contactos profissionais</li>
              </ul>
              <p>
                A empresa ou pessoa individual é integralmente responsável pela autenticidade, legalidade e atualização das informações disponibilizadas.
              </p>
              <p className="font-semibold text-mesclar-black dark:text-white">A pessoa individual compromete-se a:</p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Manter a confidencialidade das suas credenciais de acesso</li>
                <li>Não partilhar acessos de forma indevida</li>
                <li>Informar imediatamente qualquer utilização não autorizada da conta.</li>
              </ul>
              <p className="text-xs text-mesclar-muted dark:text-slate-400">
                A MESCLAR não será responsável por prejuízos resultantes da utilização indevida das credenciais pela própria Pessoa ou por terceiros autorizados pela plataforma.
              </p>
            </div>
          </section>

          {/* CLAÚSULA 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                4
              </span>
              Utilização Permitida da Plataforma
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A empresa compromete-se a utilizar a MESCLAR exclusivamente para fins Profissionais legítimos.
              </p>
              <p className="font-semibold text-mesclar-black dark:text-white">São permitidas atividades como:</p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Divulgação institucional</li>
                <li>Apresentação de produtos e serviços</li>
                <li>Procura e desenvolvimento de oportunidades comerciais</li>
                <li>Comunicação com parceiros empresariais</li>
                <li>Participação em processos comerciais dentro da plataforma.</li>
              </ul>

              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 p-4 space-y-2">
                <p className="font-bold text-xs text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 text-rose-600" />
                  É proibido:
                </p>
                <ul className="text-xs text-rose-800 dark:text-rose-300 space-y-1 list-disc list-inside">
                  <li>Publicar informações falsas, enganosas ou fraudulentas</li>
                  <li>Apresentar produtos ou serviços inexistentes</li>
                  <li>Utilizar a plataforma para práticas ilegais.</li>
                  <li>Violar direitos de terceiros.</li>
                  <li>Copiar ou extrair dados de outras empresas ou pessoas sem autorização</li>
                  <li>Comprometer a segurança ou funcionamento da plataforma</li>
                  <li>Realizar engenharia reversa ou tentativa de acesso não autorizado aos sistemas.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CLAÚSULA 5 & 6 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  5
                </span>
                Responsabilidade das Empresas e pessoas Utilizadoras
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                Cada empresa, centro profissional ou pessoa individual é exclusivamente responsável pelas informações, produtos, serviços e conteúdos publicados na plataforma.
              </p>
              <p className="text-xs font-semibold text-mesclar-black dark:text-white">O utilizador declara que:</p>
              <ul className="text-xs text-mesclar-gray dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Possui autorização para divulgar os conteúdos enviados.</li>
                <li>Não viola direitos de propriedade intelectual de terceiros.</li>
                <li>Cumpre todas as leis e regulamentações aplicáveis ao seu setor de atividade.</li>
                <li>Possui capacidade legal para comercializar os produtos e serviços apresentados.</li>
              </ul>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 pt-1">
                A MESCLAR LOGÍSTICA poderá solicitar documentos ou informações adicionais para validação do perfil quando necessário.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  6
                </span>
                Verificação Empresarial e Selo de Confiança
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                A MESCLAR poderá disponibilizar mecanismos de validação profissional incluindo análise documental e atribuição de indicadores de confiança.
              </p>
              <p className="text-xs font-semibold text-mesclar-black dark:text-white">A validação poderá considerar elementos como:</p>
              <ul className="text-xs text-mesclar-gray dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Documentação Pessoal ou institucional</li>
                <li>Informações institucionais</li>
                <li>Dados fornecidos pela instituição</li>
                <li>Outros critérios internos de avaliação</li>
              </ul>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                O selo de confiança ou qualquer indicador de validação significa apenas que determinados dados foram analisados pela MESCLAR segundo os seus procedimentos internos.
              </p>
              <div className="text-xs space-y-1 rounded-xl bg-mesclar-cream/40 dark:bg-[#0A192F] p-3 border border-mesclar-border/60 dark:border-[#1e3a5f]">
                <strong className="block text-mesclar-black dark:text-white">Isto não representa:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-mesclar-muted dark:text-slate-300">
                  <li>Certificação premium</li>
                  <li>Garantia absoluta de qualidade</li>
                  <li>Garantia financeira</li>
                  <li>Garantia de cumprimento contratual</li>
                  <li>Responsabilidade pela atuação comercial do utilizador.</li>
                </ul>
              </div>
            </section>
          </div>

          {/* CLAÚSULA 7 & 8 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  7
                </span>
                Conteúdos Publicados pelas pessoas individuais
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                Ao disponibilizar conteúdos na plataforma, incluindo textos, imagens, catálogos ou informações comerciais, a instituição ou o profissional concede à MESCLAR LOGÍSTICA uma licença limitada, não exclusiva e gratuita para utilização desses conteúdos exclusivamente para:
              </p>
              <ul className="text-xs text-mesclar-gray dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Operação da plataforma</li>
                <li>Apresentação do perfil profissional</li>
                <li>Divulgação dentro do ecossistema MESCLAR LOGÍSTICA.</li>
                <li>Promoção comercial da plataforma</li>
              </ul>
              <p className="text-xs font-semibold text-mesclar-black dark:text-white pt-1">
                A marca mantém todos os direitos sobre sua utilização.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  8
                </span>
                Propriedade Intelectual da MESCLAR LOGÍSTICA
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                Todos os elementos da plataforma, incluindo: Marca MESCLAR LOGÍSTICA, Software, Código, Design, Interface, Base tecnológica, Estrutura de dados, Algoritmos e Sistemas de pesquisa e organização da informação, são propriedade da MESCLAR MESCLAR/LICENCIADOS DO ATLANTICO, encontram-se devidamente catalogados e licenciados.
              </p>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 pt-1">
                A utilização da plataforma não concede à marca qualquer direito de propriedade sobre estes elementos.
              </p>
            </section>
          </div>

          {/* CLAÚSULA 9 & 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                9
              </span>
              Serviços, Planos e Pagamentos
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A MESCLAR poderá disponibilizar as modalidades de utilização, que inclui:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Funcionalidades gratuitas</li>
                <li>Planos de subscrição</li>
                <li>Serviços Anual</li>
                <li>Serviços adicionais de visibilidade</li>
                <li>Relatórios ou ferramentas comerciais</li>
              </ul>
              <p>
                Os valores aplicáveis serão apresentados previamente ao utilizador. Os pagamentos deverão ser realizados conforme as condições contratadas.
              </p>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 font-medium">
                A falta de pagamento poderá resultar na suspensão temporária ou encerramento de funcionalidades associadas ao serviço. Impostos, taxas ou encargos legalmente aplicáveis serão suportados conforme legislação vigente.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                10
              </span>
              Comunicação e Relações Comerciais entre Profissionais
            </h2>
            <div className="text-sm leading-relaxed space-y-2 text-mesclar-gray dark:text-slate-300">
              <p>
                A MESCLAR disponibiliza ferramentas para facilitar comunicação entre profissionais, bem como entre consumidores e requsitantes de serviços.
              </p>
              <p>
                Os utentes comprometem-se a utilizar estes canais de forma profissional e respeitosa.
              </p>
              <div className="rounded-xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50/50 dark:bg-[#0E223F] p-4 text-xs space-y-2">
                <p className="font-semibold text-mesclar-black dark:text-white">
                  A MESCLAR LOGÍSTICS não participa automaticamente nas negociações realizadas entre Consumidores e Profissionais comerciantes dos seus serviços ou artigos e não assume responsabilidade por:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-mesclar-muted dark:text-slate-300">
                  <li>Preços acordados</li>
                  <li>Qualidade dos serviços</li>
                  <li>Prazos de entrega</li>
                  <li>Pagamentos</li>
                  <li>Garantias</li>
                  <li>Cumprimento contratual.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CLAÚSULA 11 a 16 */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-4 space-y-1 bg-slate-50 dark:bg-[#0E223F]">
              <strong className="text-sm font-bold text-mesclar-black dark:text-white block">11. Agentes e Parceiros Comerciais</strong>
              <p className="text-mesclar-gray dark:text-slate-300">Quando aplicável, agentes ou parceiros comerciais autorizados poderão atuar como facilitadores de conexão empresarial.</p>
              <p className="text-mesclar-gray dark:text-slate-300">Os agentes não representam legalmente a MESCLAR LOGÍSTICA, salvo mediante autorização formal.</p>
              <p className="text-mesclar-gray dark:text-slate-300">A atuação dos agentes deverá respeitar estes Termos e as regras comerciais estabelecidas pela plataforma.</p>
            </div>

            <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-4 space-y-1 bg-slate-50 dark:bg-[#0E223F]">
              <strong className="text-sm font-bold text-mesclar-black dark:text-white block">12. Limitação de Responsabilidade</strong>
              <p className="text-mesclar-gray dark:text-slate-300">A MESCLAR LOGÍSTICA esforça-se para disponibilizar uma plataforma segura, funcional e confiável. Contudo, a Mesclar Logística reconhece que informações publicadas por terceiros são da responsabilidade dos respetivos autores, a validação não elimina todos os riscos de exposição e a plataforma não garante resultados comerciais específicos.</p>
              <p className="text-mesclar-gray dark:text-slate-300">A MESCLAR LOGÍSTICA não será responsável por perdas indiretas, perda de lucros, danos comerciais resultantes de relações entre empresas, informações incorretas fornecidas por utilizadores ou atuação de indivíduos burladores.</p>
            </div>

            <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-4 space-y-1 bg-slate-50 dark:bg-[#0E223F]">
              <strong className="text-sm font-bold text-mesclar-black dark:text-white block">13. Privacidade e Proteção de Dados</strong>
              <p className="text-mesclar-gray dark:text-slate-300">O uso da plataforma está sujeito à nossa Política de Privacidade. A MESCLAR LOGÍSTICA poderá recolher e tratar dados necessários exclusivamente ao funcionamento da plataforma, incluindo dados pessoais, dados de contacto profissional, informações comerciais, documentos submetidos e dados de utilização da plataforma.</p>
              <p className="text-mesclar-gray dark:text-slate-300">O tratamento será realizado conforme a legislação aplicável, incluindo as normas de proteção de dados vigentes.</p>
            </div>

            <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-4 space-y-1 bg-slate-50 dark:bg-[#0E223F]">
              <strong className="text-sm font-bold text-mesclar-black dark:text-white block">14. Confidencialidade de Informações</strong>
              <p className="text-mesclar-gray dark:text-slate-300">A MESCLAR LOGÍSTICA procurará proteger informações pessoais disponibilizadas pelos utilizadores.</p>
              <p className="text-mesclar-gray dark:text-slate-300">Informações identificadas como privadas ou confidenciais não serão divulgadas publicamente sem autorização, com excepção quando exigido por lei.</p>
            </div>

            <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-4 space-y-1 bg-slate-50 dark:bg-[#0E223F]">
              <strong className="text-sm font-bold text-mesclar-black dark:text-white block">15. Rescisão de Conta</strong>
              <p className="text-mesclar-gray dark:text-slate-300">A MESCLAR LOGÍSTICA poderá suspender ou encerrar contas pessoais quando identificar violação destes Termos, informações falsas, atividades fraudulentas, uso abusivo da plataforma, riscos de segurança ou violação de direitos de terceiros.</p>
              <p className="text-mesclar-gray dark:text-slate-300">O utilizador poderá solicitar o encerramento da sua conta através dos canais oficiais disponibilizados.</p>
            </div>

            <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-4 space-y-1 bg-slate-50 dark:bg-[#0E223F]">
              <strong className="text-sm font-bold text-mesclar-black dark:text-white block">16. Disponibilidade da Plataforma</strong>
              <p className="text-mesclar-gray dark:text-slate-300">A MESCLAR LOGÍSTICA garante elevada disponibilidade e desempenho da plataforma.</p>
              <p className="text-mesclar-gray dark:text-slate-300">Entretanto, poderão ocorrer interrupções temporárias quando necessária devido a manutenção, atualizações, melhorias técnicas ou problemas externos de privacidade e estrutura digital.</p>
            </div>
          </div>

          {/* CLAÚSULA 17: ALTERAÇÕES NOS TERMOS E ANUIDADE */}
          <section className="rounded-2xl border border-mesclar-gold/40 bg-mesclar-gold/10 dark:bg-[#0E223F] p-6 space-y-3">
            <h2 className="text-lg font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                17
              </span>
              Alterações nos Termos
            </h2>
            <div className="text-sm leading-relaxed space-y-2 text-mesclar-gray dark:text-slate-300">
              <p>
                A MESCLAR LOGÍSTICA poderá alterar estes Termos sempre que necessário.
              </p>
              <p>
                Alterações relevantes poderão ser comunicadas através da plataforma ou por meios digitais disponíveis.
              </p>
              <div className="rounded-xl border border-mesclar-gold/50 bg-white dark:bg-[#0A192F] p-4 text-xs font-semibold text-mesclar-black dark:text-slate-200 space-y-1 shadow-sm">
                <p>
                  A continuidade de utilização da plataforma após a publicação das alterações representa aceitação dos novos Termos e do pagamento da taxa de <strong>12.000,00 AOA</strong> valor anual de utilização e manutenção.
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ★ Este valor tem efeito de pagamento apenas após período experimental de 120 dias de uso.
                </p>
              </div>
            </div>
          </section>

          {/* CLAÚSULA 18: LEGISLAÇÃO APLICÁVEL */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                18
              </span>
              Legislação Aplicável
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                Estes Termos são regulados pela legislação da do código civil e penal adentro das cláusulas de confidencialidade e uso normal por via dos objectivos da criação da plataforma.
              </p>
              <p>
                Qualquer conflito relacionado com a utilização da plataforma será preferencialmente resolvido através de negociação entre utilizadores lesados e utilizadores Infractores desde que identificados e comprovados as ações com impactos beligerantes.
              </p>
              <p className="text-xs font-semibold text-mesclar-black dark:text-slate-200">
                Caso não seja possível uma solução amigável, serão competentes à <strong>Tribunal da Comarca de Luanda</strong>.
              </p>
            </div>
          </section>

          {/* CLAÚSULA 19: CONTATO */}
          <section className="rounded-3xl border border-mesclar-gold/40 bg-gradient-to-br from-mesclar-gold/15 via-mesclar-cream/30 to-white dark:from-[#0E223F] dark:via-[#0A192F] dark:to-[#0A192F] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mesclar-gold text-mesclar-black font-black shadow-sm">
                19
              </span>
              <div>
                <h2 className="text-lg font-black text-mesclar-black dark:text-white">
                  Contato
                </h2>
                <p className="text-xs text-mesclar-muted dark:text-slate-300">
                  Para dúvidas, solicitações ou reclamações relacionadas com estes Termos:
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <a
                href="mailto:suporte@mesclarlogistica.com"
                className="flex items-center gap-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0E223F] p-4 text-xs font-bold text-mesclar-black dark:text-white hover:border-mesclar-gold transition shadow-xs"
              >
                <Mail className="h-5 w-5 text-mesclar-gold-dark" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-mesclar-muted dark:text-slate-400 font-semibold">
                    E-mail
                  </span>
                  <span>suporte@mesclarlogistica.com</span>
                </div>
              </a>

              <a
                href="tel:+244921522885"
                className="flex items-center gap-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0E223F] p-4 text-xs font-bold text-mesclar-black dark:text-white hover:border-mesclar-gold transition shadow-xs"
              >
                <Phone className="h-5 w-5 text-mesclar-gold-dark" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-mesclar-muted dark:text-slate-400 font-semibold">
                    Telefone
                  </span>
                  <span>+244 921 522 885</span>
                </div>
              </a>
            </div>

            <p className="text-xs text-mesclar-gray dark:text-slate-300 pt-2">
              <strong>Canal de atendimento:</strong> disponível através da plataforma MESCLAR LOGÍSTICA compromete-se a responder às solicitações de forma transparente, profissional e dentro de timings aplicáveis.
            </p>

            <div className="pt-4 border-t border-mesclar-gold/20 text-center sm:text-left space-y-1">
              <p className="text-sm font-black text-mesclar-black dark:text-mesclar-gold">
                MESCLAR LOGÍSTICA
              </p>
              <p className="text-xs font-medium text-mesclar-muted dark:text-slate-300">
                Infraestrutura Digital Industrial B2C/C2B/C2C para conectar profissionais e não só e oportunidades de networking e eventos de conhecimentos que geram valor social.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

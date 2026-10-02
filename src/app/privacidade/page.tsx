import { Metadata } from "next";
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Database,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados",
  description:
    "Política de Privacidade e Proteção de Dados da Plataforma MESCLAR LOGÍSTICA para Profissionais da área e não só.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mesclar-cream/40 via-white to-mesclar-cream/20 dark:from-[#060d1a] dark:via-[#0A192F] dark:to-[#060d1a] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* CABEÇALHO */}
        <div className="surface-card p-8 sm:p-10 text-center relative overflow-hidden rounded-3xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] shadow-md transition-colors">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-mesclar-gold/10 blur-3xl" />
          <div className="inline-flex items-center gap-2 rounded-full bg-mesclar-gold/15 dark:bg-mesclar-gold/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mesclar-black dark:text-mesclar-gold border border-mesclar-gold/30">
            <ShieldCheck className="h-4 w-4 text-mesclar-gold-dark dark:text-mesclar-gold" />
            Proteção de Dados & Privacidade
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight text-mesclar-black dark:text-white leading-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-mesclar-muted dark:text-slate-300 max-w-2xl mx-auto">
            Política de Privacidade e Proteção de Dados da Plataforma MESCLAR LOGÍSTICA para Profssionais da área e não só.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-mesclar-cream/60 dark:bg-[#0E223F] px-4 py-2 text-xs font-semibold text-mesclar-black dark:text-slate-200 border border-mesclar-border/70 dark:border-[#1e3a5f]">
            <Calendar className="h-4 w-4 text-mesclar-gold-dark" />
            <span>Última atualização: <strong>10 de Outubro de 2026</strong></span>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="surface-card p-6 sm:p-10 rounded-3xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] shadow-sm space-y-10 dark:text-slate-200 text-mesclar-black">
          
          {/* SEÇÃO 1: INTRODUÇÃO */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                1
              </span>
              Introdução
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A presente Política de Privacidade e Proteção de Dados estabelece as regras aplicáveis ao tratamento de dados realizado através da plataforma MESCLAR LOGISTICA.
              </p>
              <p>
                A MESCLAR valoriza a privacidade, a segurança da informação e a transparência no tratamento dos dados das empresas utilizadoras, dos seus representantes, colaboradores, parceiros comerciais e demais utilizadores da plataforma.
              </p>
              <p>
                Esta Política aplica-se aos dados recolhidos através da utilização da plataforma, incluindo criação de contas pessoais, utilização de funcionalidades digitais, comunicação entre profissionais e participação no ecossistema B2C/C2B/C2C da cadeia logística.
              </p>
              <div className="rounded-xl border border-mesclar-gold/30 bg-mesclar-gold/5 dark:bg-[#0E223F] p-4 text-xs font-medium dark:text-slate-200">
                O tratamento de dados pessoais será realizado em conformidade com a legislação aplicável na República de Angola, incluindo a <strong>Lei n.º 22/11, de 17 de junho — Lei da Proteção de Dados Pessoais</strong>.
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: RESPONSÁVEL PELO TRATAMENTO DOS DADOS */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                2
              </span>
              Responsável pelo Tratamento dos Dados
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A MESCLAR é responsável pelo tratamento dos dados recolhidos através da plataforma, determinando as finalidades e os meios utilizados para o processamento das informações.
              </p>
              <p>
                A entidade/pessoa individual ou colectiva responsável pela abertura de conta aqui, poderá ser contactada através dos canais oficiais disponibilizados pela plataforma.
              </p>
              <p className="font-semibold text-mesclar-black dark:text-white">
                A MESCLAR LOGÍSTICA compromete-se a tratar os dados de forma lícita, transparente e segura, respeitando os direitos dos titulares dos dados.
              </p>
            </div>
          </section>

          {/* SEÇÃO 3: INFORMAÇÕES QUE RECOLHEMOS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                3
              </span>
              Informações que Recolhemos
            </h2>
            <p className="text-sm text-mesclar-gray dark:text-slate-300">
              A MESCLAR LOGISTICA poderá recolher diferentes tipos de informações necessárias ao funcionamento da plataforma.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* 3.1 */}
              <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0E223F] p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-mesclar-black dark:text-white">
                  <Building2 className="h-4 w-4 text-mesclar-gold-dark shrink-0" />
                  3.1 Dados Empresariais
                </div>
                <p className="text-xs text-mesclar-muted dark:text-slate-400">
                  Podem ser recolhidas informações relacionadas com a empresa, incluindo:
                </p>
                <ul className="text-xs space-y-1 text-mesclar-muted dark:text-slate-300 list-disc list-inside">
                  <li>Nome Individual</li>
                  <li>Setor de atividade</li>
                  <li>Área industrial</li>
                  <li>Produtos e serviços oferecidos</li>
                  <li>Capacidade produtiva</li>
                  <li>Certificações</li>
                  <li>Informações institucionais</li>
                  <li>Fotografias, vídeos e materiais comerciais</li>
                </ul>
                <p className="text-[11px] font-medium text-mesclar-gold-dark dark:text-mesclar-gold pt-1">
                  Estes dados destinam-se à criação e gestão do perfil profissional dentro do ecossistema fucional do perfil do utilizador.
                </p>
              </div>

              {/* 3.2 */}
              <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0E223F] p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-mesclar-black dark:text-white">
                  <UserCheck className="h-4 w-4 text-mesclar-gold-dark shrink-0" />
                  3.2 Dados Pessoais Associados à Empresa
                </div>
                <p className="text-xs text-mesclar-muted dark:text-slate-400">
                  A MESCLAR LOGISTICA poderá recolher dados pessoais de representantes, colaboradores ou utilizadores autorizados/voluntários, incluindo:
                </p>
                <ul className="text-xs space-y-1 text-mesclar-muted dark:text-slate-300 list-disc list-inside">
                  <li>Nome completo</li>
                  <li>Cargo ou função</li>
                  <li>Endereço de e-mail profissional</li>
                  <li>Número de telefone</li>
                  <li>Dados de autenticação</li>
                  <li>Histórico de utilização da plataforma</li>
                  <li>Comunicações realizadas através da plataforma</li>
                </ul>
              </div>

              {/* 3.3 */}
              <div className="rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0E223F] p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-mesclar-black dark:text-white">
                  <Database className="h-4 w-4 text-mesclar-gold-dark shrink-0" />
                  3.3 Dados Técnicos
                </div>
                <p className="text-xs text-mesclar-muted dark:text-slate-400">
                  Poderão ser recolhidas automaticamente informações técnicas, incluindo:
                </p>
                <ul className="text-xs space-y-1 text-mesclar-muted dark:text-slate-300 list-disc list-inside">
                  <li>Endereço IP</li>
                  <li>Tipo de dispositivo</li>
                  <li>Sistema operativo</li>
                  <li>Tipo de navegador</li>
                  <li>Dados de acesso</li>
                  <li>Registos de utilização</li>
                  <li>Informações de segurança e desempenho</li>
                </ul>
                <p className="text-[11px] font-medium text-mesclar-gold-dark dark:text-mesclar-gold pt-1">
                  Estes dados destinam-se à melhoria da experiência, segurança e funcionamento da plataforma.
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: FINALIDADES DO TRATAMENTO */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                4
              </span>
              Finalidades do Tratamento dos Dados
            </h2>
            <p className="text-sm text-mesclar-gray dark:text-slate-300">
              A MESCLAR utiliza os dados recolhidos para as seguintes finalidades:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs font-medium text-mesclar-black dark:text-slate-200">
              {[
                "Criar e gerir contas Pessoais",
                "Disponibilizar funcionalidades da plataforma",
                "Criar perfis profissionais",
                "Facilitar conexões entre profissionais e instituições",
                "Permitir descoberta de fornecedores e parceiros",
                "Apresentar produtos e serviços industriais",
                "Validar informações empresariais",
                "Melhorar os serviços disponibilizados",
                "Personalizar funcionalidades e recomendações",
                "Comunicar atualizações, informações técnicas e comerciais relevantes",
                "Prevenir fraude, utilização abusiva ou acesso não autorizado",
                "Cumprir obrigações legais e regulamentares",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-xl border border-mesclar-border/60 dark:border-[#1e3a5f] p-3 bg-slate-50/50 dark:bg-[#0E223F]/60">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-mesclar-gold-dark mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO 5: DIVULGAÇÃO DE INFORMAÇÃO EMPRESARIAL */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                5
              </span>
              Divulgação de Informação Empresarial
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A empresa reconhece que determinadas informações fornecidas poderão ser apresentadas no seu perfil empresarial dentro da plataforma.
              </p>
              <p>
                Dependendo das configurações escolhidas e funcionalidades utilizadas, poderão ser divulgados:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Nome indicidual</li>
                <li>Descrição institucional</li>
                <li>Produtos e serviços</li>
                <li>Fotografias e vídeos</li>
                <li>Certificações</li>
                <li>Informações comerciais autorizadas</li>
              </ul>
              <p>
                A MESCLAR disponibiliza estas funcionalidades com o objetivo de promover visibilidade profissional e facilitar oportunidades comerciais dentro do ecossistema B2C/C2B/C2C.
              </p>
            </div>
          </section>

          {/* SEÇÃO 6: PARTILHA DE INFORMAÇÕES */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                6
              </span>
              Partilha de Informações
            </h2>
            <p className="text-sm text-mesclar-gray dark:text-slate-300 font-semibold">
              A MESCLAR não cede dados pessoais ou empresariais das empresas utilizadoras.
            </p>
            <div className="space-y-3 text-sm text-mesclar-gray dark:text-slate-300">
              <p>Os dados poderão ser partilhados apenas quando necessário para:</p>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-mesclar-border dark:border-[#1e3a5f] p-4 bg-slate-50 dark:bg-[#0E223F] space-y-2">
                  <strong className="block text-sm text-mesclar-black dark:text-white">6.1 Prestadores de Serviços</strong>
                  <p>A MESCLAR poderá utilizar fornecedores tecnológicos para serviços como:</p>
                  <ul className="list-disc list-inside space-y-1 text-mesclar-muted dark:text-slate-300">
                    <li>Hospedagem</li>
                    <li>Armazenamento de dados</li>
                    <li>Segurança</li>
                    <li>Processamento de pagamentos</li>
                    <li>Análise de desempenho</li>
                    <li>Infraestrutura tecnológica</li>
                  </ul>
                  <p className="font-semibold text-mesclar-gold-dark dark:text-mesclar-gold pt-1">
                    Estes prestadores estarão sujeitos a obrigações de confidencialidade e proteção de dados.
                  </p>
                </div>

                <div className="rounded-xl border border-mesclar-border dark:border-[#1e3a5f] p-4 bg-slate-50 dark:bg-[#0E223F] space-y-1">
                  <strong className="block text-sm text-mesclar-black dark:text-white">6.2 Parceiros Comerciais e Estratégicos</strong>
                  <p>
                    Algumas informações empresariais poderão ser partilhadas com parceiros estratégicos quando autorizado pela empresa ou quando necessário para disponibilização de serviços específicos.
                  </p>
                </div>

                <div className="rounded-xl border border-mesclar-border dark:border-[#1e3a5f] p-4 bg-slate-50 dark:bg-[#0E223F] space-y-1">
                  <strong className="block text-sm text-mesclar-black dark:text-white">6.3 Autoridades Legais</strong>
                  <p>
                    Os dados poderão ser disponibilizados às autoridades competentes quando exigido por lei, decisão judicial ou obrigação regulamentar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 7: SEGURANÇA DOS DADOS */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                7
              </span>
              Segurança dos Dados
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>
                A MESCLAR implementa medidas técnicas e administrativas destinadas a proteger os dados contra:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Acesso não autorizado</li>
                <li>Perda</li>
                <li>Alteração indevida</li>
                <li>Divulgação não autorizada</li>
                <li>Destruição acidental ou ilícita</li>
              </ul>
              <p>As medidas podem incluir:</p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Criptografia de dados sensíveis</li>
                <li>Controlo de acesso baseado em permissões</li>
                <li>Monitorização de segurança</li>
                <li>Registos de atividade</li>
                <li>Backups</li>
                <li>Proteção da infraestrutura tecnológica</li>
              </ul>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 font-medium">
                Apesar das medidas adotadas, nenhum sistema digital pode garantir segurança absoluta. As pessoas devem igualmente proteger as suas credenciais e acessos à plataforma.
              </p>
            </div>
          </section>

          {/* SEÇÃO 8: DIREITOS DOS TITULARES DOS DADOS */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                8
              </span>
              Direitos dos Titulares dos Dados
            </h2>
            <div className="text-sm leading-relaxed space-y-2 text-mesclar-gray dark:text-slate-300">
              <p>
                Os titulares dos dados pessoais associados à utilização possuem, dentro dos limites previstos pela legislação aplicável, os seguintes direitos:
              </p>
              <ul className="text-xs space-y-1.5 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Solicitar informação sobre o tratamento dos seus dados</li>
                <li>Aceder aos dados pessoais armazenados</li>
                <li>Solicitar correção de informações incorretas</li>
                <li>Solicitar atualização dos dados</li>
                <li>Solicitar eliminação quando aplicável</li>
                <li>Opor-se a determinados tratamentos</li>
                <li>Solicitar informações sobre utilização dos seus dados</li>
              </ul>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 pt-1">
                Os pedidos deverão ser realizados através dos canais oficiais da MESCLAR LOGISTICA.
              </p>
            </div>
          </section>

          {/* SEÇÃO 9: COOKIES */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-mesclar-black dark:text-white flex items-center gap-2 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mesclar-gold text-xs font-black text-mesclar-black">
                9
              </span>
              Cookies e Tecnologias Semelhantes
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-mesclar-gray dark:text-slate-300">
              <p>A MESCLAR poderá utilizar cookies e tecnologias semelhantes para:</p>
              <ul className="text-xs space-y-1 list-disc list-inside font-medium text-mesclar-black dark:text-slate-200">
                <li>Garantir funcionamento adequado da plataforma</li>
                <li>Melhorar a experiência do utilizador</li>
                <li>Guardar preferências</li>
                <li>Analisar desempenho</li>
                <li>Melhorar funcionalidades</li>
                <li>Reforçar segurança</li>
              </ul>
              <p className="text-xs text-mesclar-muted dark:text-slate-400">
                O utilizador poderá gerir cookies através das configurações do navegador utilizado. A desativação de determinados cookies poderá limitar algumas funcionalidades da plataforma.
              </p>
            </div>
          </section>

          {/* SEÇÃO 10 & 11 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  10
                </span>
                Conservação dos Dados
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                A MESCLAR conservará os dados apenas durante o período necessário para:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-mesclar-muted dark:text-slate-300">
                <li>Prestação dos serviços contratados</li>
                <li>Funcionamento da plataforma</li>
                <li>Cumprimento de obrigações legais</li>
                <li>Resolução de conflitos</li>
                <li>Proteção dos interesses legítimos da plataforma</li>
              </ul>
              <p className="text-xs text-mesclar-muted dark:text-slate-400">
                Após o período necessário, os dados poderão ser eliminados ou anonimizados de forma segura.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  11
                </span>
                Transferência Internacional de Dados
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                Alguns dados poderão ser armazenados ou tratados através de Licencisdos do Atlantico empresa nacional detentora da marca MESCLAR LOGISTICA. Bem como parceiros que necessitem de prestação de serviços dos profissionais desta plataforma.
              </p>
              <p className="text-xs text-mesclar-muted dark:text-slate-400">
                Estas situações podem ocorrer devido à utilização de:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-mesclar-muted dark:text-slate-300">
                <li>Serviços de infraestrutura tecnológica</li>
                <li>Sistemas de armazenamento</li>
                <li>Ferramentas de segurança</li>
                <li>Serviços digitais internacionais</li>
              </ul>
              <p className="text-xs font-medium text-mesclar-black dark:text-slate-200">
                A MESCLAR LOGISTICA adotará medidas adequadas para garantir níveis apropriados de proteção e segurança dos dados, respeitando a legislação aplicável.
              </p>
            </section>
          </div>

          {/* SEÇÃO 12 & 13 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  12
                </span>
                Incidentes de Segurança
              </h3>
              <p className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300">
                Caso ocorra um incidente de segurança que possa comprometer dados pessoais, a MESCLAR LOGÍSTICA adotará medidas adequadas para:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-mesclar-muted dark:text-slate-300">
                <li>Identificar a origem do incidente</li>
                <li>Limitar impactos</li>
                <li>Reforçar medidas de segurança</li>
                <li>Cumprir eventuais obrigações legais de comunicação.</li>
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] p-5 bg-slate-50/50 dark:bg-[#0E223F]">
              <h3 className="text-base font-bold text-mesclar-black dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mesclar-gold text-xs font-black text-mesclar-black">
                  13
                </span>
                Alterações desta Política
              </h3>
              <div className="text-xs leading-relaxed text-mesclar-gray dark:text-slate-300 space-y-1.5">
                <p>
                  A MESCLAR LOGÍSTICA poderá atualizar esta Política de Privacidade sempre que necessário.
                </p>
                <p>A nova data de atualização será indicada.</p>
                <p>Poderão ser enviados avisos através da plataforma ou por meios digitais disponíveis.</p>
                <p className="font-semibold text-mesclar-gold-dark dark:text-mesclar-gold">
                  Recomenda-se a consulta periódica desta Política.
                </p>
                <p>
                  A utilização contínua da plataforma após alterações representa aceitação da estutura atualizada.
                </p>
              </div>
            </section>
          </div>

          {/* SEÇÃO 14: CONTATO */}
          <section className="rounded-3xl border border-mesclar-gold/40 bg-gradient-to-br from-mesclar-gold/15 via-mesclar-cream/30 to-white dark:from-[#0E223F] dark:via-[#0A192F] dark:to-[#0A192F] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mesclar-gold text-mesclar-black font-black shadow-sm">
                14
              </span>
              <div>
                <h2 className="text-lg font-black text-mesclar-black dark:text-white">
                  Contato
                </h2>
                <p className="text-xs text-mesclar-muted dark:text-slate-300">
                  Para dúvidas, solicitações ou reclamações relacionadas com esta Política de Privacidade:
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <a
                href="mailto:suporte@mesclarlogistica.com"
                className="flex items-center gap-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0E223F] p-4 text-xs font-bold text-mesclar-black dark:text-white hover:border-mesclar-gold transition shadow-xs"
              >
                <Mail className="h-5 w-5 text-mesclar-gold-dark shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-mesclar-muted dark:text-slate-400 font-semibold">
                    E-mail
                  </span>
                  <span className="truncate block">suporte@mesclarlogistica.com</span>
                </div>
              </a>

              <a
                href="tel:+244921522885"
                className="flex items-center gap-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0E223F] p-4 text-xs font-bold text-mesclar-black dark:text-white hover:border-mesclar-gold transition shadow-xs"
              >
                <Phone className="h-5 w-5 text-mesclar-gold-dark shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-mesclar-muted dark:text-slate-400 font-semibold">
                    Telefone
                  </span>
                  <span>+244 921 522 885</span>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0E223F] p-4 text-xs font-bold text-mesclar-black dark:text-white shadow-xs">
                <MessageSquare className="h-5 w-5 text-mesclar-gold-dark shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-mesclar-muted dark:text-slate-400 font-semibold">
                    Canal de Atendimento
                  </span>
                  <span>Disponível na Plataforma</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-medium text-mesclar-gray dark:text-slate-300 pt-2 border-t border-mesclar-gold/20">
              A MESCLAR LOGÍSTICA compromete-se a analisar e responder às solicitações de forma transparente, profissional e dentro dos prazos legalmente aplicáveis.
            </p>

            <div className="pt-2 text-center sm:text-left space-y-1">
              <p className="text-sm font-black text-mesclar-black dark:text-mesclar-gold">
                MESCLAR LOGISTICA
              </p>
              <p className="text-xs font-medium text-mesclar-muted dark:text-slate-300">
                Infraestrutura Digital para uso profissional em modelos B2C/C2B/C2C para conectar Profissionais, empresas e oportunidades de negocios e eventos de conhecimentos que geram valor social.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

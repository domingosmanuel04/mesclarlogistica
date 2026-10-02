"use client";

import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  History,
  Languages,
  Monitor,
  Users,
  Mail,
  StickyNote,
  Award,
  BadgeCheck,
  FolderKanban,
  Wrench,
} from "lucide-react";
import type { MockAuthor } from "@/types";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/utils";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon?: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-mesclar-cream/30 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:shadow-[0_14px_30px_-18px_rgba(10,10,10,0.25)] sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-mesclar-gold/5 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mesclar-gold/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <h2 className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-[0_6px_16px_-8px_rgba(10,10,10,0.6)]">
            <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
          </span>
        )}
        <span className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-mesclar-gold-dark">
          {title}
        </span>
      </h2>
      <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-mesclar-gray sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

type Tab = "perfil" | "reconhecimento" | "projectos";

const tabs: { id: Tab; label: string; icon: typeof Briefcase }[] = [
  { id: "perfil", label: "Perfil", icon: Users },
  { id: "reconhecimento", label: "Reconhecimento e prémios", icon: Award },
  { id: "projectos", label: "Projectos", icon: FolderKanban },
];

export function AuthorProfileTabs({ author }: { author: MockAuthor }) {
  const [tab, setTab] = useState<Tab>("perfil");
  const wa = author.contactWhatsapp?.replace(/\D/g, "");

  return (
    <div>
      <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-mesclar-border/80 bg-white/90 px-5 py-2 backdrop-blur sm:px-8 sm:py-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm",
                active
                  ? "bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold-light shadow-[0_6px_18px_-10px_rgba(10,10,10,0.7)]"
                  : "text-mesclar-muted hover:bg-mesclar-cream/40 hover:text-mesclar-black"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active ? "text-mesclar-gold-light" : "")}
                strokeWidth={active ? 2.1 : 1.8}
              />
              {t.label}
              {active && (
                <span className="absolute -bottom-[1px] left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-mesclar-gold shadow-[0_0_12px_rgba(201,162,39,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {tab === "perfil" && (
        <div className="flex flex-col gap-4 p-5 sm:p-8 md:gap-5">
          {author.bio && (
            <Section icon={Users} title="Sobre mim">
              {author.bio}
            </Section>
          )}

          {author.professionalHistory && (
            <Section icon={History} title="Histórico profissional">
              {author.professionalHistory}
            </Section>
          )}


          {author.academicHistory && (
            <Section icon={GraduationCap} title="Histórico académico">
              {author.academicHistory}
            </Section>
          )}

          {author.references && (
            <Section icon={GraduationCap} title="Referências">
              {author.references}
            </Section>
          )}

          {author.softwareSkills && (
            <Section icon={Monitor} title="Domínio de softwares / ERPs">
              {author.softwareSkills}
            </Section>
          )}

          {author.languages && (
            <Section icon={Languages} title="Domínio de línguas">
              {author.languages}
            </Section>
          )}

          {author.technicalSkills && (
            <Section icon={Wrench} title="Competências técnicas / Hard skills">
              {author.technicalSkills}
            </Section>
          )}

          {author.trainingCertifications && (
            <Section icon={BadgeCheck} title="Formações profissionais">
              {author.trainingCertifications}
            </Section>
          )}

          {(author.contactEmail || author.contactWhatsapp) && (
            <Section icon={Mail} title="Contactos pessoais">
              <ul className="grid gap-3 sm:grid-cols-2">
                {author.contactEmail && (
                  <li>
                    <a
                      href={`mailto:${author.contactEmail}`}
                      className="group flex items-center gap-3 rounded-xl border border-mesclar-border/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-mesclar-black/30 hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mesclar-black/95 text-mesclar-gold-light transition group-hover:bg-mesclar-black">
                        <Mail className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted">
                          Email
                        </p>
                        <p className="truncate text-sm font-semibold text-mesclar-black group-hover:text-mesclar-gold-dark">
                          {author.contactEmail}
                        </p>
                      </div>
                    </a>
                  </li>
                )}
                {author.contactWhatsapp && (
                  <li>
                    <a
                      href={
                        wa
                          ? `https://wa.me/${wa.startsWith("244") ? wa : `244${wa}`}`
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300/80 hover:shadow-[0_10px_24px_-18px_rgba(16,185,129,0.7)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md">
                        <WhatsAppIcon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700/80">
                          WhatsApp
                        </p>
                        <p className="truncate text-sm font-semibold text-emerald-950">
                          {author.contactWhatsapp}
                        </p>
                      </div>
                    </a>
                  </li>
                )}
              </ul>
            </Section>
          )}

          {author.additionalNotes && (
            <Section icon={StickyNote} title="Informações adicionais">
              {author.additionalNotes}
            </Section>
          )}
        </div>
      )}

      {tab === "reconhecimento" && (
        <div className="p-5 sm:p-8">
          {author.awardsRecognition ? (
            <Section icon={Award} title="Reconhecimento e prémios obtidos">
              {author.awardsRecognition}
            </Section>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-mesclar-cream/40 via-white to-mesclar-cream/20 px-6 py-20 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(201,162,39,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/15 blur-3xl" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold/20 via-mesclar-gold/10 to-mesclar-gold/20 text-mesclar-gold-dark shadow-inner ring-1 ring-mesclar-gold/20">
                <Award className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="relative mt-5 text-lg font-bold text-mesclar-black">
                Ainda sem reconhecimentos registados
              </p>
              <p className="relative mt-1.5 mx-auto max-w-sm text-sm text-mesclar-muted">
                Os prémios, distinções e reconhecimentos deste profissional aparecerão aqui em destaque.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "projectos" && (
        <div className="p-5 sm:p-8">
          {author.projects ? (
            <Section icon={FolderKanban} title="Projectos relevantes">
              {author.projects}
            </Section>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-mesclar-cream/40 via-white to-mesclar-cream/20 px-6 py-20 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(201,162,39,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 via-violet-500/8 to-violet-500/15 text-violet-700 shadow-inner ring-1 ring-violet-200">
                <FolderKanban className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="relative mt-5 text-lg font-bold text-mesclar-black">
                Ainda sem projectos registados
              </p>
              <p className="relative mt-1.5 mx-auto max-w-sm text-sm text-mesclar-muted">
                Os projectos mais relevantes e experiências profissionais de destaque aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

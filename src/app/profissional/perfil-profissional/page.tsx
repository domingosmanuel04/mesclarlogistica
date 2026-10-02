"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DashboardShell,
  sellerNav,
  PanelCard,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EMPLOYMENT_LABELS, ACADEMIC_LABELS } from "@/lib/professional";
import type { AcademicStatus, EmploymentStatus } from "@/types";
import {
  ImagePlus,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  FileImage,
  Camera,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const MAX_COVER_MB = 5;

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function PhotoDropzone({
  file,
  previewUrl,
  initialPreview,
  onFile,
  onClear,
  onError,
}: {
  file: File | null;
  previewUrl: string | null;
  initialPreview?: string | null;
  onFile: (file: File | null) => void;
  onClear: () => void;
  onError?: (msg: string) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const activePreview = previewUrl ?? initialPreview ?? null;

  function pick(list: FileList | null) {
    const f = list?.[0] ?? null;
    if (!f) {
      onFile(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      onError?.("A foto de perfil deve ser uma imagem (JPG, PNG ou WebP).");
      return;
    }
    if (f.size > MAX_COVER_MB * 1024 * 1024) {
      onError?.(`Foto excede o limite de ${MAX_COVER_MB} MB.`);
      return;
    }
    onError?.("");
    onFile(f);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-mesclar-gold-dark" />
          <p className="text-sm font-semibold text-mesclar-black">Foto de perfil (Avatar)</p>
        </div>
        <p className="text-[11px] font-medium text-mesclar-muted">
          JPG / PNG / WebP · máx. {MAX_COVER_MB} MB
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-mesclar-cream/30 via-white to-mesclar-cream/20 p-4">
        {/* Círculo do avatar */}
        <div className="relative group shrink-0">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-mesclar-gold/50 shadow-md bg-mesclar-black">
            {activePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activePreview}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-mesclar-gold">
                <User className="h-10 w-10 opacity-70" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-mesclar-gold text-mesclar-black shadow-md transition hover:scale-105 hover:bg-mesclar-gold-light"
            title="Alterar foto"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Detalhes e Ações */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <p className="text-xs font-semibold text-mesclar-black">
            {file ? file.name : (activePreview ? "Foto de perfil carregada" : "Nenhuma foto de perfil definida")}
          </p>
          <p className="text-[11px] text-mesclar-muted">
            Esta foto aparecerá no seu currículo público, no avatar do cabeçalho e no painel.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-mesclar-border bg-white px-3.5 py-1.5 text-xs font-semibold text-mesclar-black shadow-sm transition hover:border-mesclar-gold/60 hover:bg-mesclar-gold/10"
            >
              <Upload className="h-3.5 w-3.5" />
              {activePreview ? "Trocar foto" : "Carregar foto"}
            </button>
            {(file || initialPreview) && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerDropzone({
  file,
  previewUrl,
  initialPreview,
  onFile,
  onClear,
  onError,
}: {
  file: File | null;
  previewUrl: string | null;
  initialPreview?: string | null;
  onFile: (file: File | null) => void;
  onClear: () => void;
  onError?: (msg: string) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const sizeBytes = file?.size ?? 0;
  const sizePct = Math.min(100, (sizeBytes / (MAX_COVER_MB * 1024 * 1024)) * 100);
  const sizeOk = !file || sizeBytes <= MAX_COVER_MB * 1024 * 1024;
  const typeOk = !file || file.type.startsWith("image/");

  const activePreview = previewUrl ?? initialPreview ?? null;

  function pick(list: FileList | null) {
    const f = list?.[0] ?? null;
    if (!f) {
      onFile(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      onError?.("O banner deve ser uma imagem (JPG, PNG ou WebP).");
      return;
    }
    if (f.size > MAX_COVER_MB * 1024 * 1024) {
      onError?.(`Banner excede o limite de ${MAX_COVER_MB} MB.`);
      return;
    }
    onError?.("");
    onFile(f);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 text-mesclar-gold-dark" />
          <p className="text-sm font-semibold text-mesclar-black">Banner de perfil</p>
        </div>
        <p className="text-[11px] font-medium text-mesclar-muted">
          JPG / PNG / WebP · máx. {MAX_COVER_MB} MB
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />

      {!activePreview && !file ? (
        <label
          htmlFor={inputId}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files);
          }}
          className={cn(
            "group relative flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300",
            dragging
              ? "scale-[1.01] border-mesclar-gold bg-mesclar-gold/10 shadow-[0_0_0_4px_rgba(201,162,39,0.15)]"
              : "border-mesclar-border bg-gradient-to-br from-mesclar-cream/60 via-white to-mesclar-cream/30 hover:border-mesclar-gold/60 hover:from-mesclar-gold/5 hover:to-mesclar-gold/[0.02]"
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              dragging && "opacity-100"
            )}
            aria-hidden
          >
            <div className="absolute inset-0 grid-pattern opacity-[0.25]" />
          </div>

          <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-[0_12px_30px_-8px_rgba(10,10,10,0.55)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-2deg]">
            <ImagePlus className="h-9 w-9" strokeWidth={1.75} />
          </span>

          <p className="relative mt-5 text-lg font-bold tracking-tight text-mesclar-black">
            Arraste a imagem aqui
          </p>
          <p className="relative mt-1 text-sm font-medium text-mesclar-muted">
            ou clique para seleccionar o ficheiro
          </p>

          <span className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-mesclar-black px-5 py-2 text-xs font-semibold text-mesclar-gold-light shadow-md transition-all group-hover:bg-mesclar-gray group-hover:shadow-lg">
            <Upload className="h-4 w-4" />
            Escolher imagem
          </span>

          <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-mesclar-gold/15 px-3 py-1 text-[10px] font-semibold text-mesclar-gold-dark sm:flex">
            <AlertCircle className="h-3 w-3" />
            Recomendado: 1920 × 820 px
          </div>
        </label>
      ) : (
        <div className="group relative overflow-hidden rounded-3xl border border-mesclar-border/80 shadow-[0_14px_40px_-22px_rgba(10,10,10,0.45)]">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-mesclar-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePreview!}
              alt="Banner do perfil"
              className={cn(
                "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              )}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {file && (
              <div className="absolute bottom-0 left-0 right-0 space-y-2 px-4 pb-4 sm:px-6 sm:pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700 ring-1 ring-inset ring-emerald-500/30">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {file.name}
                      </p>
                      <p className="text-[11px] font-medium text-white/70">
                        {formatBytes(sizeBytes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/20"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={onClear}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-red-500/35"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-white/80">
                    <span className="flex items-center gap-1.5">
                      {sizeOk && typeOk ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Tamanho dentro do limite
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-400" />
                          Ficheiro inválido
                        </>
                      )}
                    </span>
                    <span>
                      {formatBytes(sizeBytes)} / {MAX_COVER_MB} MB
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        sizePct > 100
                          ? "bg-gradient-to-r from-red-400 to-red-500"
                          : sizePct > 75
                          ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
                          : "bg-gradient-to-r from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark"
                      )}
                      style={{ width: `${Math.min(100, sizePct)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!file && initialPreview && (
              <div className="absolute bottom-0 right-0 flex gap-2 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Trocar banner
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-red-500/40"
                  aria-label="Remover banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {file && (!sizeOk || !typeOk) && (
        <p className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {!typeOk
            ? "Formato inválido. Use JPG, PNG ou WebP."
            : `Ficheiro demasiado grande. Limite: ${MAX_COVER_MB} MB.`}
        </p>
      )}
    </div>
  );
}

export default function SellerProfessionalPage() {
  const { refreshProfile } = useAuth();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [initialCover, setInitialCover] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [initialPhoto, setInitialPhoto] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    bio: "",
    employmentStatus: "" as EmploymentStatus | "",
    academicStatus: "" as AcademicStatus | "",
    academicHistory: "",
    professionalHistory: "",
    softwareSkills: "",
    technicalSkills: "",
    languages: "",
    references: "",
    contactEmail: "",
    contactWhatsapp: "",
    trainingCertifications: "",
    awardsRecognition: "",
    projects: "",
    additionalNotes: "",
  });

  useEffect(() => {
    void fetch("/api/seller/professional")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.id) return;
        setSlug(d.slug);
        if (d.isValidated !== undefined) {
          setIsValidated(Boolean(d.isValidated));
        }
        if (d.coverUrl) {
          setInitialCover(d.coverUrl);
        }
        if (d.photoUrl) {
          setInitialPhoto(d.photoUrl);
        }
        setForm({
          name: d.name ?? "",
          specialty: d.specialty ?? "",
          bio: d.bio ?? "",
          employmentStatus: d.employmentStatus ?? "",
          academicStatus: d.academicStatus ?? "",
          academicHistory: d.academicHistory ?? "",
          professionalHistory: d.professionalHistory ?? "",
          softwareSkills: d.softwareSkills ?? "",
          technicalSkills: d.technicalSkills ?? "",
          languages: d.languages ?? "",
          references: d.references ?? "",
          contactEmail: d.contactEmail ?? "",
          contactWhatsapp: d.contactWhatsapp ?? "",
          trainingCertifications: d.trainingCertifications ?? "",
          awardsRecognition: d.awardsRecognition ?? "",
          projects: d.projects ?? "",
          additionalNotes: d.additionalNotes ?? "",
        });
      });
  }, []);

  const filePreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  );

  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile]
  );

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v ?? ""));
    if (coverFile) fd.set("cover", coverFile);
    if (photoFile) fd.set("photo", photoFile);
    const res = await fetch("/api/seller/professional", { method: "PUT", body: fd });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(json.error || "Erro ao guardar.");
      return;
    }
    setSlug(json.slug);
    if (json.coverUrl) {
      setInitialCover(json.coverUrl);
      setCoverFile(null);
    }
    if (json.photoUrl) {
      setInitialPhoto(json.photoUrl);
      setPhotoFile(null);
    }
    if (json.isValidated !== undefined) {
      setIsValidated(Boolean(json.isValidated));
    }
    await refreshProfile().catch(() => null);
    setMsg("Perfil profissional guardado com sucesso.");
  }

  const [validatingSelf, setValidatingSelf] = useState(false);

  async function handleToggleValidation() {
    if (!slug) return;
    setValidatingSelf(true);
    try {
      const res = await fetch(`/api/authors/${slug}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isValidated ? "unvalidate" : "validate" }),
      });
      const data = await res.json().catch(() => ({}));
      setValidatingSelf(false);
      if (!res.ok) {
        setMsg(data.error || "Não foi possível alterar a validação do perfil.");
        return;
      }
      const nextValidated = Boolean(data.isValidated);
      setIsValidated(nextValidated);
      setMsg(
        nextValidated
          ? "Perfil validado com sucesso! O seu selo de verificação e QR Code estão agora ativos."
          : "Validação do perfil removida."
      );
    } catch {
      setValidatingSelf(false);
      setMsg("Erro de comunicação ao alterar validação.");
    }
  }

  const field = "input-field";
  const labelCls = "block text-sm font-semibold text-mesclar-black";
  const hint = "mt-1 block text-[11px] font-medium text-mesclar-muted";

  return (
    <DashboardShell
      title="Perfil profissional"
      subtitle="Dados públicos em Profissionais do sector"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <PanelCard
        title="Ficha pública"
        action={
          slug && (
            <div className="flex items-center gap-2">
              {isValidated ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Perfil Validado
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleToggleValidation()}
                    disabled={validatingSelf}
                    className="text-[11px] font-semibold text-mesclar-muted hover:text-red-600 underline transition"
                  >
                    {validatingSelf ? "A atualizar..." : "Invalidar"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleToggleValidation()}
                  disabled={validatingSelf}
                  className="inline-flex items-center gap-1.5 rounded-full border border-mesclar-gold/60 bg-gradient-to-r from-mesclar-gold/25 via-mesclar-gold/15 to-white px-3.5 py-1.5 text-xs font-bold text-mesclar-black shadow-sm transition hover:bg-mesclar-gold/30 hover:border-mesclar-gold"
                >
                  <ShieldCheck className="h-4 w-4 text-mesclar-gold-dark" />
                  {validatingSelf ? "A validar..." : "Validar o meu perfil"}
                </button>
              )}
              <Link
                href={`/autores/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-mesclar-border bg-white px-3.5 py-1.5 text-xs font-semibold text-mesclar-black transition hover:border-mesclar-gold/60 hover:bg-mesclar-gold/10"
              >
                Ver página
                <span aria-hidden>↗</span>
              </Link>
            </div>
          )
        }
      >
        <form onSubmit={(e) => void save(e)} className="space-y-6">
          {msg && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold",
                msg.includes("Erro")
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              )}
            >
              {msg.includes("Erro") ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              {msg}
            </div>
          )}

          <PhotoDropzone
            file={photoFile}
            previewUrl={photoPreview}
            initialPreview={initialPhoto}
            onFile={(f) => setPhotoFile(f)}
            onClear={() => {
              setPhotoFile(null);
              setInitialPhoto(null);
            }}
            onError={(m) => setMsg(m)}
          />

          <BannerDropzone
            file={coverFile}
            previewUrl={filePreview}
            initialPreview={initialCover}
            onFile={(f) => {
              setCoverFile(f);
            }}
            onClear={() => {
              setCoverFile(null);
              setInitialCover(null);
            }}
            onError={(m) => setMsg(m)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelCls}>
              Nome completo
              <span className={hint}>Nome que aparece publicamente</span>
              <input
                required
                className={cn("mt-2", field)}
                placeholder="Ex.: João Baptista da Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className={labelCls}>
              Especialidade
              <span className={hint}>Ex.: Supply Chain, Despacho Aduaneiro</span>
              <input
                className={cn("mt-2", field)}
                placeholder="Ex.: Gestor Logístico e Procurement"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelCls}>
              Status profissional
              <select
                className={cn("mt-2", field)}
                value={form.employmentStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employmentStatus: e.target.value as EmploymentStatus | "",
                  })
                }
              >
                <option value="">Seleccionar…</option>
                {(Object.keys(EMPLOYMENT_LABELS) as EmploymentStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {EMPLOYMENT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Status académico
              <select
                className={cn("mt-2", field)}
                value={form.academicStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    academicStatus: e.target.value as AcademicStatus | "",
                  })
                }
              >
                <option value="">Seleccionar…</option>
                {(Object.keys(ACADEMIC_LABELS) as AcademicStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {ACADEMIC_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={labelCls}>
            Sobre / Biografia
            <span className={hint}>Breve apresentação pública do profissional</span>
            <textarea
              rows={5}
              className={cn("mt-2", field)}
              placeholder="Apresente-se, descreva a sua experiência e o que o torna único/a..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </label>

          <div className="rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-mesclar-cream/60 via-white to-mesclar-cream/40 p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-mesclar-gold-dark">
              Dados profissionais
            </p>
            <p className="mt-1 text-xs text-mesclar-muted">
              Estes campos aparecem organizados na sua ficha pública.
            </p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {(
                [
                  ["academicHistory", "Histórico académico", "Instituições de ensino, cursos superiores, licenciaturas, mestrados, anos..."],
                  ["professionalHistory", "Histórico profissional", "Empresas, cargos, anos, resultados..."],
                  ["softwareSkills", "Domínio de softwares / ERPs", "SAP, Odoo, Excel avançado, WMS, TMS..."],
                  ["technicalSkills", "Competências técnicas / Hard skills", "Gestão de armazém, dimensionamento de frotas, negociação de fretes..."],
                  ["languages", "Domínio de línguas", "PT (nativo), EN (C1), FR (B2)..."],
                  ["references", "Referências", "Contactos, empresas atestando..."],
                  ["trainingCertifications", "Formações profissionais", "Diplomas, cursos, certificações obtidas..."],
                  ["awardsRecognition", "Reconhecimento e prémios", "Melhor funcionário, prémios, menções..."],
                  ["projects", "Projectos relevantes", "Projectos logísticos, implementações, melhorias..."],
                  ["additionalNotes", "Informações adicionais", "Outros detalhes que queira partilhar..."],
                ] as const
              ).map(([key, label, ph]) => (
                <label key={key} className={cn(labelCls, key === "trainingCertifications" || key === "additionalNotes" ? "lg:col-span-2" : "")}>
                  {label}
                  <textarea
                    rows={3}
                    className={cn("mt-2", field)}
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-mesclar-border/80 bg-white p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-mesclar-gold-dark">
              Contactos públicos
            </p>
            <p className="mt-1 text-xs text-mesclar-muted">
              Visíveis na sua ficha para contactos comerciais.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className={labelCls}>
                Email
                <input
                  type="email"
                  className={cn("mt-2", field)}
                  placeholder="joao@exemplo.ao"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </label>
              <label className={labelCls}>
                WhatsApp
                <input
                  className={cn("mt-2", field)}
                  value={form.contactWhatsapp}
                  onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                  placeholder="+244 9XX XXX XXX"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={busy}
              className="shadow-lg"
            >
              {busy ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                "Guardar perfil público"
              )}
            </Button>
          </div>
        </form>
      </PanelCard>
    </DashboardShell>
  );
}

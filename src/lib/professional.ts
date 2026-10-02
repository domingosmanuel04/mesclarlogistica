import type { AcademicStatus, EmploymentStatus } from "@/types";

export const EMPLOYMENT_LABELS: Record<EmploymentStatus, string> = {
  EMPLOYED: "Empregado",
  UNEMPLOYED: "Desempregado",
  FREELANCER: "Freelancer",
  ENTREPRENEUR: "Negócio próprio",
};

export const ACADEMIC_LABELS: Record<AcademicStatus, string> = {
  SECONDARY: "Ensino médio",
  UNIVERSITY_ATTENDING: "Frequência universitária",
  BACHELOR: "Licenciatura",
  POSTGRAD: "Pós-graduação",
  MASTERS: "Mestrado",
};

export function employmentLabel(status?: EmploymentStatus | null) {
  return status ? EMPLOYMENT_LABELS[status] : null;
}

export function academicLabel(status?: AcademicStatus | null) {
  return status ? ACADEMIC_LABELS[status] : null;
}

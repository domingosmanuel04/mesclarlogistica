import { createHash } from "crypto";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getAuthorBySlug, listAuthors } from "@/lib/catalog";
import { academicLabel, employmentLabel } from "@/lib/professional";
import type { MockAuthor } from "@/types";
import { existsSync, readFileSync } from "fs";
import path from "path";

const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3020";

/**
 * Generates a stable, verifiable certificate code for an author.
 * Example: MES-PRF-7A8B2C9D
 */
export function generateVerificationCode(authorId: string, slug: string): string {
  const hash = createHash("sha256")
    .update(`mesclar:author:${authorId}:${slug}:verified`)
    .digest("hex")
    .toUpperCase()
    .slice(0, 8);
  return `MES-PRF-${hash}`;
}

/**
 * Returns the public verification URL for scanning.
 */
export function getVerificationUrl(code: string): string {
  return `${appUrl}/validar/${code}`;
}

/**
 * Finds an author by verification code, slug, or ID.
 */
export async function findAuthorByVerificationCode(code: string): Promise<{
  author: MockAuthor;
  certificateId: string;
  verifiedAt: Date;
  isValidated: boolean;
} | null> {
  const cleanCode = code.trim().toUpperCase();
  const allAuthors = await listAuthors();

  for (const author of allAuthors) {
    const expectedCode = generateVerificationCode(author.id, author.slug);
    if (
      cleanCode === expectedCode ||
      cleanCode === author.slug.toUpperCase() ||
      cleanCode === author.id.toUpperCase()
    ) {
      return {
        author,
        certificateId: expectedCode,
        verifiedAt: new Date(
          author.validatedAt ?? (author as unknown as { createdAt?: string | number | Date }).createdAt ?? Date.now()
        ),
        isValidated: Boolean(author.isValidated),
      };
    }
  }

  // Fallback direct slug match
  const bySlug = await getAuthorBySlug(code.toLowerCase());
  if (bySlug) {
    return {
      author: bySlug,
      certificateId: generateVerificationCode(bySlug.id, bySlug.slug),
      verifiedAt: new Date(bySlug.validatedAt ?? Date.now()),
      isValidated: Boolean(bySlug.isValidated),
    };
  }

  return null;
}

/**
 * Generates an official, beautifully styled PDF of the professional profile
 * with an embedded QR code at the end of the PDF, page numbering, and excluding publications.
 */
export async function generateAuthorProfilePdf(author: MockAuthor): Promise<Buffer> {
  const code = generateVerificationCode(author.id, author.slug);
  const verifyUrl = getVerificationUrl(code);

  // Generate QR Code PNG Buffer
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    width: 260,
    margin: 1,
    color: {
      dark: "#0B0B0B",
      light: "#FFFFFF",
    },
  });

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page dimensions: A4 (595.28 x 841.89 pt)
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const black = rgb(0.04, 0.04, 0.04);
  const gold = rgb(0.79, 0.64, 0.15); // #C9A227
  const goldLight = rgb(0.96, 0.93, 0.85);
  const grayDark = rgb(0.25, 0.25, 0.25);
  const grayMuted = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);
  const navyBlue = rgb(0.04, 0.06, 0.18); // Azul marinho muito forte #0A0F2E

  // Embed QR Code
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  // Embed Logo Icon if available
  let logoImage = null;
  const logoPath = path.join(process.cwd(), "public", "icon.png");
  if (existsSync(logoPath)) {
    try {
      const logoBuffer = readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBuffer);
    } catch {
      // ignore
    }
  }

  // --- PAGE 1: Header & Profile Details ---
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  // Top Dark Banner Header (90pt)
  y -= 90;
  page.drawRectangle({
    x: 0,
    y,
    width: pageWidth,
    height: 90,
    color: black,
  });

  // Gold accent bar below banner
  page.drawRectangle({
    x: 0,
    y: y - 4,
    width: pageWidth,
    height: 4,
    color: gold,
  });

  // Header Title & Logo in banner
  if (logoImage) {
    page.drawImage(logoImage, {
      x: margin,
      y: y + 23,
      width: 44,
      height: 44,
    });
  }

  const logoTextX = logoImage ? margin + 52 : margin;
  page.drawText("MESCLAR LOGÍSTICA PROCUREMENT", {
    x: logoTextX,
    y: y + 40,
    size: 12,
    font: fontBold,
    color: gold,
  });

  // Separador vertical dourado entre o título e o "Resumo de Perfil"
  const separatorX = pageWidth - margin - fontBold.widthOfTextAtSize("Resumo de Perfil", 14) - 20;
  page.drawLine({
    start: { x: separatorX, y: y + 22 },
    end: { x: separatorX, y: y + 62 },
    thickness: 1,
    color: gold,
  });

  // Resumo de Perfil — sem borda, sem fundo, tamanho maior
  const resumoText = "Resumo de Perfil";
  const resumoX = separatorX + 10;
  page.drawText(resumoText, {
    x: resumoX,
    y: y + 40,
    size: 14,
    font: fontBold,
    color: white,
  });

  y -= 45; // Espaçamento confortável entre a linha amarela e o nome do profissional

  // --- PROFESSIONAL HEADER CARD ---
  // Name
  page.drawText(author.name, {
    x: margin,
    y,
    size: 22,
    font: fontBold,
    color: black,
  });
  y -= 20;

  // Specialty
  if (author.specialty) {
    page.drawText(author.specialty, {
      x: margin,
      y,
      size: 12,
      font: fontBold,
      color: gold,
    });
    y -= 18;
  }

  // Status & Academia Tags
  const statusStr = employmentLabel(author.employmentStatus) || "Profissional do Setor";
  const academicStr = academicLabel(author.academicStatus) || "Ensino Superior";
  page.drawText(
    `Estatuto: ${statusStr}   |   Formação Académica: ${academicStr}`,
    {
      x: margin,
      y,
      size: 9.5,
      font: fontRegular,
      color: grayDark,
    }
  );
  y -= 16;

  // Contact Info
  const contactParts = [];
  if (author.contactEmail) contactParts.push(`Email: ${author.contactEmail}`);
  if (author.contactWhatsapp) contactParts.push(`WhatsApp: ${author.contactWhatsapp}`);
  if (contactParts.length > 0) {
    page.drawText(contactParts.join("   •   "), {
      x: margin,
      y,
      size: 8.5,
      font: fontRegular,
      color: grayMuted,
    });
    y -= 16;
  }

  // Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.75,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 20;

  // --- HELPER FUNCTION TO DRAW SECTIONS ---
  function drawSection(title: string, content: string | null | undefined) {
    if (!content || !content.trim()) return;

    // Check if new page is needed
    if (y < 90) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;

      // Small top running header
      page.drawText(`Mesclar Logística — ${author.name} (Validação: ${code})`, {
        x: margin,
        y: pageHeight - 30,
        size: 8,
        font: fontRegular,
        color: grayMuted,
      });
      page.drawLine({
        start: { x: margin, y: pageHeight - 35 },
        end: { x: pageWidth - margin, y: pageHeight - 35 },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
    }

    // Section Title
    page.drawRectangle({
      x: margin,
      y: y - 2,
      width: 4,
      height: 14,
      color: gold,
    });
    page.drawText(title.toUpperCase(), {
      x: margin + 10,
      y: y + 2,
      size: 10,
      font: fontBold,
      color: black,
    });
    y -= 18;

    // Word wrap content
    const lines = wrapText(content.trim(), contentWidth - 10, fontRegular, 9);
    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 50;
      }
      page.drawText(line, {
        x: margin + 10,
        y,
        size: 9,
        font: fontRegular,
        color: grayDark,
      });
      y -= 13;
    }
    y -= 12; // gap between sections
  }

  // Sections (EXCLUDING Publicações do profissional)
  drawSection("Resumo e Perfil Profissional", author.bio);
  drawSection("Histórico Académico", author.academicHistory);
  drawSection("Histórico Profissional e Experiência", author.professionalHistory);
  drawSection("Competências de Software e Ferramentas", author.softwareSkills);
  drawSection("Competências Técnicas / Hard Skills", author.technicalSkills);
  drawSection("Formação e Certificações", author.trainingCertifications);
  drawSection("Prémios e Distinções", author.awardsRecognition);
  drawSection("Projectos Desenvolvidos", author.projects);
  drawSection("Idiomas", author.languages);
  drawSection("Referências e Recomendações", author.references);

  // --- VERIFICATION QR CODE & SEAL BOX (Rendered at the END of the PDF) ---
  const qrBoxHeight = 115;
  if (y < qrBoxHeight + 60) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - 50;
  } else {
    y -= 15;
  }

  const qrBoxY = y - qrBoxHeight;

  // Background box — Azul marinho forte com borda dourada
  page.drawRectangle({
    x: margin,
    y: qrBoxY,
    width: contentWidth,
    height: qrBoxHeight,
    color: navyBlue,
    borderColor: gold,
    borderWidth: 1.5,
  });

  // Draw QR Image (fundo branco por baixo do QR para contraste)
  page.drawRectangle({
    x: margin + 13,
    y: qrBoxY + 10,
    width: 94,
    height: 94,
    color: white,
  });
  page.drawImage(qrImage, {
    x: margin + 15,
    y: qrBoxY + 12,
    width: 90,
    height: 90,
  });

  // Seal details next to QR Code
  const qrDetailsX = margin + 120;
  page.drawText("SELO DE VERIFICAÇÃO DE AUTENTICIDADE", {
    x: qrDetailsX,
    y: qrBoxY + 88,
    size: 11,
    font: fontBold,
    color: white,
  });

  page.drawText(`Código de Validação: ${code}`, {
    x: qrDetailsX,
    y: qrBoxY + 70,
    size: 10,
    font: fontBold,
    color: gold,
  });

  page.drawText(
    "Este perfil foi registado e verificado no sistema oficial da Mesclar Logística.",
    {
      x: qrDetailsX,
      y: qrBoxY + 54,
      size: 8.5,
      font: fontRegular,
      color: white,
    }
  );

  page.drawText("Escaneie o QR Code acima para validar a autenticidade em tempo real:", {
    x: qrDetailsX,
    y: qrBoxY + 40,
    size: 8,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95),
  });

  page.drawText(verifyUrl, {
    x: qrDetailsX,
    y: qrBoxY + 26,
    size: 8,
    font: fontBold,
    color: gold,
  });

  const issueDateStr = new Date().toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  page.drawText(`Data de Emissão: ${issueDateStr}`, {
    x: qrDetailsX,
    y: qrBoxY + 12,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.85),
  });

  // --- FOOTER & PAGINATION ON ALL PAGES ---
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    p.drawLine({
      start: { x: margin, y: 40 },
      end: { x: pageWidth - margin, y: 40 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    p.drawText(
      `Perfil autenticado digitalmente. Referência: ${code}`,
      {
        x: margin,
        y: 26,
        size: 7.5,
        font: fontRegular,
        color: grayMuted,
      }
    );

    p.drawText(`Verifique online em: ${verifyUrl}`, {
      x: margin,
      y: 15,
      size: 7.5,
      font: fontBold,
      color: gold,
    });

    p.drawText(`Página ${idx + 1} de ${totalPages}`, {
      x: pageWidth - margin - 65,
      y: 15,
      size: 7.5,
      font: fontRegular,
      color: grayMuted,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Word-wraps text into lines according to maximum width in points.
 */
function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  const paragraphs = text.split("\n");
  const result: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) result.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) result.push(currentLine);
  }

  return result;
}

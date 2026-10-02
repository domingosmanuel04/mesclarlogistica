import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface WatermarkOptions {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
}

/**
 * Adds a discreet, anti-piracy licensing watermark to each page of the eBook PDF.
 */
export async function applyPdfWatermark(
  pdfBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    if (!pages.length) return pdfBuffer;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const dateStr = new Date().toLocaleDateString("pt-AO");
    const watermarkText = `Exemplar licenciado para ${options.customerName} (${options.customerEmail}) • Pedido #${options.orderNumber} • Mesclar Logística (${dateStr})`;

    const fontSize = 7;
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

    for (const page of pages) {
      const { width } = page.getSize();
      // Center the text horizontally or start at left margin if it fits
      const x = Math.max(25, (width - textWidth) / 2);
      const y = 14;

      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
        opacity: 0.75,
      });
    }

    const modifiedBytes = await pdfDoc.save();
    return Buffer.from(modifiedBytes);
  } catch (err) {
    console.warn("[pdf-watermark] Failed to watermark PDF, returning original:", err);
    return pdfBuffer;
  }
}

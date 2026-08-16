import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface GenerateStatementPDFParams {
  customer: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  statementDateStr: string;
  ref: string;
  totalBilled: number;
  totalPaid: number;
  netOutstanding: number;
  entries: Array<{
    dateStr: string;
    ref: string;
    type: "INVOICE" | "PAYMENT";
    description: string;
    debit: number;
    credit: number;
    runningBalance: number;
  }>;
}

export async function generateCustomerStatementPDF(data: GenerateStatementPDFParams): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 Dimensions in points

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Load Store Icon PNG (public/favicon.png)
  let iconEmbed = null;
  try {
    const iconPath = path.join(process.cwd(), "public", "favicon.png");
    if (fs.existsSync(iconPath)) {
      const iconBytes = fs.readFileSync(iconPath);
      iconEmbed = await pdfDoc.embedPng(iconBytes);
    }
  } catch (e) {
    console.warn("Favicon embedding skipped:", e);
  }

  // Theme Palette
  const primaryColor = rgb(0.06, 0.09, 0.16); // #0f172a
  const secondaryColor = rgb(0.28, 0.33, 0.41); // #475569
  const accentBlue = rgb(0.11, 0.31, 0.85); // #1d4ed8
  const greenColor = rgb(0.02, 0.47, 0.34); // #047857
  const redColor = rgb(0.86, 0.15, 0.15); // #dc2626
  const bgLight = rgb(0.97, 0.98, 0.99); // #f8fafc
  const borderColor = rgb(0.8, 0.84, 0.88); // #cbd5e1

  const width = 595.28;
  const height = 841.89;
  const margin = 36;
  const contentWidth = width - margin * 2; // 523.28

  // Header Icon + Title Details
  let titleX = margin;
  if (iconEmbed) {
    const iconSize = 36;
    page.drawImage(iconEmbed, {
      x: margin,
      y: height - 76,
      width: iconSize,
      height: iconSize,
    });
    titleX = margin + iconSize + 10;
  }

  page.drawText("JAYABIMA HARDWARE & STORES", {
    x: titleX,
    y: height - 46,
    size: 14,
    font: fontBold,
    color: primaryColor,
  });

  page.drawText("No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa", {
    x: titleX,
    y: height - 60,
    size: 8.5,
    font: fontRegular,
    color: secondaryColor,
  });

  page.drawText("Tel: 0777187729 / 0362231535", {
    x: titleX,
    y: height - 72,
    size: 8.5,
    font: fontRegular,
    color: secondaryColor,
  });

  // Right-aligned Document Metadata
  const docTitle = "OFFICIAL STATEMENT OF ACCOUNT";
  const docTitleWidth = fontBold.widthOfTextAtSize(docTitle, 10.5);
  page.drawText(docTitle, {
    x: width - margin - docTitleWidth,
    y: height - 46,
    size: 10.5,
    font: fontBold,
    color: accentBlue,
  });

  const dateText = `Date Generated: ${data.statementDateStr}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 8.5);
  page.drawText(dateText, {
    x: width - margin - dateWidth,
    y: height - 60,
    size: 8.5,
    font: fontRegular,
    color: secondaryColor,
  });

  const refText = `Ref: ${data.ref}`;
  const refWidth = fontRegular.widthOfTextAtSize(refText, 8.5);
  page.drawText(refText, {
    x: width - margin - refWidth,
    y: height - 72,
    size: 8.5,
    font: fontRegular,
    color: secondaryColor,
  });

  // Horizontal Rule
  page.drawLine({
    start: { x: margin, y: height - 88 },
    end: { x: width - margin, y: height - 88 },
    thickness: 1,
    color: borderColor,
  });

  // Customer Summary Card Box
  const cardY = height - 165;
  page.drawRectangle({
    x: margin,
    y: cardY,
    width: contentWidth,
    height: 68,
    color: bgLight,
    borderColor: borderColor,
    borderWidth: 1,
  });

  page.drawText("STATEMENT FOR CUSTOMER", {
    x: margin + 10,
    y: cardY + 52,
    size: 8,
    font: fontBold,
    color: secondaryColor,
  });

  page.drawText(data.customer.name, {
    x: margin + 10,
    y: cardY + 36,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });

  let custInfoY = cardY + 22;
  if (data.customer.phone) {
    page.drawText(`Phone: ${data.customer.phone}`, { x: margin + 10, y: custInfoY, size: 8.5, font: fontRegular, color: secondaryColor });
    custInfoY -= 11;
  }
  if (data.customer.email) {
    page.drawText(`Email: ${data.customer.email}`, { x: margin + 10, y: custInfoY, size: 8.5, font: fontRegular, color: secondaryColor });
  }

  // Financial Metric Tiles
  const tileW = 88;
  const tileH = 48;
  const tileY = cardY + 10;
  const startX = margin + 240;

  // Billed Tile
  page.drawRectangle({ x: startX, y: tileY, width: tileW, height: tileH, color: rgb(1, 1, 1), borderColor, borderWidth: 1 });
  page.drawText("TOTAL BILLED", { x: startX + 12, y: tileY + 34, size: 7.5, font: fontBold, color: secondaryColor });
  page.drawText(`LKR ${data.totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, { x: startX + 6, y: tileY + 16, size: 8.5, font: fontBold, color: primaryColor });

  // Paid Tile
  page.drawRectangle({ x: startX + 93, y: tileY, width: tileW, height: tileH, color: rgb(1, 1, 1), borderColor, borderWidth: 1 });
  page.drawText("TOTAL PAID", { x: startX + 93 + 16, y: tileY + 34, size: 7.5, font: fontBold, color: secondaryColor });
  page.drawText(`LKR ${data.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, { x: startX + 93 + 6, y: tileY + 16, size: 8.5, font: fontBold, color: greenColor });

  // Net Owed Tile
  page.drawRectangle({ x: startX + 186, y: tileY, width: tileW, height: tileH, color: rgb(1, 1, 1), borderColor, borderWidth: 1 });
  page.drawText("NET OWED", { x: startX + 186 + 20, y: tileY + 34, size: 7.5, font: fontBold, color: secondaryColor });
  page.drawText(`LKR ${data.netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, { x: startX + 186 + 6, y: tileY + 16, size: 8.5, font: fontBold, color: data.netOutstanding > 0 ? redColor : greenColor });

  // Table Header
  let currentY = height - 192;

  const drawTableHeader = (p: typeof page, posY: number) => {
    p.drawRectangle({ x: margin, y: posY - 14, width: contentWidth, height: 18, color: rgb(0.94, 0.96, 0.98) });
    p.drawText("DATE", { x: margin + 6, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
    p.drawText("REF #", { x: margin + 66, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
    p.drawText("TYPE", { x: margin + 131, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
    p.drawText("DESCRIPTION", { x: margin + 176, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
    p.drawText("DEBIT (+)", { x: margin + 331, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
    p.drawText("CREDIT (-)", { x: margin + 396, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
    p.drawText("BALANCE", { x: margin + 461, y: posY - 10, size: 8, font: fontBold, color: secondaryColor });
  };

  drawTableHeader(page, currentY);
  currentY -= 20;

  // Render Ledger Rows
  data.entries.forEach((entry, idx) => {
    if (currentY < 45) {
      page = pdfDoc.addPage([595.28, 841.89]);
      currentY = height - 45;
      drawTableHeader(page, currentY);
      currentY -= 20;
    }

    if (idx % 2 === 1) {
      page.drawRectangle({ x: margin, y: currentY - 12, width: contentWidth, height: 16, color: bgLight });
    }

    page.drawText(entry.dateStr, { x: margin + 6, y: currentY - 8, size: 8, font: fontRegular, color: primaryColor });
    page.drawText(entry.ref, { x: margin + 66, y: currentY - 8, size: 7.5, font: fontRegular, color: secondaryColor });

    // Type Tag
    page.drawText(entry.type === "INVOICE" ? "INV" : "PAY", {
      x: margin + 131,
      y: currentY - 8,
      size: 8,
      font: fontBold,
      color: entry.type === "INVOICE" ? accentBlue : greenColor,
    });

    // Description
    const descText = entry.description.length > 32 ? entry.description.slice(0, 30) + "..." : entry.description;
    page.drawText(descText, { x: margin + 176, y: currentY - 8, size: 8, font: fontRegular, color: secondaryColor });

    // Debit
    const debitText = entry.debit > 0 ? `LKR ${entry.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-";
    page.drawText(debitText, { x: margin + 331, y: currentY - 8, size: 8, font: fontRegular, color: primaryColor });

    // Credit
    const creditText = entry.credit > 0 ? `LKR ${entry.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-";
    page.drawText(creditText, { x: margin + 396, y: currentY - 8, size: 8, font: fontBold, color: greenColor });

    // Running Balance
    const balText = `LKR ${entry.runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    page.drawText(balText, { x: margin + 461, y: currentY - 8, size: 8, font: fontBold, color: primaryColor });

    currentY -= 18;
  });

  // Footer Rule & Disclaimer
  if (currentY < 40) {
    page = pdfDoc.addPage([595.28, 841.89]);
    currentY = height - 45;
  }

  page.drawLine({
    start: { x: margin, y: currentY - 6 },
    end: { x: width - margin, y: currentY - 6 },
    thickness: 0.5,
    color: borderColor,
  });

  page.drawText("Please review your account statement. If you have questions regarding any transaction, please contact Jayabima Hardware.", {
    x: margin,
    y: currentY - 20,
    size: 7.5,
    font: fontRegular,
    color: secondaryColor,
  });

  const netText = `Net Outstanding: LKR ${data.netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const netWidth = fontBold.widthOfTextAtSize(netText, 8.5);
  page.drawText(netText, {
    x: width - margin - netWidth,
    y: currentY - 20,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

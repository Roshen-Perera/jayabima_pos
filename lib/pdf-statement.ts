import PDFDocument from "pdfkit";

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

export function generateCustomerStatementPDF(data: GenerateStatementPDFParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Color definitions
    const primaryColor = "#0f172a";
    const secondaryColor = "#475569";
    const accentBlue = "#1d4ed8";
    const greenColor = "#047857";
    const redColor = "#dc2626";

    // Header Branding
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("JAYABIMA HARDWARE & STORES", 36, 36);

    doc
      .fillColor(secondaryColor)
      .fontSize(9)
      .font("Helvetica")
      .text("No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa", 36, 56)
      .text("Tel: 0777187729 / 0362231535", 36, 68);

    // Right-aligned Document Title & Metadata
    doc
      .fillColor(accentBlue)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("OFFICIAL STATEMENT OF ACCOUNT", 300, 36, { align: "right" });

    doc
      .fillColor(secondaryColor)
      .fontSize(9)
      .font("Helvetica")
      .text(`Date Generated: ${data.statementDateStr}`, 300, 52, { align: "right" })
      .text(`Ref: ${data.ref}`, 300, 66, { align: "right" });

    // Divider Line
    doc
      .moveTo(36, 88)
      .lineTo(559, 88)
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .stroke();

    // Customer Info Card
    doc.rect(36, 96, 523, 68).fillAndStroke("#f8fafc", "#cbd5e1");

    doc
      .fillColor(secondaryColor)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("STATEMENT FOR CUSTOMER", 46, 104);

    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(data.customer.name, 46, 116);

    let infoY = 132;
    if (data.customer.phone) {
      doc.fillColor(secondaryColor).fontSize(8.5).font("Helvetica").text(`Phone: ${data.customer.phone}`, 46, infoY);
      infoY += 11;
    }
    if (data.customer.email) {
      doc.fillColor(secondaryColor).fontSize(8.5).font("Helvetica").text(`Email: ${data.customer.email}`, 46, infoY);
    }

    // Financial Metric Tiles
    const tileW = 88;
    const tileH = 48;
    const startX = 275;
    const tileY = 106;

    // Tile 1: Total Billed
    doc.rect(startX, tileY, tileW, tileH).fillAndStroke("#ffffff", "#cbd5e1");
    doc.fillColor(secondaryColor).fontSize(7.5).font("Helvetica-Bold").text("TOTAL BILLED", startX, tileY + 6, { width: tileW, align: "center" });
    doc.fillColor(primaryColor).fontSize(9.5).font("Helvetica-Bold").text(`LKR ${data.totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, startX + 2, tileY + 22, { width: tileW - 4, align: "center" });

    // Tile 2: Total Paid
    doc.rect(startX + 93, tileY, tileW, tileH).fillAndStroke("#ffffff", "#cbd5e1");
    doc.fillColor(secondaryColor).fontSize(7.5).font("Helvetica-Bold").text("TOTAL PAID", startX + 93, tileY + 6, { width: tileW, align: "center" });
    doc.fillColor(greenColor).fontSize(9.5).font("Helvetica-Bold").text(`LKR ${data.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, startX + 95, tileY + 22, { width: tileW - 4, align: "center" });

    // Tile 3: Net Owed
    doc.rect(startX + 186, tileY, tileW, tileH).fillAndStroke("#ffffff", "#cbd5e1");
    doc.fillColor(secondaryColor).fontSize(7.5).font("Helvetica-Bold").text("NET OWED", startX + 186, tileY + 6, { width: tileW, align: "center" });
    doc.fillColor(data.netOutstanding > 0 ? redColor : greenColor).fontSize(9.5).font("Helvetica-Bold").text(`LKR ${data.netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, startX + 188, tileY + 22, { width: tileW - 4, align: "center" });

    // Table Header
    let y = 178;

    const drawTableHeader = (posY: number) => {
      doc.rect(36, posY, 523, 18).fill("#f1f5f9");
      doc.fillColor("#334155").fontSize(8).font("Helvetica-Bold");
      doc.text("DATE", 42, posY + 5, { width: 60 });
      doc.text("REF #", 102, posY + 5, { width: 65 });
      doc.text("TYPE", 167, posY + 5, { width: 45 });
      doc.text("DESCRIPTION", 212, posY + 5, { width: 155 });
      doc.text("DEBIT (+)", 367, posY + 5, { width: 60, align: "right" });
      doc.text("CREDIT (-)", 427, posY + 5, { width: 60, align: "right" });
      doc.text("BALANCE", 487, posY + 5, { width: 65, align: "right" });
    };

    drawTableHeader(y);
    y += 22;

    // Table Rows
    doc.font("Helvetica").fontSize(8);

    data.entries.forEach((entry, idx) => {
      if (y > 750) {
        doc.addPage();
        y = 36;
        drawTableHeader(y);
        y += 22;
      }

      if (idx % 2 === 1) {
        doc.rect(36, y - 2, 523, 18).fill("#f8fafc");
      }

      doc.fillColor(primaryColor).text(entry.dateStr, 42, y, { width: 60 });
      doc.fillColor(secondaryColor).text(entry.ref, 102, y, { width: 65 });

      // Type
      doc
        .fillColor(entry.type === "INVOICE" ? accentBlue : greenColor)
        .font("Helvetica-Bold")
        .text(entry.type === "INVOICE" ? "INV" : "PAY", 167, y, { width: 45 });

      // Description
      doc
        .font("Helvetica")
        .fillColor(secondaryColor)
        .text(entry.description, 212, y, { width: 150, height: 14 });

      // Debit
      doc
        .fillColor(primaryColor)
        .text(entry.debit > 0 ? `LKR ${entry.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-", 367, y, { width: 60, align: "right" });

      // Credit
      doc
        .fillColor(greenColor)
        .font("Helvetica-Bold")
        .text(entry.credit > 0 ? `LKR ${entry.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-", 427, y, { width: 60, align: "right" });

      // Balance
      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text(`LKR ${entry.runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 487, y, { width: 65, align: "right" });

      y += 18;
    });

    // Footer Summary
    if (y > 740) {
      doc.addPage();
      y = 36;
    }

    doc
      .moveTo(36, y + 10)
      .lineTo(559, y + 10)
      .strokeColor("#cbd5e1")
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor(secondaryColor)
      .fontSize(8)
      .font("Helvetica")
      .text("Please review your account statement. If you have questions regarding any transaction, please contact Jayabima Hardware.", 36, y + 18, { width: 340 });

    doc
      .fillColor(primaryColor)
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .text(`Net Outstanding: LKR ${data.netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 380, y + 18, { width: 175, align: "right" });

    doc.end();
  });
}

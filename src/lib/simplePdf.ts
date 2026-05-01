function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function wrapLine(line: string, maxLength = 92) {
  const words = line.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export function createSimplePdfBase64(title: string, body: string) {
  const rawLines = [title, "", ...body.split("\n")];
  const lines = rawLines.flatMap((line) => wrapLine(line));
  const pageHeight = 792;
  const marginTop = 740;
  const lineHeight = 14;
  const linesPerPage = 46;
  const pages: string[] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    const pageLines = lines.slice(index, index + linesPerPage);
    const stream = [
      "BT",
      "/F1 10 Tf",
      "50 740 Td",
      ...pageLines.flatMap((line, lineIndex) => {
        const escaped = escapePdfText(line);
        return lineIndex === 0 ? [`(${escaped}) Tj`] : [`0 -${lineHeight} Td`, `(${escaped}) Tj`];
      }),
      "ET"
    ].join("\n");
    pages.push(stream);
  }

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`
  ];

  pages.forEach((stream, index) => {
    const pageObjectNumber = 3 + index * 2;
    const streamObjectNumber = pageObjectNumber + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${streamObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8").toString("base64");
}

type BrandedPdfBlock =
  | { type: "hero"; title: string; subtitle: string; metric: string; label: string }
  | { type: "stat"; label: string; value: string; note: string }
  | { type: "bar"; label: string; value: string; percent: number; note: string }
  | { type: "section"; title: string }
  | { type: "text"; text: string };

function pdfText(value: string) {
  return escapePdfText(value).slice(0, 130);
}

function rect(x: number, y: number, width: number, height: number, color: string) {
  return `${color} rg\n${x} ${y} ${width} ${height} re f`;
}

function text(x: number, y: number, value: string, size = 10, color = "0.07 0.09 0.13") {
  return `BT\n${color} rg\n/F1 ${size} Tf\n${x} ${y} Td\n(${pdfText(value)}) Tj\nET`;
}

function wrappedText(x: number, y: number, value: string, maxLength = 82, size = 10, color = "0.25 0.30 0.38") {
  return wrapLine(value, maxLength).slice(0, 4).map((line, index) => text(x, y - index * 14, line, size, color));
}

export function createBrandedPdfBase64(blocks: BrandedPdfBlock[]) {
  const pageHeight = 792;
  const pageWidth = 612;
  const pages: string[] = [];
  let commands: string[] = [];
  let y = 740;

  function beginPage() {
    commands = [
      rect(0, 0, pageWidth, pageHeight, "0.98 0.98 0.98"),
      rect(0, 746, pageWidth, 46, "0.07 0.09 0.13"),
      rect(0, 738, pageWidth, 8, "0.98 0.45 0.09"),
      text(42, 764, "AI SDR by AnutechLabs", 16, "1 1 1"),
      text(430, 764, "Sales Automation Audit", 9, "0.98 0.73 0.45")
    ];
    y = 705;
  }

  function closePage() {
    commands.push(text(42, 28, "Thanks & Regards, AI SDR- Anutech Labs | Website: https://anutechlabs.company/", 8, "0.35 0.39 0.46"));
    pages.push(commands.join("\n"));
  }

  function ensureSpace(required = 90) {
    if (y - required < 58) {
      closePage();
      beginPage();
    }
  }

  beginPage();

  for (const block of blocks) {
    if (block.type === "hero") {
      ensureSpace(170);
      commands.push(rect(42, y - 128, 528, 132, "0.07 0.09 0.13"));
      commands.push(rect(42, y - 128, 8, 132, "0.98 0.45 0.09"));
      commands.push(text(64, y - 34, block.title, 22, "1 1 1"));
      commands.push(...wrappedText(64, y - 58, block.subtitle, 74, 10, "0.85 0.88 0.92"));
      commands.push(text(390, y - 54, block.metric, 26, "0.98 0.45 0.09"));
      commands.push(text(392, y - 76, block.label, 9, "0.85 0.88 0.92"));
      y -= 160;
    }

    if (block.type === "stat") {
      ensureSpace(78);
      commands.push(rect(42, y - 58, 160, 64, "1 1 1"));
      commands.push(rect(42, y - 58, 4, 64, "0.98 0.45 0.09"));
      commands.push(text(56, y - 16, block.label.toUpperCase(), 8, "0.98 0.45 0.09"));
      commands.push(text(56, y - 36, block.value, 18, "0.07 0.09 0.13"));
      commands.push(text(56, y - 50, block.note, 8, "0.35 0.39 0.46"));
      y -= 76;
    }

    if (block.type === "section") {
      ensureSpace(44);
      commands.push(text(42, y, block.title, 18, "0.07 0.09 0.13"));
      commands.push(rect(42, y - 10, 528, 2, "0.98 0.45 0.09"));
      y -= 34;
    }

    if (block.type === "bar") {
      ensureSpace(58);
      const barWidth = Math.max(8, Math.min(310, Math.round(310 * (block.percent / 100))));
      commands.push(text(42, y, block.label, 11, "0.07 0.09 0.13"));
      commands.push(text(420, y, block.value, 11, "0.07 0.09 0.13"));
      commands.push(rect(42, y - 20, 310, 10, "0.88 0.90 0.94"));
      commands.push(rect(42, y - 20, barWidth, 10, "0.98 0.45 0.09"));
      commands.push(...wrappedText(42, y - 38, block.note, 90, 8, "0.35 0.39 0.46"));
      y -= 58;
    }

    if (block.type === "text") {
      ensureSpace(60);
      const lines = wrappedText(42, y, block.text, 90, 10, "0.25 0.30 0.38");
      commands.push(...lines);
      y -= lines.length * 14 + 14;
    }
  }

  closePage();

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`
  ];

  pages.forEach((stream, index) => {
    const pageObjectNumber = 3 + index * 2;
    const streamObjectNumber = pageObjectNumber + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${streamObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8").toString("base64");
}

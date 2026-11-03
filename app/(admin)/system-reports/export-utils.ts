import jsPDF from "jspdf";
import autoTable, { type CellHookData, type RowInput } from "jspdf-autotable";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeightRule,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TabStopType,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import * as XLSX from "xlsx";

import type { SystemReportResult } from "@/lib/types/report";

import {
  FLAG_COLORS,
  REPORT_ASSETS,
  REPORT_IDENTITY,
  REPORT_TYPE_LABELS,
  STATUS_PDF_RGB,
  formatDate,
  formatDateTime,
  formatPlace,
  formatRange,
  formatStatus,
  getComplaintRows,
  getMeetingRows,
  getStatusTone,
  includesComplaints,
  includesMeetings,
  reportFileName,
} from "./report-config";

/* -------------------------------------------------------------------------- */
/*  Shared                                                                    */
/* -------------------------------------------------------------------------- */

type RGB = [number, number, number];

const COLOR = {
  green: [14, 107, 47] as RGB,
  blue: [0, 102, 153] as RGB,
  gold: [212, 160, 23] as RGB,
  ink: [30, 41, 59] as RGB,
  muted: [100, 116, 139] as RGB,
  line: [226, 232, 240] as RGB,
  soft: [244, 247, 250] as RGB,
};

const HEX = {
  green: "0E6B2F",
  blue: "006699",
  ink: "1E293B",
  muted: "64748B",
  line: "E2E8F0",
  soft: "F4F7FA",
  zebra: "F7F9FB",
};

function rgbToHex([r, g, b]: RGB) {
  return [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function hexToRgb(hex: string): RGB {
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function reportTitle(result: SystemReportResult) {
  return `${REPORT_TYPE_LABELS[result.type]} Report`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/* -------------------------------------------------------------------------- */
/*  Logos                                                                     */
/* -------------------------------------------------------------------------- */

interface LoadedImage {
  dataUrl: string;
  bytes: Uint8Array;
  width: number;
  height: number;
  format: "PNG" | "JPEG";
}

export interface ReportLogos {
  coat: LoadedImage | null;
  council: LoadedImage | null;
}

const imageCache = new Map<string, Promise<LoadedImage | null>>();

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function measureImage(dataUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = dataUrl;
  });
}

async function fetchImage(url: string): Promise<LoadedImage | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const [buffer, dataUrl] = await Promise.all([blob.arrayBuffer(), blobToDataUrl(blob)]);
    const { width, height } = await measureImage(dataUrl);

    return {
      dataUrl,
      bytes: new Uint8Array(buffer),
      width,
      height,
      format: blob.type.includes("jpeg") || blob.type.includes("jpg") ? "JPEG" : "PNG",
    };
  } catch {
    return null;
  }
}

/** Cached per session; a failed load is retried on the next export. */
function loadImage(url: string) {
  let pending = imageCache.get(url);
  if (!pending) {
    pending = fetchImage(url).then((image) => {
      if (!image) imageCache.delete(url);
      return image;
    });
    imageCache.set(url, pending);
  }
  return pending;
}

export async function loadReportLogos(): Promise<ReportLogos> {
  const [coat, council] = await Promise.all([
    loadImage(REPORT_ASSETS.coatOfArms),
    loadImage(REPORT_ASSETS.councilLogo),
  ]);
  return { coat, council };
}

function fit(image: LoadedImage, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
  return { width: image.width * ratio, height: image.height * ratio };
}

/* -------------------------------------------------------------------------- */
/*  Table data (one definition feeds PDF, Word and Excel)                     */
/* -------------------------------------------------------------------------- */

interface TableSpec {
  title: string;
  note: string;
  head: string[];
  body: string[][];
  tones: ReturnType<typeof getStatusTone>[];
  statusCol: number;
  emptyText: string;
}

function buildTables(result: SystemReportResult) {
  const tables: { complaints?: TableSpec; meetings?: TableSpec } = {};

  if (includesComplaints(result)) {
    const rows = getComplaintRows(result);
    tables.complaints = {
      title: `Citizen Complaints (${result.complaintsTotal})`,
      note:
        rows.length < result.complaintsTotal
          ? `Showing ${rows.length} of ${result.complaintsTotal}`
          : `${result.complaintsTotal} record${result.complaintsTotal === 1 ? "" : "s"}`,
      head: ["#", "Reference", "Name", "Village / Ward", "Status", "Created"],
      body: rows.map((row, index) => [
        String(index + 1),
        row.referenceNumber,
        row.fullName?.trim() || "—",
        formatPlace(row.village, row.ward),
        formatStatus(row.status),
        formatDate(row.createdAt),
      ]),
      tones: rows.map((row) => getStatusTone(row.status)),
      statusCol: 4,
      emptyText: "No citizen complaints were recorded in this period.",
    };
  }

  if (includesMeetings(result)) {
    const rows = getMeetingRows(result);
    tables.meetings = {
      title: `Meetings (${result.meetingsTotal})`,
      note:
        rows.length < result.meetingsTotal
          ? `Showing ${rows.length} of ${result.meetingsTotal}`
          : `${result.meetingsTotal} record${result.meetingsTotal === 1 ? "" : "s"}`,
      head: ["#", "Title", "Status", "Scheduled", "Participants", "Created"],
      body: rows.map((row, index) => [
        String(index + 1),
        row.title,
        formatStatus(row.status),
        formatDate(row.scheduledStartAt),
        String(row.participantCount ?? 0),
        formatDate(row.createdAt),
      ]),
      tones: rows.map((row) => getStatusTone(row.status)),
      statusCol: 2,
      emptyText: "No meetings were recorded in this period.",
    };
  }

  return tables;
}

function summaryItems(result: SystemReportResult) {
  const items: { label: string; value: number; color: RGB }[] = [];
  if (includesComplaints(result)) {
    items.push({ label: "Citizen complaints", value: result.complaintsTotal, color: COLOR.green });
  }
  if (includesMeetings(result)) {
    items.push({ label: "Meetings", value: result.meetingsTotal, color: COLOR.blue });
  }
  return items;
}

function metaItems(result: SystemReportResult) {
  return [
    { label: "Report type", value: REPORT_TYPE_LABELS[result.type] },
    { label: "Reporting period", value: formatRange(result.range.startDate, result.range.endDate) },
    { label: "Generated on", value: formatDateTime() },
  ];
}

/* -------------------------------------------------------------------------- */
/*  PDF                                                                       */
/* -------------------------------------------------------------------------- */

const PAGE = { width: 210, height: 297, margin: 14 };
const PDF_WIDTHS = {
  complaints: [10, 32, 44, 50, 24, 22],
  meetings: [10, 62, 24, 30, 26, 30],
};

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

function drawLetterhead(doc: jsPDF, logos: ReportLogos) {
  const { width, margin } = PAGE;
  const top = 10;
  const boxW = 30;
  const boxH = 27;
  const centerX = width / 2;

  if (logos.coat) {
    const size = fit(logos.coat, boxW, boxH);
    doc.addImage(
      logos.coat.dataUrl,
      logos.coat.format,
      margin,
      top + (boxH - size.height) / 2,
      size.width,
      size.height,
      undefined,
      "FAST",
    );
  }

  if (logos.council) {
    const size = fit(logos.council, boxW, boxH);
    doc.addImage(
      logos.council.dataUrl,
      logos.council.format,
      width - margin - size.width,
      top + (boxH - size.height) / 2,
      size.width,
      size.height,
      undefined,
      "FAST",
    );
  }

  const textWidth = width - margin * 2 - boxW * 2 - 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLOR.ink);
  doc.text(REPORT_IDENTITY.republic, centerX, top + 5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...COLOR.muted);
  const ministryLines = doc.splitTextToSize(REPORT_IDENTITY.ministry, textWidth) as string[];
  doc.text(ministryLines, centerX, top + 10.5, { align: "center", lineHeightFactor: 1.25 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(...COLOR.green);
  doc.text(REPORT_IDENTITY.council, centerX, top + 10.5 + ministryLines.length * 3.5 + 5.5, {
    align: "center",
  });

  // Flag-colour band
  const bandY = top + boxH + 3;
  const segment = (width - margin * 2) / FLAG_COLORS.length;
  FLAG_COLORS.forEach((hex, index) => {
    doc.setFillColor(...hexToRgb(hex));
    doc.rect(margin + segment * index, bandY, segment, 1.6, "F");
  });

  return bandY + 1.6;
}

function drawTitleBlock(doc: jsPDF, result: SystemReportResult, startY: number) {
  const { width, margin } = PAGE;
  const contentWidth = width - margin * 2;
  let y = startY + 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLOR.ink);
  doc.text(reportTitle(result).toUpperCase(), width / 2, y, { align: "center" });

  y += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text(REPORT_IDENTITY.system, width / 2, y, { align: "center" });

  // Meta box
  y += 6;
  const boxH = 17;
  doc.setFillColor(...COLOR.soft);
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");

  const items = metaItems(result);
  const columnWidth = contentWidth / items.length;
  items.forEach((item, index) => {
    const x = margin + columnWidth * index + 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR.muted);
    doc.text(item.label.toUpperCase(), x, y + 5.8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.ink);
    doc.text(item.value, x, y + 11.8, { maxWidth: columnWidth - 8 });
  });

  // Summary tiles
  y += boxH + 6;
  const tiles = summaryItems(result);
  const gap = 6;
  const tileWidth =
    tiles.length === 1 ? 88 : (contentWidth - gap * (tiles.length - 1)) / tiles.length;
  const tileH = 18;

  tiles.forEach((tile, index) => {
    const x = margin + (tileWidth + gap) * index;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLOR.line);
    doc.roundedRect(x, y, tileWidth, tileH, 2, 2, "FD");
    doc.setFillColor(...tile.color);
    doc.roundedRect(x, y, 2.2, tileH, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...tile.color);
    doc.text(String(tile.value), x + 8, y + 10.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.muted);
    doc.text(tile.label, x + 8, y + 15);
  });

  return y + tileH + 9;
}

function drawRunningHeader(doc: jsPDF, logos: ReportLogos) {
  const { width, margin } = PAGE;
  let textX = margin;

  if (logos.coat) {
    const size = fit(logos.coat, 10, 10);
    doc.addImage(logos.coat.dataUrl, logos.coat.format, margin, 6, size.width, size.height, undefined, "FAST");
    textX = margin + size.width + 3;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.green);
  doc.text(REPORT_IDENTITY.council, textX, 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.muted);
  doc.text("System Report", width - margin, 10.5, { align: "right" });

  doc.setDrawColor(...COLOR.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, 17, width - margin, 17);
}

function drawSectionHeading(doc: jsPDF, spec: TableSpec, y: number) {
  const { width, margin } = PAGE;
  doc.setFillColor(...COLOR.green);
  doc.rect(margin, y - 3.8, 1.4, 5.4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.ink);
  doc.text(spec.title, margin + 4, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.muted);
  doc.text(spec.note, width - margin, y, { align: "right" });

  return y + 3.5;
}

function drawTable(
  doc: PdfDoc,
  spec: TableSpec,
  widths: number[],
  startY: number,
  onNewPage: () => void,
) {
  const body: RowInput[] = spec.body.length
    ? spec.body
    : [
        [
          {
            content: spec.emptyText,
            colSpan: spec.head.length,
            styles: {
              halign: "center",
              textColor: COLOR.muted,
              fontStyle: "italic",
              cellPadding: 6,
            },
          },
        ],
      ];

  const columnStyles = Object.fromEntries(
    widths.map((cellWidth, index) => [
      index,
      { cellWidth, halign: index === 0 ? ("center" as const) : ("left" as const) },
    ]),
  );

  autoTable(doc, {
    startY,
    head: [spec.head],
    body,
    theme: "grid",
    margin: { left: PAGE.margin, right: PAGE.margin, top: 24, bottom: 20 },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.4,
      textColor: COLOR.ink,
      lineColor: COLOR.line,
      lineWidth: 0.15,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: COLOR.green,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineColor: COLOR.green,
    },
    alternateRowStyles: { fillColor: [247, 249, 251] },
    columnStyles,
    didParseCell: (data: CellHookData) => {
      if (data.section === "body" && data.column.index === spec.statusCol) {
        const tone = spec.tones[data.row.index];
        if (tone) {
          data.cell.styles.textColor = STATUS_PDF_RGB[tone];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: (data: { pageNumber: number }) => {
      if (data.pageNumber > 1) onNewPage();
    },
  });

  return (doc.lastAutoTable?.finalY ?? startY) + 9;
}

function drawSignatures(doc: jsPDF, y: number) {
  const { width, margin } = PAGE;
  const columnWidth = 80;
  const labels = ["Prepared by", "Approved by"];

  labels.forEach((label, index) => {
    const x = index === 0 ? margin : width - margin - columnWidth;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.ink);
    doc.text(label, x, y);

    doc.setDrawColor(...COLOR.muted);
    doc.setLineWidth(0.2);
    doc.line(x, y + 14, x + columnWidth, y + 14);
    doc.line(x, y + 26, x + columnWidth, y + 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.muted);
    doc.text("Name, title and signature", x, y + 18);
    doc.text("Date", x, y + 30);
  });
}

function drawFooters(doc: jsPDF) {
  const { width, height, margin } = PAGE;
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setDrawColor(...COLOR.line);
    doc.setLineWidth(0.25);
    doc.line(margin, height - 14, width - margin, height - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.muted);
    doc.text(
      `${REPORT_IDENTITY.council}  |  ${REPORT_IDENTITY.system}`,
      margin,
      height - 9,
    );
    doc.text(`Page ${page} of ${pageCount}`, width - margin, height - 9, { align: "right" });
  }
}

export async function buildPdf(result: SystemReportResult): Promise<jsPDF> {
  const logos = await loadReportLogos();
  const doc: PdfDoc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setProperties({
    title: `${reportTitle(result)} – ${formatRange(result.range.startDate, result.range.endDate)}`,
    subject: "System report",
    author: REPORT_IDENTITY.council,
    creator: REPORT_IDENTITY.system,
  });

  const letterheadBottom = drawLetterhead(doc, logos);
  let y = drawTitleBlock(doc, result, letterheadBottom);

  const headerDrawn = new Set<number>();
  const onNewPage = () => {
    const page = doc.getCurrentPageInfo().pageNumber;
    if (headerDrawn.has(page)) return;
    headerDrawn.add(page);
    drawRunningHeader(doc, logos);
  };

  const tables = buildTables(result);

  for (const [key, widths] of [
    ["complaints", PDF_WIDTHS.complaints],
    ["meetings", PDF_WIDTHS.meetings],
  ] as const) {
    const spec = tables[key];
    if (!spec) continue;

    // Keep a heading together with at least the start of its table.
    if (y > PAGE.height - 60) {
      doc.addPage();
      onNewPage();
      y = 28;
    }

    y = drawSectionHeading(doc, spec, y);
    y = drawTable(doc, spec, widths, y, onNewPage);
  }

  if (y > PAGE.height - 60) {
    doc.addPage();
    onNewPage();
    y = 28;
  }
  drawSignatures(doc, y + 6);

  drawFooters(doc);
  return doc;
}

export async function exportPdfDownload(result: SystemReportResult) {
  const doc = await buildPdf(result);
  doc.save(reportFileName(result, "pdf"));
}

/** Remember to URL.revokeObjectURL() the result when the preview closes. */
export async function exportPdfPreviewUrl(result: SystemReportResult): Promise<string> {
  const doc = await buildPdf(result);
  return URL.createObjectURL(doc.output("blob"));
}

/* -------------------------------------------------------------------------- */
/*  Word (.docx)                                                              */
/* -------------------------------------------------------------------------- */

const DOCX_CONTENT_WIDTH = 9906; // A4 (11906) minus 2 × 1000 twips margins
const DOCX_WIDTHS = {
  complaints: [500, 1800, 2300, 2500, 1300, 1506],
  meetings: [500, 3400, 1300, 1700, 1500, 1506],
};

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const CELL_NO_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
};
const TABLE_NO_BORDERS = {
  ...CELL_NO_BORDERS,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER,
};
const THIN = { style: BorderStyle.SINGLE, size: 4, color: HEX.line };
const CELL_THIN_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

function docxImage(image: LoadedImage, maxPx: number) {
  const size = fit(image, maxPx, maxPx);
  return new ImageRun({
    data: image.bytes,
    transformation: { width: Math.round(size.width), height: Math.round(size.height) },
  });
}

function docxText(
  text: string,
  options: {
    bold?: boolean;
    italics?: boolean;
    size?: number; // half-points
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    before?: number;
    after?: number;
  } = {},
) {
  return new Paragraph({
    alignment: options.align ?? AlignmentType.LEFT,
    spacing: { before: options.before ?? 0, after: options.after ?? 0 },
    children: [
      new TextRun({
        text,
        bold: options.bold,
        italics: options.italics,
        size: options.size ?? 20,
        color: options.color ?? HEX.ink,
      }),
    ],
  });
}

function docxLetterhead(logos: ReportLogos) {
  const sides = [1900, DOCX_CONTENT_WIDTH - 3800, 1900];

  const letterhead = new Table({
    width: { size: DOCX_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: sides,
    borders: TABLE_NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: sides[0], type: WidthType.DXA },
            borders: CELL_NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: logos.coat ? [docxImage(logos.coat, 96)] : [],
              }),
            ],
          }),
          new TableCell({
            width: { size: sides[1], type: WidthType.DXA },
            borders: CELL_NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              docxText(REPORT_IDENTITY.republic, {
                bold: true,
                size: 24,
                align: AlignmentType.CENTER,
                after: 40,
              }),
              docxText(REPORT_IDENTITY.ministry, {
                size: 15,
                color: HEX.muted,
                align: AlignmentType.CENTER,
                after: 80,
              }),
              docxText(REPORT_IDENTITY.council, {
                bold: true,
                size: 27,
                color: HEX.green,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: sides[2], type: WidthType.DXA },
            borders: CELL_NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: logos.council ? [docxImage(logos.council, 96)] : [],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Flag-colour band
  const segment = Math.floor(DOCX_CONTENT_WIDTH / FLAG_COLORS.length);
  const band = new Table({
    width: { size: segment * FLAG_COLORS.length, type: WidthType.DXA },
    columnWidths: FLAG_COLORS.map(() => segment),
    borders: TABLE_NO_BORDERS,
    rows: [
      new TableRow({
        height: { value: 70, rule: HeightRule.EXACT },
        children: FLAG_COLORS.map(
          (hex) =>
            new TableCell({
              width: { size: segment, type: WidthType.DXA },
              borders: CELL_NO_BORDERS,
              shading: { type: ShadingType.CLEAR, color: "auto", fill: hex },
              children: [new Paragraph({ children: [new TextRun({ text: "", size: 2 })] })],
            }),
        ),
      }),
    ],
  });

  return [letterhead, new Paragraph({ spacing: { after: 60 } }), band];
}

function docxMetaTable(result: SystemReportResult) {
  const items = metaItems(result);
  const width = Math.floor(DOCX_CONTENT_WIDTH / items.length);

  return new Table({
    width: { size: width * items.length, type: WidthType.DXA },
    columnWidths: items.map(() => width),
    borders: TABLE_NO_BORDERS,
    rows: [
      new TableRow({
        children: items.map(
          (item) =>
            new TableCell({
              width: { size: width, type: WidthType.DXA },
              borders: CELL_NO_BORDERS,
              shading: { type: ShadingType.CLEAR, color: "auto", fill: HEX.soft },
              margins: { top: 100, bottom: 100, left: 160, right: 120 },
              children: [
                docxText(item.label.toUpperCase(), { size: 14, color: HEX.muted, after: 40 }),
                docxText(item.value, { bold: true, size: 19 }),
              ],
            }),
        ),
      }),
    ],
  });
}

function docxSummaryTable(result: SystemReportResult) {
  const items = summaryItems(result);
  // A single tile stays half-width instead of stretching across the page.
  const gapless =
    items.length === 1
      ? Math.floor(DOCX_CONTENT_WIDTH / 2)
      : Math.floor(DOCX_CONTENT_WIDTH / items.length);

  return new Table({
    width: { size: gapless * items.length, type: WidthType.DXA },
    columnWidths: items.map(() => gapless),
    borders: TABLE_NO_BORDERS,
    rows: [
      new TableRow({
        children: items.map((item) => {
          const hex = rgbToHex(item.color);
          return new TableCell({
            width: { size: gapless, type: WidthType.DXA },
            borders: {
              ...CELL_THIN_BORDERS,
              left: { style: BorderStyle.SINGLE, size: 36, color: hex },
            },
            margins: { top: 120, bottom: 120, left: 200, right: 120 },
            children: [
              docxText(String(item.value), { bold: true, size: 40, color: hex }),
              docxText(item.label, { size: 16, color: HEX.muted }),
            ],
          });
        }),
      }),
    ],
  });
}

function docxSectionHeading(spec: TableSpec) {
  return [
    new Paragraph({
      spacing: { before: 320, after: 40 },
      border: {
        left: { style: BorderStyle.SINGLE, size: 24, color: HEX.green, space: 8 },
      },
      children: [
        new TextRun({ text: spec.title, bold: true, size: 23, color: HEX.ink }),
        new TextRun({ text: `    ${spec.note}`, size: 16, color: HEX.muted }),
      ],
    }),
    new Paragraph({ spacing: { after: 80 } }),
  ];
}

function docxDataTable(spec: TableSpec, widths: number[]) {
  const total = widths.reduce((sum, value) => sum + value, 0);

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: spec.head.map(
      (label, index) =>
        new TableCell({
          width: { size: widths[index], type: WidthType.DXA },
          borders: CELL_THIN_BORDERS,
          shading: { type: ShadingType.CLEAR, color: "auto", fill: HEX.green },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 90, bottom: 90, left: 100, right: 100 },
          children: [
            docxText(label, {
              bold: true,
              size: 17,
              color: "FFFFFF",
              align: index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
            }),
          ],
        }),
    ),
  });

  const bodyRows = spec.body.length
    ? spec.body.map(
        (cells, rowIndex) =>
          new TableRow({
            cantSplit: true,
            children: cells.map((value, index) => {
              const isStatus = index === spec.statusCol;
              return new TableCell({
                width: { size: widths[index], type: WidthType.DXA },
                borders: CELL_THIN_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                shading:
                  rowIndex % 2 === 1
                    ? { type: ShadingType.CLEAR, color: "auto", fill: HEX.zebra }
                    : undefined,
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [
                  docxText(value, {
                    size: 17,
                    bold: isStatus,
                    color: isStatus ? rgbToHex(STATUS_PDF_RGB[spec.tones[rowIndex]]) : HEX.ink,
                    align: index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                  }),
                ],
              });
            }),
          }),
      )
    : [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: spec.head.length,
              width: { size: total, type: WidthType.DXA },
              borders: CELL_THIN_BORDERS,
              margins: { top: 200, bottom: 200, left: 100, right: 100 },
              children: [
                docxText(spec.emptyText, {
                  italics: true,
                  size: 18,
                  color: HEX.muted,
                  align: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        }),
      ];

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...bodyRows],
  });
}

function docxSignatures() {
  const half = Math.floor(DOCX_CONTENT_WIDTH / 2);

  const column = (label: string) =>
    new TableCell({
      width: { size: half, type: WidthType.DXA },
      borders: CELL_NO_BORDERS,
      margins: { left: 0, right: 400 },
      children: [
        docxText(label, { bold: true, size: 18 }),
        new Paragraph({
          spacing: { before: 520, after: 40 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: HEX.muted, space: 1 } },
        }),
        docxText("Name, title and signature", { size: 15, color: HEX.muted }),
        new Paragraph({
          spacing: { before: 420, after: 40 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: HEX.muted, space: 1 } },
        }),
        docxText("Date", { size: 15, color: HEX.muted }),
      ],
    });

  return new Table({
    width: { size: half * 2, type: WidthType.DXA },
    columnWidths: [half, half],
    borders: TABLE_NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: [column("Prepared by"), column("Approved by")] })],
  });
}

export async function exportDocx(result: SystemReportResult) {
  const logos = await loadReportLogos();
  const tables = buildTables(result);

  const children: (Paragraph | Table)[] = [
    ...docxLetterhead(logos),
    docxText(reportTitle(result).toUpperCase(), {
      bold: true,
      size: 32,
      align: AlignmentType.CENTER,
      before: 280,
      after: 40,
    }),
    docxText(REPORT_IDENTITY.system, {
      size: 18,
      color: HEX.muted,
      align: AlignmentType.CENTER,
      after: 200,
    }),
    docxMetaTable(result),
    new Paragraph({ spacing: { after: 160 } }),
    docxSummaryTable(result),
  ];

  if (tables.complaints) {
    children.push(...docxSectionHeading(tables.complaints));
    children.push(docxDataTable(tables.complaints, DOCX_WIDTHS.complaints));
  }

  if (tables.meetings) {
    children.push(...docxSectionHeading(tables.meetings));
    children.push(docxDataTable(tables.meetings, DOCX_WIDTHS.meetings));
  }

  children.push(new Paragraph({ spacing: { before: 480 } }), docxSignatures());

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: HEX.line, space: 6 } },
        children: [
          new TextRun({
            text: `${REPORT_IDENTITY.council}  |  ${REPORT_IDENTITY.system}  |  Page `,
            size: 15,
            color: HEX.muted,
          }),
          new TextRun({ children: [PageNumber.CURRENT], size: 15, color: HEX.muted }),
          new TextRun({ text: " of ", size: 15, color: HEX.muted }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: HEX.muted }),
        ],
      }),
    ],
  });

  // Letterhead is on page 1; later pages get a slim running header.
  const runningHeader = new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "D4A017", space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: DOCX_CONTENT_WIDTH }],
        children: [
          new TextRun({ text: REPORT_IDENTITY.council, bold: true, size: 16, color: HEX.green }),
          new TextRun({ text: "\tSystem Report", size: 15, color: HEX.muted }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: REPORT_IDENTITY.council,
    title: reportTitle(result),
    description: `${formatRange(result.range.startDate, result.range.endDate)}`,
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        headers: { default: runningHeader, first: new Header({ children: [new Paragraph("")] }) },
        footers: { default: footer, first: footer },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, reportFileName(result, "docx"));
}

/* -------------------------------------------------------------------------- */
/*  Excel (.xlsx)                                                             */
/* -------------------------------------------------------------------------- */

/*
 * Note: SheetJS Community Edition cannot embed images or style cells, so the
 * Excel export carries the identity as text rows (merged across the sheet).
 * Use the PDF or Word export for the logos, or switch to ExcelJS if logos in
 * Excel are required.
 */

type Cell = string | number;

function sheetLetterhead(title: string, result: SystemReportResult): Cell[][] {
  return [
    [REPORT_IDENTITY.republic],
    [REPORT_IDENTITY.ministry],
    [REPORT_IDENTITY.council],
    [REPORT_IDENTITY.system],
    [],
    [title],
    [`Period: ${formatRange(result.range.startDate, result.range.endDate)}`],
    [`Generated: ${formatDateTime()}`],
    [],
  ];
}

function buildSheet(
  title: string,
  result: SystemReportResult,
  head: string[],
  rows: Cell[][],
  widths: number[],
) {
  const lead = sheetLetterhead(title, result);
  const aoa: Cell[][] = [...lead, head, ...rows];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  const lastColumn = head.length - 1;
  const headerRow = lead.length;

  sheet["!merges"] = lead
    .map((row, index) => (row.length ? index : -1))
    .filter((index) => index >= 0)
    .map((index) => ({ s: { r: index, c: 0 }, e: { r: index, c: lastColumn } }));

  sheet["!cols"] = widths.map((wch) => ({ wch }));
  sheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRow, c: 0 },
      e: { r: Math.max(headerRow, aoa.length - 1), c: lastColumn },
    }),
  };

  return sheet;
}

export function exportXlsx(result: SystemReportResult) {
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: reportTitle(result),
    Author: REPORT_IDENTITY.council,
    Company: REPORT_IDENTITY.council,
  };

  // Summary
  XLSX.utils.book_append_sheet(
    workbook,
    buildSheet(
      reportTitle(result),
      result,
      ["Record type", "Total"],
      summaryItems(result).map((item) => [item.label, item.value]),
      [34, 14],
    ),
    "Summary",
  );

  if (includesComplaints(result)) {
    const rows = getComplaintRows(result);
    XLSX.utils.book_append_sheet(
      workbook,
      buildSheet(
        `Citizen Complaints (${result.complaintsTotal})`,
        result,
        ["#", "Reference", "Name", "Village", "Ward", "Status", "Created"],
        rows.map((row, index) => [
          index + 1,
          row.referenceNumber,
          row.fullName?.trim() || "—",
          row.village ?? "—",
          row.ward ?? "—",
          formatStatus(row.status),
          formatDate(row.createdAt),
        ]),
        [6, 18, 28, 20, 20, 16, 14],
      ),
      "Complaints",
    );
  }

  if (includesMeetings(result)) {
    const rows = getMeetingRows(result);
    XLSX.utils.book_append_sheet(
      workbook,
      buildSheet(
        `Meetings (${result.meetingsTotal})`,
        result,
        ["#", "Title", "Status", "Scheduled", "Participants", "Created"],
        rows.map((row, index) => [
          index + 1,
          row.title,
          formatStatus(row.status),
          formatDate(row.scheduledStartAt),
          row.participantCount ?? 0,
          formatDate(row.createdAt),
        ]),
        [6, 40, 14, 16, 14, 14],
      ),
      "Meetings",
    );
  }

  XLSX.writeFile(workbook, reportFileName(result, "xlsx"));
}

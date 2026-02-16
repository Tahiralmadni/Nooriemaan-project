import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Logo path for watermark ───
import logoUrl from '/logo-main-removebg-preview.png?url';

/**
 * Fetch image and return as base64 data URL
 */
const fetchImageAsBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

/**
 * Create a semi-transparent watermark using Canvas
 * TRANSPARENT background so data underneath remains visible
 */
const createWatermarkImage = async (logoDataUrl, opacity = 0.06) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const size = 800; // Large canvas for full-page coverage
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // *** TRANSPARENT background — NO white fill ***
            // ctx.clearRect is default — canvas starts transparent

            // Draw logo centered with very low opacity
            ctx.globalAlpha = opacity;
            const scale = Math.min(size / img.width, size / img.height) * 0.85;
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;
            ctx.drawImage(img, x, y, w, h);

            const base64 = canvas.toDataURL('image/png').split(',')[1];
            resolve(base64);
        };
        img.onerror = () => resolve(null);
        img.src = logoDataUrl;
    });
};

// Full visible sheet width (A to Q = 17 columns)
const FULL_SHEET_COLS = 17;

/**
 * Export data to a professionally styled Excel file with watermark
 */
export const exportToExcel = async (data, fileName, title = 'Report', isRTL = false, summaryStats = null) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Nooriemaan Digital Portal';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Report', {
        views: [{ rightToLeft: isRTL, state: 'frozen', ySplit: 5 }],
        properties: { defaultRowHeight: 22 },
        pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            horizontalCentered: true,
            margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 }
        },
        headerFooter: {
            oddFooter: '&C&8Nooriemaan Digital Portal  •  Page &P of &N'
        }
    });

    // ── Headers & span width ──
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const colCount = headers.length || 1;
    const spanCols = Math.max(colCount, FULL_SHEET_COLS); // Always span full visible width

    // ── ROW 1 — Organization Header (spans full width A → Q) ──
    const orgRow = worksheet.addRow(['نوری ایمان ڈیجیٹل پورٹل  |  Nooriemaan Digital Portal']);
    orgRow.height = 34;
    worksheet.mergeCells(1, 1, 1, spanCols);
    const orgCell = orgRow.getCell(1);
    orgCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    orgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
    orgCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // Fill remaining cells in the merged row with the same color
    for (let c = 2; c <= spanCols; c++) {
        orgRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
    }

    // ── ROW 2 — Report Title (spans full width) ──
    const titleRow = worksheet.addRow([title]);
    titleRow.height = 38;
    worksheet.mergeCells(2, 1, 2, spanCols);
    const titleCell = titleRow.getCell(1);
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    for (let c = 2; c <= spanCols; c++) {
        titleRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
    }

    // ── ROW 3 — Date & Time (spans full width) ──
    const now = new Date();
    const dateStr = `Generated: ${now.toLocaleDateString()} • ${now.toLocaleTimeString()}`;
    const dateRow = worksheet.addRow([dateStr]);
    dateRow.height = 26;
    worksheet.mergeCells(3, 1, 3, spanCols);
    const dateCell = dateRow.getCell(1);
    dateCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF6B7280' } };
    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.border = { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
    for (let c = 2; c <= spanCols; c++) {
        dateRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
        dateRow.getCell(c).border = { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
    }

    // ── ROW 4 — Spacer ──
    const spacerRow = worksheet.addRow([]);
    spacerRow.height = 8;

    // ── ROW 5 — Column Headers ──
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 34;
    headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF059669' } },
            bottom: { style: 'medium', color: { argb: 'FF047857' } },
            left: { style: 'thin', color: { argb: 'FF34D399' } },
            right: { style: 'thin', color: { argb: 'FF34D399' } }
        };
    });

    // ── DATA ROWS — Zebra + Status Colors ──
    const statusColIndex = headers.findIndex(h =>
        h.toLowerCase().includes('status') || h.includes('کیفیت')
    );

    data.forEach((row, index) => {
        const values = Object.values(row);
        const dataRow = worksheet.addRow(values);
        dataRow.height = 28;
        const isEven = index % 2 === 0;

        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 10 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.fill = {
                type: 'pattern', pattern: 'solid',
                fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF0FDF4' }
            };
            cell.border = {
                top: { style: 'hair', color: { argb: 'FFE5E7EB' } },
                bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
                left: { style: 'hair', color: { argb: 'FFE5E7EB' } },
                right: { style: 'hair', color: { argb: 'FFE5E7EB' } }
            };

            // Color-code status column
            if (colNumber === statusColIndex + 1 && cell.value) {
                const val = String(cell.value).toLowerCase();
                if (val.includes('present') || val.includes('حاضر')) {
                    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
                } else if (val.includes('absent') || val.includes('غیر حاضر')) {
                    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFDC2626' } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
                } else if (val.includes('leave') || val.includes('رخصت')) {
                    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFD97706' } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
                } else if (val.includes('holiday') || val.includes('تعطیل')) {
                    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF2563EB' } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
                }
            }
        });
    });

    // ── Bottom border ──
    if (worksheet.lastRow) {
        worksheet.lastRow.eachCell((cell) => {
            cell.border = { ...cell.border, bottom: { style: 'medium', color: { argb: 'FF10B981' } } };
        });
    }

    // ── SUMMARY SECTION ──
    if (summaryStats) {
        worksheet.addRow([]);
        const stRow = worksheet.addRow(['📊  Summary / خلاصہ']);
        const stNum = stRow.number;
        worksheet.mergeCells(stNum, 1, stNum, spanCols);
        stRow.height = 26;
        const stCell = stRow.getCell(1);
        stCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF047857' } };
        stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
        stCell.alignment = { horizontal: 'center', vertical: 'middle' };
        stCell.border = {
            top: { style: 'medium', color: { argb: 'FF10B981' } },
            bottom: { style: 'thin', color: { argb: 'FFD1FAE5' } }
        };

        const pairs = [
            ['Total Days / کل دن', summaryStats.totalDays || '-'],
            ['Present / حاضری', summaryStats.present || 0],
            ['Absent / غیر حاضری', summaryStats.absent || 0],
            ['Leave / رخصت', summaryStats.leave || 0],
            ['Holidays / تعطیلات', summaryStats.holiday || 0],
            ['Late Minutes / تاخیر (منٹ)', summaryStats.lateMins || 0],
            ['Deduction / کٹوتی', `Rs. ${summaryStats.deduction || 0}`],
        ];

        pairs.forEach(([label, value], idx) => {
            const sRow = worksheet.addRow([label, value]);
            sRow.height = 20;
            const bg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB';
            sRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF374151' } };
            sRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            sRow.getCell(1).alignment = { horizontal: isRTL ? 'right' : 'left', vertical: 'middle' };
            sRow.getCell(1).border = { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FF10B981' } } };
            sRow.getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
            sRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            sRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
            sRow.getCell(2).border = { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FF10B981' } } };
        });
    }

    // ── COLUMN WIDTHS — Fill full page (A to Q width) ──
    // Distribute ~170 units across 8 columns proportionally
    const colWidthMap = {
        0: 12,   // Serial / No.
        1: 22,   // Date
        2: 18,   // Day
        3: 26,   // Status
        4: 22,   // Late In
        5: 22,   // Early Out
        6: 22,   // Deduction
        7: 32,   // Remarks
    };
    worksheet.columns.forEach((col, i) => {
        if (i < colCount) {
            col.width = colWidthMap[i] || 20;
        } else {
            col.width = 8;
        }
    });

    // ── WATERMARK LOGO — Full page, transparent, centered ──
    try {
        const logoDataUrl = await fetchImageAsBase64(logoUrl);
        if (logoDataUrl) {
            const watermarkBase64 = await createWatermarkImage(logoDataUrl, 0.07);
            if (watermarkBase64) {
                const imageId = workbook.addImage({
                    base64: watermarkBase64,
                    extension: 'png',
                });

                // Span the ENTIRE visible area: A1 to Q40+
                const totalRows = worksheet.lastRow ? worksheet.lastRow.number : 35;
                const endRow = Math.max(totalRows + 5, 40);

                worksheet.addImage(imageId, {
                    tl: { col: 0, row: 0 },
                    br: { col: spanCols, row: endRow },
                    editAs: 'absolute'
                });
            }
        }
    } catch (e) {
        console.warn('Watermark could not be added:', e);
    }

    // ── Generate & Download ──
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${fileName}.xlsx`);
};

/**
 * Export data to PDF file with professional layout
 */
export const exportToPDF = (title, columns, rows, fileName) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header bar
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F');

    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });

    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(209, 250, 229);
    doc.text('Nooriemaan Digital Portal', doc.internal.pageSize.getWidth() / 2, 24, { align: 'center' });

    // Date
    doc.setFontSize(8);
    doc.setTextColor(167, 243, 208);
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    doc.text(`Generated: ${date} • ${time}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    // Table
    doc.autoTable({
        startY: 42,
        head: [columns],
        body: rows,
        theme: 'grid',
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 8,
            halign: 'center',
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [240, 253, 244]
        },
        styles: {
            lineColor: [209, 213, 219],
            lineWidth: 0.15,
        },
        margin: { left: 14, right: 14 },
        didParseCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 3) {
                const val = String(hookData.cell.raw || '').toLowerCase();
                if (val.includes('present') || val.includes('حاضر')) {
                    hookData.cell.styles.textColor = [5, 150, 105];
                    hookData.cell.styles.fontStyle = 'bold';
                } else if (val.includes('absent') || val.includes('غیر')) {
                    hookData.cell.styles.textColor = [220, 38, 38];
                    hookData.cell.styles.fontStyle = 'bold';
                } else if (val.includes('holiday') || val.includes('تعطیل')) {
                    hookData.cell.styles.textColor = [37, 99, 235];
                    hookData.cell.styles.fontStyle = 'bold';
                } else if (val.includes('leave') || val.includes('رخصت')) {
                    hookData.cell.styles.textColor = [217, 119, 6];
                    hookData.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFillColor(249, 250, 251);
        doc.rect(0, pageH - 15, doc.internal.pageSize.getWidth(), 15, 'F');
        doc.setDrawColor(209, 213, 219);
        doc.line(0, pageH - 15, doc.internal.pageSize.getWidth(), pageH - 15);
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `Nooriemaan Digital Portal  •  Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2, pageH - 6,
            { align: 'center' }
        );
    }

    doc.save(`${fileName}.pdf`);
};

"use strict";

async function loadReportImage(url) {

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`Unable to load report photo: ${url}`));
    });

    return image;

}

async function downloadReportPdf(report, options = {}) {

    if (!report || !window.jspdf?.jsPDF) {
        throw new Error("The report or PDF generator is unavailable.");
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const tableWidth = pageWidth - margin * 2;
    const footerHeight = 19;
    const rowLabelWidth = 43;
    let y = 43;

    function addPage() {
        pdf.addPage();
        y = 20;
    }

    function ensureSpace(height) {
        if (y + height > pageHeight - footerHeight) {
            addPage();
        }
    }

    function addSection(title) {
        ensureSpace(13);
        const sectionWidth = Math.min(95, Math.max(42, title.length * 2.15 + 9));
        pdf.setFillColor(224, 231, 221);
        pdf.roundedRect(margin, y, sectionWidth, 8, 1.5, 1.5, "F");
        pdf.setTextColor(45, 55, 45);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(title, margin + 4, y + 5.5);
        y += 11;
    }

    function addRow(label, value, fullWidth = false) {
        if (fullWidth) {
            const descriptionLines = pdf.splitTextToSize(
                String(value || "No description provided."),
                tableWidth - 6
            );
            const linesPerPage = Math.floor((pageHeight - footerHeight - 24) / 4.5);

            ensureSpace(8);
            pdf.setDrawColor(120, 124, 120);
            pdf.setFillColor(245, 246, 245);
            pdf.rect(margin, y, tableWidth, 8, "FD");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(48, 48, 48);
            pdf.text(label, margin + 3, y + 5.3);
            y += 8;

            for (let index = 0; index < descriptionLines.length; index += linesPerPage) {
                const pageLines = descriptionLines.slice(index, index + linesPerPage);
                const rowHeight = pageLines.length * 4.5 + 4;

                if (y + rowHeight > pageHeight - footerHeight) {
                    addPage();
                }

                pdf.setDrawColor(120, 124, 120);
                pdf.rect(margin, y, tableWidth, rowHeight);
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(65, 65, 65);
                pdf.text(pageLines, margin + 3, y + 5);
                y += rowHeight;
            }

            return;
        }

        const labelWidth = fullWidth ? 0 : rowLabelWidth;
        const valueX = margin + labelWidth;
        const valueWidth = tableWidth - labelWidth;
        const labelLines = pdf.splitTextToSize(String(label), labelWidth - 5);
        const valueLines = pdf.splitTextToSize(String(value), valueWidth - 6);
        const rowHeight = Math.max(8, Math.max(labelLines.length, valueLines.length) * 4.5 + 3);

        if (y + rowHeight > pageHeight - footerHeight) {
            addPage();
        }

        pdf.setDrawColor(120, 124, 120);
        pdf.setLineWidth(0.25);
        pdf.rect(margin, y, tableWidth, rowHeight);

        pdf.line(margin + labelWidth, y, margin + labelWidth, y + rowHeight);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(48, 48, 48);
        pdf.text(labelLines, margin + 2.5, y + 5.3);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(65, 65, 65);
        pdf.text(valueLines, valueX + 3, y + 5.3);
        y += rowHeight;
    }

    async function addPhotoGrid(photos) {
        if (!photos.length) {
            addRow("Photos", "No photos uploaded.");
            return;
        }

        const gap = 5;
        const cellWidth = (tableWidth - gap) / 2;
        const cellHeight = 54;

        for (let index = 0; index < photos.length; index += 2) {
            ensureSpace(cellHeight + 3);

            const rowPhotos = photos.slice(index, index + 2);

            for (const [column, photo] of rowPhotos.entries()) {
                const image = await loadReportImage(photo.url);
                const x = margin + column * (cellWidth + gap);

                pdf.setDrawColor(120, 124, 120);
                pdf.rect(x, y, cellWidth, cellHeight);
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(9);
                pdf.setTextColor(48, 48, 48);
                pdf.text(photo.caption, x + 3, y + 6);

                const imageWidth = cellWidth - 6;
                const imageHeight = cellHeight - 12;
                const scale = Math.min(imageWidth / image.width, imageHeight / image.height);
                const drawWidth = image.width * scale;
                const drawHeight = image.height * scale;

                pdf.addImage(
                    image,
                    x + (cellWidth - drawWidth) / 2,
                    y + 8 + (imageHeight - drawHeight) / 2,
                    drawWidth,
                    drawHeight
                );
            }

            y += cellHeight + 3;
        }
    }

    pdf.setFillColor(36, 76, 80);
    pdf.rect(0, 0, pageWidth, 34, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.text("Road Welfare System", margin, 15);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Road issue inspection report", margin, 23);
    pdf.text(`Report ID: ${report.id}`, pageWidth - margin, 23, { align: "right" });

    pdf.setTextColor(70, 70, 70);
    pdf.setFontSize(9);
    pdf.text(
        "Details of the reported road issue, its location, and review status.",
        margin,
        39
    );

    if (options.includeReporter) {
        addSection("Contact info");
        addRow("Name", report.profiles?.full_name || "Not available");
        addRow("Phone", report.profiles?.phone || "Not available");
        addRow("Email", report.profiles?.email || "Not available");
    }

    addSection("Report details");
    addRow("Report title", report.title || "Not provided");
    addRow("Category", report.category || "Not provided");
    addRow("Date submitted", report.created_at
        ? new Date(report.created_at).toLocaleString()
        : "Not available");
    addRow("Address", report.address || "Not provided");
    addRow("Latitude", report.latitude ?? "Not available");
    addRow("Longitude", report.longitude ?? "Not available");

    addSection("Complaint");
    addRow("Status", report.status || "Not available");
    addRow("Complaint details", report.description || "No description provided.", true);

    const afterReviewPhotos = options.includeAfterReviewPhotos
        ? (Array.isArray(report.after_review_image_urls) ? report.after_review_image_urls : [])
        : [];

    addSection(options.includeAfterReviewPhotos ? "Review and close" : "Submitted photo");

    if (options.includeAfterReviewPhotos) {
        addRow("Review outcome", report.status || "Not available");
        addRow("After-review photos", String(afterReviewPhotos.length));
    }

    const photos = [
        report.image_url ? { url: report.image_url, caption: "Before - submitted photo" } : null,
        ...afterReviewPhotos.map((url, index) => ({
            url,
            caption: `After - review photo ${index + 1}`
        }))
    ].filter(Boolean);

    await addPhotoGrid(photos);

    const totalPages = pdf.getNumberOfPages();

    for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        pdf.setDrawColor(180);
        pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text("Road Welfare System", margin, pageHeight - 7);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 7, {
            align: "center"
        });
        pdf.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 7, {
            align: "right"
        });
    }

    pdf.save(`Road_Welfare_Report_${report.id}.pdf`);

}

window.downloadReportPdf = downloadReportPdf;

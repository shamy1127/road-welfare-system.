"use strict";

async function addReportPhoto(pdf, url, caption, y) {

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`Unable to load report photo: ${url}`));
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = 170;
    const imageHeight = Math.min(75, imageWidth * image.height / image.width);

    if (y + 10 + imageHeight > pageHeight - 22) {
        pdf.addPage();
        y = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(caption, 20, y);
    y += 6;

    pdf.addImage(image, 20, y, imageWidth, imageHeight);

    return y + imageHeight + 10;
}

async function downloadReportPdf(report, options = {}) {

    if (!report || !window.jspdf?.jsPDF) {
        throw new Error("The report or PDF generator is unavailable.");
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 42;

    pdf.setFillColor(22, 101, 192);
    pdf.rect(0, 0, pageWidth, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("ROAD WELFARE SYSTEM", pageWidth / 2, 13, { align: "center" });
    pdf.setFontSize(11);
    pdf.text("Official Road Issue Report", pageWidth / 2, 22, { align: "center" });
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(10);
    pdf.text(`Report ID: ${report.id}`, 20, 37);

    const details = [
        ["Title", report.title || "Not provided"],
        ["Category", report.category || "Not provided"],
        ["Status", report.status || "Not provided"],
        ["Address", report.address || "Not provided"],
        ["Latitude", report.latitude ?? "Not available"],
        ["Longitude", report.longitude ?? "Not available"],
        ["Submitted", report.created_at ? new Date(report.created_at).toLocaleString() : "Not available"]
    ];

    if (options.includeReporter) {
        details.push(
            ["Citizen", report.profiles?.full_name || "Unknown"],
            ["Email", report.profiles?.email || "Not available"],
            ["Phone", report.profiles?.phone || "Not available"]
        );
    }

    details.forEach(([label, value]) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, 20, y);
        pdf.setFont("helvetica", "normal");

        const lines = pdf.splitTextToSize(String(value), 145);
        pdf.text(lines, 55, y);
        y += Math.max(7, lines.length * 5);

        if (y > pageHeight - 24) {
            pdf.addPage();
            y = 20;
        }
    });

    y += 3;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Description", 20, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const descriptionLines = pdf.splitTextToSize(
        report.description || "No description provided.",
        170
    );

    descriptionLines.forEach(line => {
        if (y > pageHeight - 22) {
            pdf.addPage();
            y = 20;
        }

        pdf.text(line, 20, y);
        y += 5;
    });

    const photos = [
        report.image_url ? { url: report.image_url, caption: "Submitted Geo-tagged Photo" } : null,
        ...(Array.isArray(report.after_review_image_urls)
            ? report.after_review_image_urls.map(url => ({
                url,
                caption: "After-review Photo"
            }))
            : [])
    ].filter(Boolean);

    for (const photo of photos) {
        y = await addReportPhoto(pdf, photo.url, photo.caption, y);
    }

    const totalPages = pdf.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);
        pdf.setDrawColor(180);
        pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text("Road Welfare System", 20, pageHeight - 9);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 9, {
            align: "center"
        });
        pdf.text(`Page ${page} of ${totalPages}`, pageWidth - 20, pageHeight - 9, {
            align: "right"
        });
    }

    pdf.save(`Road_Welfare_Report_${report.id}.pdf`);
}

window.downloadReportPdf = downloadReportPdf;

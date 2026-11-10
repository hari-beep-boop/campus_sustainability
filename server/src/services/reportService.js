import PDFDocument from 'pdfkit';
import AnalyticsService from './analyticsService.js';
import Building from '../models/Building.js';
import Setting from '../models/Setting.js';

export class ReportService {
  /**
   * Stream a generated PDF report directly to an HTTP response
   */
  static async generateCampusPdf(res, campusName = 'Greenwood Central Campus') {
    const summary = await AnalyticsService.getSummary();
    const buildings = await AnalyticsService.getBuildingUsage();
    const settingDoc = await Setting.findOne({ key: 'reportCampusName' });
    const campus = settingDoc?.value || campusName;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set HTTP response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="campus_sustainability_report_${new Date().toISOString().split('T')[0]}.pdf"`
    );

    doc.pipe(res);

    // Header & Title
    doc.fillColor('#059669').fontSize(22).text('CAMPUS SUSTAINABILITY REPORT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fillColor('#4B5563').fontSize(12).text(`Campus: ${campus}  |  Generated: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });
    doc.moveDown(1.5);

    // Executive Summary Box
    doc.rect(40, doc.y, 515, 80).fillAndStroke('#F0FDF4', '#10B981');
    const boxY = doc.y + 10;
    doc.fillColor('#065F46').fontSize(14).text('Performance Summary & Sustainability Score', 55, boxY);
    doc.fontSize(10).fillColor('#1F2937');
    doc.text(
      `Campus Sustainability Score: ${summary.score} / 100\n` +
        `Total Electricity Consumed: ${summary.energyKwh.toLocaleString()} kWh  |  Carbon Footprint: ${summary.carbonKg.toLocaleString()} kg CO2e\n` +
        `Water Withdrawal: ${summary.waterL.toLocaleString()} Litres  |  Average Indoor CO2: ${summary.co2Ppm} ppm\n` +
        `Municipal Waste Generated: ${summary.wasteKg.toLocaleString()} kg`,
      55,
      boxY + 22
    );

    doc.y = boxY + 80;
    doc.moveDown(1.5);

    // Section 2: Building Breakdown Table
    doc.fillColor('#111827').fontSize(14).text('Building Performance Breakdown');
    doc.moveDown(0.5);

    // Table Header
    const startY = doc.y;
    doc.rect(40, startY, 515, 22).fill('#E5E7EB');
    doc.fillColor('#1F2937').fontSize(9).font('Helvetica-Bold');
    doc.text('Building Name', 45, startY + 6, { width: 150 });
    doc.text('Energy (kWh)', 200, startY + 6, { width: 80 });
    doc.text('Water (L)', 290, startY + 6, { width: 75 });
    doc.text('CO2 (ppm)', 375, startY + 6, { width: 65 });
    doc.text('Carbon (kg)', 450, startY + 6, { width: 85 });

    let rowY = startY + 24;
    doc.font('Helvetica');

    buildings.forEach((b, i) => {
      if (i % 2 === 1) {
        doc.rect(40, rowY - 2, 515, 20).fill('#F9FAFB');
      }
      doc.fillColor('#374151');
      doc.text(b.building, 45, rowY + 3, { width: 150 });
      doc.text(b.energy.toLocaleString(), 200, rowY + 3, { width: 80 });
      doc.text(b.water.toLocaleString(), 290, rowY + 3, { width: 75 });
      doc.text(b.co2Ppm.toString(), 375, rowY + 3, { width: 65 });
      doc.text(b.carbonKg.toLocaleString(), 450, rowY + 3, { width: 85 });
      rowY += 20;
    });

    doc.y = rowY + 15;
    doc.moveDown(1);

    // Strategic Recommendations
    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Key Recommended Actions');
    doc.font('Helvetica').fontSize(9).fillColor('#4B5563');
    doc.moveDown(0.4);
    doc.text('1. Implement HVAC nighttime setbacks across Science Block A and Engineering Hall to reduce baseload by 35%.');
    doc.text('2. Repair continuous low-flow flush fixtures in East Wing restrooms to curb nocturnal water losses.');
    doc.text('3. Integrate demand-controlled ventilation in library study halls to keep ambient CO2 strictly under 900 ppm.');

    // Footer
    doc.fontSize(8).fillColor('#9CA3AF').text(
      'Campus Sustainability Tracker v2 — Automated Report Engine',
      40,
      780,
      { align: 'center', width: 515 }
    );

    doc.end();
  }
}

export default ReportService;

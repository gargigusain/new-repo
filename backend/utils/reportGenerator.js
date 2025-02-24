const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateCSV(employees) {
    const fields = ['id', 'name', 'email', 'role', 'department'];
    const parser = new Parser({ fields });
    return parser.parse(employees);
}

function generatePDF(employees) {
    const doc = new PDFDocument();
    const filePath = 'reports/employees_report.pdf';
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Employee Report', { align: 'center' });
    doc.moveDown();

    employees.forEach(emp => {
        doc.text(`ID: ${emp.id} | Name: ${emp.name} | Role: ${emp.role} | Department: ${emp.department}`);
    });

    doc.end();
    return filePath;
}

module.exports = { generateCSV, generatePDF };

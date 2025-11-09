import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporte des données vers Excel
   */
  exportToExcel(data: any[], fileName: string, sheetName: string = 'Data'): void {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `${fileName}_${this.getTimestamp()}.xlsx`);
      console.log('✅ Export Excel réussi:', fileName);
    } catch (error) {
      console.error('❌ Erreur export Excel:', error);
      throw error;
    }
  }

  /**
   * Exporte des données vers PDF avec tableau
   */
  exportToPDF(
    data: any[],
    columns: { header: string; dataKey: string }[],
    fileName: string,
    title: string = 'Rapport',
    orientation: 'portrait' | 'landscape' = 'portrait'
  ): void {
    try {
      const doc = new jsPDF(orientation, 'mm', 'a4');
      
      this.addPDFHeader(doc, title);
      
      autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
        startY: 40,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40, left: 10, right: 10 }
      });
      
      this.addPDFFooter(doc);
      
      doc.save(`${fileName}_${this.getTimestamp()}.pdf`);
      console.log('✅ Export PDF réussi:', fileName);
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      throw error;
    }
  }

  exportConventionsToPDF(conventions: any[], fileName: string = 'Rapport_Conventions'): void {
    const columns = [
      { header: 'Référence', dataKey: 'reference' },
      { header: 'Titre', dataKey: 'title' },
      { header: 'Statut', dataKey: 'status' },
      { header: 'Montant', dataKey: 'amount' },
      { header: 'Gouvernorat', dataKey: 'governorate' },
      { header: 'Échéance', dataKey: 'dueDate' }
    ];
    
    this.exportToPDF(conventions, columns, fileName, 'Rapport des Conventions', 'landscape');
  }

  exportInvoicesToPDF(invoices: any[], fileName: string = 'Rapport_Factures'): void {
    const columns = [
      { header: 'N° Facture', dataKey: 'invoiceNumber' },
      { header: 'Convention', dataKey: 'conventionReference' },
      { header: 'Montant', dataKey: 'amount' },
      { header: 'Statut', dataKey: 'status' },
      { header: 'Échéance', dataKey: 'dueDate' }
    ];
    
    this.exportToPDF(invoices, columns, fileName, 'Rapport des Factures');
  }

  exportToCSV(data: any[], fileName: string): void {
    try {
      if (data.length === 0) {
        console.warn('⚠️ Aucune donnée à exporter');
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${fileName}_${this.getTimestamp()}.csv`);
      console.log('✅ Export CSV réussi:', fileName);
    } catch (error) {
      console.error('❌ Erreur export CSV:', error);
      throw error;
    }
  }

  private addPDFHeader(doc: jsPDF, title: string): void {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('GestionPro', 14, 15);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 25);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 32);
    
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
  }

  private addPDFFooter(doc: jsPDF): void {
    const pageCount = (doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      
      doc.text(
        '© 2024 GestionPro - Tous droits réservés',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }
  }

  private getTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }
}

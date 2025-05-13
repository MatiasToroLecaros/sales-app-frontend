// src/services/reportService.ts (versión actualizada)
import { api } from './api';

export enum ReportFormat {
  JSON = 'json',
  PDF = 'pdf',
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  productId?: number;
  format: ReportFormat;
}

export interface ReportResponse {
  format: string;
  content?: any;
  contentType?: string;
  filename?: string;
  blob?: Blob;
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
  // Campos adicionales para acceso directo a los datos
  totalSales?: number;
  salesByProduct?: any[];
  salesByUser?: any[];
  monthlySales?: any[];
}

export const reportService = {
  async generateReport(filters: ReportFilters): Promise<ReportResponse> {
    try {
      if (filters.format === ReportFormat.PDF) {
        // Para respuestas PDF, configurar el responseType como 'blob'
        const response = await api.post('/reports/generate', filters, {
          responseType: 'blob'
        });
        
        // Crear un nombre de archivo apropiado si no viene en la respuesta
        const filename = `sales_report_${new Date().toISOString().slice(0, 10)}.pdf`;
        
        // Devolver tanto el blob como la información adicional
        return {
          format: 'pdf',
          blob: response.data,
          filename,
          contentType: 'application/pdf'
        };
      } else {
        // Para respuestas JSON
        const { data } = await api.post('/reports/generate', filters);
        
        // Garantizar que la respuesta tenga el formato esperado
        return {
          format: 'json',
          content: data.content || data,
          contentType: 'application/json',
          // Extraer campos adicionales si están disponibles directamente en la raíz
          totalSales: data.totalSales || (data.content ? data.content.summary?.totalSales : undefined),
          salesByProduct: data.salesByProduct || (data.content ? data.content.salesByProduct : undefined),
          salesByUser: data.salesByUser || (data.content ? data.content.salesByUser : undefined),
          monthlySales: data.monthlySales || (data.content ? data.content.monthlySales : undefined)
        };
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  },
};
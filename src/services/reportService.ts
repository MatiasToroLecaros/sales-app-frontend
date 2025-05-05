// src/services/reportService.ts
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

export const reportService = {
  async generateReport(filters: ReportFilters): Promise<any> {
    const { data } = await api.post('/reports/generate', filters, {
      responseType: filters.format === ReportFormat.PDF ? 'arraybuffer' : 'json',
    });
    
    return data;
  },
};
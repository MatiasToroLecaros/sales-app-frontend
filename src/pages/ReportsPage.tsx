// src/pages/ReportsPage.tsx (corregido)
import { useState, useEffect } from "react";
import { saleService } from "../services/saleService";
import { productService } from "../services/productService";
import { reportService } from "../services/reportService";
import { Product } from "../types/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { formatNumber } from "../lib/utils";

// Tipo para el formato del informe
enum ReportFormat {
  JSON = "json",
  PDF = "pdf",
}

// Tipo para los criterios de filtrado
interface ReportFilters {
  startDate?: string;
  endDate?: string;
  productId?: number;
  format: ReportFormat;
}

export const ReportsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: "",
    endDate: "",
    productId: undefined,
    format: ReportFormat.JSON,
  });
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  // Cargar productos y métricas iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [productsData, metricsData] = await Promise.all([
          productService.getAll(),
          saleService.getMetrics(),
        ]);
        setProducts(productsData);
        setMetrics(metricsData);
      } catch (err) {
        setError("Error al cargar datos iniciales");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]:
        name === "productId"
          ? value === "0"
            ? undefined
            : Number(value)
          : value,
    }));
  };

  // Generar informe
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      setError(null);
      setReportUrl(null);

      const response = await reportService.generateReport({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        productId: filters.productId,
        format: filters.format,
      });

      if (filters.format === ReportFormat.PDF) {
        // Para PDF creamos un URL para descarga
        const blob = new Blob([response.content], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setReportUrl(url);
      } else {
        // Para JSON actualizamos las métricas con la respuesta
        setMetrics(response.content);
      }
    } catch (err) {
      setError("Error al generar el informe");
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Informes</h1>

      {/* Filtros del informe */}
      <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Generar Informe
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Fecha Inicio"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <Input
            label="Fecha Fin"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <div className="flex flex-col">
            <label
              htmlFor="productId"
              className="mb-1 text-sm font-medium text-secondary-300"
            >
              Producto
            </label>
            <select
              id="productId"
              name="productId"
              className="block w-full rounded-md border border-secondary-600 bg-secondary-700 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.productId || "0"}
              onChange={handleFilterChange}
            >
              <option value="0">Todos los productos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="format"
              className="mb-1 text-sm font-medium text-secondary-300"
            >
              Formato
            </label>
            <select
              id="format"
              name="format"
              className="block w-full rounded-md border border-secondary-600 bg-secondary-700 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.format}
              onChange={handleFilterChange}
            >
              <option value={ReportFormat.JSON}>JSON (Vista Previa)</option>
              <option value={ReportFormat.PDF}>PDF (Descargar)</option>
            </select>
          </div>
          <div className="flex items-end md:col-span-2 lg:col-span-4">
            <Button
              onClick={handleGenerateReport}
              isLoading={isGeneratingReport}
              disabled={isGeneratingReport}
              className="w-full"
            >
              Generar Informe
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-400 bg-opacity-20 p-4 text-red-300">
          <p>{error}</p>
        </div>
      )}

      {/* Enlace de descarga para PDF */}
      {reportUrl && (
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Informe Generado
          </h2>
          <p className="mb-4 text-secondary-300">
            Tu informe en formato PDF está listo para descargar.
          </p>
          <a // Aquí estaba faltando la etiqueta de apertura <a>
            href={reportUrl}
            download={`sales_report_${
              new Date().toISOString().split("T")[0]
            }.pdf`}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descargar PDF
          </a>
        </div>
      )}

      {/* Vista previa JSON */}
      {!isLoading && metrics && filters.format === ReportFormat.JSON && (
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Vista Previa del Informe
          </h2>

          {/* Resumen de métricas */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-secondary-700 p-4">
              <h3 className="text-sm font-medium text-secondary-300">
                Total Ventas
              </h3>
              <p className="mt-2 text-2xl font-semibold text-white">
                ${formatNumber(metrics.totalSales || 0)}
              </p>
            </div>
            <div className="rounded-md bg-secondary-700 p-4">
              <h3 className="text-sm font-medium text-secondary-300">
                Productos Vendidos
              </h3>
              <p className="mt-2 text-2xl font-semibold text-white">
                {metrics.salesByProduct?.length || 0}
              </p>
            </div>
            <div className="rounded-md bg-secondary-700 p-4">
              <h3 className="text-sm font-medium text-secondary-300">
                Ventas por Usuario
              </h3>
              <p className="mt-2 text-2xl font-semibold text-white">
                {metrics.salesByUser?.length || 0}
              </p>
            </div>
          </div>

          {/* Ventas por Producto */}
          <div className="mb-6">
            <h3 className="mb-3 text-md font-medium text-white">
              Ventas por Producto
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-700">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                      Cantidad Total
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                      Total Ventas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.salesByProduct &&
                  metrics.salesByProduct.length > 0 ? (
                    metrics.salesByProduct.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-secondary-700">
                        <td className="px-4 py-2 text-sm text-white">
                          {item.productName || "Desconocido"}
                        </td>
                        <td className="px-4 py-2 text-sm text-secondary-300">
                          {item.totalQuantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-white">
                          ${formatNumber(item.totalAmount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-center text-sm text-secondary-400"
                      >
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ventas Mensuales */}
          <div>
            <h3 className="mb-3 text-md font-medium text-white">
              Ventas Mensuales
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-700">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                      Mes
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                      Total Ventas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.monthlySales && metrics.monthlySales.length > 0 ? (
                    metrics.monthlySales.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-secondary-700">
                        <td className="px-4 py-2 text-sm text-white">
                          {item.month}
                        </td>
                        <td className="px-4 py-2 text-sm text-white">
                          ${formatNumber(item.totalAmount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-center text-sm text-secondary-400"
                      >
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

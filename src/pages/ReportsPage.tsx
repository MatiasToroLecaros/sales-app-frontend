// src/pages/ReportsPage.tsx (versión final corregida)
import { useState, useEffect, useRef } from "react";
import { saleService } from "../services/saleService";
import { productService } from "../services/productService";
import { reportService, ReportFormat } from "../services/reportService";
import { Product } from "../types/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { formatNumber } from "../lib/utils";

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
  const [reportGenerated, setReportGenerated] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [metrics, setMetrics] = useState<any>(null);
  
  // Referencia para la última respuesta del reporte
  const lastReportResponse = useRef<any>(null);

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
        
        // Solo inicializamos con datos generales si no hay reporte generado
        if (!reportGenerated) {
          setMetrics(metricsData);
        }
      } catch (err) {
        setError("Error al cargar datos iniciales");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Limpiar URL de PDF al desmontar el componente
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Manejar cambios en los filtros
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      // Si cambiamos el formato, actualizar el estado con la última respuesta del formato correspondiente
      if (name === 'format' && lastReportResponse.current) {
        if (value === ReportFormat.JSON && lastReportResponse.current.format === 'json') {
          // Si cambiamos a JSON y tenemos una respuesta JSON guardada
          setMetrics(lastReportResponse.current.content || lastReportResponse.current);
          setReportGenerated(true);
        }
      }
      
      return {
        ...prev,
        [name]:
          name === "productId"
            ? value === "0"
              ? undefined
              : Number(value)
            : value,
      };
    });
  };

  // Generar informe
  const handleGenerateReport = async () => {
    try {
      // Validar fechas
      if (!filters.startDate || !filters.endDate) {
        setError("Por favor selecciona fechas de inicio y fin para generar el informe");
        return;
      }

      setIsGeneratingReport(true);
      setError(null);
      
      // Limpiar el URL anterior si existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

      console.log("Generando informe con filtros:", filters);

      const response = await reportService.generateReport({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        productId: filters.productId,
        format: filters.format,
      });
      
      // Guardar la respuesta más reciente para referencia
      lastReportResponse.current = response;
      console.log("Respuesta recibida:", response);

      if (filters.format === ReportFormat.PDF) {
        if (response.blob) {
          // Crear un URL para el blob
          const url = URL.createObjectURL(response.blob);
          setPdfUrl(url);
          setPdfFilename(response.filename || "reporte.pdf");
          setReportGenerated(true);
          
          // Si también hay datos JSON disponibles en la respuesta, actualizar métricas
          if (response.totalSales !== undefined || response.content) {
            const metricsData = response.content || response;
            setMetrics(metricsData);
          }
        } else {
          throw new Error("No se pudo generar el archivo PDF");
        }
      } else {
        // Para JSON, actualizamos las métricas con la respuesta
        console.log("Respuesta JSON recibida:", response);
        
        // Obtener los datos correctamente, ya sea de content o directamente
        const metricsData = response.content || response;
        setMetrics(metricsData);
        setReportGenerated(true);
      }
    } catch (err: any) {
      console.error("Error generando reporte:", err);
      setError(err.message || "Error al generar el informe");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Función para manejar la descarga directa del PDF
  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = pdfFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Función para limpiar los filtros
  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      productId: undefined,
      format: ReportFormat.JSON,
    });
    setReportGenerated(false);
    setPdfUrl(null);
    
    // También limpiamos la referencia de la última respuesta
    lastReportResponse.current = null;
    
    // Recargar datos iniciales
    setIsLoading(true);
    saleService.getMetrics()
      .then((data) => {
        setMetrics(data);
      })
      .catch((err) => {
        console.error("Error obteniendo métricas:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Verificar si hay datos disponibles para mostrar
  const hasDisplayableData = () => {
    if (!metrics) return false;
    
    // Verificamos si hay datos en cualquiera de las secciones principales
    const hasTotal = metrics.totalSales && metrics.totalSales > 0;
    const hasSalesByProduct = metrics.salesByProduct && metrics.salesByProduct.length > 0;
    const hasMonthlySales = metrics.monthlySales && metrics.monthlySales.length > 0;
    
    return hasTotal || hasSalesByProduct || hasMonthlySales;
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
            error={!filters.startDate && reportGenerated ? "Fecha requerida" : undefined}
          />
          <Input
            label="Fecha Fin"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
            error={!filters.endDate && reportGenerated ? "Fecha requerida" : undefined}
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
          <div className="flex items-end gap-4 md:col-span-2 lg:col-span-4">
            <Button
              onClick={handleGenerateReport}
              isLoading={isGeneratingReport}
              disabled={isGeneratingReport}
              className="w-full"
            >
              Generar Informe
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={isGeneratingReport || !reportGenerated}
              className="w-full md:w-auto"
            >
              Limpiar
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
      {reportGenerated && filters.format === ReportFormat.PDF && pdfUrl && (
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Informe Generado
          </h2>
          <p className="mb-4 text-secondary-300">
            Tu informe en formato PDF está listo para descargar.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={handleDownloadPdf}
              className="inline-flex items-center"
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
            </Button>
            
            <a 
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-md border border-secondary-600 text-sm font-medium text-white hover:bg-secondary-700 transition-colors"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Ver en navegador
            </a>
          </div>
        </div>
      )}

      {/* Vista previa JSON */}
      {filters.format === ReportFormat.JSON && (reportGenerated || !filters.startDate) && (
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {reportGenerated ? "Vista Previa del Informe" : "Resumen General"}
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-primary-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-secondary-300 font-medium">Cargando datos...</p>
            </div>
          ) : !hasDisplayableData() ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-secondary-400 mx-auto mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-xl text-secondary-400 mb-3">No hay datos disponibles</p>
              <p className="text-secondary-400">
                {reportGenerated 
                  ? "No se encontraron ventas para el período seleccionado." 
                  : "Selecciona fechas y genera un informe para ver los datos."}
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
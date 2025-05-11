// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { saleService } from "../services/saleService";
import { productService } from "../services/productService";
import { Product, Sale } from "../types/api";

export const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar datos en paralelo
        const [metricsData, salesData, productsData] = await Promise.all([
          saleService.getMetrics(),
          saleService.getAll(),
          productService.getAll(),
        ]);

        console.log("Metrics data:", metricsData); // Para depuración
        setMetrics(metricsData);
        setRecentSales(salesData.slice(0, 5)); // Solo las 5 ventas más recientes
        setProducts(productsData);
      } catch (err: any) {
        setError("Error al cargar los datos del dashboard");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función helper para formatear números con seguridad
  const formatNumber = (value: any): string => {
    if (typeof value === "number") {
      return value.toFixed(2);
    } else if (typeof value === "string") {
      const num = parseFloat(value);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    }
    return "0.00";
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-md bg-secondary-800 p-4 text-white">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-md bg-red-400 bg-opacity-20 p-4 text-red-300">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Asegurarse de que los valores existen y son seguros
  const totalSales = metrics?.totalSales ?? 0;
  const monthlySalesAmount = metrics?.monthlySales?.[0]?.totalAmount ?? 0;
  const bestProduct = metrics?.salesByProduct?.[0]?.productName || "N/A";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-xl p-6 transform transition-transform duration-200 hover:scale-105">
          <h3 className="text-sm font-medium text-primary-100 mb-1">
            Total Ventas
          </h3>
          <p className="text-3xl font-bold text-white">
            ${formatNumber(totalSales)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-xl p-6 transform transition-transform duration-200 hover:scale-105">
          <h3 className="text-sm font-medium text-indigo-100 mb-1">
            Productos
          </h3>
          <p className="text-3xl font-bold text-white">{products.length}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-xl p-6 transform transition-transform duration-200 hover:scale-105">
          <h3 className="text-sm font-medium text-emerald-100 mb-1">
            Ventas del Mes
          </h3>
          <p className="text-3xl font-bold text-white">
            ${formatNumber(monthlySalesAmount)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl shadow-xl p-6 transform transition-transform duration-200 hover:scale-105">
          <h3 className="text-sm font-medium text-amber-100 mb-1">
            Mejor Producto
          </h3>
          <p className="text-xl font-bold text-white truncate">{bestProduct}</p>
        </div>
      </div>

      {/* Ventas recientes */}

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-primary-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
              clipRule="evenodd"
            />
          </svg>
          Ventas Recientes
        </h2>
        <div className="bg-secondary-900 rounded-xl shadow-xl overflow-hidden border border-secondary-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-700">
              <thead>
                <tr className="bg-secondary-800">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700 bg-secondary-900">
                {recentSales.map((sale, index) => {
                  // Asegurarse de que la cantidad y el precio son números
                  const quantity =
                    typeof sale.quantity === "number"
                      ? sale.quantity
                      : parseFloat(sale.quantity as any);
                  const unitPrice =
                    typeof sale.unitPrice === "number"
                      ? sale.unitPrice
                      : parseFloat(sale.unitPrice as any);

                  return (
                    <tr
                      key={sale.id}
                      className={
                        index % 2 === 0
                          ? "bg-secondary-850"
                          : "bg-secondary-900"
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">
                        {sale.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {sale.product?.name || "Desconocido"}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        {!isNaN(quantity) ? quantity : 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        ${!isNaN(unitPrice) ? formatNumber(unitPrice) : "0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-400">
                        $
                        {!isNaN(quantity) && !isNaN(unitPrice)
                          ? formatNumber(quantity * unitPrice)
                          : "0.00"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {recentSales.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-secondary-400"
                    >
                      No hay ventas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Productos populares */}
      <div className="mb-8">
  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm2 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
    Productos Populares
  </h2>
  <div className="bg-secondary-900 rounded-xl shadow-xl overflow-hidden border border-secondary-700">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-700">
        <thead>
          <tr className="bg-secondary-800">
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Nombre</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Descripción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-700 bg-secondary-900">
          {products.slice(0, 5).map((product, index) => (
            <tr key={product.id} className={index % 2 === 0 ? 'bg-secondary-850' : 'bg-secondary-900'}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">{product.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-white">{product.name}</td>
              <td className="px-6 py-4 text-sm text-secondary-300 truncate max-w-xs">{product.description}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-secondary-400">
                No hay productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </div>
  );
};

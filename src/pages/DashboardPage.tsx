// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { saleService } from '../services/saleService';
import { productService } from '../services/productService';
import { Product, Sale } from '../types/api';

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
          productService.getAll()
        ]);
        
        console.log('Metrics data:', metricsData); // Para depuración
        setMetrics(metricsData);
        setRecentSales(salesData.slice(0, 5)); // Solo las 5 ventas más recientes
        setProducts(productsData);
      } catch (err: any) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función helper para formatear números con seguridad
  const formatNumber = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    } else if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
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
  const bestProduct = metrics?.salesByProduct?.[0]?.productName || 'N/A';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h3 className="text-sm font-medium text-secondary-300">Total Ventas</h3>
          <p className="mt-2 text-3xl font-semibold text-white">
            ${formatNumber(totalSales)}
          </p>
        </div>
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h3 className="text-sm font-medium text-secondary-300">Productos</h3>
          <p className="mt-2 text-3xl font-semibold text-white">
            {products.length}
          </p>
        </div>
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h3 className="text-sm font-medium text-secondary-300">Ventas del Mes</h3>
          <p className="mt-2 text-3xl font-semibold text-white">
            ${formatNumber(monthlySalesAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
          <h3 className="text-sm font-medium text-secondary-300">Mejor Producto</h3>
          <p className="mt-2 text-xl font-semibold text-white truncate">
            {bestProduct}
          </p>
        </div>
      </div>
      
      {/* Ventas recientes */}
      <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-white">Ventas Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">ID</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Producto</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Cantidad</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Precio</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Total</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => {
                // Asegurarse de que la cantidad y el precio son números
                const quantity = typeof sale.quantity === 'number' ? sale.quantity : parseFloat(sale.quantity as any);
                const unitPrice = typeof sale.unitPrice === 'number' ? sale.unitPrice : parseFloat(sale.unitPrice as any);
                
                return (
                  <tr key={sale.id} className="border-b border-secondary-700">
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-secondary-300">{sale.id}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-white">{sale.product?.name || 'Desconocido'}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-secondary-300">{!isNaN(quantity) ? quantity : 0}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-secondary-300">
                      ${!isNaN(unitPrice) ? formatNumber(unitPrice) : '0.00'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-white">
                      ${!isNaN(quantity) && !isNaN(unitPrice) ? formatNumber(quantity * unitPrice) : '0.00'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-secondary-300">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-secondary-400">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Productos populares */}
      <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-white">Productos Populares</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">ID</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Nombre</th>
                <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium text-secondary-300">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-secondary-700">
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-secondary-300">{product.id}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-white">{product.name}</td>
                  <td className="px-4 py-2 text-sm text-secondary-300 truncate max-w-xs">{product.description}</td>
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
  );
};
// src/pages/SalesPage.tsx
import { useState, useEffect } from 'react';
import { Sale, Product, User } from '../types/api';
import { saleService } from '../services/saleService';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { Button } from '../components/common/Button';
// import { SaleFormModal } from '../components/features/sales/SaleFormModal';
import { formatNumber } from '../lib/utils';
import { SaleFormModal } from '../components/features/sales/SaleFormModal';

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSaleId, setDeleteSaleId] = useState<number | null>(null);

  // Cargar ventas, productos y usuarios
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [salesData, productsData, usersData] = await Promise.all([
        saleService.getAll(),
        productService.getAll(),
        userService.getAll()
      ]);
      
      setSales(salesData);
      setProducts(productsData);
      setUsers(usersData);
    } catch (err: any) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Abrir modal para crear una nueva venta
  const handleCreateSale = () => {
    setCurrentSale(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar una venta existente
  const handleEditSale = (sale: Sale) => {
    setCurrentSale(sale);
    setIsModalOpen(true);
  };

  // Confirmar eliminación de una venta
  const handleDeleteConfirm = (id: number) => {
    setDeleteSaleId(id);
    setIsDeleting(true);
  };

  // Eliminar una venta
  const handleDeleteSale = async () => {
    if (!deleteSaleId) return;
    
    try {
      setIsLoading(true);
      await saleService.delete(deleteSaleId);
      setSales(sales.filter(s => s.id !== deleteSaleId));
      setDeleteSaleId(null);
      setIsDeleting(false);
    } catch (err: any) {
      setError('Error al eliminar la venta');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar una venta (crear o actualizar)
  const handleSaveSale = async (saleData: Partial<Sale>) => {
    try {
      setIsLoading(true);
      
      if (currentSale) {
        // Actualizar venta existente
        const updatedSale = await saleService.update(currentSale.id, saleData);
        setSales(sales.map(s => s.id === currentSale.id ? updatedSale : s));
      } else {
        // Crear nueva venta
        const newSale = await saleService.create(saleData as Omit<Sale, 'id'>);
        setSales([...sales, newSale]);
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      setError('Error al guardar la venta');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Obtener nombre de producto
  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Desconocido';
  };

  // Obtener nombre de usuario
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Ventas</h1>
        <Button onClick={handleCreateSale}>
          Nueva Venta
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-400 bg-opacity-20 p-4 text-red-300">
          <p>{error}</p>
        </div>
      )}

      {isLoading && !isModalOpen && !isDeleting ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-secondary-300">Cargando ventas...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-secondary-800 shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-secondary-400">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const quantity = typeof sale.quantity === 'number' ? sale.quantity : parseFloat(sale.quantity as any);
                  const unitPrice = typeof sale.unitPrice === 'number' ? sale.unitPrice : parseFloat(sale.unitPrice as any);
                  
                  return (
                    <tr key={sale.id} className="border-b border-secondary-700">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">
                        {sale.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {getProductName(sale.productId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        {getUserName(sale.userId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        {quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        ${formatNumber(unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        ${formatNumber(quantity * unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        {formatDate(sale.date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleEditSale(sale)}
                          className="mr-2 text-primary-400 hover:text-primary-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(sale.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar venta */}
      {isModalOpen && (
        <SaleFormModal
          sale={currentSale}
          products={products}
          users={users}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSale}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {isDeleting && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-900 bg-opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-secondary-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    Eliminar venta
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-secondary-300">
                      ¿Estás seguro que deseas eliminar esta venta? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  onClick={handleDeleteSale}
                  className="w-full sm:ml-3 sm:w-auto"
                >
                  Eliminar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteSaleId(null);
                    setIsDeleting(false);
                  }}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
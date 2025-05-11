import { useState, useEffect } from "react";
import { Sale, Product, User } from "../types/api";
import { saleService } from "../services/saleService";
import { productService } from "../services/productService";
import { userService } from "../services/userService";
import { Button } from "../components/common/Button";
import { SaleFormModal } from "../components/features/sales/SaleFormModal";
import { Modal } from "../components/common/Modal";
import { formatNumber } from "../lib/utils";

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

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Cargar ventas, productos y usuarios
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [salesData, productsData, usersData] = await Promise.all([
        saleService.getAll(),
        productService.getAll(),
        userService.getAll(),
      ]);

      setSales(salesData);
      setProducts(productsData);
      setUsers(usersData);
    } catch (err: any) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Obtener nombre de producto
  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Desconocido";
  };

  // Obtener nombre de usuario
  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Desconocido";
  };

  // Filtrar ventas
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      getProductName(sale.productId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getUserName(sale.userId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sale.id.toString().includes(searchTerm);

    const matchesProduct = productFilter
      ? sale.productId.toString() === productFilter
      : true;

    const matchesDate = dateFilter
      ? new Date(sale.date).toISOString().split("T")[0] === dateFilter
      : true;

    return matchesSearch && matchesProduct && matchesDate;
  });

  // Calcular estadísticas
  const salesTotal = filteredSales.reduce((total, sale) => {
    const quantity =
      typeof sale.quantity === "number"
        ? sale.quantity
        : parseFloat(sale.quantity as any);
    const unitPrice =
      typeof sale.unitPrice === "number"
        ? sale.unitPrice
        : parseFloat(sale.unitPrice as any);
    return total + quantity * unitPrice;
  }, 0);

  const today = new Date().toISOString().split("T")[0];
  const todaySalesCount = sales.filter(
    (sale) => new Date(sale.date).toISOString().split("T")[0] === today
  ).length;

  // Encontrar el producto más vendido
  const salesByProduct = products.map((product) => {
    const productSales = sales.filter((sale) => sale.productId === product.id);
    const totalQuantity = productSales.reduce((sum, sale) => {
      const quantity =
        typeof sale.quantity === "number"
          ? sale.quantity
          : parseFloat(sale.quantity as any);
      return sum + quantity;
    }, 0);
    return { product, totalQuantity };
  });

  salesByProduct.sort((a, b) => b.totalQuantity - a.totalQuantity);
  const topSellingProduct =
    salesByProduct.length > 0 ? salesByProduct[0].product.name : "N/A";

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setProductFilter("");
    setDateFilter("");
  };

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
      setSales(sales.filter((s) => s.id !== deleteSaleId));
      setDeleteSaleId(null);
      setIsDeleting(false);
    } catch (err: any) {
      setError("Error al eliminar la venta");
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
        setSales(sales.map((s) => (s.id === currentSale.id ? updatedSale : s)));
      } else {
        // Crear nueva venta
        const newSale = await saleService.create(saleData as Omit<Sale, "id">);
        setSales([...sales, newSale]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError("Error al guardar la venta");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y estadísticas */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventas</h1>
          <p className="text-secondary-400 mt-1">
            Gestiona todas las transacciones de ventas
          </p>
        </div>
        <Button
          onClick={handleCreateSale}
          className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transform transition-all duration-200 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nueva Venta
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-3">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-primary-100 mb-1">
                Total Ventas
              </p>
              <p className="text-2xl font-bold text-white">
                ${formatNumber(salesTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-indigo-100 mb-1">
                Ventas Hoy
              </p>
              <p className="text-2xl font-bold text-white">{todaySalesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-emerald-100 mb-1">
                Producto Más Vendido
              </p>
              <p className="text-xl font-bold text-white truncate">
                {topSellingProduct}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="rounded-lg bg-red-400 bg-opacity-10 p-4 mb-6 border border-red-300 border-opacity-20">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 mr-3 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-secondary-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar ventas..."
            className="pl-10 rounded-lg border border-secondary-600 bg-secondary-700 w-full py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <input
            type="date"
            className="rounded-lg border border-secondary-600 bg-secondary-700 w-full py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      {isLoading && !isModalOpen && !isDeleting ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
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
            <p className="text-secondary-300 font-medium">Cargando ventas...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-secondary-800 shadow-lg border border-secondary-700">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-800 border-b border-secondary-700">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Usuario
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
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="h-12 w-12 text-secondary-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-secondary-400 text-lg">
                        {searchTerm || productFilter || dateFilter
                          ? "No se encontraron ventas con los filtros seleccionados"
                          : "No hay ventas registradas"}
                      </p>
                      <Button
                        onClick={handleCreateSale}
                        className="mt-4"
                        variant="outline"
                        size="sm"
                      >
                        Registrar venta
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, index) => {
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
                      className={`hover:bg-secondary-750 transition-all duration-150 ${
                        index % 2 === 0
                          ? "bg-secondary-850"
                          : "bg-secondary-800"
                      }`}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {getProductName(sale.productId)}
                        </div>
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
                      <td className="px-6 py-4 text-sm font-medium text-primary-400">
                        ${formatNumber(quantity * unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-300">
                        {formatDate(sale.date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm space-x-2">
                        <button
                          onClick={() => handleEditSale(sale)}
                          className="inline-flex items-center px-3 py-1 border border-secondary-600 rounded-md text-sm font-medium text-primary-400 hover:bg-secondary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(sale.id)}
                          className="inline-flex items-center px-3 py-1 border border-secondary-600 rounded-md text-sm font-medium text-red-400 hover:bg-secondary-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
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
          isOpen={isModalOpen}
          products={products}
          users={users}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSale}
        />
      )}

      {/* Modal para confirmar eliminación */}
      {isDeleting && (
        <Modal
          isOpen={isDeleting}
          onClose={() => {
            setDeleteSaleId(null);
            setIsDeleting(false);
          }}
          title="Eliminar venta"
          maxWidth="sm"
        >
          <div className="sm:flex sm:items-start mb-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4 text-left">
              <p className="text-sm text-secondary-300">
                ¿Estás seguro que deseas eliminar esta venta? Esta acción no se
                puede deshacer.
              </p>
            </div>
          </div>
          <div className="mt-5 sm:flex sm:flex-row-reverse">
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
        </Modal>
      )}
    </div>
  );
};

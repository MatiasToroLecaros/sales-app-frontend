import { useState, useEffect } from "react";
import { Product } from "../types/api";
import { productService } from "../services/productService";
import { Button } from "../components/common/Button";
import { ProductFormModal } from "../components/features/products/ProductFormModal";
import { Modal } from "../components/common/Modal";

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err: any) {
      setError("Error al cargar los productos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir modal para crear un nuevo producto
  const handleCreateProduct = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar un producto existente
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  // Confirmar eliminación de un producto
  const handleDeleteConfirm = (id: number) => {
    setDeleteProductId(id);
    setIsDeleting(true);
  };

  // Eliminar un producto
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      setIsLoading(true);
      await productService.delete(deleteProductId);
      setProducts(products.filter((p) => p.id !== deleteProductId));
      setDeleteProductId(null);
      setIsDeleting(false);
    } catch (err: any) {
      setError("Error al eliminar el producto");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar un producto (crear o actualizar)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      setIsLoading(true);

      if (currentProduct) {
        // Actualizar producto existente
        const updatedProduct = await productService.update(
          currentProduct.id,
          productData
        );
        setProducts(
          products.map((p) => (p.id === currentProduct.id ? updatedProduct : p))
        );
      } else {
        // Crear nuevo producto
        const newProduct = await productService.create(
          productData as Omit<Product, "id">
        );
        setProducts([...products, newProduct]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError("Error al guardar el producto");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-secondary-400 mt-1">
            Gestiona los productos de tu inventario
          </p>
        </div>
        <Button
          onClick={handleCreateProduct}
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
          Nuevo Producto
        </Button>
      </div>

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

      <div className="mb-6">
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
            placeholder="Buscar productos..."
            className="pl-10 rounded-lg border border-secondary-600 bg-secondary-700 w-full py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
            <p className="text-secondary-300 font-medium">
              Cargando productos...
            </p>
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
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Descripción
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-secondary-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-secondary-400 text-lg">
                        {searchTerm
                          ? "No se encontraron productos que coincidan con la búsqueda."
                          : "No hay productos registrados"}
                      </p>
                      <Button
                        onClick={handleCreateProduct}
                        className="mt-4"
                        variant="outline"
                        size="sm"
                      >
                        Agregar Producto
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-secondary-750 transition-all duration-150 ${
                      index % 2 === 0 ? "bg-secondary-850" : "bg-secondary-800"
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-300 truncate max-w-xs">
                      {product.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
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
                        onClick={() => handleDeleteConfirm(product.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar producto */}
      {isModalOpen && (
        <ProductFormModal
          product={currentProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {isDeleting && (
        <Modal
          isOpen={isDeleting}
          onClose={() => {
            setDeleteProductId(null);
            setIsDeleting(false);
          }}
          title="Eliminar producto"
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
                ¿Estás seguro que deseas eliminar este producto? Esta acción no
                se puede deshacer.
              </p>
            </div>
          </div>
          <div className="mt-5 sm:flex sm:flex-row-reverse">
            <Button
              variant="danger"
              onClick={handleDeleteProduct}
              className="w-full sm:ml-3 sm:w-auto"
            >
              Eliminar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteProductId(null);
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

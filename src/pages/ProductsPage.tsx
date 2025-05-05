// src/pages/ProductsPage.tsx
import { useState, useEffect } from 'react';
import { Product } from '../types/api';
import { productService } from '../services/productService';
import { Button } from '../components/common/Button';
import { ProductFormModal } from '../components/features/products/ProductFormModal';


export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err: any) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      setProducts(products.filter(p => p.id !== deleteProductId));
      setDeleteProductId(null);
      setIsDeleting(false);
    } catch (err: any) {
      setError('Error al eliminar el producto');
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
        const updatedProduct = await productService.update(currentProduct.id, productData);
        setProducts(products.map(p => p.id === currentProduct.id ? updatedProduct : p));
      } else {
        // Crear nuevo producto
        const newProduct = await productService.create(productData as Omit<Product, 'id'>);
        setProducts([...products, newProduct]);
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      setError('Error al guardar el producto');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <Button onClick={handleCreateProduct}>
          Nuevo Producto
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-400 bg-opacity-20 p-4 text-red-300">
          <p>{error}</p>
        </div>
      )}

      {isLoading && !isModalOpen && !isDeleting ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-secondary-300">Cargando productos...</p>
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
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-secondary-400">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-secondary-700">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-300">
                      {product.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-300 truncate max-w-xs">
                      {product.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="mr-2 text-primary-400 hover:text-primary-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
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
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
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
                    Eliminar producto
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-secondary-300">
                      ¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
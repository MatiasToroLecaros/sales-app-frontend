import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sale, Product, User } from '../../../types/api';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Modal } from '../../common/Modal';

interface SaleFormModalProps {
  sale: Sale | null;
  isOpen: boolean; // Nuevo prop
  products: Product[];
  users: User[];
  onClose: () => void;
  onSave: (sale: Partial<Sale>) => void;
}

// Esquema de validación
const saleSchema = z.object({
  productId: z.number().min(1, 'Debes seleccionar un producto'),
  userId: z.number().min(1, 'Debes seleccionar un usuario'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  sale,
  isOpen,
  products,
  users,
  onClose,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatear fecha para input date
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: sale?.productId || 0,
      userId: sale?.userId || 0,
      quantity: sale?.quantity || 1,
      unitPrice: sale?.unitPrice || 0,
      date: sale?.date ? formatDateForInput(sale.date) : formatDateForInput(new Date().toISOString()),
    },
  });

  const onSubmit = async (data: SaleFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sale ? 'Editar Venta' : 'Nueva Venta'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="productId" className="mb-1 text-sm font-medium text-secondary-300">
            Producto
          </label>
          <select
            id="productId"
            className={`block w-full rounded-md border ${
              errors.productId ? 'border-red-300' : 'border-secondary-600'
            } bg-secondary-700 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('productId', { valueAsNumber: true })}
          >
            <option value={0}>Selecciona un producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="mt-1 text-sm text-red-500">{errors.productId.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="userId" className="mb-1 text-sm font-medium text-secondary-300">
            Usuario
          </label>
          <select
            id="userId"
            className={`block w-full rounded-md border ${
              errors.userId ? 'border-red-300' : 'border-secondary-600'
            } bg-secondary-700 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('userId', { valueAsNumber: true })}
          >
            <option value={0}>Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.userId && (
            <p className="mt-1 text-sm text-red-500">{errors.userId.message}</p>
          )}
        </div>

        <Input
          label="Cantidad"
          type="number"
          min="1"
          step="1"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
          fullWidth
        />

        <Input
          label="Precio Unitario"
          type="number"
          min="0.01"
          step="0.01"
          {...register('unitPrice', { valueAsNumber: true })}
          error={errors.unitPrice?.message}
          fullWidth
        />

        <Input
          label="Fecha"
          type="date"
          {...register('date')}
          error={errors.date?.message}
          fullWidth
        />

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="sm:col-start-2"
          >
            {sale ? 'Guardar Cambios' : 'Crear Venta'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="mt-3 sm:col-start-1 sm:mt-0"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
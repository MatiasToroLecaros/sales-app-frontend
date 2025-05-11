import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '../../../types/api';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Modal } from '../../common/Modal';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean; // Nuevo prop
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
}

// Esquema de validación
const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
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
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre"
          {...register('name')}
          error={errors.name?.message}
          fullWidth
        />
        <div className="flex flex-col">
          <label htmlFor="description" className="mb-1 text-sm font-medium text-secondary-300">
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            className={`block w-full rounded-md border ${
              errors.description ? 'border-red-300' : 'border-secondary-600'
            } bg-secondary-700 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="sm:col-start-2"
          >
            {product ? 'Guardar Cambios' : 'Crear Producto'}
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
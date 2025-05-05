// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '../types/api';
import { userService } from '../services/userService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useStore } from '../store';

// Esquema de validación para actualizar perfil
const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Si hay nueva contraseña, verificar que coincida con la confirmación
  if (data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => {
  // Si hay nueva contraseña, debe haber contraseña actual
  if (data.newPassword) {
    return !!data.currentPassword;
  }
  return true;
}, {
  message: 'Debes ingresar tu contraseña actual para cambiarla',
  path: ['currentPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user: storeUser, setUser } = useStore();
  const [user, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener perfil del usuario actual
        const userData = await userService.getProfile();
        setUserData(userData);
        
        // Establecer valores por defecto en el formulario
        reset({
          name: userData.name,
          email: userData.email,
        });
      } catch (err) {
        setError('Error al cargar datos del perfil');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [reset]);

  // Actualizar perfil
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      if (!user) return;
      
      const updateData: Partial<User & { currentPassword?: string, newPassword?: string }> = {
        name: data.name,
        email: data.email,
      };
      
      // Incluir cambio de contraseña si se proporciona
      if (data.newPassword && data.currentPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      
      // Actualizar perfil en el backend
      const updatedUser = await userService.update(user.id, updateData);
      
      // Actualizar datos locales
      setUserData(updatedUser);
      setUser(updatedUser);
      setSuccessMessage('Perfil actualizado correctamente');
      
      // Limpiar campos de contraseña
      reset({
        name: updatedUser.name,
        email: updatedUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-secondary-300">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
      
      {error && (
        <div className="rounded-md bg-red-400 bg-opacity-20 p-4 text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="rounded-md bg-green-400 bg-opacity-20 p-4 text-green-300">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="rounded-lg bg-secondary-800 p-6 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            {...register('name')}
            error={errors.name?.message}
            fullWidth
          />
          
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            fullWidth
          />
          
          <div className="border-t border-secondary-700 pt-4">
            <h2 className="mb-4 text-lg font-semibold text-white">Cambiar Contraseña</h2>
            
            <Input
              label="Contraseña Actual"
              type="password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
              fullWidth
            />
            
            <Input
              label="Nueva Contraseña"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              fullWidth
            />
            
            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              fullWidth
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSaving}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
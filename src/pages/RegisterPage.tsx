import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authService } from '../services/authService';

// Esquema de validación
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Omitir confirmPassword antes de enviar al servidor
      const { confirmPassword, ...registerData } = data;
      
      await authService.register(registerData);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al registrar usuario'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Crea tu cuenta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              label="Nombre"
              type="text"
              fullWidth
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              fullWidth
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Contraseña"
              type="password"
              fullWidth
              {...register('password')}
              error={errors.password?.message}
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              fullWidth
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-400 bg-opacity-20 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            Registrarse
          </Button>

          <div className="text-center">
            <p className="text-sm text-secondary-300">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
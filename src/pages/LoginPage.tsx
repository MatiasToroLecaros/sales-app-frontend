import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useStore } from '../store';
import { authService } from '../services/authService';

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(data);
      login(response.access_token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al iniciar sesión'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary-900 to-secondary-950">
    <div className="w-full max-w-md px-8 py-6">
      {/* Logo o imagen de la aplicación */}
      <div className="flex justify-center mb-8">
        <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
      
      
        {/* Contenedor del formulario */}
        <div className="overflow-hidden rounded-xl bg-secondary-800 shadow-2xl">
          <div className="px-6 pt-8 pb-6">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-white">
              Inicia sesión
            </h2>
            <p className="text-center text-sm text-secondary-400">
              Accede a tu cuenta para gestionar tus ventas
            </p>
          </div>
          
          <div className="bg-secondary-800 px-6 py-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  fullWidth
                  placeholder="tucorreo@ejemplo.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  fullWidth
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-400 bg-opacity-20 p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className="py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transform transition-all duration-200 hover:scale-105"
                >
                  Iniciar sesión
                </Button>
              </div>
            </form>
          </div>
          
          <div className="border-t border-secondary-700 bg-secondary-800 px-6 py-4">
            <p className="text-center text-sm text-secondary-400">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-500">
            © 2025 Sales App. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
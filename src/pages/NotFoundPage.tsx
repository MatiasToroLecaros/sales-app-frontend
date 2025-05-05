import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary-900 px-4 py-12 text-center">
      <h1 className="text-9xl font-bold text-primary-500">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-white">Página no encontrada</h2>
      <p className="mt-2 text-lg text-secondary-300">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" size="lg">
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
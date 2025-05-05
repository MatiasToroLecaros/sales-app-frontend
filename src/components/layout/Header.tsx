import { useStore } from '../../store';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, logout } = useStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-6">
      <div className="flex items-center">
        <h2 className="text-xl font-medium text-secondary-800">
          Dashboard
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-secondary-600">
          {user?.name}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
        >
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
};
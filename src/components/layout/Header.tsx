import { useStore } from "../../store";
import { Button } from "../common/Button";

export const Header: React.FC = () => {
  const { user, logout } = useStore();

  return (
    <header className="bg-secondary-800 border-b border-secondary-700 shadow-md">
      <div className="flex items-center justify-between h-16 px-6">
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-secondary-300">
            {user?.name || "Usuario"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-secondary-600 text-secondary-300 hover:bg-secondary-700"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
};

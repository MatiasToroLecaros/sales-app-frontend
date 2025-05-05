// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

// Iconos (puedes usar react-icons o cualquier otra librería)
const icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
    </svg>
  ),
  products: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  ),
  sales: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  ),
  reports: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
    </svg>
  ),
};

// Definición de enlaces de la barra lateral
const navigationLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Productos', path: '/products', icon: 'products' },
  { name: 'Ventas', path: '/sales', icon: 'sales' },
  { name: 'Informes', path: '/reports', icon: 'reports' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  // Verificar si una ruta está activa
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-secondary-800 text-white">
      <div className="flex h-16 items-center justify-center border-b border-secondary-700">
        <h1 className="text-xl font-bold">Sales App</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationLinks.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={clsx(
                  'flex items-center rounded-md px-4 py-2 transition-colors',
                  {
                    'bg-primary-600 text-white': isActive(item.path),
                    'text-gray-300 hover:bg-secondary-700': !isActive(item.path),
                  }
                )}
              >
                <span className="mr-3">{icons[item.icon as keyof typeof icons]}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-secondary-700 p-4">
        <Link to="/profile" className="flex items-center">
          <div className="mr-3 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Mi Perfil</p>
            <p className="text-xs text-secondary-400">Ver ajustes</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
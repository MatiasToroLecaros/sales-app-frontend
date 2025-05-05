import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MainLayout } from './components/layout/MainLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      // {
      //   path: '/products',
      //   element: <ProductsPage />,
      // },
      // {
      //   path: '/sales',
      //   element: <SalesPage />,
      // },
      // {
      //   path: '/reports',
      //   element: <ReportsPage />,
      // },
      // {
      //   path: '/profile',
      //   element: <ProfilePage />,
      // },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
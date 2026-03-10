import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Home } from '@/pages/Home';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ClientesPage } from '@/features/clientes/pages/ClientesPage';
import { FuncionariosPage } from '@/features/funcionarios/pages/FuncionariosPage';
import { BrinquedosPage } from '@/features/brinquedos/pages/BrinquedosPage';
import { RelatoriosPage } from '@/features/relatorios/pages/RelatoriosPage';
import { PerfilPage } from '@/features/perfil/pages/PerfilPage';
import { EventosPage } from '@/features/eventos/pages/EventosPage';
import { CalendarioPage } from '@/features/calendario/pages/CalendarioPage';
import { DetailsPage } from '@/pages/DetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
          {
            path: '/eventos',
            element: <EventosPage />,
          },
          {
            path: '/calendario',
            element: <CalendarioPage />,
          },
          {
            path: '/clientes',
            element: <ClientesPage />,
          },
          {
            path: '/funcionarios',
            element: <FuncionariosPage />,
          },
          {
            path: '/brinquedos',
            element: <BrinquedosPage />,
          },
          {
            path: '/relatorios',
            element: <RelatoriosPage />,
          },
          {
            path: '/perfil',
            element: <PerfilPage />,
          },
          {
            path: '/detalhes/:type/:id',
            element: <DetailsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

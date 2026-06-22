import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import BookList from './pages/books/BookList';
import CategoryList from './pages/categories/CategoryList';
import BorrowList from './pages/borrow/BorrowList';
import ReaderList from './pages/readers/ReaderList';
import StaffList from './pages/staffs/StaffList';
import FineList from './pages/fines/FineList';
import ReportPage from './pages/reports/ReportPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'books', element: <BookList /> },
          { path: 'categories', element: <CategoryList /> },
          { path: 'readers', element: <ReaderList /> },
          { path: 'borrow-tickets', element: <BorrowList /> },
          { path: 'fines', element: <FineList /> },
          { path: 'reports', element: <ReportPage /> },
          // Admin-only routes
          {
            path: 'staffs',
            element: <ProtectedRoute allowedRoles={['Admin', 'ADMIN']} />,
            children: [{ index: true, element: <StaffList /> }],
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

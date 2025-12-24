import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const token = localStorage.getItem('adminToken');
  return token ? <Outlet /> : <Navigate to="/cms/login" replace />;
};

export default AdminProtectedRoute;


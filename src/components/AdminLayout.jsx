import { Outlet } from 'react-router-dom';

/**
 * AdminLayout - Root layout for all /cms routes
 * Provides full viewport isolation from portfolio
 */
const AdminLayout = () => {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <Outlet />
    </div>
  );
};

export default AdminLayout;


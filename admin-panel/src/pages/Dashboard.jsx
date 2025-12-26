import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

const Dashboard = ({ onLogout }) => {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { path: '/cms/dashboard/profile', label: 'Profile & About' },
    { path: '/cms/dashboard/change-password', label: 'Name & Password' },
    { path: '/cms/dashboard/features', label: 'About Features' },
    { path: '/cms/dashboard/education', label: 'Education' },
    { path: '/cms/dashboard/languages', label: 'Languages' },
    { path: '/cms/dashboard/skills', label: 'Skills / Tech Stack' },
    { path: '/cms/dashboard/expertise', label: 'Technical Expertise' },
    { path: '/cms/dashboard/projects', label: 'Projects' },
    { path: '/cms/dashboard/certifications', label: 'Certifications' },
    { path: '/cms/dashboard/resume', label: 'Resume' },
    { path: '/cms/dashboard/contact-info', label: 'Get in Touch' },
    { path: '/cms/dashboard/activity-logs', label: 'Activity Logs' }
  ];

  return (
    <div className="min-h-screen bg-black text-white" style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div 
        className="bg-white/5 border-r border-white/10 p-6 z-10 overflow-y-auto" 
        style={{ 
          position: 'fixed', 
          left: 0, 
          top: 0, 
          height: '100vh', 
          width: '256px',
          flexShrink: 0
        }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter">
            PORTFOLIO<span className="text-emerald-500">.CMS</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>

        <nav className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 justify-center"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main Content - positioned to the right of sidebar */}
      <div 
        className="p-8" 
        style={{ 
          marginLeft: '256px', 
          width: 'calc(100% - 256px)',
          minHeight: '100vh',
          overflowY: 'auto',
          maxHeight: '100vh'
        }}
      >
        <Outlet />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4">Confirm Logout</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to logout? You will need to login again to access the admin panel.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


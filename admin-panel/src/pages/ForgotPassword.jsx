import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authAPI.forgotPassword(username);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">FORGOT PASSWORD</h1>
            <p className="text-gray-400">Enter your username to receive a reset link</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle size={18} />
                <span>If an account with that username exists, a password reset link has been sent.</span>
              </div>
              <p className="text-sm text-gray-400 text-center">
                Please check your email for the reset link. The link will expire in 30 minutes.
              </p>
              <Link
                to="/cms/login"
                className="block w-full py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all text-center uppercase tracking-wide"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {loading ? 'SENDING...' : 'SEND RESET LINK'}
              </button>

              <Link
                to="/cms/login"
                className="flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


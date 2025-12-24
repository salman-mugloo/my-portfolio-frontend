import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { authAPI } from '../services/api';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [usernameChanging, setUsernameChanging] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameMessage({ type: 'error', text: 'Please enter a new username (email)' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUsername.trim())) {
      setUsernameMessage({ type: 'error', text: 'Please provide a valid email address' });
      return;
    }

    setUsernameChanging(true);
    setUsernameMessage({ type: '', text: '' });

    try {
      const response = await authAPI.changeUsername(newUsername.trim());
      setUsernameMessage({ type: 'success', text: response.message || 'Username updated. Please log in again.' });
      setNewUsername('');
      
      setTimeout(() => {
        setUsernameMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      setUsernameMessage({ type: 'error', text: error.message || 'Failed to update username. Please try again.' });
    } finally {
      setUsernameChanging(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await authAPI.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      
      setSubmitStatus('success');
      setSubmitMessage(response.message || 'Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitMessage('');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <Lock className="text-emerald-400" size={36} />
          Name and Password
        </h1>
        <p className="text-gray-500">Manage your account credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Change Password Section */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-black mb-6 text-emerald-400 flex items-center gap-2">
              <Lock size={24} />
              Change Password
            </h2>

            <div className="space-y-6">
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
                  <p className="text-emerald-400 font-medium">{submitMessage}</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                  <p className="text-red-400 font-medium">{submitMessage}</p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 ${
                      errors.currentPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Enter your current password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="text-gray-500 hover:text-white transition-colors"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                    tabIndex={-1}
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 ${
                      errors.newPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Enter your new password (min. 6 characters)"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="text-gray-500 hover:text-white transition-colors"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                    tabIndex={-1}
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 ${
                      errors.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Confirm your new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="text-gray-500 hover:text-white transition-colors"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                    tabIndex={-1}
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        {/* Change Username Section */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-black mb-6 text-emerald-400 flex items-center gap-2">
              <Mail size={24} />
              Change Username (Email)
            </h2>

            {usernameMessage.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                usernameMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {usernameMessage.type === 'success' ? (
                  <CheckCircle className="flex-shrink-0" size={24} />
                ) : (
                  <AlertCircle className="flex-shrink-0" size={24} />
                )}
                <p className="font-medium">{usernameMessage.text}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="newUsername" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  New Username (Email) *
                </label>
                <input
                  type="email"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter new email address"
                  disabled={usernameChanging}
                />
                <p className="mt-2 text-xs text-gray-500">
                  You will need to log in again with your new username after updating.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleChangeUsername}
                  disabled={usernameChanging || !newUsername.trim()}
                  className="flex-1 px-6 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {usernameChanging ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      Update Username
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Security Tips */}
      <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl lg:max-w-[calc(50%-1rem)]">
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
            Password Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Use at least 6 characters (more is better)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Mix uppercase and lowercase letters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Include numbers and special characters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Don't reuse passwords from other accounts</span>
            </li>
          </ul>
        </div>
    </div>
  );
};

export default ChangePassword;


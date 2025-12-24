import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Shield, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const VerifyOTP = ({ onLogin }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('otpEmail');
    if (!storedEmail) {
      // No email found, redirect to login
      navigate('/cms/login');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!email) {
      setError('Email not found. Please login again.');
      navigate('/cms/login');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyLoginOTP(email, otpString);
      
      if (response.token) {
        setSuccess(true);
        // Clear email from sessionStorage
        sessionStorage.removeItem('otpEmail');
        // Save token and login
        onLogin(response.token);
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/cms/dashboard');
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendDisabled) return;

    setResendLoading(true);
    setError('');

    try {
      await authAPI.resendLoginOTP(email);
      setResendDisabled(true);
      setResendCountdown(30); // 30 seconds cooldown
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-500/10 rounded-full p-4">
                <Shield className="text-emerald-400" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">VERIFY OTP</h1>
            <p className="text-gray-400">Enter the 6-digit code sent to</p>
            <p className="text-emerald-400 font-semibold mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle size={18} />
                <span>OTP verified successfully! Redirecting...</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-wide text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
                    disabled={loading || success}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success || otp.join('').length !== 6}
              className="w-full py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {loading ? 'VERIFYING...' : success ? 'VERIFIED' : 'VERIFY OTP'}
            </button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled || resendLoading}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading
                  ? 'SENDING...'
                  : resendCountdown > 0
                  ? `Resend OTP (${resendCountdown}s)`
                  : 'Resend OTP'}
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('otpEmail');
                    navigate('/cms/login');
                  }}
                  className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;


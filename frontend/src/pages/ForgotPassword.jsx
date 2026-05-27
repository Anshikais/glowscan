import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { ShieldAlert, KeyRound, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify and Reset
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Start the password reset flow in Clerk
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setMessage('A reset OTP code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Verify code and apply new password via Clerk
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: otp,
        password: newPassword,
      });

      if (result.status === 'complete') {
        // Activate session in Clerk
        await setActive({ session: result.createdSessionId });
        setMessage('Password successfully reset! Syncing credentials...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        console.log("Clerk password reset status:", result.status);
        setError('Password reset could not be completed. Please try again.');
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#030712] transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#2D7DD2]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2D7DD2]/5 rounded-full blur-3xl animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 space-y-6 relative z-10 shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2D7DD2]/10 text-[#2D7DD2] border border-[#2D7DD2]/20">
            {step === 1 ? (
              <ShieldAlert className="h-7 w-7" />
            ) : (
              <KeyRound className="h-7 w-7" />
            )}
          </div>
          <h2 className="mt-4 text-3xl font-heading font-extrabold tracking-tight text-white">
            {step === 1 ? 'Recover Password' : 'Reset Password'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            {step === 1 ? 'Security Authorization' : 'Credentials Calibrations'}
          </p>
          <p className="mt-3 text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            {step === 1
              ? 'Enter your registered email address below, and we will transmit a verification code to authorize password reset.'
              : 'Enter the 6-digit OTP code sent to your inbox and define a secure new credential password.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  className="pl-10 w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7DD2]/30 focus:border-[#2D7DD2] text-sm transition-all text-white placeholder-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email || !isLoaded}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#2D7DD2] hover:bg-[#2D7DD2]/85 transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />
                    Transmitting OTP Code
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Verification Code (OTP)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7DD2]/30 focus:border-[#2D7DD2] tracking-widest text-center text-lg font-bold transition-all text-white placeholder-slate-700 font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-10 w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7DD2]/30 focus:border-[#2D7DD2] text-sm transition-all text-white placeholder-slate-600"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !otp || !newPassword || !isLoaded}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#2D7DD2] hover:bg-[#2D7DD2]/85 transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />
                    Resetting Credentials
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-slate-800/60 pt-4 text-center space-y-2 flex flex-col items-center">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              Modify Email Destination
            </button>
          )}
          <Link to="/login" className="text-xs font-bold text-[#2D7DD2] hover:underline uppercase tracking-wider text-[10px]">
            Back to Login Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

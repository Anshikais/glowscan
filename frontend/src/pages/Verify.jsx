import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { ShieldCheck, Mail, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Verify() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!signUp) {
        throw new Error('No active registration session found. Please register a new account.');
      }

      // Verify the OTP via Clerk
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      if (completeSignUp.status === 'complete') {
        // Activate session in Clerk, which SyncClerkAuth will pick up and sync with backend
        await setActive({ session: completeSignUp.createdSessionId });
        setMessage('Account successfully verified! Syncing clinical database...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        console.log("Clerk verification status:", completeSignUp.status);
        setError('Verification could not be completed. Please contact support.');
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded) return;
    setError('');
    setMessage('');
    setResending(true);

    try {
      if (!signUp) {
        throw new Error('No active registration session found. Please register a new account.');
      }

      // Resend OTP via Clerk
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      setMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
    } finally {
      setResending(false);
    }
  };

  // If signUp session is missing (e.g. page was visited directly or after refresh without sign-up context)
  const isSessionMissing = isLoaded && !signUp;

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
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-3xl font-heading font-extrabold tracking-tight text-white">
            Verify Email
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            Diagnostics Verification
          </p>
          <p className="mt-3 text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            We sent a secure validation code to your email inbox. Please retrieve the code and enter it below.
          </p>
        </div>

        {isSessionMissing ? (
          <div className="space-y-4">
            <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>No active registration session found. Please register an account first.</span>
            </div>
            <Link 
              to="/signup" 
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#2D7DD2] hover:bg-[#2D7DD2]/85 transition-all shadow-md uppercase tracking-wider text-center"
            >
              Go to Registration
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleVerify}>
            {error && (
              <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled
                    placeholder="name@domain.com"
                    className="pl-10 w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-sm text-slate-400 cursor-not-allowed focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
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
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading || !otp || !isLoaded}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#2D7DD2] hover:bg-[#2D7DD2]/85 transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />
                    Verifying OTP Code
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !isLoaded}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-800 text-xs font-bold rounded-xl text-slate-300 bg-slate-950/80 hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 text-[#2D7DD2] ${resending ? 'animate-spin' : ''}`} />
                Resend OTP Code
              </button>
            </div>

            <div className="border-t border-slate-800/60 pt-4 text-center">
              <Link to="/login" className="text-xs font-bold text-[#2D7DD2] hover:underline uppercase tracking-wider text-[10px]">
                Back to Login Portal
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

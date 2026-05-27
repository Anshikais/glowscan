import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { Activity, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);

    try {
      // Create sign-up record on Clerk
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send verification OTP code via Clerk
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      // Redirect user to the verify screen
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#030712] transition-colors duration-300 relative overflow-hidden">
      {/* Background Glowing Shapes */}
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
            <Activity className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-3xl font-heading font-extrabold tracking-tight text-white">
            Create Account
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
            Initiate Skincare Journey
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
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
                  placeholder="name@domain.com"
                  className="pl-10 w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7DD2]/30 focus:border-[#2D7DD2] text-sm transition-all text-white placeholder-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7DD2]/30 focus:border-[#2D7DD2] text-sm transition-all text-white placeholder-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#2D7DD2] hover:bg-[#2D7DD2]/85 transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />
                  Creating Secure Account
                </>
              ) : (
                'Register Account'
              )}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800/60 pt-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#2D7DD2] hover:underline transition-colors uppercase tracking-wider text-[10px]">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}


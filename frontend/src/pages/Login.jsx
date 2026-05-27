import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { Activity, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
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
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/dashboard');
      } else {
        console.log("Clerk sign-in status:", result.status);
        setError('Login could not be completed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : err.message);
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
            <Activity className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-3xl font-heading font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">

          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-[#2D7DD2] hover:underline uppercase tracking-wider">
                  Forgot Password?
                </Link>
              </div>
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
                  Verifying Credentials
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </div>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-450 uppercase tracking-widest font-extrabold">or connect via</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !isLoaded}
          className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-950/80 hover:bg-slate-900 border border-slate-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 uppercase tracking-wider"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google Identity Secure
        </button>

        <div className="border-t border-slate-800/60 pt-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#2D7DD2] hover:underline transition-colors uppercase tracking-wider text-[10px]">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}


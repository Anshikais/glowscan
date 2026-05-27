import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { UserButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Camera, 
  History, 
  Brain,
  MapPin, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Mail, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';

export default function SidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Scan', path: '/new-scan', icon: Camera },
    { name: 'AI Insights', path: '/insights', icon: Brain },
    { name: 'Clinics', path: '/dermatologists', icon: MapPin },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Mock Inbox', path: '/mock-inbox', icon: Mail },
  ];

  const getPageTitle = () => {
    const current = navigation.find(n => n.path === location.pathname);
    if (location.pathname === '/new-scan') return 'New Scan';
    if (location.pathname === '/insights') return 'AI Dermal Insights';
    if (location.pathname === '/settings') return 'Diagnostic Portal Settings';
    if (location.pathname === '/mock-inbox') return 'Security Transactional Inbox';
    return current ? current.name : 'Dermal Portal';
  };

  const activePath = location.pathname;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-hidden flex">
      {/* Background Glowing Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#06b6d4]/5 rounded-full filter blur-[120px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#a855f7]/5 rounded-full filter blur-[140px] animate-float-slower pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] bg-[#3b82f6]/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* DESKTOP SIDEBAR - Floating Glass Panel */}
      <aside className="hidden lg:flex flex-col w-72 h-[calc(100vh-2rem)] sticky top-4 left-4 my-4 ml-4 rounded-[30px] glass-panel z-40 overflow-hidden flex-shrink-0 shadow-2xl">
        {/* Glowing Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 neon-glow-cyan animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              AI Skin  <span className="text-cyan-400 font-medium">Detection</span>
            </h1>
            <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">AI Clinical Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = activePath === item.path && (!item.state || location.state?.openScan);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                state={item.state}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 neon-glow-cyan' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`h-4.5 w-4.5 transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer wrapper */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 border border-cyan-500/30 rounded-full" } }} />
              <div className="text-left min-w-0">
                <p className="text-[10px] font-extrabold text-white truncate max-w-[120px]">Diagnostics User</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Log</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER TRIGGER / TOP NAV BAR */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 z-30 bg-[#030712]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Hamburger trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Portal Diagnostics</h2>
              <h1 className="text-xl font-heading font-extrabold text-white mt-0.5 tracking-tight">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats / link indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              AI Core Online
            </div>

            {/* Clerk User Button for Mobile/Tablet */}
            <div className="lg:hidden flex items-center">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 border border-cyan-500/30 rounded-full" } }} />
            </div>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT WRAPPER */}
        <main className="flex-grow overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 w-80 h-full bg-[#030712] border-r border-white/5 flex flex-col z-55 p-6 shadow-2xl justify-between"
            >
              <div>
                {/* Brand header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="font-heading font-extrabold text-base tracking-tight text-white">
                        AURA <span className="text-cyan-400">SKIN</span>
                      </h1>
                      <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">AI Clinical Portal</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Nav items */}
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = activePath === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        state={item.state}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                          isActive 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 neon-glow-cyan' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="border-t border-white/5 pt-6 bg-[#030712]">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 border border-cyan-500/30 rounded-full" } }} />
                    <div className="text-left">
                      <p className="text-[10px] font-extrabold text-white">Diagnostics User</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Log</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

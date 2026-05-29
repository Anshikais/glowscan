import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Mail, MapPin, CheckCircle, AlertCircle, Info as InfoIcon, Clock } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useApi } from '../hooks/useApi';

export default function Navbar() {
  const navigate = useNavigate();
  const { request } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await request(`${import.meta.env.VITE_API_URL}/notifications/`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [request]);

  const handleMarkAllRead = async () => {
    try {
      const response = await request(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const response = await request(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clerk handles session state; token is cleared by SyncClerkAuth component on signout

  const unreadCount = notifications.filter(n => !n.is_read).length;
  return (
    <nav className="bg-[#0A1628] w-full z-50 py-3 shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-12 items-center">
          
          {/* Logo - crisp white sans-serif */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">AI Skincare</span>
            </Link>
            
            {/* Nav links */}
            <div className="hidden md:ml-12 md:flex md:space-x-8">
              <Link to="/dashboard" className="text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
                New Scan
              </Link>
              <Link to="/history" className="text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
                History
              </Link>
              <Link to="/dermatologists" className="text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
                Clinics
              </Link>
              <Link to="/mock-inbox" className="text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
                Inbox
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Mobile nav indicator */}
            <div className="md:hidden flex space-x-3 text-[10px] uppercase font-bold text-slate-300 mr-2">
              <Link to="/history" className="hover:text-white">History</Link>
              <Link to="/dermatologists" className="hover:text-white">Clinics</Link>
            </div>

            {/* Notifications panel */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-1.5 text-slate-200 hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-[#2D7DD2]" />
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-[#0A1628] text-xs uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-[#2D7DD2] hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">
                        No logs recorded.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkRead(notif.id)}
                          className={`px-4 py-3 hover:bg-slate-50 transition-colors flex items-start space-x-3 cursor-pointer border-b border-slate-100 last:border-0 ${!notif.is_read ? 'bg-[#2D7DD2]/5' : ''}`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {notif.type === 'success' ? (
                              <CheckCircle className="h-3.5 w-3.5 text-[#2D7DD2]" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs text-slate-800 ${!notif.is_read ? 'font-bold' : 'font-medium'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <span className="h-1.5 w-1.5 bg-[#2D7DD2] rounded-full mt-2 flex-shrink-0"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Button */}
            <div className="flex items-center pl-2">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7 border border-[#2D7DD2]/40 rounded-full hover:scale-105 transition-all shadow-sm shadow-[#2D7DD2]/20"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


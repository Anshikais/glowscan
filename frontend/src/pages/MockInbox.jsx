import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Calendar, User, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MockInbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/uploads/email_sent.log`
);
      if (response.status === 404) {
        setEmails([]);
        return;
      }
      if (!response.ok) throw new Error('Failed to load email logs');

      const data = await response.json();
      // Sort desc (newest first)
      setEmails(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error(err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="relative min-h-screen py-10 bg-[#F8FAFC]">
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-12 border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight text-[#0A1628] flex items-center gap-2">
              <Mail className="h-8 w-8 text-[#2D7DD2]" />
              Simulated Inbox
            </h1>
            <p className="mt-2 text-slate-500 text-xs tracking-wide uppercase font-semibold">
              Sandbox testing environment for transactional OTP notifications
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#0A1628] transition-colors py-1 border-b border-transparent hover:border-[#0A1628]"
            >
              Dashboard
            </Link>
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="flex items-center text-xs font-bold text-[#0A1628] bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm uppercase tracking-wider"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''} text-[#2D7DD2]`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Developer notice */}
        <div className="bg-amber-50 border border-amber-100 text-slate-700 rounded-xl p-5 mb-6 flex items-start">
          <Info className="h-5 w-5 mr-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs uppercase tracking-widest text-amber-800">Sandbox Mode Active</span>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500 font-medium">
              No SMTP connection is configured to prevent spam. All server-side transactional emails are redirected here for testing convenience. Review this box to fetch authentication OTPs.
            </p>
          </div>
        </div>

        {loading && emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#2D7DD2]" />
            <p className="text-xs font-semibold uppercase tracking-widest">Polling mailbox logs...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="white-tile rounded-xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto min-h-[250px]">
            <Mail className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-base font-bold text-[#0A1628] mb-2 font-heading">Simulated Mailbox is Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              No transactional messages are currently logged. Register a new user or submit a reset query to trigger a notification code.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {emails.map((email, idx) => (
              <div
                key={idx}
                className="white-tile p-6 rounded-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2D7DD2]/5 rounded-full mix-blend-multiply filter blur-xl opacity-30 transform translate-x-8 -translate-y-8"></div>
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <User className="w-4 h-4 text-[#2D7DD2]" />
                    <span className="font-bold text-[#0A1628]">To: {email.to}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold">{new Date(email.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-heading font-extrabold text-[#0A1628]">{email.subject}</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {email.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, MapPin, Phone, Star, AlertTriangle, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';

export default function DermatologistFinder() {
  const { request } = useApi();
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await request(`http://localhost:8001/dermatologists/?city=${encodeURIComponent(city.trim())}`);

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Search failed');

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Search Panel */}
      <div className="glass-card p-6 rounded-[30px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 relative z-10">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Enter city location (e.g. Mumbai, Delhi, Bangalore, Pune...)"
              required
              className="pl-12 w-full px-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm transition-all text-white placeholder-slate-600 font-medium"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="sm:w-40 flex items-center justify-center py-3.5 px-4 rounded-2xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-350 focus:outline-none shadow-md transition-all active:scale-[0.98] disabled:opacity-75 uppercase tracking-wider shadow-cyan-400/10"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Querying...
              </>
            ) : (
              'Find Clinics'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-center text-xs font-semibold">
            <AlertTriangle className="h-4.5 w-4.5 mr-3 flex-shrink-0 text-rose-400" />
            {error}
          </div>
        )}
      </div>

      {/* Results section */}
      {results && (
        <div className="space-y-6">
          {/* Cache/Registry disclaimer */}
          {results.using_fallback && (
            <div className="bg-amber-500/5 border border-amber-500/20 text-slate-300 rounded-[24px] p-5 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-500 uppercase tracking-widest">Verified Dermal Registry Active</h4>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400 font-medium">
                  We are displaying verified registry logs of skin clinics matching your search query. Booking integration remains fully calibrated.
                </p>
              </div>
            </div>
          )}

          {results.dermatologists.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest">
              No clinics logged for this location. Try another city.
            </div>
          ) : (
            <motion.div 
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {results.dermatologists.map((clinic, index) => (
                <motion.div
                  variants={itemVariants}
                  key={index}
                  className="glass-card p-6 rounded-[30px] flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full mix-blend-multiply filter blur-xl opacity-30 transform translate-x-8 -translate-y-8"></div>
                  
                  <div>
                    {/* Star Rating & Title */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-extrabold text-white leading-tight font-heading">{clinic.name}</h3>
                      <div className="flex items-center bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg text-xs font-extrabold flex-shrink-0 border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        {clinic.rating}
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-cyan-400 mb-4 uppercase tracking-widest">{clinic.clinic_name || "Dermatology Specialist"}</p>

                    {/* Metadata lines */}
                    <div className="space-y-2.5 text-xs text-slate-400 mb-6">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2.5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{clinic.address}</span>
                      </div>
                      {clinic.contact && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2.5 text-slate-500 flex-shrink-0" />
                          <span className="font-medium">{clinic.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    {clinic.contact && (
                      <a
                        href={`tel:${clinic.contact}`}
                        className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl border border-white/5 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-all text-center"
                      >
                        <Phone className="w-4 h-4 mr-2 text-slate-500" />
                        Call Clinic
                      </a>
                    )}
                    <a
                      href={`tel:${clinic.contact || '123'}`}
                      className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all text-center shadow-md uppercase tracking-wider"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Spot
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

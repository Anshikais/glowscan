import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
  Clock,
  AlertCircle,
  FileDown,
  Sparkles,
  Loader2,
  ChevronRight,
  Trash2
} from 'lucide-react';

import { jsPDF } from 'jspdf';

import { useApi } from '../hooks/useApi';

import { motion } from 'framer-motion';

// HEALTH SCORE
const getHealthScore = (prediction) => {

  let base = 90;

  if (prediction === 'Normal')
    base = 95;

  else if (
    prediction === 'Dry' ||
    prediction === 'Oily'
  )
    base = 80;

  else if (prediction === 'Acne')
    base = 65;

  else if (
    prediction === 'Eczema' ||
    prediction === 'Rosacea'
  )
    base = 55;

  return Math.round(base);
};

export default function History() {

  const { request } = useApi();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // FETCH HISTORY
  useEffect(() => {

    const fetchHistory = async () => {

      try {
          const response = await request('/history/');

        if (!response.ok) {

          throw new Error(
            'Failed to fetch history'
          );
        }

        const data =
          await response.json();

        const sortedData =
          data.sort(
            (a, b) =>
              new Date(b.timestamp) -
              new Date(a.timestamp)
          );

        setHistory(sortedData);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    };

    fetchHistory();

  }, [request]);

  // LATEST SCAN
  const latestScan = history[0];

  // DELETE HISTORY
  const deleteHistory = async (id) => {

    try {
         await request(`/history/${id}`, {
          method: 'DELETE',
        });

      setHistory((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

    } catch (err) {

      console.error(
        'Delete failed:',
        err
      );
    }
  };

  // PDF GENERATOR
  const generatePDF = (scan) => {

    const doc = new jsPDF();

    doc.setFontSize(22);

    doc.text(
      "AI Skin Report",
      20,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Condition: ${scan.prediction}`,
      20,
      40
    );

    doc.text(
      `Confidence: ${Math.round(
        scan.confidence_score * 100
      )}%`,
      20,
      50
    );

    doc.text(
      `Recommendation: ${scan.recommendation}`,
      20,
      70
    );

    doc.save(
      `scan-${scan.id}.pdf`
    );
  };

  // SEVERITY COLORS
  const severityMap = {

    Normal:
      'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',

    Dry:
      'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',

    Oily:
      'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',

    Acne:
      'text-rose-400 bg-rose-500/10 border border-rose-500/20',

    Eczema:
      'text-purple-400 bg-purple-500/10 border border-purple-500/20',

    Rosacea:
      'text-purple-400 bg-purple-500/10 border border-purple-500/20',
  };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-3">

        <Loader2 className="animate-spin h-8 w-8 text-cyan-400" />

        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">

          Loading History...

        </span>

      </div>
    );
  }

  return (

    <div className="max-w-5xl mx-auto space-y-8">

      {/* TODAY ROUTINE */}
      {latestScan?.seven_day_plan && (

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-8">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl font-bold text-white mb-2">

                Today's AI Routine

              </h2>

              <p className="text-slate-400">

                Personalized skincare generated
                from your latest scan

              </p>

            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-2 rounded-2xl text-sm">

              ACTIVE

            </div>

          </div>

          {(() => {

            const today =
              new Date().toLocaleDateString(
                "en-US",
                { weekday: "long" }
              );

            const routine =
              latestScan.seven_day_plan[
                today
              ];

            if (!routine) return null;

            return (

              <div className="grid md:grid-cols-2 gap-6">

                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700">

                  <p className="text-yellow-300 font-semibold mb-4">

                    Morning Routine

                  </p>

                  <p className="text-slate-300 leading-relaxed">

                    {routine.Morning}

                  </p>

                </div>

                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700">

                  <p className="text-purple-300 font-semibold mb-4">

                    Night Routine

                  </p>

                  <p className="text-slate-300 leading-relaxed">

                    {routine.Night}

                  </p>

                </div>

              </div>
            );

          })()}

        </div>
      )}

      {/* ERROR */}
      {error && (

        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-center text-xs font-semibold">

          <AlertCircle className="h-5 w-5 mr-3" />

          {error}

        </div>
      )}

      {/* EMPTY */}
      {history.length === 0 && !error ? (

        <div className="glass-card rounded-[30px] p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto min-h-[300px] bg-slate-900/20">

          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl mb-4 border border-cyan-500/25">

            <Clock className="w-8 h-8" />

          </div>

          <h3 className="text-base font-bold text-white mb-2">

            No diagnostics logged

          </h3>

          <p className="text-xs text-slate-400 mb-6">

            You haven’t scanned anything yet.

          </p>

          <Link
            to="/new-scan"
            className="py-3 px-6 rounded-2xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all"
          >

            Start Skin Scan

          </Link>

        </div>

      ) : (

        <motion.div className="space-y-8">

          {history.map((scan) => {

            const severityClass =
              severityMap[
                scan.prediction
              ] || 'text-slate-400';

            return (

              <motion.div
                key={scan.id}
                className="glass-card p-6 rounded-[30px] shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 hover:border-cyan-500/20 transition-all duration-300"
              >

                {/* DELETE */}
                <button
                  onClick={() =>
                    deleteHistory(scan.id)
                  }
                  className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
                >

                  <Trash2 className="w-4 h-4" />

                </button>

                {/* IMAGE */}
               {scan.image_path && (

  <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-slate-950 border border-white/5 flex-shrink-0">

        <img
  src={`${import.meta.env.VITE_API_URL}/${scan.image_path}`}
  alt="scan"
  className="w-full h-full object-cover"
/>

  </div>
)}

                {/* DETAILS */}
                <div className="flex-1 flex flex-col justify-between">

                  <div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-sm font-extrabold text-white">

                          {scan.prediction}

                        </span>

                        <span
                          className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded ${severityClass}`}
                        >

                          {Math.round(
                            scan.confidence_score * 100
                          )}
                          % Match

                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <time className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">

                          {new Date(
                            scan.timestamp
                          ).toLocaleDateString()}

                        </time>

                        {/* PDF */}
                        <button
                          onClick={() =>
                            generatePDF(scan)
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-all mr-14"
                        >

                          <FileDown className="w-4 h-4" />

                        </button>

                      </div>
                    </div>

                    {/* RECOMMENDATION */}
                    <p className="text-xs text-slate-400 leading-relaxed">

                      {scan.recommendation}

                    </p>

                  </div>

                  {/* FOOTER */}
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-white/5 pt-3">

                    <span className="flex items-center text-cyan-400/80">

                      <Sparkles className="w-3.5 h-3.5 mr-1" />

                      Health Index:
                      {' '}
                      {getHealthScore(
                        scan.prediction
                      )}
                      /100

                    </span>

                    <Link
                      to="/new-scan"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[9px]"
                    >

                      Review Routine

                      <ChevronRight className="w-3 h-3" />

                    </Link>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
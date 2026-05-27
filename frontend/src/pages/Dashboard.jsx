import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  TrendingUp,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative">

      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
          }}
          className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full"
        />

        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full"
        />

      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-6">

        {/* HERO */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-6 mb-6">

          {/* LEFT */}
          <div className="bg-white/5 border border-white/10 rounded-[36px] overflow-hidden backdrop-blur-2xl relative p-10 min-h-[340px] flex flex-col justify-center">

            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/5" />

            <div className="relative z-10 max-w-2xl">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-sm mb-6">
                <Sparkles size={16} />
                AI Dermatology Intelligence
              </div>

              <h1 className="text-5xl leading-tight font-bold mb-6 bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AI Skin Detection
                <br />
                & Smart Skin Analysis
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
                Advanced AI-powered skincare diagnostics inspired by premium dermatology platforms. Analyze hydration, oil balance, acne, texture, sensitivity, and personalized skincare insights.
              </p>

              <div className="flex flex-wrap gap-4">

                <button
  onClick={() => navigate("/new-scan")}
  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20"
>
  Start Scan
</button>

      <button
  onClick={() => navigate("/insights")}
  className="bg-slate-800 border border-slate-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-700 transition-all duration-300"
>
  View Insights
</button>

              </div>

            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="relative bg-white/5 border border-white/10 rounded-[36px] overflow-hidden backdrop-blur-2xl min-h-[340px]">

            <img
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1400&auto=format&fit=crop"
              alt="AI Skin"
              className="w-full h-full object-cover opacity-90"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

            {/* AI OVERLAY */}
            <div className="absolute inset-0">

              <div className="absolute top-[22%] left-[28%] w-24 h-24 border-[5px] border-cyan-400 rounded-full animate-pulse" />

              <div className="absolute top-[58%] left-[62%] w-28 h-28 border-[5px] border-purple-400 rounded-full animate-pulse" />

              <div className="absolute top-[35%] left-[50%] w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

              <div className="absolute top-[48%] left-[40%] w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)]" />

            </div>

            <div className="absolute top-10 right-10 bg-black/50 backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/10">
              <p className="text-slate-300 text-sm">Hydration</p>
              <h2 className="text-3xl font-bold text-cyan-400">96%</h2>
            </div>

            <div className="absolute bottom-10 left-10 bg-black/50 backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/10">
              <p className="text-slate-300 text-sm">Texture Score</p>
              <h2 className="text-3xl font-bold text-blue-400">92</h2>
            </div>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className="text-cyan-400" />
              <span className="text-green-400 text-sm">+12%</span>
            </div>

            <p className="text-slate-400 text-sm">
              AI Accuracy
            </p>

            <h2 className="text-4xl font-bold mt-2">
              95%
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <Droplets className="text-blue-400" />
              <span className="text-cyan-400 text-sm">Healthy</span>
            </div>

            <p className="text-slate-400 text-sm">
              Hydration Level
            </p>

            <h2 className="text-4xl font-bold mt-2">
              84%
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-purple-400" />
              <span className="text-green-400 text-sm">Stable</span>
            </div>

            <p className="text-slate-400 text-sm">
              Skin Health
            </p>

            <h2 className="text-4xl font-bold mt-2">
              92%
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <Brain className="text-pink-400" />
              <span className="text-cyan-400 text-sm">248</span>
            </div>

            <p className="text-slate-400 text-sm">
              Total Scans
            </p>

            <h2 className="text-4xl font-bold mt-2">
              248
            </h2>
          </div>

        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">

            <h3 className="text-xl font-bold mb-4">
              Skin Hydration
            </h3>

            <div className="w-full h-3 bg-slate-800 rounded-full">
              <div className="w-[84%] h-3 bg-cyan-400 rounded-full"></div>
            </div>

            <p className="text-slate-400 mt-4">
              Hydration levels are balanced and healthy.
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">

            <h3 className="text-xl font-bold mb-4">
              Oil Balance
            </h3>

            <div className="w-full h-3 bg-slate-800 rounded-full">
              <div className="w-[68%] h-3 bg-blue-400 rounded-full"></div>
            </div>

            <p className="text-slate-400 mt-4">
              Mild oil concentration detected in T-zone.
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">

            <h3 className="text-xl font-bold mb-4">
              AI Recommendation
            </h3>

            <p className="text-slate-300 leading-relaxed">
              Maintain hydration with ceramide-based moisturizers and apply SPF daily.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
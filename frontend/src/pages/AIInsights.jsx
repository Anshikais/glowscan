import { motion } from 'framer-motion';
import { 
  Brain, 
  Droplet, 
  Sun, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';

export default function AIInsights() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const ingredients = [
    { name: 'Niacinamide (Vitamin B3)', percentage: '5%', purpose: 'Barrier repair & sebum calibration', time: 'Morning Protocol', description: 'Enhances dermal elasticity, reduces pores, and calms hyperpigmentation.' },
    { name: 'Retinol (Vitamin A)', percentage: '0.5%', purpose: 'Cellular rotation & collagen booster', time: 'Evening Protocol', description: 'Accelerates epidermic turnover to smooth textures and decrease fine lines.' },
    { name: 'Hyaluronic Acid', percentage: '2%', purpose: 'Deep cellular hydration calibration', time: 'AM / PM Protocols', description: 'Binds moisture up to 1000x its weight in deep epidermal layers.' },
    { name: 'Vitamin C (L-Ascorbic Acid)', percentage: '15%', purpose: 'Antioxidant shielding & brightener', time: 'Morning Protocol', description: 'Protects cells from ultraviolet oxidation and boosts natural radiance.' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-5xl"
    >
      {/* Top Banner */}
      <motion.div 
        variants={itemVariants}
        className="glass-card rounded-[30px] p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40 transform translate-x-12 -translate-y-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              Core Neural Analytics
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white">AI Dermal Insights</h2>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Dermal metrics calculated from historical diagnostics, local UV forecasting, and personal cell hydration metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 p-3.5 bg-slate-900/50 border border-white/5 rounded-2xl">
            <Brain className="h-6 w-6 text-cyan-400 animate-pulse" />
            <div className="text-left">
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">Model Engine</span>
              <span className="text-xs font-bold text-white">SkinNet v4.2 PRO</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid containing Moisture, UV, and Dermal composition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Moisture levels */}
        <motion.div variants={itemVariants} className="glass-card rounded-[30px] p-6 flex flex-col justify-between h-64 relative group hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
              <Droplet className="h-5 w-5" />
            </div>
            <span className="text-[9px] text-[#06b6d4] font-extrabold uppercase tracking-widest border border-cyan-500/20 px-2 py-0.5 rounded">Stable</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Epidermal Hydration</span>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-4xl font-extrabold text-white font-heading">74%</h3>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +2.4% (vs last week)
              </span>
            </div>
            {/* Custom Bar progress indicator */}
            <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full mt-4 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full w-[74%] neon-glow-cyan" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-medium mt-2">
            Hydration index is optimal. Cell lipid barriers show robust retention. Keep hydrating as normal.
          </p>
        </motion.div>

        {/* UV Exposure forecasts */}
        <motion.div variants={itemVariants} className="glass-card rounded-[30px] p-6 flex flex-col justify-between h-64 relative group hover:border-purple-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
              <Sun className="h-5 w-5 animate-spin-slow" />
            </div>
            <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-widest border border-purple-500/20 px-2 py-0.5 rounded">Moderate</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Local UV Exposure Forecast</span>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-4xl font-extrabold text-white font-heading">4.0 <span className="text-xs font-semibold text-slate-400">UV Index</span></h3>
            </div>
            {/* Custom UV safety indicator */}
            <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full mt-4 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-purple-500 rounded-full w-[40%] neon-glow-purple" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-medium mt-2 flex items-start">
            <ShieldAlert className="h-4 w-4 text-amber-500 mr-1.5 flex-shrink-0 mt-0.5" />
            Moderate UV levels. Broad-spectrum SPF 30+ shield recommended for outdoor activities.
          </p>
        </motion.div>
      </div>

      {/* Recommended ingredients timeline */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            AI Recommended Active Ingredients
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">Timeline protocols for therapeutic skin protection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ingredients.map((ing, idx) => (
            <div 
              key={idx} 
              className="glass-card p-6 rounded-[30px] hover:-translate-y-1 transition-all duration-300 border border-white/5 hover:border-cyan-500/20 flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <h4 className="font-heading font-extrabold text-sm text-white">{ing.name}</h4>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">{ing.percentage}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ing.description}</p>
              </div>

              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500 mt-4">
                <span className="flex items-center text-cyan-400/80">
                  <Heart className="h-3 w-3 mr-1" />
                  {ing.purpose}
                </span>
                <span className="flex items-center text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-cyan-400" />
                  {ing.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

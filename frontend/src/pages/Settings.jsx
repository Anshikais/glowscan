import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

import {
  Lock,
  Bell,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function Settings() {
  const { user } = useUser();

  const [skinType, setSkinType] =
    useState('Combination');

  const [timeoutLogout, setTimeoutLogout] =
    useState(true);

  const [emailAlerts, setEmailAlerts] =
    useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },

    show: {
      opacity: 1,

      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15
    },

    show: {
      opacity: 1,
      y: 0,

      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const skinTypes = [
    'Dry',
    'Oily',
    'Normal',
    'Sensitive',
    'Combination'
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-4xl"
    >

      {/* PROFILE HEADER */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-[30px] p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
      >

        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl opacity-30 translate-x-12 -translate-y-12" />

        {/* AVATAR */}
        <div className="relative z-10 flex items-center justify-center h-20 w-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-3xl font-heading font-extrabold uppercase">

          {user?.firstName
            ? user.firstName[0]
            : user?.primaryEmailAddress?.emailAddress
            ? user.primaryEmailAddress.emailAddress[0]
            : 'U'}

        </div>

        {/* USER INFO */}
        <div className="text-center sm:text-left space-y-1">

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">

            <h2 className="text-xl font-heading font-extrabold text-white">

              {user?.fullName ||
                'Authorized Clinical Profile'}

            </h2>

            <span className="text-[8px] font-extrabold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">
              Tier Level 1 Verified
            </span>

          </div>

          <p className="text-xs text-slate-400 font-medium">

            Authorized Email:
            {' '}
            {user?.primaryEmailAddress?.emailAddress ||
              'loading...'}

          </p>

        </div>

      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="space-y-6">

          {/* SKIN TYPE */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-[30px] p-6 space-y-6"
          >

            <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">

              <Sparkles className="h-4 w-4" />

              Skincare Calibration

            </h3>

            <div className="space-y-4">

              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">

                Self-Reported Skin Classification

              </label>

              <div className="flex flex-wrap gap-2">

                {skinTypes.map((type) => {

                  const isActive =
                    skinType === type;

                  return (

                    <button
                      key={type}
                      onClick={() =>
                        setSkinType(type)
                      }

                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 neon-glow-cyan'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >

                      {type}

                    </button>
                  );
                })}

              </div>

              <p className="text-[10px] text-slate-400 leading-normal font-medium mt-2">

                Selecting a skin classification
                aligns skincare recommendations
                according to your dermis type.

              </p>

            </div>

          </motion.div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* SECURITY */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-[30px] p-6 space-y-6"
          >

            <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">

              <Lock className="h-4 w-4" />

              Security Settings

            </h3>

            <div className="space-y-4">

              {/* AUTO LOGOUT */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">

                <div className="space-y-0.5">

                  <span className="block text-xs font-bold text-white">

                    Auto Session Logout

                  </span>

                  <span className="block text-[9px] text-slate-500 leading-normal font-semibold">

                    Automatically logout after
                    inactivity

                  </span>

                </div>

                <button
                  onClick={() =>
                    setTimeoutLogout(
                      !timeoutLogout
                    )
                  }

                  className="text-cyan-400 hover:scale-105 transition-all"
                >

                  {timeoutLogout ? (
                    <ToggleRight className="h-9 w-9 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-600" />
                  )}

                </button>

              </div>

            </div>

          </motion.div>

          {/* EMAIL ALERTS */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-[30px] p-6 space-y-6"
          >

            <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">

              <Bell className="h-4 w-4" />

              Smart Alerts

            </h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">

                <div className="space-y-0.5">

                  <span className="block text-xs font-bold text-white">

                    Email Notifications

                  </span>

                  <span className="block text-[9px] text-slate-500 leading-normal font-semibold">

                    Receive AI skincare
                    recommendations and updates

                  </span>

                </div>

                <button
                  onClick={() =>
                    setEmailAlerts(
                      !emailAlerts
                    )
                  }

                  className="text-cyan-400 hover:scale-105 transition-all"
                >

                  {emailAlerts ? (
                    <ToggleRight className="h-9 w-9 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-600" />
                  )}

                </button>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </motion.div>
  );
}
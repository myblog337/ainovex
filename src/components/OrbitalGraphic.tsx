import React, { useState } from 'react';
import { GitBranch, Sparkles, Cpu, Orbit } from 'lucide-react';

export const OrbitalGraphic: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  return (
    <div 
      className="relative w-full max-w-[430px] sm:max-w-[480px] mx-auto aspect-square flex items-center justify-center my-4 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Background radial glow with ambient multi-stop aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/25 via-sky-500/20 to-purple-600/15 dark:from-blue-600/35 dark:via-cyan-500/25 dark:to-purple-600/25 rounded-full blur-3xl pointer-events-none transition-all duration-700 animate-pulse" />

      {/* 2. Floating Badge: Agent Workflows (Top Left) */}
      <div className="absolute top-2 left-0 sm:-left-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl backdrop-blur-xl bg-white/95 border border-sky-300/80 shadow-xl shadow-sky-500/15 dark:bg-slate-900/90 dark:border-sky-500/40 dark:shadow-sky-950/40 animate-float-slow transition-transform hover:scale-105">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400/25 to-blue-500/20 border border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
          <GitBranch className="w-4 h-4 animate-pulse" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
            <span>Agent Workflows</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          </div>
          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold tracking-wide flex items-center gap-1">
            <span>Autonomous Sync</span>
            <span className="text-[9px] opacity-75 font-mono">· 99.8%</span>
          </div>
        </div>
      </div>

      {/* 3. Floating Badge: Smarter with AI (Top Right) */}
      <div className="absolute top-8 right-0 sm:-right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-xl bg-white/95 border border-amber-300/80 shadow-xl shadow-amber-500/10 dark:bg-slate-900/90 dark:border-amber-400/40 dark:shadow-amber-950/30 animate-float-reverse transition-transform hover:scale-105">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400/25 to-orange-500/20 border border-amber-400/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm">
          <span className="text-xs">⚡</span>
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            Smarter with AI
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold tracking-wide font-mono">
            Neural v4.5 Active
          </div>
        </div>
      </div>

      {/* 4. Outer Dashed Orbit Ring */}
      <div className="absolute w-[88%] h-[88%] rounded-full border border-dashed border-blue-400/50 dark:border-sky-400/35 animate-orbit-spin">
        {/* Orbit Tracer Bead */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-400 dark:bg-sky-300 shadow-[0_0_10px_#38bdf8]" />
      </div>

      {/* 5. Middle Orbit Ellipse 1 (Tilted -16deg) [CSS selector 5] */}
      <div 
        className="absolute w-[95%] h-[56%] rounded-[100%] border-2 border-sky-400/50 dark:border-sky-400/45 rotate-[-16deg] shadow-[0_0_22px_rgba(56,189,248,0.3)] transition-all duration-700 hover:border-sky-400 group"
      >
        {/* Orbit Node with Glow Flare */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_12px_#38bdf8] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        </div>
        {/* Secondary Opposite Particle Node */}
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
      </div>

      {/* 6. Middle Orbit Ellipse 2 (Opposite Tilt +24deg) [CSS selector 3] */}
      <div 
        className="absolute w-[95%] h-[56%] rounded-[100%] border-2 border-indigo-500/45 dark:border-indigo-400/40 rotate-[24deg] shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-700 hover:border-indigo-400"
      >
        {/* Orbit Node with Deep Violet Glow */}
        <div className="absolute bottom-2 right-1/4 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 shadow-[0_0_14px_#818cf8] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        {/* Opposite Particle Node */}
        <div className="absolute top-2 left-1/4 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
      </div>

      {/* 7. Inner Orbit Ring (Quantum Gyroscope) [CSS selector 4] */}
      <div className="absolute w-[62%] h-[62%] rounded-full border border-dashed border-cyan-400/60 dark:border-cyan-400/45 animate-orbit-spin-reverse shadow-[0_0_16px_rgba(34,211,238,0.25)]">
        {/* Cardinal Quantum Nodes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
      </div>

      {/* 8. Center Spherical Core Graphic [CSS selector 1 & 2] */}
      <div 
        onClick={() => setPulseCount((prev) => prev + 1)}
        className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center p-[3px] bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 dark:from-blue-600 dark:via-cyan-400 dark:to-purple-500 animate-core-pulse cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group shadow-[0_0_55px_rgba(14,165,233,0.55)]"
        title="Interactive AI Neural Core · Click to pulse"
      >
        {/* Core sphere inner container */}
        <div className="w-full h-full rounded-full bg-[#f8fbff] dark:bg-[#060c18] flex items-center justify-center relative overflow-hidden border border-white/60 dark:border-sky-500/30 backdrop-blur-md">
          
          {/* 1. Inner volumetric planetary gradient & holographic core sphere [CSS selector 2] */}
          <div className="absolute inset-1 rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/25 via-blue-600/20 to-indigo-950/40 dark:from-sky-400/30 dark:via-blue-950/50 dark:to-[#030712] shadow-[inset_0_0_30px_rgba(56,189,248,0.35)] backdrop-blur-md animate-holographic-orb transition-all duration-700 group-hover:scale-105 group-hover:shadow-[inset_0_0_42px_rgba(56,189,248,0.55)] border border-white/20 dark:border-cyan-500/20" />
          
          {/* Cybernetic Matrix & Latitude Lattice Grid */}
          <div className="absolute inset-0 flex flex-col justify-around items-center opacity-40 dark:opacity-45 pointer-events-none">
            {/* Animated Sonar Radar Wave */}
            <div className="absolute w-24 h-24 rounded-full border border-cyan-400/50 animate-wave-pulse" />
            <div className="absolute w-36 h-36 rounded-full border border-sky-400/30 animate-wave-pulse [animation-delay:1.2s]" />
            {/* Latitude curved bands */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          </div>

          {/* Central Bright AI Neural Core container */}
          <div className="relative z-20 flex items-center justify-center">
            {/* Blur glow & luminous lens flare */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400/40 via-sky-300/50 to-indigo-500/40 blur-md absolute animate-pulse" />
            
            {/* The Animated Iconic AI Neural Core [CSS selector 1] */}
            <div className="relative flex items-center justify-center animate-ai-core filter drop-shadow-[0_0_16px_#38bdf8] drop-shadow-[0_0_28px_#818cf8] transition-transform duration-300 group-hover:scale-125 text-sky-500 dark:text-cyan-300">
              <svg 
                className="w-12 h-12 sm:w-14 sm:h-14 transition-all duration-500" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  className="animate-circuit-flow transition-all duration-700" 
                  stroke="url(#aiCoreGradient)" 
                  d="M12 6.5L17.5 12L12 17.5L6.5 12ZM12 9.2L13.5 12L12 14.8L10.5 12ZM12 6.5V2.5M12 17.5V21.5M6.5 12H2.5M17.5 12H21.5M12 2.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M12 21.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M2.5 12m0-1a1 1 0 1 0 0 2a1 1 0 1 0 0-2M21.5 12m0-1a1 1 0 1 0 0 2a1 1 0 1 0 0-2M15 9L18.5 5.5M9 9L5.5 5.5M15 15L18.5 18.5M9 15L5.5 18.5M18.5 5.5m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0-1.6 0M5.5 5.5m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0-1.6 0M18.5 18.5m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0-1.6 0M5.5 18.5m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0-1.6 0" 
                />
                <defs>
                  <linearGradient id="aiCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="35%" stopColor="#22d3ee" />
                    <stop offset="70%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Orbiting Stardust Particles */}
          <div className="absolute top-4 left-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff] opacity-90 animate-ping [animation-duration:3s]" />
          <div className="absolute bottom-5 right-8 w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_6px_#38bdf8] opacity-80 animate-ping [animation-duration:2.5s]" />
          <div className="absolute top-8 right-6 w-1 h-1 rounded-full bg-cyan-200 opacity-70" />
        </div>
      </div>

      {/* Floating Accent Particles */}
      <div className="absolute top-1/4 right-8 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-float-slow" />
      <div className="absolute bottom-1/4 left-10 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-float-reverse" />
    </div>
  );
};


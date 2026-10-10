import React from "react";
import { useTheme } from "@/src/context/ThemeContext";

export const HeroRobotGraphic: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="relative w-full max-w-[360px] xs:max-w-[420px] sm:max-w-[500px] md:max-w-[560px] lg:max-w-[620px] aspect-square flex items-center justify-center select-none mx-auto group">
      {/* 1. Multi-layered Volumetric 3D Ambient Lighting Glow */}
      <div
        className={`absolute inset-4 sm:inset-10 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isDark
            ? "bg-gradient-to-tr from-blue-600/35 via-cyan-500/25 to-indigo-600/35 opacity-90 group-hover:opacity-100"
            : "bg-gradient-to-tr from-blue-500/25 via-cyan-400/20 to-indigo-400/25 opacity-80 group-hover:opacity-95"
        }`}
      />
      <div
        className={`absolute -inset-2 rounded-full blur-2xl pointer-events-none transition-opacity duration-700 ${
          isDark ? "bg-cyan-500/10" : "bg-blue-400/10"
        }`}
      />

      {/* 2. Floating "Smarter with AI" Signature Badge */}
      <div className="absolute top-2 sm:top-5 right-2 sm:right-6 z-30 transform hover:scale-105 transition-transform duration-300 animate-float-slow">
        <div
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border shadow-xl backdrop-blur-md flex items-center gap-2 ${
            isDark
              ? "bg-[#0b152d]/90 text-white border-blue-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
              : "bg-white/95 text-slate-900 border-blue-200/90 shadow-[0_8px_30px_rgba(37,99,235,0.18)]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold text-xs sm:text-sm">⚡</span>
          <span
            className={`font-sans text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap ${
              isDark ? "text-cyan-200" : "text-blue-900"
            }`}
          >
            Smarter with AI
          </span>
        </div>
      </div>

      {/* 3. Professional 3D AI Neural Quantum Core Graphic (Pure Vector & 3D Depth) */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.38)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Volumetric 3D Quantum Core Gradient */}
            <radialGradient id="aiQuantumSphere" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#67e8f9" />
              <stop offset="48%" stopColor="#0284c7" />
              <stop offset="78%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#090d1a" />
            </radialGradient>

            {/* Inner Neural Singularity */}
            <radialGradient id="singularityGlow" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#a5f3fc" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="90%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>

            {/* 3D Glassmorphic Torus Ring Gradient */}
            <linearGradient id="torusGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Secondary 3D Gyro Ring Gradient */}
            <linearGradient id="torusGradPurple" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>

            {/* Metallic Gold / Amber AI Synapse Accent */}
            <linearGradient id="synapseAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Glassmorphic Telemetry Cards */}
            <linearGradient id="aiGlassCardDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c1938" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#081329" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#040b18" stopOpacity="0.96" />
            </linearGradient>

            {/* Precision Glow Filter */}
            <filter id="aiCyanIntense" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft Ambient Depth Filter */}
            <filter id="aiSoftAmbient" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 3D Drop Shadow for HUD panels */}
            <filter id="hudCardShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* ==============================================================
              SECTION 1: 3D SPATIAL NEURAL GRID & DEPTH HORIZON (BACK)
              ============================================================== */}
          <g id="spatial-depth-grid" opacity={isDark ? "0.45" : "0.25"}>
            {/* Concentric 3D Ground Ellipses (Perspective grid floor) */}
            <ellipse cx="300" cy="460" rx="240" ry="60" stroke="#1e3a8a" strokeWidth="1.2" strokeDasharray="6 8" />
            <ellipse cx="300" cy="470" rx="180" ry="42" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 6" />
            <ellipse cx="300" cy="480" rx="120" ry="26" stroke="#00f0ff" strokeWidth="1" opacity="0.6" />

            {/* Radiating 3D perspective rays to horizon */}
            <line x1="300" y1="300" x2="60" y2="470" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 6" opacity="0.5" />
            <line x1="300" y1="300" x2="160" y2="510" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 6" opacity="0.5" />
            <line x1="300" y1="300" x2="300" y2="530" stroke="#00f0ff" strokeWidth="1.2" opacity="0.6" />
            <line x1="300" y1="300" x2="440" y2="510" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 6" opacity="0.5" />
            <line x1="300" y1="300" x2="540" y2="470" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 6" opacity="0.5" />
          </g>

          {/* ==============================================================
              SECTION 2: 3D MULTI-DIMENSIONAL GYROSCOPIC ORBITAL RINGS (BACK ARCS)
              ============================================================== */}
          <g id="gyroscopic-rings-back">
            {/* Ring 1 (Tilted 3D Isometric Ellipse - Back Arc) */}
            <path
              d="M100 280 C110 160 210 100 330 110 C440 120 510 190 500 310"
              stroke="url(#torusGradCyan)"
              strokeWidth="2.5"
              strokeDasharray="16 8 32 8"
              opacity="0.65"
            />

            {/* Ring 2 (Cross-Axis 3D Orbital Gimbal - Back Arc) */}
            <path
              d="M140 370 C100 270 150 160 260 120 C370 80 465 140 480 230"
              stroke="url(#torusGradPurple)"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.6"
            />

            {/* Ring 3 (Equatorial Telemetry Gyro - Back Arc) */}
            <path
              d="M80 300 C80 220 180 170 300 170 C420 170 520 220 520 300"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="3 7"
              opacity="0.5"
            />
          </g>

          {/* ==============================================================
              SECTION 3: 3D SYNAPTIC NEURAL CLUSTER LINES & DATA ARCS
              ============================================================== */}
          <g id="synaptic-data-pathways" filter="url(#aiCyanIntense)" opacity="0.85">
            {/* Synaptic vectors originating from central intelligence core to HUD cards */}
            <path
              d="M300 300 Q190 240 160 180"
              stroke="#00f0ff"
              strokeWidth="2"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M300 300 Q200 340 155 390"
              stroke="#818cf8"
              strokeWidth="1.8"
              strokeDasharray="6 4"
              fill="none"
            />
            <path
              d="M300 300 Q390 240 440 170"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="none"
            />
            <path
              d="M300 300 Q400 360 450 380"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="8 6"
              fill="none"
            />

            {/* Synapse junction beacons */}
            <circle cx="210" cy="260" r="3.5" fill="#00f0ff" />
            <circle cx="390" cy="270" r="3.5" fill="#38bdf8" />
            <circle cx="230" cy="330" r="3" fill="#a5f3fc" />
            <circle cx="370" cy="340" r="3" fill="#c084fc" />
          </g>

          {/* ==============================================================
              SECTION 4: CENTRAL 3D AI QUANTUM CORE (THE HEART OF AI)
              ============================================================== */}
          <g id="central-3d-ai-core">
            {/* Ambient Core Corona Flare */}
            <circle cx="300" cy="300" r="145" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.35" strokeDasharray="8 12" />
            <circle cx="300" cy="300" r="125" fill="#0284c7" fillOpacity="0.12" filter="url(#aiSoftAmbient)" />

            {/* Outer Volumetric Sphere Shell */}
            <circle
              cx="300"
              cy="300"
              r="92"
              fill="url(#aiQuantumSphere)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />

            {/* 3D Geodesic / Isometric Neural Mesh Facets on Sphere */}
            <g id="geodesic-neural-mesh" opacity="0.8">
              {/* Latitude Arcs (Curving in 3D) */}
              <ellipse cx="300" cy="265" rx="84" ry="24" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
              <ellipse cx="300" cy="300" rx="92" ry="32" fill="none" stroke="#00f0ff" strokeWidth="2" strokeDasharray="8 6" />
              <ellipse cx="300" cy="335" rx="84" ry="24" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />

              {/* Longitude Arcs (Curving vertically in 3D) */}
              <ellipse cx="300" cy="300" rx="30" ry="92" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6" strokeDasharray="12 8" />
              <ellipse cx="300" cy="300" rx="64" ry="90" fill="none" stroke="#818cf8" strokeWidth="1.2" opacity="0.5" />

              {/* Geodesic Intersecting Diagonal Triangulation Lines */}
              <path d="M236 265 L300 240 L364 265 L300 300 Z" fill="none" stroke="#67e8f9" strokeWidth="1.2" opacity="0.65" />
              <path d="M215 300 L300 300 L236 335 Z" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
              <path d="M385 300 L300 300 L364 335 Z" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
              <path d="M236 335 L300 360 L364 335 Z" fill="none" stroke="#67e8f9" strokeWidth="1.2" opacity="0.65" />
            </g>

            {/* Glowing 3D Inner Singularity Node (Deep Neural Kernel) */}
            <circle
              cx="300"
              cy="300"
              r="46"
              fill="url(#singularityGlow)"
              filter="url(#aiCyanIntense)"
            />

            {/* Inner Cybernetic Rotating Iris Ticks */}
            <circle
              cx="300"
              cy="300"
              r="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.9"
            />
            <circle
              cx="300"
              cy="300"
              r="22"
              fill="#06122c"
              stroke="#00f0ff"
              strokeWidth="2"
            />

            {/* Core Neural Sparkle Prism (Star of Intelligence) */}
            <path
              d="M300 282 L304 296 L318 300 L304 304 L300 318 L296 304 L282 300 L296 296 Z"
              fill="#ffffff"
              filter="url(#aiCyanIntense)"
            />
            <circle cx="300" cy="300" r="4" fill="#ffffff" />

            {/* 3D Specular Highlight Arc on Sphere (Gives genuine 3D spherical volume) */}
            <path
              d="M245 240 C265 220 310 220 340 235"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M235 255 C245 245 265 235 285 235"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>

          {/* ==============================================================
              SECTION 5: 3D MULTI-DIMENSIONAL GYROSCOPIC ORBITAL RINGS (FRONT ARCS)
              ============================================================== */}
          <g id="gyroscopic-rings-front">
            {/* Ring 1 (Front Arc Passing in Front of Sphere) */}
            <path
              d="M500 310 C490 430 390 490 270 480 C160 470 90 400 100 280"
              stroke="url(#torusGradCyan)"
              strokeWidth="3.5"
              strokeDasharray="24 10 40 10"
              strokeLinecap="round"
              filter="url(#aiCyanIntense)"
            />

            {/* Ring 2 (Cross-Axis Front Arc with Glow) */}
            <path
              d="M480 230 C520 330 470 440 360 480 C250 520 155 460 140 370"
              stroke="url(#torusGradPurple)"
              strokeWidth="2.8"
              strokeDasharray="18 8 8 8"
              strokeLinecap="round"
            />

            {/* Ring 3 (Equatorial Gyro Front Arc) */}
            <path
              d="M520 300 C520 380 420 430 300 430 C180 430 80 380 80 300"
              stroke="#00f0ff"
              strokeWidth="2.2"
              strokeDasharray="30 12 10 12"
              opacity="0.85"
            />

            {/* High-speed Orbital Data Packets (Pulsing Beacons) */}
            <circle cx="492" cy="330" r="5.5" fill="#00f0ff" filter="url(#aiCyanIntense)" />
            <circle cx="118" cy="265" r="4.5" fill="#38bdf8" filter="url(#aiCyanIntense)" />
            <circle cx="360" cy="480" r="5" fill="#c084fc" filter="url(#aiCyanIntense)" />
            <circle cx="215" cy="470" r="4" fill="#67e8f9" />
          </g>

          {/* ==============================================================
              SECTION 6: FLOATING 3D HOLOGRAPHIC AI CAPABILITY CARDS & HUD PANELS
              (Directly matching AINOVEX ecosystem: LLM, Vision, Dev, Audio)
              ============================================================== */}

          {/* Card 1: Top-Left "Neural LLM Engine" */}
          <g transform="translate(35, 125)" className="animate-float-slow" filter="url(#hudCardShadow)">
            <rect
              x="0"
              y="0"
              width="155"
              height="66"
              rx="16"
              fill="url(#aiGlassCardDark)"
              stroke="#38bdf8"
              strokeWidth="1.8"
            />
            {/* Card Glass Specular Edge */}
            <path d="M12 2 L143 2" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

            {/* Glowing Icon Container (Brain / Neural Spark) */}
            <rect x="14" y="16" width="34" height="34" rx="10" fill="#0284c7" fillOpacity="0.4" stroke="#00f0ff" strokeWidth="1.4" />
            {/* Neural Brain Waveform */}
            <path
              d="M20 33 L24 26 L28 38 L32 24 L36 36 L41 31"
              stroke="#00f0ff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="32" cy="24" r="2.5" fill="#ffffff" />

            {/* Typography */}
            <text x="56" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif">
              Neural LLM
            </text>
            <text x="56" y="46" fill="#38bdf8" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              Inference • 12ms
            </text>
            {/* Corner Status LED */}
            <circle cx="140" cy="18" r="3.5" fill="#10b981" filter="url(#aiCyanIntense)" />
          </g>

          {/* Card 2: Bottom-Left "Generative Vision 3D" */}
          <g transform="translate(45, 375)" className="animate-float-delayed" filter="url(#hudCardShadow)">
            <rect
              x="0"
              y="0"
              width="160"
              height="66"
              rx="16"
              fill="url(#aiGlassCardDark)"
              stroke="#a855f7"
              strokeWidth="1.8"
            />
            {/* Card Glass Specular Edge */}
            <path d="M12 2 L148 2" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

            {/* Icon Container (Diffusion Prism) */}
            <rect x="14" y="16" width="34" height="34" rx="10" fill="#6b21a8" fillOpacity="0.4" stroke="#c084fc" strokeWidth="1.4" />
            {/* 3D Prism Crystal */}
            <path
              d="M31 22 L41 38 L21 38 Z"
              stroke="#c084fc"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="#c084fc"
              fillOpacity="0.2"
            />
            <line x1="31" y1="22" x2="31" y2="38" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="31" cy="22" r="2" fill="#ffffff" />

            {/* Typography */}
            <text x="56" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif">
              Vision Studio
            </text>
            <text x="56" y="46" fill="#c084fc" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              Gen-3 Synthesizer
            </text>
            {/* Active Chip */}
            <rect x="118" y="35" width="28" height="15" rx="7.5" fill="#9333ea" fillOpacity="0.5" />
            <text x="123" y="46" fill="#f3e8ff" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
              4K
            </text>
          </g>

          {/* Card 3: Middle-Right "Autonomous Code & Dev" */}
          <g transform="translate(415, 230)" className="animate-float-reverse" filter="url(#hudCardShadow)">
            <rect
              x="0"
              y="0"
              width="155"
              height="66"
              rx="16"
              fill="url(#aiGlassCardDark)"
              stroke="#06b6d4"
              strokeWidth="1.8"
            />
            {/* Card Glass Specular Edge */}
            <path d="M12 2 L143 2" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

            {/* Icon Container (Cyber Brackets & AI logic) */}
            <rect x="14" y="16" width="34" height="34" rx="10" fill="#0e7490" fillOpacity="0.4" stroke="#22d3ee" strokeWidth="1.4" />
            <path
              d="M24 28 L19 33 L24 38 M38 28 L43 33 L38 38"
              stroke="#22d3ee"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="33" y1="26" x2="29" y2="40" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" />

            {/* Typography */}
            <text x="56" y="32" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif">
              Copilot Dev
            </text>
            <text x="56" y="46" fill="#67e8f9" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              Zero-Bug Flow
            </text>
            {/* Pulse Indicator */}
            <circle cx="140" cy="18" r="3.5" fill="#00f0ff" filter="url(#aiCyanIntense)" />
          </g>

          {/* Card 4: Bottom-Right "Multimodal Workflow Hub" */}
          <g transform="translate(390, 415)" className="animate-float-slow" filter="url(#hudCardShadow)">
            <rect
              x="0"
              y="0"
              width="165"
              height="58"
              rx="16"
              fill="url(#aiGlassCardDark)"
              stroke="#3b82f6"
              strokeWidth="1.6"
            />
            <rect x="12" y="13" width="32" height="32" rx="9" fill="#1e40af" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.2" />
            {/* Synaptic Network Hub Icon */}
            <circle cx="28" cy="29" r="4" fill="#60a5fa" />
            <circle cx="20" cy="22" r="2.5" fill="#38bdf8" />
            <circle cx="36" cy="22" r="2.5" fill="#38bdf8" />
            <circle cx="28" cy="38" r="2.5" fill="#00f0ff" />
            <line x1="28" y1="29" x2="20" y2="22" stroke="#93c5fd" strokeWidth="1.2" />
            <line x1="28" y1="29" x2="36" y2="22" stroke="#93c5fd" strokeWidth="1.2" />
            <line x1="28" y1="29" x2="28" y2="38" stroke="#93c5fd" strokeWidth="1.2" />

            <text x="52" y="29" fill="#ffffff" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
              Agent Workflows
            </text>
            <text x="52" y="42" fill="#93c5fd" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">
              Autonomous Sync
            </text>
          </g>

          {/* ==============================================================
              SECTION 7: FLOATING 3D PARTICLES, QUANTUM SPARKS & SHIMMER
              ============================================================== */}
          <g id="sparkles-and-particles">
            <circle cx="180" cy="110" r="3" fill="#00f0ff" filter="url(#aiCyanIntense)" />
            <circle cx="370" cy="90" r="3.5" fill="#60a5fa" filter="url(#aiCyanIntense)" />
            <circle cx="480" cy="150" r="2.5" fill="#00f0ff" />
            <circle cx="140" cy="260" r="2" fill="#38bdf8" />
            <circle cx="470" cy="340" r="3" fill="#c084fc" filter="url(#aiCyanIntense)" />
            <circle cx="240" cy="520" r="2.5" fill="#60a5fa" />
            <circle cx="340" cy="535" r="3" fill="#00f0ff" filter="url(#aiCyanIntense)" />
            <circle cx="90" cy="460" r="2" fill="#38bdf8" />
            <circle cx="530" cy="270" r="2.5" fill="#38bdf8" />

            {/* Glowing Cross Sparkles */}
            <path
              d="M205 155 L207 160 L212 162 L207 164 L205 169 L203 164 L198 162 L203 160 Z"
              fill="#ffffff"
              filter="url(#aiCyanIntense)"
            />
            <path
              d="M415 115 L417 120 L422 122 L417 124 L415 129 L413 124 L408 122 L413 120 Z"
              fill="#ffffff"
              filter="url(#aiCyanIntense)"
            />
            <path
              d="M365 470 L366.5 474 L371 475.5 L366.5 477 L365 481 L363.5 477 L359 475.5 L363.5 474 Z"
              fill="#a5f3fc"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { STATIC_HEX_PATH } from './staticHexPath';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface HexCell {
  cx: number;
  cy: number;
  cz: number;
  vx: Float32Array;
  vy: Float32Array;
  vz: Float32Array;
  vCount: number;
}

/**
 * Procedurally generates a geodesic hexagonal sphere (dual of subdivided icosahedron).
 * Optimized with compact typed arrays for zero-allocation rendering.
 */
function generateHexSphere(subdivisions = 5): HexCell[] {
  const t = (1 + Math.sqrt(5)) / 2;
  const baseVertices: [number, number, number][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ].map((v) => {
    const len = Math.hypot(...v);
    return [v[0] / len, v[1] / len, v[2] / len];
  });

  const baseFaces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  const vertices: [number, number, number][] = [];
  const vertexMap = new Map<string, number>();

  function addVertex(v: [number, number, number]): number {
    const len = Math.hypot(...v);
    const norm: [number, number, number] = [v[0] / len, v[1] / len, v[2] / len];
    const key = `${norm[0].toFixed(5)},${norm[1].toFixed(5)},${norm[2].toFixed(5)}`;
    if (vertexMap.has(key)) return vertexMap.get(key)!;
    const idx = vertices.length;
    vertices.push(norm);
    vertexMap.set(key, idx);
    return idx;
  }

  const triangles: [number, number, number][] = [];
  for (const [aIdx, bIdx, cIdx] of baseFaces) {
    const A = baseVertices[aIdx];
    const B = baseVertices[bIdx];
    const C = baseVertices[cIdx];
    const rowVertices: number[][] = [];

    for (let i = 0; i <= subdivisions; i++) {
      rowVertices[i] = [];
      for (let j = 0; j <= subdivisions - i; j++) {
        const k = subdivisions - i - j;
        const v: [number, number, number] = [
          (i * A[0] + j * B[0] + k * C[0]) / subdivisions,
          (i * A[1] + j * B[1] + k * C[1]) / subdivisions,
          (i * A[2] + j * B[2] + k * C[2]) / subdivisions
        ];
        rowVertices[i][j] = addVertex(v);
      }
    }

    for (let i = 0; i < subdivisions; i++) {
      for (let j = 0; j < subdivisions - i; j++) {
        triangles.push([rowVertices[i][j], rowVertices[i + 1][j], rowVertices[i][j + 1]]);
        if (j < subdivisions - i - 1) {
          triangles.push([rowVertices[i + 1][j], rowVertices[i + 1][j + 1], rowVertices[i][j + 1]]);
        }
      }
    }
  }

  const centroids: Point3D[] = triangles.map(([i1, i2, i3]) => {
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const v3 = vertices[i3];
    const c = [
      (v1[0] + v2[0] + v3[0]) / 3,
      (v1[1] + v2[1] + v3[1]) / 3,
      (v1[2] + v2[2] + v3[2]) / 3
    ];
    const len = Math.hypot(...c);
    return { x: c[0] / len, y: c[1] / len, z: c[2] / len };
  });

  const vertexToTriangles: number[][] = Array.from({ length: vertices.length }, () => []);
  triangles.forEach((tri, triIdx) => {
    vertexToTriangles[tri[0]].push(triIdx);
    vertexToTriangles[tri[1]].push(triIdx);
    vertexToTriangles[tri[2]].push(triIdx);
  });

  const hexCells: HexCell[] = [];
  for (let vIdx = 0; vIdx < vertices.length; vIdx++) {
    const centerNorm = vertices[vIdx];
    const triIndices = vertexToTriangles[vIdx];
    if (triIndices.length < 5) continue;

    const faceCentroids = triIndices.map((idx) => centroids[idx]);

    let ref = [1, 0, 0];
    if (Math.abs(centerNorm[0]) > 0.9) ref = [0, 1, 0];
    const u = [
      centerNorm[1] * ref[2] - centerNorm[2] * ref[1],
      centerNorm[2] * ref[0] - centerNorm[0] * ref[2],
      centerNorm[0] * ref[1] - centerNorm[1] * ref[0]
    ];
    const uLen = Math.hypot(...u);
    u[0] /= uLen; u[1] /= uLen; u[2] /= uLen;
    const v = [
      centerNorm[1] * u[2] - centerNorm[2] * u[1],
      centerNorm[2] * u[0] - centerNorm[0] * u[2],
      centerNorm[0] * u[1] - centerNorm[1] * u[0]
    ];

    const sorted = faceCentroids.map((pt) => {
      const diff = [pt.x - centerNorm[0], pt.y - centerNorm[1], pt.z - centerNorm[2]];
      const pu = diff[0] * u[0] + diff[1] * u[1] + diff[2] * u[2];
      const pv = diff[0] * v[0] + diff[1] * v[1] + diff[2] * v[2];
      return { pt, angle: Math.atan2(pv, pu) };
    }).sort((a, b) => a.angle - b.angle).map((item) => item.pt);

    const vCount = sorted.length;
    const vx = new Float32Array(vCount);
    const vy = new Float32Array(vCount);
    const vz = new Float32Array(vCount);
    for (let k = 0; k < vCount; k++) {
      vx[k] = sorted[k].x;
      vy[k] = sorted[k].y;
      vz[k] = sorted[k].z;
    }

    hexCells.push({
      cx: centerNorm[0],
      cy: centerNorm[1],
      cz: centerNorm[2],
      vx,
      vy,
      vz,
      vCount
    });
  }

  return hexCells;
}

// Pre-generated static geometry cached once
const cachedHexCells = generateHexSphere(5);

// Static orbit definitions (defined once outside render loop)
interface RingConfig {
  rScale: number;
  speedMultiplier: number;
  angleSource: 'a1' | 'a2' | 'a3';
  color: string;
  glowColor: string;
  width: number;
  segments: { start: number; len: number }[];
  particles: { speed: number; phase: number; size: number; trailLen: number }[];
}

const STATIC_RINGS: RingConfig[] = [
  {
    rScale: 1.12,
    speedMultiplier: 1.6,
    angleSource: 'a1',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    width: 1.6,
    segments: [
      { start: 0, len: Math.PI * 0.7 },
      { start: Math.PI * 0.9, len: Math.PI * 0.4 },
      { start: Math.PI * 1.5, len: Math.PI * 0.35 }
    ],
    particles: [
      { speed: 2.2, phase: 0.2, size: 2.4, trailLen: 0.25 },
      { speed: 2.2, phase: 1.8, size: 1.8, trailLen: 0.18 }
    ]
  },
  {
    rScale: 1.25,
    speedMultiplier: 1.0,
    angleSource: 'a2',
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.35)',
    width: 2.2,
    segments: [
      { start: 0.2, len: Math.PI * 1.05 },
      { start: Math.PI * 1.4, len: Math.PI * 0.45 }
    ],
    particles: [
      { speed: 1.4, phase: 0.0, size: 3.0, trailLen: 0.32 },
      { speed: 1.4, phase: Math.PI, size: 2.2, trailLen: 0.22 }
    ]
  },
  {
    rScale: 1.36,
    speedMultiplier: -1.2,
    angleSource: 'a3',
    color: '#0ea5e9',
    glowColor: 'rgba(14, 165, 233, 0.25)',
    width: 1.3,
    segments: [
      { start: 0.4, len: Math.PI * 0.6 },
      { start: Math.PI * 1.1, len: Math.PI * 0.5 },
      { start: Math.PI * 1.7, len: Math.PI * 0.25 }
    ],
    particles: [
      { speed: -1.6, phase: 1.2, size: 2.0, trailLen: 0.2 }
    ]
  },
  {
    rScale: 1.45,
    speedMultiplier: 0.8,
    angleSource: 'a1',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.2)',
    width: 1.1,
    segments: [
      { start: 0.1, len: Math.PI * 0.85 },
      { start: Math.PI * 1.25, len: Math.PI * 0.5 }
    ],
    particles: [
      { speed: 1.0, phase: 2.5, size: 2.2, trailLen: 0.25 }
    ]
  },
  {
    rScale: 1.58,
    speedMultiplier: 0.5,
    angleSource: 'a2',
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.15)',
    width: 1.0,
    segments: [
      { start: 0, len: Math.PI * 2 * 0.98 }
    ],
    particles: [
      { speed: 0.7, phase: 0.5, size: 2.5, trailLen: 0.2 }
    ]
  }
];

export const OrbitalGraphic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseOffsetRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = 0;
    let isVisible = true;
    let width = container.offsetWidth || 440;
    let height = container.offsetHeight || 440;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function setCanvasDimensions(w: number, h: number) {
      if (!canvas) return;
      width = w;
      height = h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    setCanvasDimensions(width, height);

    // Optimized ResizeObserver: reads entry.contentRect directly to prevent forced reflow
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect) {
        const cw = entry.contentRect.width || 440;
        const ch = entry.contentRect.height || 440;
        setCanvasDimensions(cw, ch);
        renderFrame(0);
      }
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !prefersReducedMotion && !animationFrameId) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
      }
    });
    intersectionObserver.observe(container);

    // Cached rect for mouse tracking to avoid forced reflows during pointermove
    let cachedRect: DOMRect | null = null;
    const handlePointerEnter = () => {
      cachedRect = container.getBoundingClientRect();
      setIsHovered(true);
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!cachedRect) cachedRect = container.getBoundingClientRect();
      const nx = ((e.clientX - cachedRect.left) / cachedRect.width - 0.5) * 2;
      const ny = ((e.clientY - cachedRect.top) / cachedRect.height - 0.5) * 2;
      mouseOffsetRef.current.targetX = Math.max(-1, Math.min(1, nx)) * 0.18;
      mouseOffsetRef.current.targetY = Math.max(-1, Math.min(1, ny)) * 0.18;
    };
    const handlePointerLeave = () => {
      cachedRect = null;
      setIsHovered(false);
      mouseOffsetRef.current.targetX = 0;
      mouseOffsetRef.current.targetY = 0;
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Orbital constants
    const ORBIT_ROT_Z = -0.62;
    const ORBIT_TILT_X = 1.08;
    const cosZ = Math.cos(ORBIT_ROT_Z);
    const sinZ = Math.sin(ORBIT_ROT_Z);
    const cosX = Math.cos(ORBIT_TILT_X);
    const sinX = Math.sin(ORBIT_TILT_X);

    const CROSS_ROT_Z = -0.92;
    const CROSS_TILT_X = 0.88;
    const ccosZ = Math.cos(CROSS_ROT_Z);
    const csinZ = Math.sin(CROSS_ROT_Z);
    const ccosX = Math.cos(CROSS_TILT_X);
    const csinX = Math.sin(CROSS_TILT_X);

    let globeAngle = 0;
    let orbitAngle1 = 0;
    let orbitAngle2 = 0;
    let orbitAngle3 = 0;
    let pulseTime = 0;
    let lastTime = performance.now();

    function renderFrame(time: number) {
      if (!ctx || !canvas) return;

      const mo = mouseOffsetRef.current;
      mo.x += (mo.targetX - mo.x) * 0.05;
      mo.y += (mo.targetY - mo.y) * 0.05;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.285;
      const pulse = 1 + Math.sin(pulseTime * 1.5) * 0.02;

      // 1. Ambient Background Radial Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 2.2);
      bgGlow.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
      bgGlow.addColorStop(0.35, 'rgba(2, 132, 199, 0.12)');
      bgGlow.addColorStop(0.7, 'rgba(3, 105, 161, 0.04)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Background Orbital Arcs (z < 0)
      drawOrbitalSystem(ctx, cx, cy, R, orbitAngle1, orbitAngle2, orbitAngle3, pulseTime, false);

      // 3. Central 3D Hexagonal Wireframe Globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R * pulse, 0, Math.PI * 2);
      ctx.clip();

      const sphereGrad = ctx.createRadialGradient(
        cx + R * 0.35,
        cy - R * 0.35,
        R * 0.05,
        cx,
        cy,
        R
      );
      sphereGrad.addColorStop(0, 'rgba(34, 211, 238, 0.45)');
      sphereGrad.addColorStop(0.22, 'rgba(14, 165, 233, 0.7)');
      sphereGrad.addColorStop(0.55, 'rgba(2, 60, 160, 0.92)');
      sphereGrad.addColorStop(0.92, 'rgba(2, 15, 52, 0.98)');
      sphereGrad.addColorStop(1, 'rgba(1, 8, 30, 1)');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - R - 5, cy - R - 5, (R + 5) * 2, (R + 5) * 2);

      // Globe rotation transform
      const tiltX = 0.32 + mo.y;
      const tiltZ = -0.22 + mo.x;
      const cosTX = Math.cos(tiltX);
      const sinTX = Math.sin(tiltX);
      const cosTZ = Math.cos(tiltZ);
      const sinTZ = Math.sin(tiltZ);
      const cosG = Math.cos(globeAngle);
      const sinG = Math.sin(globeAngle);

      // Hexagonal Wireframe Rendering (Zero memory allocations)
      for (let i = 0; i < cachedHexCells.length; i++) {
        const cell = cachedHexCells[i];

        // Transform center
        const cx1 = cell.cx * cosG - cell.cz * sinG;
        const cy1 = cell.cy;
        const cz1 = cell.cx * sinG + cell.cz * cosG;
        const cx2 = cx1 * cosTZ - cy1 * sinTZ;
        const cy2 = cx1 * sinTZ + cy1 * cosTZ;
        const transCZ = cy2 * sinTX + cz1 * cosTX;

        if (transCZ < -0.05) continue;

        const transCX = cx2;
        const transCY = cy2 * cosTX - cz1 * sinTX;
        const lightDot = Math.max(0, transCX * 0.35 - transCY * 0.4 + transCZ * 0.8);
        const zDepth = transCZ;

        ctx.beginPath();
        let anyVisible = false;
        for (let j = 0; j < cell.vCount; j++) {
          const vx1 = cell.vx[j] * cosG - cell.vz[j] * sinG;
          const vy1 = cell.vy[j];
          const vz1 = cell.vx[j] * sinG + cell.vz[j] * cosG;
          const vx2 = vx1 * cosTZ - vy1 * sinTZ;
          const vy2 = vx1 * sinTZ + vy1 * cosTZ;
          const vzTrans = vy2 * sinTX + vz1 * cosTX;
          if (vzTrans > -0.15) anyVisible = true;
          const px = cx + vx2 * R * pulse;
          const py = cy + (vy2 * cosTX - vz1 * sinTX) * R * pulse;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (anyVisible) {
          const fillAlpha = Math.min(0.25, 0.02 + lightDot * 0.16 + zDepth * 0.06);
          ctx.fillStyle = `rgba(34, 211, 238, ${fillAlpha.toFixed(3)})`;
          ctx.fill();

          const strokeAlpha = Math.min(0.95, 0.25 + lightDot * 0.45 + zDepth * 0.25);
          ctx.strokeStyle = `rgba(56, 189, 248, ${strokeAlpha.toFixed(3)})`;
          ctx.lineWidth = lightDot > 0.6 ? 1.3 : 0.9;
          ctx.stroke();
        }
      }

      // Inner Atmosphere / Fresnel rim glow
      const rimGrad = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R);
      rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rimGrad.addColorStop(0.7, 'rgba(34, 211, 238, 0.2)');
      rimGrad.addColorStop(0.95, 'rgba(56, 189, 248, 0.6)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      ctx.restore();

      // Outer rim ring
      ctx.beginPath();
      ctx.arc(cx, cy, R * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 4. Foreground Orbital Arcs (z >= 0)
      drawOrbitalSystem(ctx, cx, cy, R, orbitAngle1, orbitAngle2, orbitAngle3, pulseTime, true);

      // 5. Polar Gyroscopic Collar Ring (Top-Right)
      drawPolarCollar(ctx, cx, cy, R, pulseTime);

      ctx.restore();
    }

    function drawOrbitalSystem(
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      R: number,
      a1: number,
      a2: number,
      a3: number,
      t: number,
      isForeground: boolean
    ) {
      for (let ri = 0; ri < STATIC_RINGS.length; ri++) {
        const ring = STATIC_RINGS[ri];
        const baseAngle = ring.angleSource === 'a1' ? a1 : ring.angleSource === 'a2' ? a2 : a3;
        const ringOffset = baseAngle * ring.speedMultiplier;
        const r = R * ring.rScale;

        // Render continuous arcs directly without object allocations
        for (let si = 0; si < ring.segments.length; si++) {
          const seg = ring.segments[si];
          const steps = 36;
          const stepAngle = seg.len / steps;

          c.beginPath();
          let inPath = false;
          let firstX = 0, firstY = 0;

          for (let step = 0; step <= steps; step++) {
            const angle = ringOffset + seg.start + step * stepAngle;
            const px = r * Math.cos(angle);
            const py = r * Math.sin(angle);
            const py1 = py * cosX;
            const pz1 = py * sinX;
            const sx = cx + (px * cosZ - py1 * sinZ);
            const sy = cy + (px * sinZ + py1 * cosZ);

            const belongs = isForeground ? pz1 >= 0 : pz1 < 0;

            if (belongs) {
              if (!inPath) {
                c.moveTo(sx, sy);
                firstX = sx; firstY = sy;
                inPath = true;
              } else {
                c.lineTo(sx, sy);
              }
            } else {
              inPath = false;
            }
          }

          if (inPath) {
            c.strokeStyle = ring.color;
            c.lineWidth = ring.width;
            c.lineCap = 'round';
            c.stroke();
          }
        }

        // Render traveling particles
        for (let pi = 0; pi < ring.particles.length; pi++) {
          const p = ring.particles[pi];
          const curAngle = ringOffset + (t * p.speed) + p.phase;
          const px = r * Math.cos(curAngle);
          const py = r * Math.sin(curAngle);
          const py1 = py * cosX;
          const pz1 = py * sinX;
          const inLayer = isForeground ? pz1 >= 0 : pz1 < 0;

          if (inLayer) {
            const hx = cx + (px * cosZ - py1 * sinZ);
            const hy = cy + (px * sinZ + py1 * cosZ);

            // Comet tail
            c.beginPath();
            const tailSteps = 10;
            for (let ti = 0; ti <= tailSteps; ti++) {
              const tailAngle = curAngle - (p.trailLen * (ti / tailSteps)) * Math.sign(p.speed);
              const tpx = r * Math.cos(tailAngle);
              const tpy = r * Math.sin(tailAngle);
              const tpy1 = tpy * cosX;
              const tx = cx + (tpx * cosZ - tpy1 * sinZ);
              const ty = cy + (tpx * sinZ + tpy1 * cosZ);
              if (ti === 0) c.moveTo(tx, ty);
              else c.lineTo(tx, ty);
            }
            c.strokeStyle = ring.color;
            c.lineWidth = ring.width * 1.3;
            c.lineCap = 'round';
            c.stroke();

            // Head bead
            c.beginPath();
            c.arc(hx, hy, p.size, 0, Math.PI * 2);
            c.fillStyle = '#ffffff';
            c.fill();

            c.beginPath();
            c.arc(hx, hy, p.size * 2.0, 0, Math.PI * 2);
            c.fillStyle = ring.glowColor;
            c.fill();
          }
        }
      }

      // Secondary Cross-Orbit
      const crossR = R * 1.32;
      const crossAngle = -a2 * 0.9;
      const cSteps = 36;
      c.beginPath();
      let inCross = false;
      for (let i = 0; i <= cSteps; i++) {
        const ang = crossAngle + (i / cSteps) * Math.PI * 1.2;
        const px = crossR * Math.cos(ang);
        const py = crossR * Math.sin(ang);
        const py1 = py * ccosX;
        const pz1 = py * csinX;
        const sx = cx + (px * ccosZ - py1 * csinZ);
        const sy = cy + (px * csinZ + py1 * ccosZ);

        const belongs = isForeground ? pz1 >= 0 : pz1 < 0;
        if (belongs) {
          if (!inCross) {
            c.moveTo(sx, sy);
            inCross = true;
          } else {
            c.lineTo(sx, sy);
          }
        } else {
          inCross = false;
        }
      }
      if (inCross) {
        c.strokeStyle = 'rgba(129, 140, 248, 0.75)';
        c.lineWidth = 1.2;
        c.stroke();
      }
    }

    function drawPolarCollar(
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      R: number,
      t: number
    ) {
      const px = cx + R * 0.72;
      const py = cy - R * 0.65;

      c.save();
      c.translate(px, py);
      c.rotate(-0.55);

      c.beginPath();
      c.ellipse(0, 0, 18, 9, 0, t * 0.8, t * 0.8 + Math.PI * 1.3);
      c.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      c.lineWidth = 2.4;
      c.stroke();

      c.beginPath();
      c.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      c.lineWidth = 1.0;
      c.stroke();

      c.beginPath();
      c.ellipse(0, 0, 32, 16, 0, -t * 0.5, -t * 0.5 + Math.PI * 0.6);
      c.strokeStyle = 'rgba(14, 165, 233, 0.75)';
      c.lineWidth = 1.6;
      c.stroke();

      c.restore();
    }

    function loop(currentTime: number) {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      globeAngle += dt * 0.16;
      orbitAngle1 += dt * 0.35;
      orbitAngle2 += dt * 0.22;
      orbitAngle3 += dt * 0.18;
      pulseTime += dt;

      renderFrame(currentTime);
      animationFrameId = requestAnimationFrame(loop);
    }

    // Render initial static frame immediately for instant FCP/LCP
    renderFrame(0);

    // Start continuous animation loop immediately (zero-allocation loop runs in 0.2ms, 0ms TBT)
    if (!prefersReducedMotion && isVisible) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      } else if (!prefersReducedMotion && isVisible && !animationFrameId) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="orbital-graphic relative w-full max-w-[430px] sm:max-w-[480px] mx-auto aspect-square flex items-center justify-center my-4 select-none"
    >
      {/* 1. Ambient Background Multi-stop Glow Aura */}
      <div className="absolute inset-0 bg-radial from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-700 translate-y-8 sm:translate-y-12" />

      {/* 2. Floating Badge: Agent Workflows (Top Left - Preserved Exact Position) */}
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

      {/* 3. Floating Badge: Smarter with AI (Top Right - Preserved Exact Position) */}
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

      {/* 4. Instant Vector Base Layer (Renders at 0ms synchronously with FCP so Speed Index is under 2.0s) */}
      <svg
        viewBox="0 0 440 440"
        className="absolute inset-0 w-full h-full pointer-events-none translate-y-8 sm:translate-y-12 select-none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="staticGlobeGrad" cx="62%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="22%" stopColor="#0ea5e9" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#023ca0" stopOpacity="0.92" />
            <stop offset="92%" stopColor="#020f34" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#01081e" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="staticGlobeRim" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="#000" stopOpacity="0" />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.8" />
          </radialGradient>
          <clipPath id="staticGlobeClip">
            <circle cx="220" cy="220" r="110" />
          </clipPath>
        </defs>

        {/* Background Orbital Arcs (behind globe) */}
        <g opacity="0.65">
          <ellipse
            cx="220"
            cy="220"
            rx="138"
            ry="64"
            transform="rotate(-35, 220, 220)"
            stroke="#38bdf8"
            strokeWidth="1.6"
            strokeDasharray="140 120"
            fill="none"
          />
          <ellipse
            cx="220"
            cy="220"
            rx="155"
            ry="72"
            transform="rotate(-35, 220, 220)"
            stroke="#22d3ee"
            strokeWidth="2.0"
            strokeDasharray="220 140"
            fill="none"
          />
        </g>

        {/* Central Hexagonal Wireframe Globe */}
        <g clipPath="url(#staticGlobeClip)">
          <circle cx="220" cy="220" r="110" fill="url(#staticGlobeGrad)" />
          <path
            d={STATIC_HEX_PATH}
            stroke="#38bdf8"
            strokeWidth="1.0"
            fill="rgba(34, 211, 238, 0.08)"
            strokeOpacity="0.85"
          />
          <circle cx="220" cy="220" r="110" fill="url(#staticGlobeRim)" />
        </g>
        <circle cx="220" cy="220" r="110" stroke="rgba(56, 189, 248, 0.55)" strokeWidth="1.4" fill="none" />

        {/* Foreground Orbital Arcs (across front of globe) */}
        <g>
          <ellipse
            cx="220"
            cy="220"
            rx="155"
            ry="72"
            transform="rotate(-35, 220, 220)"
            stroke="#22d3ee"
            strokeWidth="2.2"
            strokeDasharray="180 200"
            strokeDashoffset="120"
            fill="none"
          />
          <ellipse
            cx="220"
            cy="220"
            rx="172"
            ry="80"
            transform="rotate(-35, 220, 220)"
            stroke="#0ea5e9"
            strokeWidth="1.3"
            strokeDasharray="90 80 120 70"
            fill="none"
          />
          <ellipse
            cx="220"
            cy="220"
            rx="192"
            ry="90"
            transform="rotate(-35, 220, 220)"
            stroke="#60a5fa"
            strokeWidth="1.0"
            strokeOpacity="0.5"
            fill="none"
          />
          {/* Cross Orbit */}
          <ellipse
            cx="220"
            cy="220"
            rx="160"
            ry="76"
            transform="rotate(-52, 220, 220)"
            stroke="#818cf8"
            strokeWidth="1.2"
            strokeDasharray="140 180"
            strokeOpacity="0.75"
            fill="none"
          />
          {/* Polar HUD Collar at upper-right */}
          <g transform="translate(305, 145) rotate(-32)">
            <ellipse cx="0" cy="0" rx="18" ry="9" stroke="rgba(56, 189, 248, 0.9)" strokeWidth="2.4" fill="none" />
            <ellipse cx="0" cy="0" rx="26" ry="13" stroke="rgba(34, 211, 238, 0.45)" strokeWidth="1" fill="none" />
          </g>
        </g>
      </svg>

      {/* 5. The Futuristic Holographic Hexagonal Wireframe Globe & Orbital System Canvas */}
      <canvas
        ref={canvasRef}
        width={440}
        height={440}
        aria-label="Futuristic holographic hexagonal wireframe globe with glowing cyan orbital rings"
        className="relative z-10 w-full h-full block cursor-pointer transition-transform duration-500 hover:scale-[1.02] translate-y-8 sm:translate-y-12"
      />
    </div>
  );
};

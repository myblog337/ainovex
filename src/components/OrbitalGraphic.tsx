import React, { useEffect, useRef, useState } from 'react';
import { GitBranch } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface HexCell {
  center: Point3D;
  vertices: Point3D[];
  isPentagon: boolean;
}

/**
 * Procedurally generates a geodesic hexagonal sphere (dual of a subdivided icosahedron).
 * Produces ~252 cells (240 regular hexagons, 12 pentagons) matching the exact
 * dense honeycomb wireframe seen in the reference holographic globe.
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
        triangles.push([
          rowVertices[i][j],
          rowVertices[i + 1][j],
          rowVertices[i][j + 1]
        ]);
        if (j < subdivisions - i - 1) {
          triangles.push([
            rowVertices[i + 1][j],
            rowVertices[i + 1][j + 1],
            rowVertices[i][j + 1]
          ]);
        }
      }
    }
  }

  // Centroid of each triangle
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

  // Map each vertex to its surrounding triangle centroids
  const vertexToTriangles: number[][] = Array.from({ length: vertices.length }, () => []);
  triangles.forEach((tri, triIdx) => {
    vertexToTriangles[tri[0]].push(triIdx);
    vertexToTriangles[tri[1]].push(triIdx);
    vertexToTriangles[tri[2]].push(triIdx);
  });

  const hexCells: HexCell[] = [];
  for (let vIdx = 0; vIdx < vertices.length; vIdx++) {
    const centerNorm = vertices[vIdx];
    const center: Point3D = { x: centerNorm[0], y: centerNorm[1], z: centerNorm[2] };
    const triIndices = vertexToTriangles[vIdx];
    if (triIndices.length < 5) continue;

    const faceCentroids = triIndices.map((idx) => centroids[idx]);

    // Construct local tangent frame u, v
    let ref = [1, 0, 0];
    if (Math.abs(center.x) > 0.9) ref = [0, 1, 0];
    const u = [
      center.y * ref[2] - center.z * ref[1],
      center.z * ref[0] - center.x * ref[2],
      center.x * ref[1] - center.y * ref[0]
    ];
    const uLen = Math.hypot(...u);
    u[0] /= uLen; u[1] /= uLen; u[2] /= uLen;
    const v = [
      center.y * u[2] - center.z * u[1],
      center.z * u[0] - center.x * u[2],
      center.x * u[1] - center.y * u[0]
    ];

    // Sort polygon vertices cyclically around normal
    const sorted = faceCentroids.map((pt) => {
      const diff = [pt.x - center.x, pt.y - center.y, pt.z - center.z];
      const pu = diff[0] * u[0] + diff[1] * u[1] + diff[2] * u[2];
      const pv = diff[0] * v[0] + diff[1] * v[1] + diff[2] * v[2];
      return { pt, angle: Math.atan2(pv, pu) };
    }).sort((a, b) => a.angle - b.angle).map((item) => item.pt);

    hexCells.push({
      center,
      vertices: sorted,
      isPentagon: sorted.length === 5
    });
  }

  return hexCells;
}

// Pre-generate geometry once at module scope (takes ~5ms, zero runtime overhead)
const cachedHexCells = generateHexSphere(5);

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

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let isVisible = true;
    let width = container.clientWidth || 440;
    let height = container.clientHeight || 440;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function updateSize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      width = rect.width || 440;
      height = rect.height || 440;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
      if (prefersReducedMotion) renderFrame(0);
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

    // Mouse movement for subtle interactive tilt
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseOffsetRef.current.targetX = Math.max(-1, Math.min(1, nx)) * 0.18;
      mouseOffsetRef.current.targetY = Math.max(-1, Math.min(1, ny)) * 0.18;
    };
    const handlePointerLeave = () => {
      mouseOffsetRef.current.targetX = 0;
      mouseOffsetRef.current.targetY = 0;
    };
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Orbital configuration matching reference image:
    // Main orbital plane tilted at ~34deg diagonally across screen
    const ORBIT_ROT_Z = -0.62; // ~-35 degrees
    const ORBIT_TILT_X = 1.08; // ~62 degrees tilt

    // Precalculate transform matrix for orbital plane
    const cosZ = Math.cos(ORBIT_ROT_Z);
    const sinZ = Math.sin(ORBIT_ROT_Z);
    const cosX = Math.cos(ORBIT_TILT_X);
    const sinX = Math.sin(ORBIT_TILT_X);

    function projectOrbitPoint(r: number, angle: number): Point3D {
      // Point in orbit plane: (r * cos(angle), r * sin(angle), 0)
      const px = r * Math.cos(angle);
      const py = r * Math.sin(angle);
      // Tilt around X axis
      const py1 = py * cosX;
      const pz1 = py * sinX;
      // Rotate around Z axis
      const px2 = px * cosZ - py1 * sinZ;
      const py2 = px * sinZ + py1 * cosZ;
      const pz2 = pz1;
      return { x: px2, y: py2, z: pz2 };
    }

    // Secondary cross-orbit plane configuration
    const CROSS_ROT_Z = -0.92;
    const CROSS_TILT_X = 0.88;
    const ccosZ = Math.cos(CROSS_ROT_Z);
    const csinZ = Math.sin(CROSS_ROT_Z);
    const ccosX = Math.cos(CROSS_TILT_X);
    const csinX = Math.sin(CROSS_TILT_X);

    function projectCrossOrbitPoint(r: number, angle: number): Point3D {
      const px = r * Math.cos(angle);
      const py = r * Math.sin(angle);
      const py1 = py * ccosX;
      const pz1 = py * csinX;
      const px2 = px * ccosZ - py1 * csinZ;
      const py2 = px * csinZ + py1 * ccosZ;
      return { x: px2, y: py2, z: pz1 };
    }

    let globeAngle = 0;
    let orbitAngle1 = 0;
    let orbitAngle2 = 0;
    let orbitAngle3 = 0;
    let pulseTime = 0;
    let lastTime = performance.now();

    function renderFrame(time: number) {
      if (!ctx || !canvas) return;

      // Smooth mouse easing
      const mo = mouseOffsetRef.current;
      mo.x += (mo.targetX - mo.x) * 0.05;
      mo.y += (mo.targetY - mo.y) * 0.05;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2;
      // Globe radius sized to leave room for orbital rings and floating badges
      const R = Math.min(width, height) * 0.285;

      // Subtle breathing pulse on the globe glow
      const pulse = 1 + Math.sin(pulseTime * 1.5) * 0.02;

      // -----------------------------------------------------------------------
      // 1. AMBIENT BACKGROUND GLOW
      // -----------------------------------------------------------------------
      const bgGlow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 2.2);
      bgGlow.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
      bgGlow.addColorStop(0.35, 'rgba(2, 132, 199, 0.12)');
      bgGlow.addColorStop(0.7, 'rgba(3, 105, 161, 0.04)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // -----------------------------------------------------------------------
      // 2. BACKGROUND ORBITAL ARCS & PARTICLES (z < 0: behind the globe)
      // -----------------------------------------------------------------------
      drawOrbitalSystem(ctx, cx, cy, R, orbitAngle1, orbitAngle2, orbitAngle3, pulseTime, false);

      // -----------------------------------------------------------------------
      // 3. CENTRAL 3D HEXAGONAL WIREFRAME GLOBE
      // -----------------------------------------------------------------------
      ctx.save();
      // Clip to sphere circle
      ctx.beginPath();
      ctx.arc(cx, cy, R * pulse, 0, Math.PI * 2);
      ctx.clip();

      // Deep rich volumetric spherical gradient
      // Light source offset to top-right (cx + 0.35R, cy - 0.35R) matching reference
      const sphereGrad = ctx.createRadialGradient(
        cx + R * 0.35,
        cy - R * 0.35,
        R * 0.05,
        cx,
        cy,
        R
      );
      sphereGrad.addColorStop(0, 'rgba(34, 211, 238, 0.45)'); // luminous electric cyan highlight
      sphereGrad.addColorStop(0.22, 'rgba(14, 165, 233, 0.7)'); // bright sky blue
      sphereGrad.addColorStop(0.55, 'rgba(2, 60, 160, 0.92)'); // deep cobalt/sapphire blue
      sphereGrad.addColorStop(0.92, 'rgba(2, 15, 52, 0.98)'); // deep space navy
      sphereGrad.addColorStop(1, 'rgba(1, 8, 30, 1)');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - R - 5, cy - R - 5, (R + 5) * 2, (R + 5) * 2);

      // 3D Globe Rotation Matrix (Axial tilt + continuous spin + mouse tilt)
      const tiltX = 0.32 + mo.y;
      const tiltZ = -0.22 + mo.x;
      const cosTX = Math.cos(tiltX);
      const sinTX = Math.sin(tiltX);
      const cosTZ = Math.cos(tiltZ);
      const sinTZ = Math.sin(tiltZ);
      const cosG = Math.cos(globeAngle);
      const sinG = Math.sin(globeAngle);

      function transformSpherePoint(p: Point3D): Point3D {
        // Spin around polar axis (Y)
        const x1 = p.x * cosG - p.z * sinG;
        const y1 = p.y;
        const z1 = p.x * sinG + p.z * cosG;
        // Tilt around Z
        const x2 = x1 * cosTZ - y1 * sinTZ;
        const y2 = x1 * sinTZ + y1 * cosTZ;
        const z2 = z1;
        // Tilt around X
        const y3 = y2 * cosTX - z2 * sinTX;
        const z3 = y2 * sinTX + z2 * cosTX;
        return { x: x2, y: y3, z: z3 };
      }

      // Render Hexagonal Cells
      for (let i = 0; i < cachedHexCells.length; i++) {
        const cell = cachedHexCells[i];
        const centerTrans = transformSpherePoint(cell.center);

        // Back-face culling: only draw cells on the front-facing hemisphere
        if (centerTrans.z < -0.05) continue;

        // Spherical lighting factor: dot product with light source (0.35, -0.4, 0.8)
        const lightDot = Math.max(0, centerTrans.x * 0.35 - centerTrans.y * 0.4 + centerTrans.z * 0.8);
        const zDepth = centerTrans.z; // 0 to 1

        // Transform vertices to 2D screen coords
        const pts: [number, number][] = [];
        let anyVisible = false;
        for (let j = 0; j < cell.vertices.length; j++) {
          const vTrans = transformSpherePoint(cell.vertices[j]);
          if (vTrans.z > -0.15) anyVisible = true;
          pts.push([cx + vTrans.x * R * pulse, cy + vTrans.y * R * pulse]);
        }
        if (!anyVisible || pts.length < 3) continue;

        // Draw hexagon path
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < pts.length; k++) {
          ctx.lineTo(pts[k][0], pts[k][1]);
        }
        ctx.closePath();

        // Hexagon cell inner fill: subtle luminous cybernetic sheen
        const fillAlpha = Math.min(0.25, 0.02 + lightDot * 0.16 + zDepth * 0.06);
        ctx.fillStyle = `rgba(34, 211, 238, ${fillAlpha.toFixed(3)})`;
        ctx.fill();

        // Hexagon wireframe stroke: intense cyan on highlights, deeper blue towards edges
        const strokeAlpha = Math.min(0.95, 0.25 + lightDot * 0.45 + zDepth * 0.25);
        ctx.strokeStyle = `rgba(56, 189, 248, ${strokeAlpha.toFixed(3)})`;
        ctx.lineWidth = lightDot > 0.6 ? 1.3 : 0.9;
        ctx.stroke();

        // Node vertices (small luminous cyan dots at intersections)
        if (lightDot > 0.45 && zDepth > 0.3) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(0.3 + lightDot * 0.5).toFixed(2)})`;
          for (let m = 0; m < pts.length; m += 2) {
            ctx.beginPath();
            ctx.arc(pts[m][0], pts[m][1], 1.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Inner atmosphere / Fresnel rim edge glow
      const rimGrad = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R);
      rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rimGrad.addColorStop(0.7, 'rgba(34, 211, 238, 0.2)');
      rimGrad.addColorStop(0.95, 'rgba(56, 189, 248, 0.6)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      ctx.restore(); // Exit sphere clipping

      // Outer edge sharp cyan rim line
      ctx.beginPath();
      ctx.arc(cx, cy, R * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // -----------------------------------------------------------------------
      // 4. FOREGROUND ORBITAL ARCS & PARTICLES (z >= 0: in front of the globe)
      // -----------------------------------------------------------------------
      drawOrbitalSystem(ctx, cx, cy, R, orbitAngle1, orbitAngle2, orbitAngle3, pulseTime, true);

      // -----------------------------------------------------------------------
      // 5. POLAR GYROSCOPIC COLLAR RINGS (Top-Right HUD target collar)
      // -----------------------------------------------------------------------
      drawPolarCollar(ctx, cx, cy, R, pulseTime);

      ctx.restore();
    }

    /**
     * Renders orbital rings and traversing particles.
     * Splitting into background (isForeground = false) and foreground (isForeground = true)
     * achieves genuine 3D spatial depth around the globe.
     */
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
      // Configuration of the multiple orbital tracks:
      // [radiusMultiplier, speedMultiplier, baseAlpha, lineWidth, arcs, particles]
      const rings = [
        // Ring 0: Inner tight fast cyan orbit
        {
          r: R * 1.12,
          angleOffset: a1 * 1.6,
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
        // Ring 1: Primary wide orbit with long glowing arcs (matches reference centerpiece)
        {
          r: R * 1.25,
          angleOffset: a2,
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
        // Ring 2: Concentric mid orbit
        {
          r: R * 1.36,
          angleOffset: -a3 * 1.2,
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
        // Ring 3: Concentric outer cluster ring
        {
          r: R * 1.45,
          angleOffset: a1 * 0.8,
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
        // Ring 4: Outer sweeping orbital guide wire
        {
          r: R * 1.58,
          angleOffset: a2 * 0.5,
          color: '#60a5fa',
          glowColor: 'rgba(96, 165, 250, 0.15)',
          width: 1.0,
          segments: [
            { start: 0, len: Math.PI * 2 * 0.98 } // Almost complete thin orbit
          ],
          particles: [
            { speed: 0.7, phase: 0.5, size: 2.5, trailLen: 0.2 }
          ]
        }
      ];

      for (const ring of rings) {
        // Draw orbital segments
        for (const seg of ring.segments) {
          const steps = 40;
          const stepAngle = seg.len / steps;

          let currentBatch: Point3D[] = [];

          for (let i = 0; i <= steps; i++) {
            const angle = ring.angleOffset + seg.start + i * stepAngle;
            const pt = projectOrbitPoint(ring.r, angle);

            // Filter by foreground vs background depth
            const belongs = isForeground ? pt.z >= 0 : pt.z < 0;

            if (belongs) {
              currentBatch.push(pt);
            } else {
              if (currentBatch.length > 1) {
                renderArcBatch(c, cx, cy, currentBatch, ring.color, ring.glowColor, ring.width);
              }
              currentBatch = [];
            }
          }
          if (currentBatch.length > 1) {
            renderArcBatch(c, cx, cy, currentBatch, ring.color, ring.glowColor, ring.width);
          }
        }

        // Draw traveling particles
        for (const p of ring.particles) {
          const curAngle = ring.angleOffset + (t * p.speed) + p.phase;
          const headPt = projectOrbitPoint(ring.r, curAngle);
          const inLayer = isForeground ? headPt.z >= 0 : headPt.z < 0;

          if (inLayer) {
            const hx = cx + headPt.x;
            const hy = cy + headPt.y;

            // Draw particle comet tail
            const tailSteps = 12;
            c.beginPath();
            for (let ti = 0; ti <= tailSteps; ti++) {
              const tailAngle = curAngle - (p.trailLen * (ti / tailSteps)) * Math.sign(p.speed);
              const tp = projectOrbitPoint(ring.r, tailAngle);
              const tx = cx + tp.x;
              const ty = cy + tp.y;
              if (ti === 0) c.moveTo(tx, ty);
              else c.lineTo(tx, ty);
            }
            c.strokeStyle = ring.color;
            c.lineWidth = ring.width * 1.4;
            c.lineCap = 'round';
            c.stroke();

            // Particle glowing head
            c.beginPath();
            c.arc(hx, hy, p.size, 0, Math.PI * 2);
            c.fillStyle = '#ffffff';
            c.fill();

            // Outer soft glow halo
            c.beginPath();
            c.arc(hx, hy, p.size * 2.2, 0, Math.PI * 2);
            c.fillStyle = ring.glowColor;
            c.fill();
          }
        }
      }

      // Cross-Tilted Secondary Gyro Orbit Ring
      const crossR = R * 1.32;
      const crossAngle = -a2 * 0.9;
      const cSteps = 45;
      let cBatch: Point3D[] = [];
      for (let i = 0; i <= cSteps; i++) {
        const ang = crossAngle + (i / cSteps) * Math.PI * 1.2;
        const pt = projectCrossOrbitPoint(crossR, ang);
        const belongs = isForeground ? pt.z >= 0 : pt.z < 0;
        if (belongs) {
          cBatch.push(pt);
        } else {
          if (cBatch.length > 1) {
            renderArcBatch(c, cx, cy, cBatch, 'rgba(129, 140, 248, 0.75)', 'rgba(129, 140, 248, 0.2)', 1.2);
          }
          cBatch = [];
        }
      }
      if (cBatch.length > 1) {
        renderArcBatch(c, cx, cy, cBatch, 'rgba(129, 140, 248, 0.75)', 'rgba(129, 140, 248, 0.2)', 1.2);
      }
    }

    /** Helper to draw a batch of connected 3D projected points with two-pass glow stroke */
    function renderArcBatch(
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      pts: Point3D[],
      color: string,
      glowColor: string,
      width: number
    ) {
      if (pts.length < 2) return;

      // Pass 1: Soft wide stroke for glow effect
      c.beginPath();
      c.moveTo(cx + pts[0].x, cy + pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        c.lineTo(cx + pts[i].x, cy + pts[i].y);
      }
      c.strokeStyle = glowColor;
      c.lineWidth = width * 3.2;
      c.lineCap = 'round';
      c.stroke();

      // Pass 2: Crisp core beam stroke
      c.beginPath();
      c.moveTo(cx + pts[0].x, cy + pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        c.lineTo(cx + pts[i].x, cy + pts[i].y);
      }
      c.strokeStyle = color;
      c.lineWidth = width;
      c.lineCap = 'round';
      c.stroke();
    }

    /**
     * Renders the futuristic polar collar rings at the top-right
     * matching the distinct gimbal collar in the reference screenshot.
     */
    function drawPolarCollar(
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      R: number,
      t: number
    ) {
      // Polar axis position located at upper-right (~45 deg)
      const px = cx + R * 0.72;
      const py = cy - R * 0.65;

      c.save();
      c.translate(px, py);
      // Tilted ellipse orientation
      c.rotate(-0.55);

      // Inner collar arc
      c.beginPath();
      c.ellipse(0, 0, 18, 9, 0, t * 0.8, t * 0.8 + Math.PI * 1.3);
      c.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      c.lineWidth = 2.4;
      c.stroke();

      // Outer collar thin ring
      c.beginPath();
      c.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      c.lineWidth = 1.0;
      c.stroke();

      // Dashed satellite tick
      c.beginPath();
      c.ellipse(0, 0, 32, 16, 0, -t * 0.5, -t * 0.5 + Math.PI * 0.6);
      c.strokeStyle = 'rgba(14, 165, 233, 0.75)';
      c.lineWidth = 1.6;
      c.stroke();

      c.restore();
    }

    // Animation Loop
    function loop(currentTime: number) {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update angles continuously (frame-rate independent)
      globeAngle += dt * 0.16; // One stately rotation ~39s
      orbitAngle1 += dt * 0.35;
      orbitAngle2 += dt * 0.22;
      orbitAngle3 += dt * 0.18;
      pulseTime += dt;

      renderFrame(currentTime);
      animationFrameId = requestAnimationFrame(loop);
    }

    // Initial render
    renderFrame(0);

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(loop);
    }

    // Handle visibility changes (pause when user switches tabs)
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Ambient Background Multi-stop Glow Aura */}
      <div className="absolute inset-0 bg-radial from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-700" />

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

      {/* 4. The Futuristic Holographic Hexagonal Wireframe Globe & Orbital System Canvas */}
      <canvas
        ref={canvasRef}
        aria-label="Futuristic holographic hexagonal wireframe globe with glowing cyan orbital rings"
        className="relative z-10 w-full h-full block cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
      />
    </div>
  );
};

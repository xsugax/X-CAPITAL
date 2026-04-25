"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface OrbitalConstellationProps {
  size?: number;
  className?: string;
  dense?: boolean;
}

export default function OrbitalConstellation({
  size = 280,
  className,
  dense = false,
}: OrbitalConstellationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rings = dense
    ? [
        { size: 60, speed: "orbit-1", satellite: true, dim: false },
        { size: 100, speed: "orbit-2", satellite: true, dim: true },
        { size: 140, speed: "orbit-3", satellite: true, dim: false },
        { size: 180, speed: "orbit-4", satellite: true, dim: true },
        { size: 220, speed: "orbit-5", satellite: true, dim: false },
        { size: 260, speed: "orbit-6", satellite: true, dim: true },
      ]
    : [
        { size: 80, speed: "orbit-1", satellite: true, dim: false },
        { size: 140, speed: "orbit-3", satellite: true, dim: true },
        { size: 200, speed: "orbit-5", satellite: true, dim: false },
      ];

  // Extra decorative satellites for dense mode
  const extraSatellites = dense
    ? [
        { orbit: 60, angle: 90, speed: "orbit-1" },
        { orbit: 100, angle: 180, speed: "orbit-2" },
        { orbit: 140, angle: 270, speed: "orbit-3" },
        { orbit: 180, angle: 45, speed: "orbit-4" },
        { orbit: 220, angle: 135, speed: "orbit-5" },
        { orbit: 260, angle: 315, speed: "orbit-6" },
      ]
    : [
        { orbit: 80, angle: 180, speed: "orbit-1" },
        { orbit: 140, angle: 90, speed: "orbit-3" },
        { orbit: 200, angle: 270, speed: "orbit-5" },
      ];

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Constellation mesh background dots */}
      <div className="constellation-mesh rounded-full absolute inset-0" />

      {/* Central core node */}
      <div className="orbit-core" />

      {/* Signal expansion rings */}
      <div className="orbit-signal" style={{ animationDelay: "0s" }} />
      <div
        className="orbit-signal"
        style={{
          animationDelay: "1.3s",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="orbit-signal"
        style={{
          animationDelay: "2.6s",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Orbital rings with satellites */}
      {rings.map((ring, i) => (
        <div
          key={i}
          className={cn("orbit-ring orbit-ring-enhanced", ring.speed)}
          style={{ width: ring.size, height: ring.size }}
        >
          {ring.satellite && (
            <div className={cn("orbit-satellite", ring.dim && "dim")} />
          )}
        </div>
      ))}

      {/* Extra satellites at different angles */}
      {mounted &&
        extraSatellites.map((sat, i) => (
          <div
            key={`extra-${i}`}
            className={cn("orbit-ring", sat.speed)}
            style={{
              width: sat.orbit,
              height: sat.orbit,
              transform: `translate(-50%, -50%) rotate(${sat.angle}deg)`,
            }}
          >
            <div
              className={cn(
                "orbit-satellite",
                i % 2 === 0 ? "dim" : "",
              )}
              style={{
                top: "-3px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        ))}

      {/* Data packet animation */}
      {mounted && (
        <>
          <div
            className="data-packet"
            style={{
              offsetPath: "path('M 0,-100 Q 50,-50 100,0')",
              animationDelay: "0s",
              animationDuration: "2s",
            }}
          />
          <div
            className="data-packet"
            style={{
              offsetPath: "path('M 100,0 Q 50,50 0,100')",
              animationDelay: "0.7s",
              animationDuration: "2.5s",
            }}
          />
          <div
            className="data-packet"
            style={{
              offsetPath: "path('M 0,100 Q -50,50 -100,0')",
              animationDelay: "1.4s",
              animationDuration: "2.2s",
            }}
          />
        </>
      )}

      {/* Center profit indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 12px rgba(16,185,129,0.6)" }} />
      </div>
    </div>
  );
}

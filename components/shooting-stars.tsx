"use client";
import { cn } from "../lib/utils";
import React, { useEffect, useRef, useId } from "react";

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  maxStars?: number;
  className?: string;
}

interface StarState {
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
  rect: SVGRectElement;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3:
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  maxStars = 5,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const starsRef = useRef<StarState[]>([]);
  const rafRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gradientId = useId();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const spawnStar = () => {
      if (starsRef.current.length >= maxStars) return;

      const { x, y, angle } = getRandomStartPoint();
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", String(starWidth));
      rect.setAttribute("height", String(starHeight));
      rect.setAttribute("fill", `url(#${gradientId})`);
      svg.appendChild(rect);

      starsRef.current.push({
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
        rect,
      });
    };

    const scheduleSpawn = () => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      spawnTimerRef.current = setTimeout(() => {
        spawnStar();
        scheduleSpawn();
      }, delay);
    };

    const animate = () => {
      const toRemove: number[] = [];

      for (let i = 0; i < starsRef.current.length; i++) {
        const star = starsRef.current[i];
        const rad = (star.angle * Math.PI) / 180;
        star.x += star.speed * Math.cos(rad);
        star.y += star.speed * Math.sin(rad);
        star.distance += star.speed;
        star.scale = 1 + star.distance / 100;

        if (
          star.x < -20 ||
          star.x > window.innerWidth + 20 ||
          star.y < -20 ||
          star.y > window.innerHeight + 20
        ) {
          toRemove.push(i);
        } else {
          const w = starWidth * star.scale;
          star.rect.setAttribute("x", String(star.x));
          star.rect.setAttribute("y", String(star.y));
          star.rect.setAttribute("width", String(w));
          star.rect.setAttribute(
            "transform",
            `rotate(${star.angle}, ${star.x + w / 2}, ${star.y + starHeight / 2})`
          );
        }
      }

      // Remove off-screen stars (iterate in reverse to preserve indices)
      for (let i = toRemove.length - 1; i >= 0; i--) {
        const idx = toRemove[i];
        const star = starsRef.current[idx];
        star.rect.remove();
        starsRef.current.splice(idx, 1);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    spawnStar();
    scheduleSpawn();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      // Clean up all rect elements
      for (const star of starsRef.current) {
        star.rect.remove();
      }
      starsRef.current = [];
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay, starWidth, starHeight, maxStars, gradientId]);

  return (
    <svg ref={svgRef} className={cn("w-full h-full absolute inset-0", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop
            offset="100%"
            style={{ stopColor: starColor, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

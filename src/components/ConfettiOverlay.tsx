import React, { useEffect, useRef } from 'react';

export default function ConfettiOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#10B981', // emerald
      '#06B6D4', // cyan
      '#14B8A6', // teal
      '#EF4444', // red
      '#F59E0B', // amber
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#EC4899', // pink
    ];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    // Create a beautiful upward-zooming confetti burst from the bottom center or middle
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
      // Slight randomness to start position, centered
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 5;
      particles.push({
        x: width / 2,
        y: height / 2 - 50,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 6, // additional upward bias
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() * 2 - 1) * 8,
        opacity: 1.0,
      });
    }

    const gravity = 0.3;
    const friction = 0.97;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let anyAlive = false;
      for (const p of particles) {
        p.speedY += gravity;
        p.speedX *= friction;
        p.speedY *= friction;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        
        // Slowly fade out as they fall below bottom half
        if (p.speedY > 2) {
          p.opacity -= 0.008;
        }

        if (p.opacity > 0 && p.y < height + 20) {
          anyAlive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          // Render paper-like confetti rectangle
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1.0;

      if (anyAlive) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}

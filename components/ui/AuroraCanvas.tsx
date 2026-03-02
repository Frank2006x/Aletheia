"use client";

import { useEffect, useRef } from "react";

export function AuroraCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        let w = 0, h = 0;

        type Orb = {
            x: number; y: number;
            rx: number; ry: number;
            vx: number; vy: number;
            hue: number; alpha: number;
            speed: number; phase: number;
        };

        type Particle = {
            x: number; y: number;
            vx: number; vy: number;
            life: number; maxLife: number;
            size: number;
        };

        let orbs: Orb[] = [];
        let particles: Particle[] = [];

        const resize = () => {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w;
            canvas.height = h;
        };

        const initOrbs = () => {
            const hues = [158, 220, 280, 158, 195];
            orbs = hues.map((hue, i) => ({
                x: (w / (hues.length + 1)) * (i + 1),
                y: h * 0.3 + Math.random() * h * 0.4,
                rx: 180 + Math.random() * 180,
                ry: 120 + Math.random() * 120,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.15,
                hue,
                alpha: 0.055 + Math.random() * 0.055,
                speed: 0.0004 + Math.random() * 0.0004,
                phase: Math.random() * Math.PI * 2,
            }));
        };

        const spawnParticle = () => {
            particles.push({
                x: Math.random() * w,
                y: h + 10,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -(0.4 + Math.random() * 0.8),
                life: 0,
                maxLife: 180 + Math.random() * 120,
                size: 0.8 + Math.random() * 1.6,
            });
        };

        resize();
        initOrbs();
        const particleInterval = setInterval(() => { if (particles.length < 60) spawnParticle(); }, 120);

        let time = 0;

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            time += 0.008;

            orbs.forEach((orb) => {
                orb.x += orb.vx + Math.sin(time * 0.7 + orb.phase) * 0.3;
                orb.y += orb.vy + Math.cos(time * 0.5 + orb.phase) * 0.2;
                if (orb.x < -orb.rx) orb.x = w + orb.rx;
                if (orb.x > w + orb.rx) orb.x = -orb.rx;
                if (orb.y < -orb.ry) orb.vy *= -1;
                if (orb.y > h + orb.ry) orb.vy *= -1;

                ctx.save();
                ctx.translate(orb.x, orb.y);
                ctx.scale(1, orb.ry / orb.rx);
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, orb.rx);
                grad.addColorStop(0, `hsla(${orb.hue}, 85%, 60%, ${orb.alpha})`);
                grad.addColorStop(0.5, `hsla(${orb.hue}, 75%, 50%, ${orb.alpha * 0.5})`);
                grad.addColorStop(1, `hsla(${orb.hue}, 70%, 40%, 0)`);
                ctx.beginPath();
                ctx.arc(0, 0, orb.rx, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });

            particles = particles.filter((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life++;
                if (p.life >= p.maxLife) return false;
                const t = p.life / p.maxLife;
                const alpha = t < 0.2 ? t / 0.2 : t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.55})`;
                ctx.fill();
                if (p.size > 1.8) {
                    ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x - 3, p.y); ctx.lineTo(p.x + 3, p.y);
                    ctx.moveTo(p.x, p.y - 3); ctx.lineTo(p.x, p.y + 3);
                    ctx.stroke();
                }
                return true;
            });

            const scanY = ((time * 60) % (h + 40)) - 20;
            const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
            scanGrad.addColorStop(0, "rgba(52,211,153,0)");
            scanGrad.addColorStop(0.5, "rgba(52,211,153,0.025)");
            scanGrad.addColorStop(1, "rgba(52,211,153,0)");
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 30, w, 60);

            raf = requestAnimationFrame(draw);
        };

        draw();

        const ro = new ResizeObserver(() => { resize(); initOrbs(); });
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(raf);
            clearInterval(particleInterval);
            ro.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        />
    );
}

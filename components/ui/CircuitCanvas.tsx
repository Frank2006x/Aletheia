"use client";

import { useEffect, useRef } from "react";

export function CircuitCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        let w = 0, h = 0;
        const P = { r: 52, g: 211, b: 153 };

        type Trace = {
            x: number; y: number;
            dir: number;
            len: number; travelled: number;
            speed: number; alpha: number;
        };

        const GRID = 40;
        let traces: Trace[] = [];

        const resize = () => {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w;
            canvas.height = h;
        };

        const dx = [1, 0, -1, 0];
        const dy = [0, 1, 0, -1];

        const spawnTrace = () => {
            traces.push({
                x: Math.floor(Math.random() * (w / GRID)) * GRID,
                y: Math.floor(Math.random() * (h / GRID)) * GRID,
                dir: Math.floor(Math.random() * 4),
                len: GRID * (2 + Math.floor(Math.random() * 5)),
                travelled: 0,
                speed: 0.8 + Math.random() * 1.2,
                alpha: 0.12 + Math.random() * 0.18,
            });
        };

        let trailCanvas: HTMLCanvasElement | null = null;
        let trailCtx: CanvasRenderingContext2D | null = null;

        const initTrail = () => {
            trailCanvas = document.createElement("canvas");
            trailCanvas.width = w;
            trailCanvas.height = h;
            trailCtx = trailCanvas.getContext("2d");
        };

        resize();
        initTrail();
        for (let i = 0; i < 18; i++) spawnTrace();
        const spawnInterval = setInterval(() => { if (traces.length < 35) spawnTrace(); }, 300);

        const draw = () => {
            if (trailCtx && trailCanvas) {
                trailCtx.fillStyle = "rgba(5,5,5,0.04)";
                trailCtx.fillRect(0, 0, w, h);

                traces.forEach((t) => {
                    if (!trailCtx) return;
                    trailCtx.beginPath();
                    trailCtx.moveTo(t.x, t.y);
                    trailCtx.lineTo(t.x + dx[t.dir] * t.speed, t.y + dy[t.dir] * t.speed);
                    trailCtx.strokeStyle = `rgba(${P.r},${P.g},${P.b},${t.alpha})`;
                    trailCtx.lineWidth = 1.2;
                    trailCtx.stroke();

                    if (t.travelled % GRID < t.speed * 2) {
                        trailCtx.beginPath();
                        trailCtx.arc(t.x, t.y, 2.5, 0, Math.PI * 2);
                        trailCtx.fillStyle = `rgba(${P.r},${P.g},${P.b},${t.alpha * 2.5})`;
                        trailCtx.fill();
                    }
                });

                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(trailCanvas, 0, 0);
            }

            traces = traces.filter((t) => {
                t.x += dx[t.dir] * t.speed;
                t.y += dy[t.dir] * t.speed;
                t.travelled += t.speed;
                if (t.travelled >= t.len || t.x < 0 || t.x > w || t.y < 0 || t.y > h) return false;
                if (t.travelled % GRID < t.speed && Math.random() < 0.35) {
                    const turns = [0, 1, 2, 3].filter(d => Math.abs(d - t.dir) !== 2);
                    t.dir = turns[Math.floor(Math.random() * turns.length)];
                }
                return true;
            });

            const now = Date.now() / 1000;
            for (let col = 0; col <= w / GRID; col++) {
                for (let row = 0; row <= h / GRID; row++) {
                    const pulse = 0.5 + 0.5 * Math.sin(now * 1.2 + col * 0.5 + row * 0.7);
                    if (pulse > 0.85) {
                        ctx.beginPath();
                        ctx.arc(col * GRID, row * GRID, 1.2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${P.r},${P.g},${P.b},${pulse * 0.25})`;
                        ctx.fill();
                    }
                }
            }

            raf = requestAnimationFrame(draw);
        };

        draw();

        const ro = new ResizeObserver(() => { resize(); initTrail(); });
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(raf);
            clearInterval(spawnInterval);
            ro.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
            aria-hidden="true"
        />
    );
}

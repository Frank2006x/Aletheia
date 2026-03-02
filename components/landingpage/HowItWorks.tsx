"use client";

import { useEffect, useRef } from "react";
import { Link, UploadCloud, Cpu, Users, MessageCircle, Link2 } from "lucide-react";
import type { JSX } from "react";

const steps: { icon: JSX.Element; title: string; description: string }[] = [
    {
        icon: <Link className="w-5 h-5 text-white" />,
        title: "Link Generation",
        description: "The primary stakeholder (investor/buyer) generates a unique, one-time secure link for the supplier to submit their ESG documentation.",
    },
    {
        icon: <UploadCloud className="w-5 h-5 text-white" />,
        title: "Locked Upload",
        description: "The supplier receives the link and uploads their PDF. Once submitted, the document is permanently locked and cryptographically time-stamped.",
    },
    {
        icon: <Cpu className="w-5 h-5 text-white" />,
        title: "AI Extraction",
        description: "Aletheia's AI engine reads the unstructured PDF and extracts key ESG metrics without requiring any technical integration from the supplier.",
    },
    {
        icon: <Users className="w-5 h-5 text-white" />,
        title: "Shared Dashboard",
        description: "Extracted insights become instantly visible to both the investor and supplier, ensuring absolute data symmetry and transparency.",
    },
    {
        icon: <MessageCircle className="w-5 h-5 text-white" />,
        title: "Ask AI",
        description: "Both parties can interact with the conversational AI to query the data, compare benchmarks, and understand trends in plain language.",
    },
    {
        icon: <Link2 className="w-5 h-5 text-white" />,
        title: "Blockchain Anchoring",
        description: "Every upload, data point, and AI query is immutably anchored to the blockchain — creating a flawless, tamper-proof audit trail.",
    },
];

// ────────────────────────────────────────────────────────────────────────
//  Blockchain canvas background
// ────────────────────────────────────────────────────────────────────────
function BlockchainCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        let w = 0;
        let h = 0;

        // Primary green from theme: rgba(52,211,153)
        const PRIMARY = { r: 52, g: 211, b: 153 };

        // ── Node ──
        type Node = {
            x: number; y: number;
            vx: number; vy: number;
            radius: number;
            pulseOffset: number;
        };

        type Packet = {
            fromIdx: number; toIdx: number;
            t: number; speed: number;
        };

        let nodes: Node[] = [];
        let packets: Packet[] = [];
        const MAX_DIST = 220;
        const NODE_COUNT = 28;

        const resize = () => {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w;
            canvas.height = h;
        };

        const initNodes = () => {
            nodes = Array.from({ length: NODE_COUNT }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                radius: 2.5 + Math.random() * 2,
                pulseOffset: Math.random() * Math.PI * 2,
            }));
        };

        const spawnPacket = () => {
            // Pick a random edge that exists
            for (let attempt = 0; attempt < 10; attempt++) {
                const a = Math.floor(Math.random() * nodes.length);
                const b = Math.floor(Math.random() * nodes.length);
                if (a === b) continue;
                const dx = nodes[a].x - nodes[b].x;
                const dy = nodes[a].y - nodes[b].y;
                if (Math.hypot(dx, dy) < MAX_DIST) {
                    packets.push({ fromIdx: a, toIdx: b, t: 0, speed: 0.008 + Math.random() * 0.012 });
                    break;
                }
            }
        };

        resize();
        initNodes();

        // Spawn packets periodically
        const packetInterval = setInterval(spawnPacket, 600);

        let time = 0;

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            time += 0.012;

            // ── Update nodes ──
            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;
            });

            // ── Draw edges ──
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < MAX_DIST) {
                        const alpha = (1 - dist / MAX_DIST) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // ── Draw nodes ──
            nodes.forEach((n) => {
                const pulse = 0.5 + 0.5 * Math.sin(time * 1.5 + n.pulseOffset);
                const glow = n.radius * 5 * pulse;

                // Glow halo
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glow);
                grad.addColorStop(0, `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},${0.18 * pulse})`);
                grad.addColorStop(1, `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},0)`);
                ctx.beginPath();
                ctx.arc(n.x, n.y, glow, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},${0.55 + 0.35 * pulse})`;
                ctx.fill();
            });

            // ── Draw packets ──
            packets = packets.filter((p) => {
                p.t += p.speed;
                if (p.t >= 1) return false;

                const a = nodes[p.fromIdx];
                const b = nodes[p.toIdx];
                const x = a.x + (b.x - a.x) * p.t;
                const y = a.y + (b.y - a.y) * p.t;

                // Packet glow trail
                const tr = ctx.createRadialGradient(x, y, 0, x, y, 16);
                tr.addColorStop(0, `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},0.9)`);
                tr.addColorStop(0.3, `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},0.4)`);
                tr.addColorStop(1, "rgba(52,211,153,0)");
                ctx.beginPath();
                ctx.arc(x, y, 16, 0, Math.PI * 2);
                ctx.fillStyle = tr;
                ctx.fill();

                // Packet core dot
                ctx.beginPath();
                ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,255,255,0.95)";
                ctx.fill();

                return true;
            });

            // ── Hexagonal "block" outlines at random node positions ──
            // Draw faint hex decorations on large nodes
            nodes.forEach((n, i) => {
                if (i % 7 !== 0) return;
                const s = 14 + 4 * Math.sin(time + i);
                ctx.beginPath();
                for (let k = 0; k < 6; k++) {
                    const angle = (Math.PI / 3) * k - Math.PI / 6;
                    const px = n.x + s * Math.cos(angle);
                    const py = n.y + s * Math.sin(angle);
                    k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(${PRIMARY.r},${PRIMARY.g},${PRIMARY.b},0.12)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            raf = requestAnimationFrame(draw);
        };

        draw();

        const ro = new ResizeObserver(() => {
            resize();
            initNodes();
        });
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(raf);
            clearInterval(packetInterval);
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

// ────────────────────────────────────────────────────────────────────────
//  Main section
// ────────────────────────────────────────────────────────────────────────
export default function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        let ctx: { revert: () => void } | null = null;

        const initGsap = async () => {
            const { default: gsap } = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                // Vertical line draw
                if (lineRef.current) {
                    gsap.fromTo(
                        lineRef.current,
                        { scaleY: 0, transformOrigin: "top center" },
                        {
                            scaleY: 1,
                            ease: "none",
                            scrollTrigger: {
                                trigger: sectionRef.current,
                                start: "top 60%",
                                end: "bottom 80%",
                                scrub: 1,
                            },
                        }
                    );
                }

                // Step cards
                stepRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const isLeft = i % 2 === 0;
                    gsap.fromTo(
                        el,
                        { opacity: 0, x: isLeft ? -70 : 70, y: 20 },
                        {
                            opacity: 1, x: 0, y: 0,
                            duration: 0.9,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: el,
                                start: "top 83%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });

                // Node icons
                nodeRefs.current.forEach((el) => {
                    if (!el) return;
                    gsap.fromTo(
                        el,
                        { scale: 0.4, opacity: 0 },
                        {
                            scale: 1, opacity: 1,
                            duration: 0.55,
                            ease: "back.out(2.5)",
                            scrollTrigger: {
                                trigger: el,
                                start: "top 83%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
            }, sectionRef);
        };

        initGsap();
        return () => ctx?.revert();
    }, []);

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="relative w-full py-28 lg:py-40 bg-black overflow-hidden"
        >
            {/* ── Blockchain canvas background ── */}
            <BlockchainCanvas />

            {/* Vignette overlay so canvas doesn't fight text */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)"
                }}
            />

            <div className="container px-4 md:px-6 mx-auto relative z-10 max-w-5xl">
                {/* Header */}
                <div className="mb-20 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-sm px-4 py-1 text-xs text-primary mb-6 uppercase tracking-widest font-medium">
                        Workflow
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                        The Timeline of{" "}
                        <span className="text-primary">Trust</span>.
                    </h2>
                    <p className="max-w-[600px] text-lg text-white/40">
                        A frictionless workflow designed to guarantee the integrity of
                        supply chain data from submission to verification.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Vertical connecting line */}
                    <div
                        ref={lineRef}
                        className="absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 z-0 hidden sm:block"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(52,211,153,0.7), rgba(52,211,153,0.1))",
                        }}
                    />

                    <div className="flex flex-col gap-14 sm:gap-20">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`relative z-10 flex flex-col sm:flex-row items-center ${index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                                    } gap-6 sm:gap-10 group`}
                            >
                                {/* Card */}
                                <div
                                    ref={(el) => { stepRefs.current[index] = el; }}
                                    className={`flex-1 sm:w-1/2 ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"
                                        }`}
                                >
                                    <div
                                        className={`inline-flex flex-col bg-black/60 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 w-full transition-all duration-500 group-hover:bg-black/80 group-hover:border-primary/25 ${index % 2 === 0 ? "sm:items-end" : "sm:items-start"
                                            }`}
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">
                                            Step {index + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {step.title}
                                        </h3>
                                        <p className={`text-white/45 leading-relaxed text-sm ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"
                                            }`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Center node */}
                                <div className="static sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex justify-center shrink-0">
                                    <div
                                        ref={(el) => { nodeRefs.current[index] = el; }}
                                        className="w-12 h-12 rounded-full bg-black border border-white/15 flex items-center justify-center relative z-20 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/70"
                                        style={{ boxShadow: "0 0 0 6px rgba(0,0,0,0.8), 0 0 20px rgba(52,211,153,0.15)" }}
                                    >
                                        {step.icon}
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="flex-1 sm:w-1/2 hidden sm:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

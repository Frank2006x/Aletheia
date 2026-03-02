"use client";

import {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValueEvent,
    useReducedMotion,
    MotionValue,
} from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const FRAME_PREFIX = "/sequence/ezgif-frame-";
const FRAME_EXT = ".jpg";
const TOTAL_FRAMES = 120;
const LERP_FACTOR = 0.12;

// ─── Text Timeline ──────────────────────────────────────────────────────────
interface TextSlide {
    id: string;
    lines: string[];
    position: "center" | "left" | "right";
    rangeStart: number;
    rangeEnd: number;
    isCTA?: boolean;
}

const TEXT_SLIDES: TextSlide[] = [
    {
        id: "intro",
        lines: [
            "Truth that cannot be hidden",
            "Responsibility",
            "Intelligence that cannot be compromised",
        ],
        position: "center",
        rangeStart: 0,
        rangeEnd: 0.25,
    },
    {
        id: "verify",
        lines: ["Verifiable by design."],
        position: "left",
        rangeStart: 0.25,
        rangeEnd: 0.55,
    },
    {
        id: "transparent",
        lines: ["Transparent.", "Auditable.", "Immutable."],
        position: "right",
        rangeStart: 0.55,
        rangeEnd: 0.85,
    },
    {
        id: "cta",
        lines: ["Build on truth."],
        position: "center",
        rangeStart: 0.85,
        rangeEnd: 1,
        isCTA: true,
    },
];

// ─── Easing ──────────────────────────────────────────────────────────────────
const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function padFrame(n: number): string {
    return String(n).padStart(3, "0");
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// ─── Loading Screen ──────────────────────────────────────────────────────────
function LoadingScreen({ progress }: { progress: number }) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]">
            <div className="relative mb-8">
                {/* Pulsing glow */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
                <svg
                    className="relative w-16 h-16 animate-spin-slow"
                    viewBox="0 0 64 64"
                    fill="none"
                >
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="2"
                    />
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="url(#loader-grad)"
                        strokeWidth="2"
                        strokeDasharray="176"
                        strokeDashoffset={176 - 176 * (progress / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                    <defs>
                        <linearGradient id="loader-grad" x1="0" y1="0" x2="64" y2="64">
                            <stop stopColor="#34d399" />
                            <stop offset="1" stopColor="#6366f1" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <p className="text-white/50 text-sm tracking-widest uppercase font-medium">
                Loading experience
            </p>
            <p className="text-white/30 text-xs mt-2 tabular-nums">
                {Math.round(progress)}%
            </p>
        </div>
    );
}

// ─── Text Overlay Component ─────────────────────────────────────────────────
function TextOverlay({
    slide,
    scrollProgress,
}: {
    slide: TextSlide;
    scrollProgress: MotionValue<number>;
}) {
    const midpoint = (slide.rangeStart + slide.rangeEnd) / 2;
    const fadeInEnd = slide.rangeStart + (midpoint - slide.rangeStart) * 0.6;
    const fadeOutStart = midpoint + (slide.rangeEnd - midpoint) * 0.4;

    const opacity = useTransform(
        scrollProgress,
        [slide.rangeStart, fadeInEnd, fadeOutStart, slide.rangeEnd],
        [0, 1, 1, 0]
    );

    const blur = useTransform(
        scrollProgress,
        [slide.rangeStart, fadeInEnd, fadeOutStart, slide.rangeEnd],
        [8, 0, 0, 8]
    );

    const y = useTransform(
        scrollProgress,
        [slide.rangeStart, fadeInEnd, fadeOutStart, slide.rangeEnd],
        [40, 0, 0, -40]
    );

    const filterBlur = useTransform(blur, (v) => `blur(${v}px)`);

    const positionClasses = {
        center: "items-center justify-center text-center",
        left: "items-start justify-center text-left pl-8 md:pl-16 lg:pl-24",
        right: "items-end justify-center text-right pr-8 md:pr-16 lg:pr-24",
    };

    return (
        <motion.div
            className={`absolute inset-0 z-20 flex flex-col ${positionClasses[slide.position]} pointer-events-none px-6`}
            style={{ opacity, y, filter: filterBlur }}
        >
            <div className="max-w-2xl">
                {slide.lines.map((line, i) => (
                    <motion.p
                        key={i}
                        className={
                            slide.isCTA
                                ? "text-3xl md:text-5xl lg:text-6xl font-bold text-white/90 tracking-tight leading-tight"
                                : slide.position === "center" && slide.id === "intro"
                                    ? "text-2xl md:text-4xl lg:text-5xl font-semibold text-white/90 tracking-tight leading-snug mb-2"
                                    : "text-2xl md:text-4xl lg:text-5xl font-semibold text-white/90 tracking-tight leading-tight"
                        }
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: i * 0.1,
                            duration: 0.6,
                            ease: EASE_CINEMATIC,
                        }}
                    >
                        {line}
                    </motion.p>
                ))}
                {slide.isCTA && (
                    <motion.div className="mt-8 pointer-events-auto" style={{ opacity }}>
                        <button className="hero-cta-button group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/[0.08] hover:bg-white/15 hover:border-white/20 transition-all duration-500 ease-out">
                            <span className="relative z-10">Get Started</span>
                            <svg
                                className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                            {/* Glow */}
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main HeroScroll Component ───────────────────────────────────────────────
export default function HeroScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef(0);
    const animatedFrameRef = useRef(0);
    const rafIdRef = useRef<number>(0);

    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const prefersReducedMotion = useReducedMotion();

    // useScroll bound to container — works because container is always rendered
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // ─── Frame URLs ──────────────────────────────────────────────────────────
    const frameUrls = useMemo(() => {
        return Array.from({ length: TOTAL_FRAMES }, (_, i) =>
            `${FRAME_PREFIX}${padFrame(i + 1)}${FRAME_EXT}`
        );
    }, []);

    // ─── Draw frame on canvas ────────────────────────────────────────────────
    const drawFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const img = imagesRef.current[frameIndex];

        if (!ctx || !img || !img.complete || !img.naturalWidth) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Only resize if needed
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
        }

        // Reset transform and clear
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Cover-fit on desktop, contain-fit on mobile
        const isMobile = rect.width < 768;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = rect.width / rect.height;

        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (isMobile) {
            // Contain
            if (canvasAspect > imgAspect) {
                drawH = rect.height;
                drawW = drawH * imgAspect;
            } else {
                drawW = rect.width;
                drawH = drawW / imgAspect;
            }
        } else {
            // Cover
            if (canvasAspect > imgAspect) {
                drawW = rect.width;
                drawH = drawW / imgAspect;
            } else {
                drawH = rect.height;
                drawW = drawH * imgAspect;
            }
        }

        drawX = (rect.width - drawW) / 2;
        drawY = (rect.height - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }, []);

    // ─── Lerp animation loop ────────────────────────────────────────────────
    const animate = useCallback(() => {
        const target = currentFrameRef.current;
        const current = animatedFrameRef.current;

        const next = lerp(current, target, LERP_FACTOR);
        animatedFrameRef.current = next;

        const frameIndex = Math.round(next);
        const clampedFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));

        drawFrame(clampedFrame);
        rafIdRef.current = requestAnimationFrame(animate);
    }, [drawFrame]);

    // ─── Track scroll → frame mapping ───────────────────────────────────────
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        if (prefersReducedMotion) return;
        currentFrameRef.current = v * (TOTAL_FRAMES - 1);
    });

    // ─── Preload all frames ─────────────────────────────────────────────────
    useEffect(() => {
        let loadedCount = 0;
        const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

        const loadImage = (src: string, index: number): Promise<void> =>
            new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    images[index] = img;
                    loadedCount++;
                    setLoadProgress((loadedCount / TOTAL_FRAMES) * 100);
                    resolve();
                };
                img.onerror = () => {
                    // Still store the img for graceful fallback
                    images[index] = img;
                    loadedCount++;
                    setLoadProgress((loadedCount / TOTAL_FRAMES) * 100);
                    resolve();
                };
            });

        // Load in parallel batches
        async function preloadAll() {
            const batchSize = 15;
            for (let i = 0; i < frameUrls.length; i += batchSize) {
                const batch = frameUrls
                    .slice(i, i + batchSize)
                    .map((url, j) => loadImage(url, i + j));
                await Promise.all(batch);
            }
            imagesRef.current = images;
            setIsLoaded(true);
        }

        preloadAll();
    }, [frameUrls]);

    // ─── Start animation loop after loaded ──────────────────────────────────
    useEffect(() => {
        if (!isLoaded) return;

        // Draw first frame immediately
        if (prefersReducedMotion) {
            drawFrame(0);
            return;
        }

        drawFrame(0);
        rafIdRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [isLoaded, animate, drawFrame, prefersReducedMotion]);

    // ─── Handle resize ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoaded) return;

        const handleResize = () => {
            const frameIndex = Math.round(animatedFrameRef.current);
            drawFrame(Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex)));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isLoaded, drawFrame]);

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            {/* Loading overlay */}
            {!isLoaded && <LoadingScreen progress={loadProgress} />}

            <section
                ref={containerRef}
                className="relative h-[400vh] bg-[#050505]"
                id="hero"
            >
                {/* Sticky viewport */}
                <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                    {/* Subtle glow behind canvas */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[60%] h-[60%] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
                    </div>

                    {/* Canvas */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ imageRendering: "auto" }}
                    />

                    {/* Text overlays — only show after loaded */}
                    {isLoaded &&
                        TEXT_SLIDES.map((slide) => (
                            <TextOverlay
                                key={slide.id}
                                slide={slide}
                                scrollProgress={scrollYProgress}
                            />
                        ))}

                    {/* Noise overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none z-30 opacity-[0.035]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "repeat",
                        }}
                    />
                </div>
            </section>
        </>
    );
}

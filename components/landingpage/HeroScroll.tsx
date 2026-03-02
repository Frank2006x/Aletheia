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
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────
const FRAME_PREFIX = "/sequence/ezgif-frame-";
const FRAME_EXT = ".jpg";
const TOTAL_FRAMES = 115;
const START_FRAME = 6;
const LERP_FACTOR = 0.12;

// ─── Text Timeline ──────────────────────────────────────────────────────────
interface TextSlide {
    id: string;
    lines: React.ReactNode[];
    position: "center" | "left" | "right";
    rangeStart: number;
    rangeEnd: number;
    isCTA?: boolean;
}

const TEXT_SLIDES: TextSlide[] = [
    {
        id: "verify",
        lines: [
            <span key="3"><span className="text-primary">Verifiable</span> by design.</span>
        ],
        position: "left",
        rangeStart: 0.15,
        rangeEnd: 0.50,
    },
    {
        id: "transparent",
        lines: [
            "Transparent.",
            "Auditable.",
            <span key="4" className="text-primary">Immutable.</span>
        ],
        position: "right",
        rangeStart: 0.50,
        rangeEnd: 0.83,
    },
    {
        id: "cta",
        lines: [
            <span key="cta-title" className="relative group inline-block mb-8">
                <span className="relative z-10 text-7xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 drop-shadow-2xl">
                    Aletheia
                </span>
            </span>,
        ],
        position: "center",
        rangeStart: 0.70,
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
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
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
                            <stop stopColor="var(--color-primary)" />
                            <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.5" />
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
        [0, 1, 1, slide.isCTA ? 1 : 0]
    );

    const blur = useTransform(
        scrollProgress,
        [slide.rangeStart, fadeInEnd, fadeOutStart, slide.rangeEnd],
        [8, 0, 0, slide.isCTA ? 0 : 8]
    );

    const y = useTransform(
        scrollProgress,
        [slide.rangeStart, fadeInEnd, fadeOutStart, slide.rangeEnd],
        [40, 0, 0, slide.isCTA ? 0 : -40]
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
            style={{ opacity, filter: filterBlur }}
        >
            {/* Background Gradient Overlay to improve text readability */}
            <div
                className="absolute inset-0 z-0 opacity-70"
                style={{
                    background: slide.position === 'center'
                        ? 'radial-gradient(circle at center, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0) 60%)'
                        : slide.position === 'left'
                            ? 'linear-gradient(to right, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0) 70%)'
                            : 'linear-gradient(to left, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0) 70%)'
                }}
            />

            <motion.div className="max-w-3xl relative z-10" style={{ y }}>
                {slide.lines.map((line, i) => (
                    <motion.div
                        key={i}
                        className={
                            slide.isCTA
                                ? "text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight"
                                : slide.id === "title"
                                    ? "mb-4"
                                    : slide.position === "center" && slide.id === "intro"
                                        ? "text-3xl md:text-5xl lg:text-6xl font-semibold text-white/95 tracking-tight leading-snug mb-3 drop-shadow-lg"
                                        : "text-3xl md:text-5xl lg:text-6xl font-semibold text-white/95 tracking-tight leading-tight drop-shadow-lg"
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
                    </motion.div>
                ))}
                {slide.isCTA && (
                    <motion.div className="mt-8 pointer-events-auto" style={{ opacity }}>
                        <Link href="/sign-in" className="hero-cta-button group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/[0.08] hover:bg-white/15 hover:border-white/20 transition-all duration-500 ease-out">
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
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Link>
                    </motion.div>
                )}
            </motion.div>
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
            `${FRAME_PREFIX}${padFrame(i + START_FRAME)}${FRAME_EXT}`
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

        // Core dimensions
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgAspect = imgW / imgH;
        const canvasAspect = rect.width / rect.height;

        let drawW = rect.width;
        let drawH = rect.height;
        let offsetX = 0;
        let offsetY = 0;

        const isMobile = rect.width < 768;

        if (isMobile) {
            // CONTAIN logic for mobile (shows full frame)
            if (canvasAspect > imgAspect) {
                // Canvas is wider than image aspect -> align height, center width
                drawH = rect.height;
                drawW = drawH * imgAspect;
                offsetX = (rect.width - drawW) / 2;
            } else {
                // Canvas is taller than image aspect -> align width, center height
                drawW = rect.width;
                drawH = drawW / imgAspect;
                offsetY = (rect.height - drawH) / 2;
            }
        } else {
            // COVER logic for desktop (fills screen, crops edges if needed, perfectly centered)
            if (canvasAspect > imgAspect) {
                // Canvas is wider than image -> width matches, height crops (overflows top/bottom)
                drawW = rect.width;
                drawH = drawW / imgAspect;
                offsetY = (rect.height - drawH) / 2;
            } else {
                // Canvas is taller than image -> height matches, width crops (overflows left/right)
                drawH = rect.height;
                drawW = drawH * imgAspect;
                offsetX = (rect.width - drawW) / 2;
            }
        }

        // Apply Math.round to avoid sub-pixel blurring and ensure crisp lines
        ctx.drawImage(img, Math.round(offsetX), Math.round(offsetY), Math.round(drawW), Math.round(drawH));
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

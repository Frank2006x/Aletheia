"use client";

import { useEffect, useRef } from "react";
import { AuroraCanvas } from "@/components/ui/AuroraCanvas";

export default function ValueCreated() {
    const sectionRef = useRef<HTMLElement>(null);
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const headingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx: { revert: () => void } | null = null;
        const init = async () => {
            const { default: gsap } = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                if (headingRef.current) {
                    gsap.fromTo(headingRef.current,
                        { opacity: 0, y: 60 },
                        {
                            opacity: 1, y: 0, duration: 1, ease: "power3.out",
                            scrollTrigger: {
                                trigger: headingRef.current,
                                start: "top 85%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }
                cardRefs.current.forEach((el, i) => {
                    if (!el) return;
                    gsap.fromTo(el,
                        { opacity: 0, y: 80, scale: 0.95 },
                        {
                            opacity: 1, y: 0, scale: 1,
                            duration: 0.85, ease: "power3.out",
                            delay: i * 0.15,
                            scrollTrigger: {
                                trigger: el,
                                start: "top 90%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
            }, sectionRef);
        };
        init();
        return () => ctx?.revert();
    }, []);

    return (
        <section
            id="value-created"
            ref={sectionRef}
            className="relative w-full min-h-screen overflow-hidden flex flex-col justify-end bg-black"
        >
            <video
                src="/ball.mp4"
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <AuroraCanvas />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />

            <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-24 pb-12 sm:pb-16 md:pb-24 pt-24 sm:pt-32 flex flex-col xl:flex-row gap-8 sm:gap-12 xl:gap-24 xl:items-end max-w-[1400px] mx-auto">
                <div ref={headingRef} className="flex-shrink-0">
                    <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight leading-[1.1]">
                        Value Created<br />for Everyone
                    </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
                    <div
                        ref={(el) => { cardRefs.current[0] = el; }}
                        className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 hover:bg-white/[0.06] transition-all duration-500"
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-6 border border-emerald-500/20">
                            For Suppliers
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Effortless Compliance</h3>
                        <p className="text-white/60 leading-relaxed text-[15px]">
                            No technical integration or manual data entry. Upload your existing ESG report or statements once, and our AI does the rest. Gain instant access to the same analytics the investors see, and use conversational AI to understand how your metrics compare to industry benchmarks.
                        </p>
                    </div>

                    <div
                        ref={(el) => { cardRefs.current[1] = el; }}
                        className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 hover:bg-white/[0.06] transition-all duration-500"
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-semibold mb-6 border border-green-500/20">
                            For Investors
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Unshakeable Certainty</h3>
                        <p className="text-white/60 leading-relaxed text-[15px]">
                            Eliminate greenwashing. Every data point is cryptographically anchored to the blockchain, creating a fully transparent and immutable audit trail. Instantly query thousands of supplier submissions with AI to surface risks and track scope emissions with pinpoint accuracy.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
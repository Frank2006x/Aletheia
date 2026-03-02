import { Link, UploadCloud, Cpu, Users, MessageCircle, Link2 } from "lucide-react";

const steps = [
    {
        icon: <Link className="w-6 h-6 text-white" />,
        title: "1. Link Generation",
        description: "The primary stakeholder (investor/buyer) generates a unique, one-time secure link for the supplier to submit their ESG documentation.",
    },
    {
        icon: <UploadCloud className="w-6 h-6 text-white" />,
        title: "2. Locked Upload",
        description: "The supplier receives the link and uploads their PDF (utility bills, reports). Once uploaded, the submission is permanently locked and cryptographically time-stamped.",
    },
    {
        icon: <Cpu className="w-6 h-6 text-white" />,
        title: "3. AI Extraction",
        description: "Aletheia's AI engine automatically reads the unstructured PDF, extracting key metrics without the supplier needing any technical integration.",
    },
    {
        icon: <Users className="w-6 h-6 text-white" />,
        title: "4. Shared Dashboard",
        description: "The extracted insights become instantly visible to both the investor and the supplier, ensuring absolute data symmetry and transparency.",
    },
    {
        icon: <MessageCircle className="w-6 h-6 text-white" />,
        title: "5. Ask AI",
        description: "Both parties can interact with the conversational AI to query the data. e.g., 'Is this supplier improving?' or 'How do I compare to industry benchmarks?'",
    },
    {
        icon: <Link2 className="w-6 h-6 text-white" />,
        title: "6. Blockchain Anchoring",
        description: "Every upload, every extracted data point, and every AI query is immutably anchored to the blockchain, creating a flawless audit trail.",
    },
];

export default function HowItWorks() {
    return (
        <section className="relative w-full py-24 lg:py-32 bg-[#000000] overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10 max-w-5xl">
                <div className="mb-16 md:mb-24 flex flex-col items-center text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                        The Timeline of <span className="text-primary">Trust</span>.
                    </h2>
                    <p className="max-w-[700px] text-lg text-white/50">
                        A frictionless workflow designed to guarantee the integrity of supply chain data from submission to verification.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-primary/50 via-indigo-500/50 to-transparent md:left-1/2 md:-translate-x-1/2 z-0 hidden sm:block" />

                    <div className="flex flex-col gap-12 sm:gap-16">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`relative z-10 flex flex-col sm:flex-row items-start ${index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                                    } gap-6 sm:gap-12 md:gap-24 group`}
                            >
                                {/* Content Side */}
                                <div className={`flex-1 sm:w-1/2 ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                                    <div
                                        className={`inline-flex flex-col bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-3xl p-6 md:p-8 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 w-full ${index % 2 === 0 ? "sm:items-end" : "sm:items-start"
                                            }`}
                                    >
                                        <h3 className="text-2xl font-bold text-white mb-3">
                                            {step.title}
                                        </h3>
                                        <p className={`text-white/50 leading-relaxed ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Center Node / Icon */}
                                <div className="absolute left-8 sm:static sm:left-auto top-6 sm:top-auto -translate-x-1/2 sm:translate-x-0 w-16 flex justify-center shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-black border border-white/20 flex items-center justify-center relative z-20 group-hover:scale-110 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all duration-500">
                                        {step.icon}
                                    </div>
                                </div>

                                {/* Spacer piece to balance grid flex layout */}
                                <div className="flex-1 sm:w-1/2 hidden sm:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

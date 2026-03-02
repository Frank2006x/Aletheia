import { Lock, FileText, Eye, MessageSquare, Database, ShieldAlert } from "lucide-react";

const features = [
    {
        title: "One-Time Locked Upload",
        description: "Data tampering is prevented after submission. Once a supplier uploads a PDF, it is locked with a clear timestamp, ensuring the document cannot be altered later.",
        icon: <Lock className="w-6 h-6 text-primary" />,
        className: "md:col-span-2 lg:col-span-1",
    },
    {
        title: "AI Data Extraction",
        description: "No technical integration needed. AI automatically reads complex ESG reports or utility bills and converts unstructured PDFs into structured, comparable data.",
        icon: <FileText className="w-6 h-6 text-primary" />,
        className: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "Shared Insights Dashboard",
        description: "Both investor and supplier see the exact same truth. Eliminates information asymmetry and builds absolute trust between all involved parties.",
        icon: <Eye className="w-6 h-6 text-primary" />,
        className: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "Conversational AI Querying",
        description: "Make complex data accessible. Investors can query emission trends, and suppliers can benchmark against the industry using native conversational AI.",
        icon: <MessageSquare className="w-6 h-6 text-primary" />,
        className: "md:col-span-1 lg:col-span-1",
    },
    {
        title: "Immutable Blockchain Storage",
        description: "Every single upload, query, and insight is anchored to the chain. Creates a permanent, full audit trail that cannot be refuted.",
        icon: <Database className="w-6 h-6 text-primary" />,
        className: "md:col-span-2 lg:col-span-1",
    },
    {
        title: "Malpractice Detection Engine",
        description: "Automatically flags suspicious patterns, such as inexplicable emission drops or metadata inconsistencies across consecutive report submissions.",
        icon: <ShieldAlert className="w-6 h-6 text-primary" />,
        className: "md:col-span-3 lg:col-span-1",
    },
];

export default function Features() {
    return (
        <section className="relative w-full py-24 lg:py-32 bg-[#050505] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="mb-16 md:mb-24 flex flex-col items-center text-center">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-primary mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Unbreakable Verification
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                        How we <span className="text-primary">enforce truth</span>.
                    </h2>
                    <p className="max-w-[700px] text-lg text-white/50">
                        Aletheia combines the analytical capability of AI with the cryptographic certainty of the blockchain. Here is how we build unshakeable trust.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 md:p-10 hover:bg-white/[0.05] transition-colors duration-500 ${feature.className}`}
                        >
                            <div className="relative z-10">
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                    {feature.icon}
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-white/90">
                                    {feature.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed text-sm md:text-base">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Hover effect gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

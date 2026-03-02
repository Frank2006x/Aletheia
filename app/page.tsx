import Image from "next/image";

export default function Home() {
  return (
    <>
      <section className="relative w-full min-h-screen overflow-hidden bg-background">
        {/* Background Image */}
        <Image
          src="/section1.png"
          alt="Section 1 background"
          fill
          className="object-cover object-bottom"
          priority
        />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-10 py-5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-background"
              style={{
                background:
                  "linear-gradient(to bottom right, var(--chart-2), var(--chart-3))",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="5" cy="17" r="2.5" />
                <circle cx="19" cy="17" r="2.5" />
                <line
                  x1="12"
                  y1="7.5"
                  x2="5"
                  y2="14.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="7.5"
                  x2="19"
                  y2="14.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-foreground font-semibold text-lg">
              Synthio
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <a href="#" className="text-foreground hover:text-foreground/80">
              Home
            </a>
            <a href="#" className="hover:text-foreground">
              Product
            </a>
            <a href="#" className="hover:text-foreground">
              Case studies
            </a>
            <a href="#" className="hover:text-foreground">
              Support
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 bg-background/70 backdrop-blur-sm">
              <span>🌐</span>
              <span>EN</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="text-sm text-muted-foreground font-medium hover:text-foreground px-3 py-1.5">
              Login
            </button>
            <button className="text-sm font-semibold text-background bg-foreground hover:bg-foreground/80 rounded-full px-5 py-2 shadow-md">
              Get started
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-10 pt-14 md:pt-20 max-w-3xl">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            Your <span style={{ color: "var(--chart-3)" }}>next-level</span>{" "}
            {/* Toggle Switch */}
            <span className="inline-flex items-center align-middle mx-2 translate-y-[-4px]">
              <span className="relative inline-block w-14 h-8">
                <span
                  className="block w-14 h-8 rounded-full"
                  style={{
                    background:
                      "linear-gradient(to right, var(--chart-3), var(--chart-2))",
                  }}
                ></span>
                <span className="absolute right-1 top-1 w-6 h-6 bg-background rounded-full shadow"></span>
              </span>
            </span>
            <br />
            <span className="text-foreground/30">productivity</span>{" "}
            <span className="text-foreground">engine.</span>
          </h1>

          <p className="text-muted-foreground text-base mb-10 max-w-md">
            AI-powered workflows built to move faster and work smarter.
          </p>

          <button className="w-fit text-sm font-semibold text-background bg-foreground hover:bg-foreground/80 rounded-full px-8 py-3.5 shadow-lg">
            Boost Productivity
          </button>
        </div>
      </section>
    </>
  );
}

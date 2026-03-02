"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/" });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* ── Left: Form panel ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "oklch(72.786% 0.24093 143.274 / 0.15)",
                  border: "1px solid oklch(72.786% 0.24093 143.274 / 0.35)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 3L25 9.5V18.5L14 25L3 18.5V9.5L14 3Z"
                    stroke="oklch(72.786% 0.24093 143.274)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="2.5"
                    fill="oklch(72.786% 0.24093 143.274)"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Aletheia
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-white/45">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Card */}
          <Card className="border-white/[0.08] bg-white/[0.03] shadow-none">
            <CardHeader className="pb-2">
              <p className="text-xs text-white/35 uppercase tracking-widest">
                Continue with
              </p>
            </CardHeader>

            <CardContent className="pt-2">
              {/* Google button */}
              <Button
                variant="outline"
                className="w-full h-11 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white transition-all gap-3"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      className="opacity-75"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                )}
                {loading ? "Redirecting…" : "Continue with Google"}
              </Button>

              <div className="flex items-center gap-3 my-5">
                <Separator className="flex-1 bg-white/[0.07]" />
                <span className="text-xs text-white/25">
                  secure sign-in
                </span>
                <Separator className="flex-1 bg-white/[0.07]" />
              </div>

              <p className="text-center text-[11px] text-white/25 leading-relaxed">
                By continuing, you agree to our{" "}
                <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors underline underline-offset-2">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors underline underline-offset-2">
                  Privacy Policy
                </span>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Right: Image panel ─────────────────────────────────── */}
      <div className="hidden lg:block relative w-[55%] xl:w-[60%] flex-shrink-0">
        <Image
          src="/background.jpeg"
          alt="Aletheia background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for polish */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Bottom caption */}
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-white/90 text-xl font-semibold leading-snug max-w-xs">
            AI-powered truth,<br />built on the blockchain.
          </p>
          <p className="text-white/50 text-sm mt-2">
            Verifiable · Transparent · Immutable
          </p>
        </div>
      </div>
    </div>
  );
}
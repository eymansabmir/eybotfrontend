import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Moon, Sun, ShieldCheck, Mail, LogIn, ArrowRight, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { EYLogo } from "@/components/branding/ey-logo"

type Stage = "request" | "verify"
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}$/

export function EmailOtpLoginPage() {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [stage, setStage] = useState<Stage>("request")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!normalizedEmail) {
      setError("Email is required")
      return
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Enter a valid email address")
      return
    }

    const domain = normalizedEmail.split('@')[1];
    const isEy = domain === 'in.ey.com' || domain?.endsWith('.in.ey.com');
    const isAirtel = domain === 'airtel.com' || domain?.endsWith('.airtel.com');
    
    if (!isEy && !isAirtel) {
      setError("This email or domain is not authorized. Please contact your administrator.")
      return
    }

    setIsLoading(true)
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      })

      if (sendError) {
        setError(sendError.message || "Could not send OTP")
        return
      }

      setStage("verify")
    } catch {
      setError("Something went wrong while sending OTP")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!normalizedEmail || !otp.trim()) {
      setError("Email and OTP are required")
      return
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Enter a valid email address")
      return
    }

    const otpValue = otp.trim()
    if (!/^\d{6}$/.test(otpValue)) {
      setError("Enter the 6-digit verification code")
      return
    }

    setIsLoading(true)
    try {
      const { error: signInError } = await authClient.signIn.emailOtp({
        email: normalizedEmail,
        otp: otpValue,
      })

      if (signInError) {
        setError(signInError.message || "Invalid or expired OTP")
        return
      }

      await navigate({ to: "/" })
    } catch {
      setError("Something went wrong while verifying OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f8f9fb] px-6 py-12 dark:bg-[#0a0d13]">
      {/* ── Immersive Background ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Animated Mesh Gradients */}
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-primary/20 blur-[120px] dark:bg-primary/10" />
        <div className="absolute top-[30%] -right-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-400/10 blur-[100px] [animation-delay:2s]" />
        <div className="absolute -bottom-[10%] left-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-emerald-500/10 blur-[80px] [animation-delay:4s]" />
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      {/* ── Header Branding ─────────────────────────────────────────────────── */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background shadow-lg ring-1 ring-black/5 backdrop-blur-sm">
          <EYLogo className="h-6 shrink-0 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">WHATSAPP BOT</span>
          <span className="text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase">Identity</span>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-20">
        <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-200 bg-white/50 backdrop-blur-sm transition-all hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-900"
          disabled={!mounted}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>

      {/* ── Main Sign-In Card ────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/50 md:p-10">
          
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Sign in to manage your WhatsApp flows
            </p>
          </div>

          <div className="grid gap-6">
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-200 bg-white text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <LogIn className="mr-2 size-5 text-primary" />
              EY Single Sign-On
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#fcfdfd] px-4 text-slate-400 dark:bg-[#0f141e]">Secure Link</span>
              </div>
            </div>

            <form onSubmit={stage === "request" ? handleSendOtp : handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-primary">
                  Work Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-400 transition-colors group-focus-within:text-primary" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@ey.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.slice(0, 254))}
                        maxLength={254}
                        className="h-12 w-full rounded-xl border-slate-200/60 bg-white/50 pl-11 text-base shadow-sm ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-800 dark:bg-black/20 dark:ring-offset-slate-950"
                        required
                    />
                </div>
              </div>

              {stage === "verify" && (
                <div className="space-y-3 group animate-in fade-in slide-in-from-top-4 duration-500">
                  <Label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-primary">
                    Enter Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="h-14 w-full rounded-xl border-slate-200/60 bg-white/50 text-center text-2xl font-bold tracking-[0.5em] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-800 dark:bg-black/20"
                    required
                  />
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    Sent to {normalizedEmail}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-in shake duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-13 w-full rounded-xl text-base font-bold shadow-xl shadow-primary/20 transition-all hover:translate-y-[-1px] hover:shadow-primary/30 active:translate-y-0"
              >
                {isLoading ? (
                  <Spinner className="mr-2 size-5" />
                ) : (
                  <>
                  {stage === "request" ? "Get Access Code" : "Verify & Sign In"}
                  <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>

              {(stage === "verify" || !!error) && (
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  onClick={() => {
                    setStage("request")
                    setOtp("")
                    setError(null)
                    if (stage === "request") setEmail("") 
                  }}
                >
                  {stage === "verify" ? "Use a different email address" : "Try another email"}
                </button>
              )}
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
          Protected by EY Enterprise Security. <br/>
          By signing in, you agree to our <a href="#" className="font-semibold text-slate-700 dark:text-slate-300">Terms</a> and <a href="#" className="font-semibold text-slate-700 dark:text-slate-300">Privacy</a>.
        </p>
      </div>

      {/* ── Visual Footer Detail ─────────────────────────────────────────────── */}
      <div className="absolute bottom-8 flex items-center gap-8 text-slate-400 opacity-40">
        <div className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Secure</span>
        </div>
        <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Compliant</span>
        </div>
      </div>
    </div>
  )
}

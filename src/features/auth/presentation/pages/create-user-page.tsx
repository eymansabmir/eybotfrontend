import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { ShieldCheck, Mail, User, UserCheck, ArrowRight, ArrowLeft, CheckCircle2, Home } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { EYLogo } from "@/components/branding/ey-logo"
import { ENV } from "@/config/env"
import { authClient } from "@/lib/auth-client"

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}$/

type FormStage = "email" | "details"

export function CreateUserPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [mounted, setMounted] = useState(false)

  const [stage, setStage] = useState<FormStage>("email")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("CLIENTMEMBER")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isPending && (!session || session.user?.role !== "SUPERADMIN")) {
      navigate({ to: "/login" })
    }
  }, [session, isPending, navigate])

  if (isPending || !session || session.user?.role !== "SUPERADMIN") {
    return null
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!normalizedEmail) {
      setError("Email is required")
      return
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Enter a valid email address")
      return
    }

    setStage("details")
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setIsLoading(true)
    try {
      // 1. Get backend token
      const baseApiUrl = ENV.API_URL.replace(/\/api$/, '')
      const tokenRes = await fetch(`${baseApiUrl}/api/v1/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: "roi_live_406dbf1349fa85f8",
          appSecret: "d55bf04610900360f4cb4693b896be95"
        })
      })

      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}))
        throw new Error(errData.message || errData.error || "Failed to authenticate with backend.")
      }

      const tokenData = await tokenRes.json()
      const token = tokenData.token || tokenData.accessToken || tokenData.data?.token || tokenData.data?.accessToken

      if (!token) {
        throw new Error("Could not parse access token from backend response.")
      }

      // 2. Create User
      const createUserRes = await fetch(`${ENV.API_URL}/auth/create-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: normalizedEmail,
          name: name.trim(),
          role: role
        })
      })

      const createData = await createUserRes.json().catch(() => ({}))

      if (!createUserRes.ok) {
        let errMsg = createData.message || createData.error || "Failed to create user."
        if (createData.errors && Array.isArray(createData.errors)) {
          errMsg = createData.errors.map((e: any) => e.message || e.msg || String(e)).join(", ")
        } else if (createData.details) {
            errMsg += " " + JSON.stringify(createData.details)
        }
        throw new Error(errMsg)
      }

      setSuccess(createData.message || "User successfully registered!")
      // Reset form and return to first stage
      setEmail("")
      setName("")
      setRole("CLIENTMEMBER")
      setStage("email")
    } catch (err: any) {
      setError(err.message || "Something went wrong while creating the user.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f8f9fb] px-6 py-12 dark:bg-[#0a0d13]">
      {/* ── Immersive Background ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-emerald-500/20 blur-[120px] dark:bg-emerald-500/10" />
        <div className="absolute top-[30%] -right-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-400/10 blur-[100px] [animation-delay:2s]" />
        <div className="absolute -bottom-[10%] left-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/10 blur-[80px] [animation-delay:4s]" />
        
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
          <span className="text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase">User Registration Portal</span>
        </div>
      </div>

      {/* ── Main Create Card ────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/50 md:p-10">
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Register User</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {stage === "email" 
                ? "Enter the user's work email to get started" 
                : "Complete the profile details below"}
            </p>
          </div>

          <div className="grid gap-6">
            {stage === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                          onChange={(e) => {
                            setEmail(e.target.value.slice(0, 254))
                            setError(null)
                            setSuccess(null)
                          }}
                          maxLength={254}
                          className="h-12 w-full rounded-xl border-slate-200/60 bg-white/50 pl-11 text-base shadow-sm ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-800 dark:bg-black/20 dark:ring-offset-slate-950"
                          required
                      />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-in shake duration-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 animate-in fade-in duration-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                        <span>{success}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => navigate({ to: "/" })}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-semibold"
                    >
                      <Home className="mr-2 size-4 text-emerald-600 dark:text-emerald-400" />
                      Go to Dashboard
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-13 w-full rounded-xl text-base font-bold shadow-xl shadow-primary/20 transition-all hover:translate-y-[-1px] hover:shadow-primary/30 active:translate-y-0 bg-primary hover:bg-primary/95 text-white"
                >
                  Continue
                  <ArrowRight className="ml-2 size-4 opacity-70" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-6">
                {/* Email Display & Go Back option */}
                <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-black/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{normalizedEmail}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStage("email")}
                      className="h-8 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ArrowLeft className="mr-1 size-3" /> Change
                    </Button>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2 group">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-primary">
                    Full Name
                  </Label>
                  <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-400 transition-colors group-focus-within:text-primary" />
                      <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            setError(null)
                          }}
                          className="h-12 w-full rounded-xl border-slate-200/60 bg-white/50 pl-11 text-base shadow-sm ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-800 dark:bg-black/20 dark:ring-offset-slate-950"
                          required
                      />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2 group">
                  <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-primary">
                    Role
                  </Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value)
                      setError(null)
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 text-base shadow-sm ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="CLIENTMEMBER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Client Member</option>
                    <option value="CLIENTADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Client Admin</option>
                    <option value="SUPERADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Super Admin</option>
                  </select>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-in shake duration-300">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-13 w-full rounded-xl text-base font-bold shadow-xl shadow-primary/20 transition-all hover:translate-y-[-1px] hover:shadow-primary/30 active:translate-y-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? (
                    <Spinner className="mr-2 size-5 text-white" />
                  ) : (
                    <>
                    <UserCheck className="mr-2 size-5" />
                    Register User
                    <ArrowRight className="ml-2 size-4 opacity-70" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Visual Footer Detail ─────────────────────────────────────────────── */}
      <div className="absolute bottom-8 flex items-center gap-8 text-slate-400 opacity-40">
        <div className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Admin Secure</span>
        </div>
        <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Audit Logged</span>
        </div>
      </div>
    </div>
  )
}

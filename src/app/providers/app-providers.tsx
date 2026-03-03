import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { queryClient } from "@/providers/query-client"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/app/providers/theme-provider"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

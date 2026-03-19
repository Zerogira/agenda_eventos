import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { queryClient } from './app/query-client'
import { router } from './app/router'
import { Toaster } from '@/components/ui/sonner'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <SpeedInsights />
    </QueryClientProvider>
  )
}

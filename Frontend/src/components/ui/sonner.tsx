import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl p-4 gap-3",
          description: "group-[.toast]:text-slate-500 font-medium text-xs leading-relaxed",
          actionButton:
            "group-[.toast]:bg-[#734ebd] group-[.toast]:text-white font-bold rounded-lg text-xs px-3 h-8",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 font-bold rounded-lg text-xs px-3 h-8",
          closeButton: "group-[.toast]:bg-white group-[.toast]:border-slate-200 group-[.toast]:text-slate-400 group-[.toast]:hover:text-slate-900 transition-colors",
          success: "group-[.toaster]:border-emerald-100 group-[.toaster]:bg-emerald-50/30 group-[.toast]:text-emerald-900",
          error: "group-[.toaster]:border-rose-100 group-[.toaster]:bg-rose-50/30 group-[.toast]:text-rose-900",
          warning: "group-[.toaster]:border-amber-100 group-[.toaster]:bg-amber-50/30 group-[.toast]:text-amber-900",
          info: "group-[.toaster]:border-blue-100 group-[.toaster]:bg-blue-50/30 group-[.toast]:text-blue-900",
        },
      }}
      icons={{
        success: <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>,
        error: <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center"><XCircle className="h-4 w-4 text-rose-600" /></div>,
        warning: <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-amber-600" /></div>,
        info: <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center"><Info className="h-4 w-4 text-blue-600" /></div>,
      }}
      {...props}
    />
  )
}

export { Toaster }

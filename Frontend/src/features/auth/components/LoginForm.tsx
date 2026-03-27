import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginCredentials } from "../types";
import { useLogin } from "../api/use-login";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginCredentials) {
    login(values);
  }

  const passwordValue = form.watch("password");

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-white via-purple-50 to-indigo-100 selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Lado Esquerdo: Branding & Impacto (Mantém destaque roxo forte) */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative z-10 bg-gradient-to-br from-purple-700 via-indigo-600 to-purple-800 shadow-2xl">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">Agenda Eventos</span>
        </div>

        <div className="max-w-xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tight text-white leading-[1.1]">
              Gerencie sua <span className="text-purple-200">operação</span> com maestria.
            </h1>
            <p className="text-xl text-purple-50 font-medium leading-relaxed">
              A plataforma definitiva para controle de eventos, equipes e logística de brinquedos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm shadow-inner">
              <CheckCircle2 className="h-5 w-5 text-purple-300 mt-1 shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm">Controle Total</h4>
                <p className="text-purple-100/70 text-xs mt-1">Dashboard em tempo real da sua operação.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm shadow-inner">
              <Sparkles className="h-5 w-5 text-blue-300 mt-1 shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm">Inteligência</h4>
                <p className="text-purple-100/70 text-xs mt-1">Relatórios automáticos e insights de lucro.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-purple-200 text-sm font-medium italic">
          <div className="h-px w-12 bg-white/20" />
          Powered by Agenda Eventos Pro
        </div>
      </div>

      {/* Lado Direito: Formulário (Claro e Moderno) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12 justify-center">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-purple-900 uppercase">AE</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-purple-100 p-8 lg:p-10 rounded-[32px] shadow-2xl shadow-purple-900/5">
            <div className="space-y-2 mb-10">
              <h2 className="text-3xl font-black tracking-tight text-gray-900">Bem-vindo</h2>
              <p className="text-gray-500 font-medium">Acesse sua conta para continuar.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-black uppercase text-gray-600 tracking-widest ml-1">E-mail</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input 
                            placeholder="seu@email.com" 
                            className="h-12 pl-12 bg-white border-gray-200 text-gray-900 rounded-2xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 font-medium"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500 font-bold ml-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-black uppercase text-gray-600 tracking-widest ml-1">Senha</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            className="h-12 pl-12 pr-12 bg-white border-gray-200 text-gray-900 rounded-2xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 font-medium"
                            {...field} 
                          />
                          {passwordValue && passwordValue.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors p-1"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500 font-bold ml-1" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Autenticando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Acessar Sistema <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col gap-4 text-center">
              <p className="text-gray-500 text-sm font-medium">
                Ainda não tem acesso?{" "}
                <Link to="/register" className="text-purple-600 hover:text-purple-500 font-bold transition-colors underline-offset-4 hover:underline">
                  Crie sua conta
                </Link>
              </p>
            </div>

            {/* Development Hint */}
            {import.meta.env.DEV && (
              <div className="mt-8 p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> Modo Desenvolvedor
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium flex justify-between">
                    <span>E-mail:</span> <span className="text-gray-900 font-bold">admin@admin.com</span>
                  </p>
                  <p className="text-xs text-gray-500 font-medium flex justify-between">
                    <span>Senha:</span> <span className="text-gray-900 font-bold">123456</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

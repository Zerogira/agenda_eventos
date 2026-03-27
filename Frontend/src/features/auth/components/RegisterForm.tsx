import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterCredentials } from "../types";
import { useRegister } from "../api/use-register";
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
import { User, Mail, Lock, Key, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nomeUsuario: "",
      email: "",
      password: "",
      confirmPassword: "",
      codigoConvite: "",
    },
  });

  function onSubmit(values: RegisterCredentials) {
    register(values);
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-white via-purple-50 to-indigo-100 selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      {/* Lado Esquerdo: Branding & Impacto (Mantém destaque roxo forte) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative z-10 bg-gradient-to-br from-purple-700 via-indigo-600 to-purple-800 shadow-2xl">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">Agenda Eventos</span>
        </div>

        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1]">
              Comece sua jornada <span className="text-purple-200">profissional</span> hoje.
            </h1>
            <p className="text-lg text-purple-50 font-medium leading-relaxed">
              Junte-se a centenas de empresas que já otimizaram sua logística de eventos com nossa plataforma.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-purple-100 font-medium">
              <CheckCircle2 className="h-5 w-5 text-purple-300" />
              <span>Configuração em menos de 2 minutos</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 font-medium">
              <CheckCircle2 className="h-5 w-5 text-purple-300" />
              <span>Acesso a todas as ferramentas PRO</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 font-medium">
              <CheckCircle2 className="h-5 w-5 text-purple-300" />
              <span>Suporte prioritário via WhatsApp</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-purple-200 text-sm font-medium italic">
          <div className="h-px w-12 bg-white/20" />
          Join the professional network
        </div>
      </div>

      {/* Lado Direito: Formulário (Claro e Moderno) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-[520px] animate-in fade-in slide-in-from-right-4 duration-700">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-purple-900 uppercase">AE</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-purple-100 p-8 lg:p-10 rounded-[32px] shadow-2xl shadow-purple-900/5">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-black tracking-tight text-gray-900">Criar Conta</h2>
              <p className="text-gray-500 font-medium text-sm">Preencha os dados abaixo para ativar seu acesso.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="nomeUsuario"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Nome Completo</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input 
                            placeholder="Como deseja ser chamado" 
                            className="h-11 pl-11 bg-white border-gray-200 text-gray-900 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 text-sm font-medium"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] text-rose-500 font-bold ml-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">E-mail Corporativo</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input 
                            placeholder="seu@email.com" 
                            className="h-11 pl-11 bg-white border-gray-200 text-gray-900 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 text-sm font-medium"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] text-rose-500 font-bold ml-1" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Senha</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <Input 
                              type="password" 
                              placeholder="••••••••"
                              className="h-11 pl-11 bg-white border-gray-200 text-gray-900 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 text-sm font-medium"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] text-rose-500 font-bold ml-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Confirmar</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <Input 
                              type="password" 
                              placeholder="••••••••"
                              className="h-11 pl-11 bg-white border-gray-200 text-gray-900 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 text-sm font-medium"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] text-rose-500 font-bold ml-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="codigoConvite"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black uppercase text-purple-600 tracking-widest ml-1 flex items-center gap-2">
                        <Key className="h-3 w-3" /> Código de Convite
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Informe o código recebido" 
                          className="h-11 px-4 bg-purple-50 border-purple-100 text-purple-900 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all placeholder:text-purple-200 text-sm font-bold tracking-widest uppercase"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-rose-500 font-bold ml-1" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-95 transition-all duration-300 mt-4" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Finalizar Cadastro <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm font-medium">
                Já possui uma conta?{" "}
                <Link to="/login" className="text-purple-600 hover:text-purple-500 font-bold transition-colors underline-offset-4 hover:underline">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

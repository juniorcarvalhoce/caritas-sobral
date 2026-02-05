import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import logoCaritas from "@/assets/logo-caritas.png";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        console.error("Login error:", error);
      } else if (data.user) {
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o painel administrativo...",
        });
        // Redirecionar para o painel administrativo após login bem-sucedido
        navigate('/admin');
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Button>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="glass rounded-3xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <img src={logoCaritas} alt="Cáritas" className="w-10 h-10" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-heading text-2xl font-semibold mb-2"
            >
              Área Administrativa
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground"
            >
              Acesse o painel administrativo da Cáritas
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@caritas-sobral.org"
                className="glass-dark"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="glass-dark pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full gap-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-muted-foreground">
              Acesso restrito aos administradores da Cáritas Diocesana de Sobral
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
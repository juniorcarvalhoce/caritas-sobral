import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar, { MobileAdminBar } from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível verificar sua sessão. Faça login novamente.",
          variant: "destructive",
        });
        navigate("/login");
      } else if (!data.session) {
        navigate("/login");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          navigate("/login");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileAdminBar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

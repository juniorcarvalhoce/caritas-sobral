import { NavLink, useNavigate } from "react-router-dom";
import { Home, FileText, Newspaper, Building, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoCaritas from "@/assets/logo-caritas.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const navItems = [
    { to: "/admin/editais", icon: FileText, label: "Editais" },
    { to: "/admin/noticias", icon: Newspaper, label: "Notícias" },
    { to: "/admin/patrimonio", icon: Building, label: "Patrimônio" },
  ];

  return (
    <aside className={cn(
      "relative bg-sidebar-background text-sidebar-foreground border-r border-border flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <img src={logoCaritas} alt="Cáritas" className="w-10 h-10 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-lg leading-tight">Cáritas</span>
            <span className="text-xs">Admin</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    isActive ? "bg-primary/10 text-primary font-semibold" : "text-sidebar-foreground",
                    isCollapsed && "justify-center"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn("w-full flex items-center gap-3", isCollapsed && "justify-center")}
          onClick={() => navigate("/")}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Ver Site</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn("w-full flex items-center gap-3 text-red-500 hover:text-red-600", isCollapsed && "justify-center")}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
      
      <Button 
        variant="outline"
        size="icon"
        className="absolute -right-4 top-16 rounded-full bg-background hover:bg-muted"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>
    </aside>
  );
};

export default Sidebar;

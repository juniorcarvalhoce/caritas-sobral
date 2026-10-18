import { NavLink, useNavigate } from "react-router-dom";
import { Home, FileText, Newspaper, Building, LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Menu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoCaritas from "@/assets/logo-caritas.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Resumo", end: true },
  { to: "/admin/editais", icon: FileText, label: "Editais" },
  { to: "/admin/noticias", icon: Newspaper, label: "Notícias" },
  { to: "/admin/areas", icon: Layers, label: "Áreas de atuação" },
  { to: "/admin/patrimonio", icon: Building, label: "Patrimônio" },
];

const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  return async () => {
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
};

// Conteúdo do menu, usado tanto na lateral (computador) quanto na gaveta (celular)
const SidebarContent = ({ isCollapsed = false, onNavigate }: { isCollapsed?: boolean; onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const handleLogout = useLogout();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <img src={logoCaritas} alt="Cáritas" className="w-10 h-10 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-lg leading-tight">Cáritas</span>
            <span className="text-xs text-muted-foreground">Área administrativa</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 my-1 rounded-lg transition-colors text-sm",
                    "hover:bg-primary/10 hover:text-primary",
                    isActive ? "bg-primary/10 text-primary font-semibold" : "text-sidebar-foreground",
                    isCollapsed && "justify-center px-0"
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

      <div className="px-3 py-4 border-t border-border space-y-1">
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-3", isCollapsed && "justify-center")}
          onClick={() => {
            onNavigate?.();
            navigate("/");
          }}
          title={isCollapsed ? "Ver site" : undefined}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Ver site</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50", isCollapsed && "justify-center")}
          onClick={handleLogout}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};

// Barra do topo com menu em gaveta, só no celular
export const MobileAdminBar = () => {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between gap-3 px-4 py-3 border-b bg-sidebar-background sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <img src={logoCaritas} alt="" className="w-8 h-8" />
        <span className="font-heading font-semibold">Área administrativa</span>
      </div>
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menu">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar-background">
          <SheetTitle className="sr-only">Menu da área administrativa</SheetTitle>
          <SidebarContent onNavigate={() => setAberto(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Menu lateral, só no computador
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col bg-sidebar-background text-sidebar-foreground border-r border-border transition-all duration-300 ease-in-out flex-shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} />

      <Button
        variant="outline"
        size="icon"
        className="absolute -right-4 top-16 rounded-full bg-background hover:bg-muted h-8 w-8"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>
    </aside>
  );
};

export default Sidebar;

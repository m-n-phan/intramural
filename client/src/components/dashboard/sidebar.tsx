import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Trophy, 
  Users, 
  Calendar, 
  Award, 
  CreditCard, 
  TrendingUp,
  Shield,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: DashboardView) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { isAdmin } = useAuth();
  
  const allNavItems = [
    { id: 'overview', label: 'Overview', icon: Home, adminOnly: true },
    { id: 'sports', label: 'Sports & Seasons', icon: Trophy, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, adminOnly: true },
    { id: 'payments', label: 'Payments', icon: CreditCard, adminOnly: true },
    { id: 'roles', label: 'Role Management', icon: Shield, adminOnly: true },
    { id: 'teams', label: 'Teams', icon: Users, adminOnly: false },
    { id: 'schedule', label: 'Schedule', icon: Calendar, adminOnly: false },
    { id: 'standings', label: 'Standings', icon: Award, adminOnly: false },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: false },
  ];

  const navItems = allNavItems.filter(item => isAdmin || !item.adminOnly);

  return (
    <div className="w-64 hidden lg:block">
      <Card>
        <CardContent className="p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Trophy, 
  Users, 
  Calendar, 
  Award, 
  CreditCard, 
  TrendingUp 
} from "lucide-react";

type DashboardView = 'overview' | 'sports' | 'teams' | 'schedule' | 'standings' | 'payments' | 'analytics';

interface SidebarProps {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'sports', label: 'Sports & Seasons', icon: Trophy },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: Award },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

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
                  onClick={() => setActiveView(item.id as DashboardView)}
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

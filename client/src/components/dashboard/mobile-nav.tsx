import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  Users, 
  Award, 
  User 
} from "lucide-react";

type DashboardView = 'overview' | 'sports' | 'teams' | 'schedule' | 'standings' | 'payments' | 'analytics' | 'roles';

interface MobileNavProps {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
}

export function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  const navItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'standings', label: 'Standings', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-3 ${
                activeView === item.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveView(item.id as DashboardView)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

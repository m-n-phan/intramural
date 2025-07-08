import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Overview } from "@/components/dashboard/overview";
import { Sports } from "@/components/dashboard/sports";
import { Teams } from "@/components/dashboard/teams";
import { Schedule } from "@/components/dashboard/schedule";
import { Standings } from "@/components/dashboard/standings";
import { Payments } from "@/components/dashboard/payments";
import { Analytics } from "@/components/dashboard/analytics";
import { RoleManagement } from "@/components/dashboard/role-management";
import { Settings } from "@/components/dashboard/settings";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Settings as SettingsIcon, User, LogOut } from "lucide-react";

type DashboardView = 'overview' | 'sports' | 'teams' | 'schedule' | 'standings' | 'payments' | 'analytics' | 'roles' | 'settings';

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <Overview />;
      case 'sports':
        return <Sports />;
      case 'teams':
        return <Teams />;
      case 'schedule':
        return <Schedule />;
      case 'standings':
        return <Standings />;
      case 'payments':
        return <Payments />;
      case 'analytics':
        return <Analytics />;
      case 'roles':
        return <RoleManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Dashboard Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">Intramural</h1>
              <div className="hidden md:block h-6 w-px bg-border" />
              <span className="hidden md:block text-muted-foreground">Spring 2024</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-foreground">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveView('settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
        {/* Sidebar */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content */}
        <div className="flex-1">
          {renderView()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

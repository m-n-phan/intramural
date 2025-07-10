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
import { UserButton, useUser } from "@clerk/clerk-react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Invite } from "@shared/schema";

// Function to determine the current season based on month and year
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January, 11 = December)
  const year = now.getFullYear();
  
  // Academic year typically runs from August to July
  // Fall: August, September, October, November
  // Winter: December, January, February
  // Spring: March, April
  // Summer: May, June, July
  
  if (month >= 7 && month <= 10) { // August to November
    return `Fall ${year}`;
  } else if (month >= 11 || month <= 1) { // December to February
    // Winter spans across calendar years
    const academicYear = month >= 11 ? year + 1 : year;
    return `Winter ${academicYear}`;
  } else if (month >= 2 && month <= 3) { // March to April
    return `Spring ${year}`;
  } else { // May to July
    return `Summer ${year}`;
  }
};

type DashboardView = 'overview' | 'sports' | 'teams' | 'schedule' | 'standings' | 'payments' | 'analytics' | 'roles' | 'settings';

function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: invites, isLoading } = useQuery<Invite[]>({
    queryKey: ['/api/users/me/invites'],
  });

  const mutation = useMutation({
    mutationFn: ({ inviteId, status }: { inviteId: number, status: 'accepted' | 'declined' }) =>
      apiRequest("PUT", `/api/invites/${inviteId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/invites'] });
      toast({ title: "Success", description: "Invitation updated." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Invitations</h4>
            <p className="text-sm text-muted-foreground">
              Respond to your team invitations.
            </p>
          </div>
          <div className="grid gap-2">
            {isLoading ? (
              <p>Loading...</p>
            ) : invites && invites.length > 0 ? (
              invites.map((invite: Invite) => (
                <div key={invite.id} className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <p>Invitation to join team {invite.teamId}</p>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => mutation.mutate({ inviteId: invite.id, status: 'accepted' })}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => mutation.mutate({ inviteId: invite.id, status: 'declined' })}>Decline</Button>
                  </div>
                </div>
              ))
            ) : (
              <p>No new invitations.</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  if (!isLoaded) {
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
              <span className="hidden md:block text-muted-foreground">{getCurrentSeason()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications />
              <UserButton afterSignOutUrl="/" />
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

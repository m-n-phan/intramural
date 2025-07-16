import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import PlayerDashboard from "@/components/dashboard/PlayerDashboard";
import { UserButton } from "@clerk/clerk-react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Invite } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Function to determine the current season based on month and year
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January, 11 = December)
  const year = now.getFullYear();
  
  if (month >= 7 && month <= 10) { // August to November
    return `Fall ${year}`;
  } else if (month >= 11 || month <= 1) { // December to February
    const academicYear = month >= 11 ? year + 1 : year;
    return `Winter ${academicYear}`;
  } else if (month >= 2 && month <= 3) { // March to April
    return `Spring ${year}`;
  } else { // May to July
    return `Summer ${year}`;
  }
};

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
    onError: (error: Error) => {
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
    const { isAdmin, isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const dashboard = isAdmin ? <AdminDashboard /> : <PlayerDashboard />;

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
            {dashboard}
        </div>
    );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface FreeAgent extends User {
  notes: string | null;
  freeAgentId: number;
}

interface FreeAgentsProps {
  sportId: number;
  teamId?: number;
}

export default function FreeAgents({ sportId, teamId }: FreeAgentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: freeAgents, isLoading } = useQuery<FreeAgent[]>({
    queryKey: ["/api/sports", sportId, "free-agents"],
    queryFn: async () => {
      const response = await fetch(`/api/sports/${sportId}/free-agents`);
      if (!response.ok) throw new Error("Failed to fetch free agents");
      return response.json() as Promise<FreeAgent[]>;
    },
    enabled: !!sportId,
  });

  const inviteMutation = useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      if (!teamId) throw new Error("No team selected to invite to.");
      const response = await fetch(`/api/teams/${teamId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message || "Failed to send invitation.");
      }
    },
    onSuccess: () => {
      toast({
        title: "Invite Sent",
        description: "The free agent has been invited to your team.",
      });
      void queryClient.invalidateQueries({
        queryKey: ["/api/sports", sportId, "free-agents"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div>Loading free agents...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Free Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {freeAgents?.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={agent.profileImageUrl || ""} />
                    <AvatarFallback>
                      {agent.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>
                      {agent.firstName} {agent.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {agent.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{agent.notes}</TableCell>
                <TableCell>
                  {teamId && (
                    <Button
                      size="sm"
                      onClick={() =>
                        inviteMutation.mutate({ userId: agent.id })
                      }
                      disabled={inviteMutation.isPending}
                    >
                      Invite to Team
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {freeAgents?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No free agents are currently available for this sport.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

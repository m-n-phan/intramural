import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Users, Search, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function Teams() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRosterDialog, setShowRosterDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");

  const { data: teams, isLoading } = useQuery({
    queryKey: ['/api/teams'],
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/teams', selectedTeam?.id, 'members'],
    enabled: !!selectedTeam,
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Filter teams based on search term and selected sport
  const filteredTeams = teams?.filter((team: any) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || team.sportId.toString() === selectedSport;
    return matchesSearch && matchesSport;
  });

  const form = useForm({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
      sportId: 0,
      captainId: user?.id || "",
      division: "recreational",
      status: "active",
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/teams", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Ensure sportId is a number
    const submitData = {
      ...data,
      sportId: Number(data.sportId),
      captainId: user?.id,
    };
    createTeamMutation.mutate(submitData);
  };

  const handleViewTeam = (team: any) => {
    // Navigate to team detail view
    toast({
      title: "Team Details",
      description: `Viewing details for ${team.name}`,
    });
  };

  const handleManageRoster = (team: any) => {
    setSelectedTeam(team);
    setShowRosterDialog(true);
  };

  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: { teamId: number; userId: string }) => {
      return await apiRequest("POST", `/api/teams/${data.teamId}/members`, { userId: data.userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeam?.id, 'members'] });
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async (data: { teamId: number; userId: string }) => {
      return await apiRequest("DELETE", `/api/teams/${data.teamId}/members/${data.userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeam?.id, 'members'] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 mb-4" />
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Teams</h2>
          <p className="text-muted-foreground">
            Manage team registrations and rosters
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
              <DialogDescription>
                Create a new team by providing team details and selecting a sport.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Thunder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports?.map((sport: any) => (
                            <SelectItem key={sport.id} value={sport.id.toString()}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="recreational">Recreational</SelectItem>
                          <SelectItem value="competitive">Competitive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTeamMutation.isPending}>
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Team Directory</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sports?.map((sport: any) => (
                    <SelectItem key={sport.id} value={sport.id.toString()}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTeams?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Team</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Sport</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Division</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Players</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Record</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team: any) => (
                    <tr key={team.id} className="border-b">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{team.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {team.division}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline">
                          {sports?.find((s: any) => s.id === team.sportId)?.name || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-foreground">{team.division}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-foreground">
                          {team.playerCount || 0} players
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-foreground">
                          {team.wins || 0}-{team.losses || 0}
                          {team.draws > 0 && `-${team.draws}`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                          {team.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewTeam(team)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleManageRoster(team)}>
                            Roster
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Teams Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedSport 
                  ? "No teams match your search criteria"
                  : "Get started by adding your first team"
                }
              </p>
              {!searchTerm && !selectedSport && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roster Management Dialog */}
      <Dialog open={showRosterDialog} onOpenChange={setShowRosterDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Roster - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Add or remove players from the team roster.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add New Member */}
            <div className="flex items-center space-x-4">
              <Select onValueChange={(userId) => {
                if (userId && selectedTeam) {
                  addTeamMemberMutation.mutate({ teamId: selectedTeam.id, userId });
                }
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a player to add" />
                </SelectTrigger>
                <SelectContent>
                  {users?.filter((user: any) => 
                    !teamMembers?.some((member: any) => member.userId === user.id)
                  ).map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                disabled={addTeamMemberMutation.isPending}
                onClick={() => {
                  // This triggers the select value change
                }}
              >
                {addTeamMemberMutation.isPending ? "Adding..." : "Add Player"}
              </Button>
            </div>

            {/* Current Members */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Members</h3>
              {teamMembers?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member: any) => {
                      const memberUser = users?.find((u: any) => u.id === member.userId);
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {memberUser?.firstName} {memberUser?.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {memberUser?.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (selectedTeam) {
                                  removeTeamMemberMutation.mutate({
                                    teamId: selectedTeam.id,
                                    userId: member.userId
                                  });
                                }
                              }}
                              disabled={removeTeamMemberMutation.isPending}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No members found. Add some players to get started.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

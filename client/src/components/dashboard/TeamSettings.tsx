import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Team, User, TeamMember, Invite } from "@shared/schema";
import FreeAgents from "./FreeAgents";
export function TeamSettings() {
 const { user, isAdmin } = useAuth();
 const params = useParams();
 const teamId = params.id ? parseInt(params.id) : null;
 const { data: team, isLoading: teamLoading } = useQuery<Team>({
  queryKey: ['/api/teams', teamId],
  queryFn: async () => {
   const response = await fetch(`/api/teams/${teamId}`);
   if (!response.ok) throw new Error("Failed to fetch team");
   return response.json() as Promise<Team>;
  },
  enabled: !!teamId,
 });
 const { data: roster, isLoading: rosterLoading } = useQuery<TeamMember[]>({
  queryKey: ['/api/teams', teamId, 'members'],
  queryFn: async () => {
   if (!teamId) return [];
   const response = await fetch(`/api/teams/${teamId}/members`);
   if (!response.ok) throw new Error("Failed to fetch roster");
   return response.json() as Promise<TeamMember[]>;
  },
  enabled: !!teamId,
 });
 const { data: pendingRequests, isLoading: requestsLoading } = useQuery<Invite[]>({
  queryKey: ['/api/teams', teamId, 'invites'],
  queryFn: async () => {
   if (!teamId) return [];
   const response = await fetch(`/api/teams/${teamId}/invites`);
   if (!response.ok) throw new Error("Failed to fetch pending requests");
   return response.json() as Promise<Invite[]>;
  },
  enabled: !!teamId,
 });
 const { data: users } = useQuery<User[]>({ queryKey: ['/api/users'] });
 const isCaptain = team?.captainId === user?.id;
 if (!teamId) {
  return <div>Invalid Team ID</div>;
 }
 if (teamLoading || rosterLoading || requestsLoading) {
  return <div>Loading...</div>;
 }
 return (
  <div className="space-y-6">
   <Card>
    <CardHeader>
     <CardTitle>Team Profile</CardTitle>
     <CardDescription>Update your team&apos;s profile picture and name.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
     <div className="flex items-center space-x-4">
      <Avatar className="h-24 w-24">
       <AvatarImage src={team?.profileImageUrl || ''} />
       <AvatarFallback>{team?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
       <Input type="file" disabled={!isAdmin && !isCaptain} />
       <p className="text-sm text-muted-foreground">Upload a new profile picture.</p>
      </div>
     </div>
    </CardContent>
   </Card>
   <Card>
    <CardHeader>
     <CardTitle>Recruit Free Agents</CardTitle>
     <CardDescription>View and invite free agents to join your team.</CardDescription>
    </CardHeader>
    <CardContent>
     {team && <FreeAgents sportId={team.sportId} teamId={team.id} />}
    </CardContent>
   </Card>
   <Card>
    <CardHeader>
     <CardTitle>Roster Management</CardTitle>
     <CardDescription>Manage your team members.</CardDescription>
    </CardHeader>
    <CardContent>
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead>Player</TableHead>
        <TableHead>Role</TableHead>
        <TableHead className="text-right">Actions</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {roster?.map((member) => {
        const memberUser = users?.find(u => u.id === member.userId);
        return (
         <TableRow key={member.id}>
          <TableCell className="font-medium flex items-center space-x-3">
           <Avatar>
            <AvatarImage src={memberUser?.profileImageUrl || ''} />
            <AvatarFallback>{memberUser?.firstName?.charAt(0)}</AvatarFallback>
           </Avatar>
           <span>{memberUser?.firstName} {memberUser?.lastName}</span>
          </TableCell>
          <TableCell>{member.role}</TableCell>
          <TableCell className="text-right">
           {(isAdmin || isCaptain) && (
            <DropdownMenu>
             <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">...</Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent>
              <DropdownMenuItem>Promote to Captain</DropdownMenuItem>
              <DropdownMenuItem>Demote to Player</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Remove from Team</DropdownMenuItem>
             </DropdownMenuContent>
            </DropdownMenu>
           )}
          </TableCell>
         </TableRow>
        )
       })}
      </TableBody>
     </Table>
    </CardContent>
   </Card>
   <Card>
    <CardHeader>
     <CardTitle>Pending Requests</CardTitle>
     <CardDescription>Accept or decline requests to join your team.</CardDescription>
    </CardHeader>
    <CardContent>
     {pendingRequests?.map((request) => {
      const requestUser = users?.find(u => u.id === request.userId);
      return (
       <div key={request.id} className="flex items-center justify-between space-x-4 mb-2">
        <div className="flex items-center space-x-3">
         <Avatar>
          <AvatarImage src={requestUser?.profileImageUrl || ''} />
          <AvatarFallback>{requestUser?.firstName?.charAt(0)}</AvatarFallback>
         </Avatar>
         <span>{requestUser?.firstName} {requestUser?.lastName}</span>
        </div>
        {(isAdmin || isCaptain) && (
         <div className="space-x-2">
          <Button size="sm">Accept</Button>
          <Button size="sm" variant="outline">Decline</Button>
         </div>
        )}
       </div>
      )
     })}
    </CardContent>
   </Card>
   <Card>
    <CardHeader>
     <CardTitle>Invite Members</CardTitle>
    </CardHeader>
    <CardContent className="flex space-x-2">
     <Input placeholder="Search for a user to invite..." />
     <Button>Invite</Button>
    </CardContent>
   </Card>
   <Card>
    <CardHeader>
     <CardTitle>Settings</CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex items-center space-x-2">
      <Switch id="captain-invites" checked={team?.captainOnlyInvites} disabled={!isAdmin && !isCaptain} />
      <Label htmlFor="captain-invites">Only captains can invite members</Label>
     </div>
    </CardContent>
   </Card>
  </div>
 );
}
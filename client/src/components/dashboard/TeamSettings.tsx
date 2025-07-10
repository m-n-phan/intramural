import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function TeamSettings() {
  // Mock data - replace with API calls
  const team = {
    name: "The Mighty Ducks",
    profileImageUrl: "https://github.com/shadcn.png",
    captainOnlyInvites: true,
  };

  const roster = [
    { id: "1", name: "Gordon Bombay", role: "captain", avatar: "https://github.com/shadcn.png" },
    { id: "2", name: "Charlie Conway", role: "player", avatar: "https://github.com/shadcn.png" },
    { id: "3", name: "Fulton Reed", role: "player", avatar: "https://github.com/shadcn.png" },
  ];

  const pendingRequests = [
    { id: "4", name: "Dwayne Robertson", avatar: "https://github.com/shadcn.png" },
    { id: "5", name: "Les Averman", avatar: "https://github.com/shadcn.png" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Profile</CardTitle>
          <CardDescription>Update your team's profile picture and name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={team.profileImageUrl} />
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Input type="file" />
              <p className="text-sm text-muted-foreground">Upload a new profile picture.</p>
            </div>
          </div>
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
              {roster.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
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
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between space-x-4 mb-2">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={request.avatar} />
                  <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{request.name}</span>
              </div>
              <div className="space-x-2">
                <Button size="sm">Accept</Button>
                <Button size="sm" variant="outline">Decline</Button>
              </div>
            </div>
          ))}
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
            <Switch id="captain-invites" checked={team.captainOnlyInvites} />
            <Label htmlFor="captain-invites">Only captains can invite members</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

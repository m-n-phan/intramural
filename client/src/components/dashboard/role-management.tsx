import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES } from "@shared/schema";
import { Shield, Users, UserCheck, UserCog } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
}

export function RoleManagement() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('GET', '/api/users'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest('PUT', `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      setSelectedUserId("");
      setSelectedRole("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateRole = () => {
    if (!selectedUserId || !selectedRole) return;
    updateRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <Shield className="h-4 w-4" />;
      case USER_ROLES.CAPTAIN:
        return <UserCheck className="h-4 w-4" />;
      case USER_ROLES.REFEREE:
        return <UserCog className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case USER_ROLES.CAPTAIN:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case USER_ROLES.REFEREE:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Role Update Section */}
        <Card>
          <CardHeader>
            <CardTitle>Update User Role</CardTitle>
            <CardDescription>
              Change user roles to grant or revoke permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">New Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateRole}
                disabled={!selectedUserId || !selectedRole || updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Users</CardTitle>
            <CardDescription>
              View all users and their current roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No users found. Users will appear here once they sign up.
                </p>
              ) : (
                users.map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
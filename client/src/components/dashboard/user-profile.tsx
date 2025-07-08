import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@shared/schema";
import { Shield, Users, UserCheck, UserCog, Info } from "lucide-react";

export function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "Full access to all features including user management, sport creation, and system configuration.";
      case USER_ROLES.CAPTAIN:
        return "Can manage teams, register players, and access team-specific features.";
      case USER_ROLES.REFEREE:
        return "Can manage games, update scores, and access referee tools.";
      default:
        return "Can join teams, view schedules, and participate in games.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">
            Your account information and role permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Your personal details and account status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="text-lg">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleColor(user.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              What you can do with your current role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{getRoleDescription(user.role)}</p>
              </div>
              
              <div className="grid gap-3">
                <h4 className="font-medium">Your permissions include:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {user.role === USER_ROLES.ADMIN && (
                    <>
                      <li>• Create and manage sports</li>
                      <li>• Manage user roles and permissions</li>
                      <li>• View system analytics</li>
                      <li>• Access payment and billing features</li>
                    </>
                  )}
                  {user.role === USER_ROLES.CAPTAIN && (
                    <>
                      <li>• Create and manage teams</li>
                      <li>• Register team members</li>
                      <li>• View team schedules and standings</li>
                    </>
                  )}
                  {user.role === USER_ROLES.REFEREE && (
                    <>
                      <li>• Update game scores</li>
                      <li>• Manage game schedules</li>
                      <li>• Access referee tools</li>
                    </>
                  )}
                  {user.role === USER_ROLES.PLAYER && (
                    <>
                      <li>• Join teams</li>
                      <li>• View game schedules</li>
                      <li>• Participate in games</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
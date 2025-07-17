import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@shared/schema";
import { 
  User, 
  Shield, 
  Users, 
  UserCheck, 
  UserCog, 
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  CreditCard
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Settings() {
  const { user: typedUser } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    gameReminders: true,
    teamUpdates: true,
    systemAnnouncements: false
  });

  const [accountForm, setAccountForm] = useState({
    firstName: typedUser?.firstName || '',
    lastName: typedUser?.lastName || '',
    email: typedUser?.email || ''
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccountMutation.mutate(accountForm);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
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

  if (!typedUser) {
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
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={typedUser.profileImageUrl ?? undefined} />
                <AvatarFallback className="text-lg">
                  {typedUser.firstName?.[0]}{typedUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleColor(typedUser.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(typedUser.role)}
                      {typedUser.role.charAt(0).toUpperCase() + typedUser.role.slice(1)}
                    </div>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Profile photo is synced with your account
                </p>
              </div>
            </div>
            
            <form onSubmit={handleAccountUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={accountForm.firstName}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={accountForm.lastName}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              </div>
              <Button 
                type="submit" 
                disabled={updateAccountMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateAccountMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the interface looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark modes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Game Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified before your games start
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.gameReminders}
                  onCheckedChange={(checked) => handleNotificationChange('gameReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Team Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about team changes and announcements
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.teamUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('teamUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Announcements</Label>
                  <p className="text-sm text-muted-foreground">
                    General platform updates and maintenance notices
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemAnnouncements}
                  onCheckedChange={(checked) => handleNotificationChange('systemAnnouncements', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your account security and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Account Security</Label>
                <p className="text-sm text-muted-foreground">
                  Your account is secured through our authentication system
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings (if applicable) */}
        {(typedUser.role === USER_ROLES.ADMIN || typedUser.role === USER_ROLES.CAPTAIN) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Billing & Payments</CardTitle>
              </div>
              <CardDescription>
                Manage payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Methods</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage your payment methods for team registrations
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

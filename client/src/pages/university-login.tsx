import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  University, 
  Shield, 
  ChevronRight,
  Building,
  Users,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface University {
  id: string;
  name: string;
  provider: string;
  loginUrl: string;
}

export default function UniversityLogin() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: universities, isLoading } = useQuery({
    queryKey: ['/api/auth/universities'],
    queryFn: async () => {
      const response = await fetch('/api/auth/universities');
      return response.json();
    }
  });

  const filteredUniversities = universities?.filter((uni: University) =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'saml':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'google':
        return <Globe className="h-5 w-5 text-red-600" />;
      case 'azure':
        return <Building className="h-5 w-5 text-blue-800" />;
      case 'okta':
        return <Users className="h-5 w-5 text-green-600" />;
      default:
        return <University className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'saml':
        return 'SAML 2.0';
      case 'google':
        return 'Google Workspace';
      case 'azure':
        return 'Microsoft Azure AD';
      case 'okta':
        return 'Okta';
      case 'openid':
        return 'OpenID Connect';
      default:
        return provider.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <University className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Intramural
          </h1>
          <p className="text-muted-foreground mb-6">
            Sign in with your university credentials to access your intramural sports platform
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for your university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* University Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : filteredUniversities.length > 0 ? (
            filteredUniversities.map((university: University) => (
              <Card key={university.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {getProviderIcon(university.provider)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {university.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getProviderName(university.provider)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = university.loginUrl}
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            // No results
            <div className="col-span-full text-center py-12">
              <University className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                University not found
              </h3>
              <p className="text-muted-foreground mb-4">
                Can't find your university? Contact your IT administrator or our support team.
              </p>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            How university authentication works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Secure Login</p>
                <p className="text-muted-foreground">
                  Use your existing university credentials - no new passwords needed
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Instant Access</p>
                <p className="text-muted-foreground">
                  Automatic account creation with your university information
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">University Integration</p>
                <p className="text-muted-foreground">
                  Seamlessly integrated with your campus systems
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Having trouble? Contact your university IT support or 
            <a href="mailto:support@intramural.com" className="text-primary hover:underline ml-1">
              our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
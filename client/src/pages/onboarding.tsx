import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  Trophy, 
  Calendar, 
  CheckCircle, 
  ArrowRight,
  UserPlus,
  Shield,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";
import { Sport, User } from "@shared/schema";

interface OnboardingData {
  interests: string[];
  experience: string;
  availability: string;
  notifications: boolean;
}

export default function Onboarding() {
  const { user: typedUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    interests: [],
    experience: '',
    availability: '',
    notifications: true
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      return await apiRequest("POST", "/api/onboarding/complete", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Intramural!",
        description: "Your account has been set up successfully.",
      });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    },
  });

  const handleInterestToggle = (sportId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      interests: prev.interests.includes(sportId)
        ? prev.interests.filter(id => id !== sportId)
        : [...prev.interests, sportId]
    }));
  };

  const handleComplete = () => {
    completeOnboardingMutation.mutate(onboardingData);
  };

  const handleSkip = () => {
    setLocation('/dashboard');
  };

  const steps = [
    { id: 1, title: "Welcome", icon: UserPlus },
    { id: 2, title: "Interests", icon: Trophy },
    { id: 3, title: "Experience", icon: Shield },
    { id: 4, title: "Availability", icon: Calendar },
    { id: 5, title: "Finish", icon: CheckCircle }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Intramural!
          </h1>
          <p className="text-muted-foreground mb-6">
            Let's get you set up to join the action
          </p>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : step.id < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {step.id < steps.length && (
                      <div className={`w-8 h-0.5 ${
                        step.id < currentStep ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {currentStepData && <currentStepData.icon className="h-5 w-5" />}
              <span>
                {currentStep === 1 && "Welcome to the Platform"}
                {currentStep === 2 && "What sports interest you?"}
                {currentStep === 3 && "What's your experience level?"}
                {currentStep === 4 && "When are you available?"}
                {currentStep === 5 && "All set!"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Hi {typedUser?.firstName || 'there'}!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We're excited to have you join our intramural sports community. 
                    Let's personalize your experience to help you find the perfect teams and activities.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Join Teams</p>
                    <p className="text-muted-foreground">Find your sport</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Track Games</p>
                    <p className="text-muted-foreground">Never miss a match</p>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-muted-foreground">Stay in the loop</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Select the sports you're interested in participating in:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Array.isArray(sports) && (sports as Sport[]).map((sport) => (
                    <div key={sport.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sport-${sport.id}`}
                        checked={onboardingData.interests.includes(sport.id.toString())}
                        onCheckedChange={() => handleInterestToggle(sport.id.toString())}
                      />
                      <Label 
                        htmlFor={`sport-${sport.id}`}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span>{sport.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {sport.gender === 'men' ? "Men's" : sport.gender === 'women' ? "Women's" : "Co-ed"}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
                {onboardingData.interests.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Don't worry, you can always change your interests later!
                  </p>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  How would you describe your sports experience?
                </p>
                <Select 
                  value={onboardingData.experience} 
                  onValueChange={(value) => setOnboardingData(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                    <SelectItem value="advanced">Advanced - Experienced player</SelectItem>
                    <SelectItem value="competitive">Competitive - High-level experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  When are you typically available to play?
                </p>
                <Select 
                  value={onboardingData.availability} 
                  onValueChange={(value) => setOnboardingData(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekday-morning">Weekday Mornings</SelectItem>
                    <SelectItem value="weekday-evening">Weekday Evenings</SelectItem>
                    <SelectItem value="weekend">Weekends</SelectItem>
                    <SelectItem value="flexible">Flexible - Any time</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={onboardingData.notifications}
                    onCheckedChange={(checked) => 
                      setOnboardingData(prev => ({ ...prev, notifications: checked as boolean }))
                    }
                  />
                  <Label htmlFor="notifications" className="text-sm">
                    Send me notifications about game updates and team invitations
                  </Label>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your profile has been created. You can now explore sports, join teams, and start playing!
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Next steps:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Browse available teams in your interested sports</li>
                    <li>• Join teams or create your own</li>
                    <li>• Check the schedule for upcoming games</li>
                    <li>• Complete your profile for better team matches</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                disabled={completeOnboardingMutation.isPending}
              >
                Skip for now
              </Button>
              
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={completeOnboardingMutation.isPending}
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < 5 ? (
                  <Button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={completeOnboardingMutation.isPending}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete}
                    disabled={completeOnboardingMutation.isPending}
                  >
                    {completeOnboardingMutation.isPending ? "Setting up..." : "Get Started"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

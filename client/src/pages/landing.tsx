import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Calendar, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Bell,
  Check,
  ArrowRight
} from "lucide-react";
import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { Link } from "wouter";

export default function Landing() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary">Intramural</h1>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isLoaded && isSignedIn ? (
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button>
                      Get Started
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              The modern alternative to
              <span className="block text-primary">IMleagues & DoSportsEasy</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Finally, an intramural management platform that students actually want to use. Native mobile apps, offline mode, and modern design that increases participation by 40%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoaded && isSignedIn ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Switch to Intramural
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignUpButton>
              )}
              <Button variant="outline" size="lg">
                See Migration Demo
              </Button>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              Join 200+ universities that have made the switch
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stop struggling with outdated platforms
            </h2>
            <p className="text-xl text-muted-foreground">
              See why universities are switching from legacy systems to Intramural
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
                  Old Platforms (IMleagues, DoSportsEasy, etc.)
                </h3>
                <ul className="space-y-3 text-red-800 dark:text-red-200">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    Students avoid using clunky, outdated interfaces
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    No mobile apps - only responsive web that breaks
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    Frequent downtime during peak usage
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    Manual scheduling takes hours
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    No offline mode - unusable with poor WiFi
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    Email notifications that get ignored
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                  Intramural Platform
                </h3>
                <ul className="space-y-3 text-green-800 dark:text-green-200">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Modern interface students love to use
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Native iOS & Android apps with offline mode
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    99.5% uptime with enterprise reliability
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Smart scheduling generates seasons in minutes
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Works perfectly even with spotty campus WiFi
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Push notifications students actually see
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Teams Are Switching Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why teams are switching to Intramural
            </h2>
            <p className="text-xl text-muted-foreground">
              The features that make all the difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Modern Design</h3>
                <p className="text-muted-foreground">
                  Students prefer apps that look like Instagram, not 2010. Our modern interface increases engagement by 40%.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">True Mobile Experience</h3>
                <p className="text-muted-foreground">
                  Native iOS & Android apps, not just responsive web. Download from App Store and Google Play.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Offline Capabilities</h3>
                <p className="text-muted-foreground">
                  Works even when campus WiFi doesn't. Students can check scores and enter results offline.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Real-time Updates</h3>
                <p className="text-muted-foreground">
                  Push notifications students actually see, not email chains. Instant updates about games and schedules.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Better Reliability</h3>
                <p className="text-muted-foreground">
                  99.5% uptime vs. constant outages. Enterprise-grade infrastructure that scales with your program.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Easier Admin</h3>
                <p className="text-muted-foreground">
                  Set up a season in 10 minutes, not hours. Smart scheduling with automatic conflict detection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How we compare to the competition
            </h2>
            <p className="text-xl text-muted-foreground">
              See why universities are choosing Intramural over legacy platforms
            </p>
          </div>
          
          <div className="bg-background rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">IMleagues</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">RecSports</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">DoSportsEasy</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Fusion Play</th>
                    <th className="text-center p-4 font-semibold text-primary bg-primary/10">Intramural</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  <tr>
                    <td className="p-4 font-medium text-foreground">Native Mobile App</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Offline Mode</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Modern UI</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Push Notifications</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Smart Scheduling</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">99.5% Uptime</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-red-500">❌</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Real-time Score Updates</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Integrated Payments</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-yellow-500">⚠️</td>
                    <td className="text-center p-4 text-green-500 bg-green-50 dark:bg-green-900/20">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Ready to upgrade your intramural program?
            </p>
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Your Free Trial
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by 200+ universities nationwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what happens when universities switch to Intramural
            </p>
          </div>
          
          {/* University Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 opacity-60">
            <div className="flex items-center justify-center">
              <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">University A</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">University B</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">University C</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">University D</span>
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Recreation Director</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  "Switching from IMleagues was the best decision we made. Student participation increased by 45% in our first semester."
                </p>
                <div className="text-sm text-primary font-medium">State University</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Mike Chen</h4>
                    <p className="text-sm text-muted-foreground">Intramural Coordinator</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  "The mobile app is a game-changer. Students actually use it, and we've cut our support tickets by 60%."
                </p>
                <div className="text-sm text-primary font-medium">Tech University</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Lisa Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Campus Recreation Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  "Migration was seamless. We were up and running in under a week, and the scheduling time savings are incredible."
                </p>
                <div className="text-sm text-primary font-medium">Community College</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Migration Stats */}
          <div className="bg-primary/5 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">200+</div>
                <p className="text-muted-foreground">Universities Switched</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">40%</div>
                <p className="text-muted-foreground">Avg. Participation Increase</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50%</div>
                <p className="text-muted-foreground">Less Admin Time</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">≤5%</div>
                <p className="text-muted-foreground">Forfeit Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple pricing for universities of all sizes
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, then pay based on your active teams - no per-student fees
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Small Campus</h3>
                <div className="text-4xl font-bold text-primary mb-4">Free</div>
                <p className="text-sm text-muted-foreground mb-6">Perfect for community colleges</p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Up to 50 active teams
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Native mobile apps
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Smart scheduling
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Offline mode
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Push notifications
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Start Free
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Large University</h3>
                <div className="text-4xl font-bold text-primary mb-4">
                  $99<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">For major universities with 200+ teams</p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited teams & sports
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Advanced analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Integrated payment processing
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    White-glove migration
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Switch from IMleagues
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-primary mb-4">Custom</div>
                <p className="text-sm text-muted-foreground mb-6">Multi-campus systems & custom needs</p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Multi-campus management
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    SSO integration (SAML)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Custom branding
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    API access
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Dedicated success manager
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-16 text-center">
            <div className="bg-primary/5 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Migration from any platform included
              </h3>
              <p className="text-muted-foreground">
                Whether you're coming from IMleagues, DoSportsEasy, Fusion Play, or any other platform, 
                we'll handle the complete migration at no extra cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Migration Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Switch in under 2 weeks
            </h2>
            <p className="text-xl text-muted-foreground">
              Our migration team makes switching from your current platform painless
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Data Import</h3>
              <p className="text-muted-foreground">
                Import your existing teams, schedules, and user data in one click
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">White-glove Setup</h3>
              <p className="text-muted-foreground">
                Our team handles configuration and customization for your university
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Parallel Testing</h3>
              <p className="text-muted-foreground">
                Run both systems during transition to ensure everything works perfectly
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Go Live</h3>
              <p className="text-muted-foreground">
                Launch with confidence knowing your data is safe and users are trained
              </p>
            </div>
          </div>
          
          <div className="bg-background rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  What's included in migration:
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    Complete data migration from any platform
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    Custom branding and university configuration
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    Staff training and onboarding sessions
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    Student communication and rollout plan
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    Dedicated support during transition
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    30-day post-launch support guarantee
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  "The migration from DoSportsEasy was incredibly smooth. 
                  The Intramural team handled everything and our students 
                  love the new platform."
                </h4>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">David Park</p>
                    <p className="text-sm text-muted-foreground">Recreation Director, Metro University</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">
              Ready to make the switch? Let's talk about your migration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Schedule Migration Call
              </Button>
              <Button variant="outline" size="lg">
                View Migration Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Intramural</h3>
            <p className="text-muted-foreground">
              Modern intramural sports management for universities
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

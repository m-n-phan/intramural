import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import { ClerkProvider, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function AppContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && isSignedIn && location === "/") {
      setLocation("/dashboard");
    }
  }, [isLoaded, isSignedIn, location, setLocation]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/">
        <SignedOut>
          <Landing />
        </SignedOut>
        <SignedIn>
          <Dashboard />
        </SignedIn>
      </Route>
      <Route path="/dashboard">
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <Landing />
        </SignedOut>
      </Route>
      <Route path="/checkout">
        <SignedIn>
          <Checkout />
        </SignedIn>
        <SignedOut>
          <Landing />
        </SignedOut>
      </Route>
      <Route path="/onboarding">
        <SignedIn>
          <Onboarding />
        </SignedIn>
        <SignedOut>
          <Landing />
        </SignedOut>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignInUrl="/dashboard" afterSignUpUrl="/onboarding">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;

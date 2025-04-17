import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import WebDashboard from "@/pages/web-dashboard";
import Venues from "@/pages/venues";
import Employees from "@/pages/employees";
import Schedule from "@/pages/schedule";
import TimeTracking from "@/pages/time-tracking";
import Messages from "@/pages/messages";
import TillVerification from "@/pages/till-verification";
import AddOns from "@/pages/add-ons";
import AuthPage from "@/pages/auth-page";
import DemoPage from "@/pages/demo-page";
import MobileDemo from "@/pages/mobile-demo";
import DemoDashboard from "@/pages/demo-dashboard";
import AuthDemo from "@/pages/auth-demo";
import VenuesDemo from "@/pages/venues-demo";
import EmployeesDemo from "@/pages/employees-demo";
import ScheduleDemo from "@/pages/schedule-demo";
import WebInterfaceDemo from "@/pages/web-interface-demo";
import RouteChecker from "@/pages/route-checker";
import { ThemeProvider } from "@/hooks/use-theme";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mobile optimizations
import { MobileOptimizationsProvider } from "@/components/mobile-optimizations-provider";

function Router() {
  const { isDesktop, isFirstRender } = useDeviceDetection();
  const [, navigate] = useLocation();
  const [shouldUseWebInterface, setShouldUseWebInterface] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Load user preference from local storage
    const storedPreference = localStorage.getItem("useWebInterface");
    const initialPreference = storedPreference ? JSON.parse(storedPreference) : isDesktop;
    setShouldUseWebInterface(initialPreference);
  }, [isDesktop]);
  
  // If user directly accesses /web, set preference accordingly
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/web')) {
      setShouldUseWebInterface(true);
      localStorage.setItem("useWebInterface", JSON.stringify(true));
    }
  }, []);
  
  // Skip rendering until we have determined the interface preference
  if (isFirstRender || shouldUseWebInterface === null) {
    return null;
  }

  return (
    <Switch>
      {/* Route Checker - Add this to test all routes */}
      <Route path="/route-checker" component={RouteChecker} />
      
      {/* Demo Routes (no authentication required) */}
      <Route path="/demo-dashboard" component={DemoDashboard} />
      <Route path="/mobile-demo" component={MobileDemo} />
      <Route path="/auth-demo" component={AuthDemo} />
      <Route path="/venues-demo" component={VenuesDemo} />
      <Route path="/employees-demo" component={EmployeesDemo} />
      <Route path="/schedule-demo" component={ScheduleDemo} />
      <Route path="/web-interface-demo" component={WebInterfaceDemo} />
      <ProtectedRoute path="/web/demo" component={DemoPage} allowDemo={true} />
      
      {/* Web Interface Routes */}
      <ProtectedRoute path="/web" component={WebDashboard} />
      <ProtectedRoute path="/web/venues" component={Venues} />
      <ProtectedRoute path="/web/employees" component={Employees} />
      <ProtectedRoute path="/web/schedule" component={Schedule} />
      <ProtectedRoute path="/web/timetracking" component={TimeTracking} />
      <ProtectedRoute path="/web/messages" component={Messages} />
      <ProtectedRoute path="/web/till-verification" component={TillVerification} />
      <ProtectedRoute path="/web/add-ons" component={AddOns} allowDemo={true} />
      
      {/* Standard Routes */}
      <Route path="/" component={DemoDashboard} />
      <ProtectedRoute path="/venues" component={Venues} />
      <ProtectedRoute path="/employees" component={Employees} />
      <ProtectedRoute path="/schedule" component={Schedule} />
      <ProtectedRoute path="/timetracking" component={TimeTracking} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/till-verification" component={TillVerification} />
      <ProtectedRoute path="/add-ons" component={AddOns} allowDemo={true} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MobileOptimizationsProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </MobileOptimizationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

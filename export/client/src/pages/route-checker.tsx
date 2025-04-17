
import React from 'react';
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function RouteChecker() {
  const [location] = useLocation();
  const [visitedRoutes, setVisitedRoutes] = React.useState<Record<string, boolean>>({});

  const routes = [
    { path: "/", name: "Home (Demo Dashboard)" },
    { path: "/demo-dashboard", name: "Demo Dashboard" },
    { path: "/mobile-demo", name: "Mobile Demo" },
    { path: "/auth-demo", name: "Auth Demo" },
    { path: "/venues-demo", name: "Venues Demo" },
    { path: "/employees-demo", name: "Employees Demo" },
    { path: "/schedule-demo", name: "Schedule Demo" },
    { path: "/web-interface-demo", name: "Web Interface Demo" },
    { path: "/web/demo", name: "Web Demo" },
    { path: "/web", name: "Web Dashboard" },
    { path: "/web/venues", name: "Web Venues" },
    { path: "/web/employees", name: "Web Employees" },
    { path: "/web/schedule", name: "Web Schedule" },
    { path: "/web/timetracking", name: "Web Time Tracking" },
    { path: "/web/messages", name: "Web Messages" },
    { path: "/web/till-verification", name: "Web Till Verification" },
    { path: "/web/add-ons", name: "Web Add-ons" },
    { path: "/venues", name: "Venues" },
    { path: "/employees", name: "Employees" },
    { path: "/schedule", name: "Schedule" },
    { path: "/timetracking", name: "Time Tracking" },
    { path: "/messages", name: "Messages" },
    { path: "/till-verification", name: "Till Verification" },
    { path: "/add-ons", name: "Add-ons" },
    { path: "/auth", name: "Auth Page" }
  ];

  const markRouteVisited = (path: string) => {
    setVisitedRoutes(prev => ({ ...prev, [path]: true }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Route Checker</CardTitle>
          <CardDescription>Verify all routes in the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm mb-4">
            Current location: <code className="bg-muted px-2 py-1 rounded">{location}</code>
          </div>
          
          <div className="grid gap-4">
            {routes.map((route) => (
              <div 
                key={route.path}
                className="flex items-center justify-between border p-3 rounded-md"
              >
                <div className="flex items-center">
                  {visitedRoutes[route.path] ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <div className="h-5 w-5 mr-2" />
                  )}
                  <span>{route.name}</span>
                  <code className="ml-2 text-xs text-muted-foreground">{route.path}</code>
                </div>
                <Link href={route.path}>
                  <Button 
                    size="sm" 
                    variant={visitedRoutes[route.path] ? "outline" : "default"}
                    onClick={() => markRouteVisited(route.path)}
                  >
                    Visit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

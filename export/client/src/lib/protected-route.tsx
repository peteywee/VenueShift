import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowDemo = false,
}: {
  path: string;
  component: () => React.JSX.Element;
  allowDemo?: boolean;
}) {
  const { user, isLoading } = useAuth();
  
  // Check if we're in demo mode
  const isDemoPath = path.includes('/demo');

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Either allow demo paths or require authentication
  if (!user && !isDemoPath && !allowDemo) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

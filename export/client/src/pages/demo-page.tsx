import { WebLayout } from "@/components/layout/web-layout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DemoDashboard } from "@/components/demo/demo-dashboard";

export default function DemoPage() {
  const [, navigate] = useLocation();
  
  return (
    <WebLayout showBackupBanner={false}>
      <div className="space-y-6">
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            You are viewing the application in demo mode. In a production environment, 
            this view would require authentication.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6">
          {/* Demo Dashboard with all features */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <DemoDashboard />
          </div>
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Staff Management Dashboard</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              This is a demonstration of the staff management system for non-profit organizations.
              Navigate through the sidebar to explore all the different features and options available.
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Use the tabs above to explore different sections of the application including pay information,
              scheduling, messaging, and till verification features.
            </p>
            
            <h3 className="text-xl font-bold mt-6 mb-3">Features Included in This Demo:</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Full access to the web and mobile interfaces</li>
              <li>Staff management with employee profiles</li>
              <li>Venue tracking and management</li>
              <li>Shift scheduling with calendar integration</li>
              <li>Time tracking with clock-in/out functionality</li>
              <li>In-app messaging for team communication</li>
              <li>End-of-night till verification system</li>
              <li>Pay information tracking and reporting</li>
              <li>Role-based access control (RBAC) for different permission levels</li>
              <li>Dark/light mode toggle for interface customization</li>
            </ul>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="default" onClick={() => navigate("/auth")}>
                Return to Login
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">Demo User Information</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              You are currently logged in as:
            </p>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md mb-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Username:</div>
                <div className="col-span-2">demo_admin</div>
                
                <div className="font-medium">Role:</div>
                <div className="col-span-2">Administrator</div>
                
                <div className="font-medium">Access Level:</div>
                <div className="col-span-2">Full system access</div>
              </div>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 text-sm italic">
              Note: No data is actually saved or modified while in demo mode.
            </p>
          </div>
        </div>
      </div>
    </WebLayout>
  );
}
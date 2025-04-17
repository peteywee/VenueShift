import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface InterfaceToggleProps {
  className?: string;
  currentInterface: "web" | "mobile";
}

export function InterfaceToggle({ className, currentInterface }: InterfaceToggleProps) {
  const isWeb = currentInterface === "web";
  
  const handleInterfaceChange = (newInterface: "web" | "mobile") => {
    localStorage.setItem("useWebInterface", JSON.stringify(newInterface === "web"));
    window.location.reload();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("flex items-center gap-1", className)}
        >
          {isWeb ? (
            <>
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Web</span>
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleInterfaceChange("web")} 
          className={cn("flex items-center gap-2", isWeb && "bg-primary/10")}
        >
          <Monitor className="h-4 w-4" />
          <span>Web Interface</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleInterfaceChange("mobile")} 
          className={cn("flex items-center gap-2", !isWeb && "bg-primary/10")}
        >
          <Smartphone className="h-4 w-4" />
          <span>Mobile Interface</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
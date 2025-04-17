import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: "up" | "down" | "neutral";
    text: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  progress?: {
    value: number;
    total: number;
  };
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
  progress,
}: StatsCardProps) {
  return (
    <Card className="border border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
            <p className="text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">{value}</p>
          </div>
          <div className={cn("rounded-full bg-opacity-10 dark:bg-opacity-20 p-2", iconColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
        
        {change && (
          <div className="flex items-center mt-4">
            {change.trend !== "neutral" && (
              <span 
                className={cn(
                  "flex items-center text-sm font-medium",
                  change.trend === "up" ? "text-green-500" : "text-red-500"
                )}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={
                      change.trend === "up" 
                        ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                        : "M19 14l-7 7m0 0l-7-7m7 7V3"
                    } 
                  />
                </svg>
                {change.value}
              </span>
            )}
            <span className="text-neutral-600 dark:text-neutral-400 text-sm ml-2">{change.text}</span>
          </div>
        )}
        
        {progress && (
          <div className="flex items-center mt-4">
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(progress.value / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

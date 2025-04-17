import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, DollarSign, Download, TrendingUp } from "lucide-react";

export function PayInformation() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  
  // Dummy pay data for demo
  const currentPeriodData = {
    startDate: "Apr 1, 2025",
    endDate: "Apr 15, 2025",
    status: "In Progress",
    hoursWorked: 37.5,
    expectedHours: 80,
    hourlyRate: 18.50,
    earnings: 693.75,
    projectedEarnings: 1480.00,
    payDate: "Apr 22, 2025",
    breakdown: [
      { date: "Apr 1, 2025", hours: 7.5, venue: "Downtown Center", rate: 18.50 },
      { date: "Apr 3, 2025", hours: 8.0, venue: "Downtown Center", rate: 18.50 },
      { date: "Apr 5, 2025", hours: 5.0, venue: "West Side Location", rate: 18.50 },
      { date: "Apr 7, 2025", hours: 8.5, venue: "Downtown Center", rate: 18.50 },
      { date: "Apr 9, 2025", hours: 8.5, venue: "East Branch", rate: 18.50 },
    ]
  };
  
  const previousPeriodData = {
    startDate: "Mar 16, 2025",
    endDate: "Mar 31, 2025",
    status: "Paid",
    hoursWorked: 76.5,
    expectedHours: 80,
    hourlyRate: 18.50,
    earnings: 1415.25,
    projectedEarnings: 1480.00,
    payDate: "Apr 8, 2025",
    breakdown: [
      { date: "Mar 16, 2025", hours: 7.5, venue: "Downtown Center", rate: 18.50 },
      { date: "Mar 18, 2025", hours: 8.0, venue: "Downtown Center", rate: 18.50 },
      { date: "Mar 20, 2025", hours: 5.0, venue: "West Side Location", rate: 18.50 },
      { date: "Mar 22, 2025", hours: 8.5, venue: "Downtown Center", rate: 18.50 },
      { date: "Mar 24, 2025", hours: 8.5, venue: "East Branch", rate: 18.50 },
      { date: "Mar 26, 2025", hours: 7.0, venue: "Downtown Center", rate: 18.50 },
      { date: "Mar 28, 2025", hours: 8.0, venue: "West Side Location", rate: 18.50 },
      { date: "Mar 30, 2025", hours: 8.0, venue: "Downtown Center", rate: 18.50 },
      { date: "Mar 31, 2025", hours: 8.0, venue: "East Branch", rate: 18.50 },
    ]
  };
  
  const activeData = selectedPeriod === "current" ? currentPeriodData : previousPeriodData;
  const percentComplete = (activeData.hoursWorked / activeData.expectedHours) * 100;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Pay Information
            </CardTitle>
            <CardDescription>
              Track your hours and earnings
            </CardDescription>
          </div>
          <div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="previous">Previous Period</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Pay Period</p>
              <p className="font-medium">{activeData.startDate} - {activeData.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeData.status === "Paid" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}>
                {activeData.status}
              </span>
            </div>
            {activeData.status === "Paid" && (
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Paid On</p>
                <p className="font-medium">{activeData.payDate}</p>
              </div>
            )}
            {activeData.status === "In Progress" && (
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Expected Payment</p>
                <p className="font-medium">{activeData.payDate}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm text-neutral-500 dark:text-neutral-400">Hours Worked</Label>
              <span className="text-sm font-medium">
                {activeData.hoursWorked} / {activeData.expectedHours} hrs
              </span>
            </div>
            <Progress value={percentComplete} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Hourly Rate</p>
              <p className="text-xl font-semibold">${activeData.hourlyRate.toFixed(2)}</p>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                {activeData.status === "Paid" ? "Total Earned" : "Current Earnings"}
              </p>
              <p className="text-xl font-semibold">${activeData.earnings.toFixed(2)}</p>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                {activeData.status === "Paid" ? "Expected Earnings" : "Projected Total"}
              </p>
              <p className="text-xl font-semibold">${activeData.projectedEarnings.toFixed(2)}</p>
            </div>
          </div>
          
          <Tabs defaultValue="breakdown" className="mt-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="breakdown">Hour Breakdown</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            <TabsContent value="breakdown" className="mt-4">
              <div className="rounded-md border">
                <div className="bg-neutral-50 dark:bg-neutral-900 p-3 border-b flex justify-between font-medium text-sm">
                  <div className="w-1/4">Date</div>
                  <div className="w-1/4">Hours</div>
                  <div className="w-1/4">Location</div>
                  <div className="w-1/4 text-right">Amount</div>
                </div>
                <div className="divide-y">
                  {activeData.breakdown.map((entry, index) => (
                    <div key={index} className="p-3 flex justify-between text-sm">
                      <div className="w-1/4">{entry.date}</div>
                      <div className="w-1/4">{entry.hours}</div>
                      <div className="w-1/4">{entry.venue}</div>
                      <div className="w-1/4 text-right">${(entry.hours * entry.rate).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <div className="rounded-md border">
                <div className="bg-neutral-50 dark:bg-neutral-900 p-3 border-b flex justify-between font-medium text-sm">
                  <div className="w-2/5">Period</div>
                  <div className="w-1/5">Hours</div>
                  <div className="w-1/5">Amount</div>
                  <div className="w-1/5 text-right">Status</div>
                </div>
                <div className="divide-y">
                  <div className="p-3 flex justify-between text-sm">
                    <div className="w-2/5">Mar 16 - Mar 31, 2025</div>
                    <div className="w-1/5">76.5</div>
                    <div className="w-1/5">$1,415.25</div>
                    <div className="w-1/5 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Paid
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex justify-between text-sm">
                    <div className="w-2/5">Mar 1 - Mar 15, 2025</div>
                    <div className="w-1/5">80.0</div>
                    <div className="w-1/5">$1,480.00</div>
                    <div className="w-1/5 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Paid
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex justify-between text-sm">
                    <div className="w-2/5">Feb 16 - Feb 28, 2025</div>
                    <div className="w-1/5">68.0</div>
                    <div className="w-1/5">$1,258.00</div>
                    <div className="w-1/5 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download Pay Stub
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
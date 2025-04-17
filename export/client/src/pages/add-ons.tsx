import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, MessageSquare, FileText, Clock, Bell, 
  LucideIcon, Smartphone, CreditCard, Calendar, 
  Users, Headphones, ShieldCheck, Verified
} from "lucide-react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  status: "available" | "coming-soon";
}

function IntegrationCard({ title, description, icon: Icon, tags, status }: IntegrationCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant={status === "available" ? "default" : "outline"}>
            {status === "available" ? "Available" : "Coming Soon"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm min-h-[60px]">{description}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {status === "available" ? "Learn More" : "Get Notified"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AddOnsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const integrations: Array<IntegrationCardProps & { category: string }> = [
    {
      title: "Geolocation & Geofencing",
      description: "Automatically track clock-ins with location verification and set up virtual boundaries for venues.",
      icon: MapPin,
      tags: ["GPS", "Location", "Clock-in Verification"],
      status: "available" as const,
      category: "core"
    },
    {
      title: "SMS Notifications",
      description: "Send shift reminders and emergency alerts directly to staff via text message.",
      icon: MessageSquare,
      tags: ["Communication", "Alerts", "Mobile"],
      status: "available" as const,
      category: "communication"
    },
    {
      title: "Payroll Export",
      description: "Integrate with popular payroll systems to automatically export timesheet data.",
      icon: FileText,
      tags: ["Accounting", "Automation", "Reports"],
      status: "available" as const,
      category: "finance"
    },
    {
      title: "Advanced Scheduling",
      description: "AI-powered shift scheduling that considers availability, skills, and venue needs.",
      icon: Clock,
      tags: ["AI", "Optimization", "Planning"],
      status: "coming-soon",
      category: "core"
    },
    {
      title: "Push Notifications",
      description: "Real-time alerts for shift changes, urgent announcements, and schedule updates.",
      icon: Bell,
      tags: ["Mobile", "Alerts", "Communication"],
      status: "available",
      category: "communication"
    },
    {
      title: "Mobile App",
      description: "Native iOS and Android apps for on-the-go management and simplified clock-in.",
      icon: Smartphone,
      tags: ["Mobile", "iOS", "Android"],
      status: "coming-soon",
      category: "core"
    },
    {
      title: "Payment Processing",
      description: "Handle tip distribution, expense reimbursements, and advance payments.",
      icon: CreditCard,
      tags: ["Finance", "Payments", "Tips"],
      status: "coming-soon",
      category: "finance"
    },
    {
      title: "Calendar Integration",
      description: "Sync with Google Calendar, Outlook, and Apple Calendar for seamless scheduling.",
      icon: Calendar,
      tags: ["Google", "Microsoft", "Apple"],
      status: "available",
      category: "core"
    },
    {
      title: "Staff Training",
      description: "Assign, track, and verify completion of required training modules and certifications.",
      icon: Users,
      tags: ["Compliance", "Training", "Onboarding"],
      status: "coming-soon",
      category: "management"
    },
    {
      title: "Virtual Call Center",
      description: "In-app calling without sharing personal phone numbers for confidential communication.",
      icon: Headphones,
      tags: ["Privacy", "Communication", "VoIP"],
      status: "available",
      category: "communication"
    },
    {
      title: "Advanced Security",
      description: "Multi-factor authentication, role-based permissions, and detailed audit logs.",
      icon: ShieldCheck,
      tags: ["Security", "Compliance", "Audit"],
      status: "available",
      category: "management"
    },
    {
      title: "Identity Verification",
      description: "Verify staff identity with document scanning and biometric authentication.",
      icon: Verified,
      tags: ["Security", "Compliance", "Onboarding"],
      status: "coming-soon",
      category: "management"
    }
  ];

  // Apply 'as const' to all status values to fix TypeScript errors
  integrations.forEach(integration => {
    if (integration.status === "available" || integration.status === "coming-soon") {
      integration.status = integration.status as "available" | "coming-soon";
    }
  });

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(integration => integration.category === activeTab);

  return (
    <div className="container py-6">
      <PageHeader className="pb-6">
        <PageHeaderHeading>Integration Add-ons</PageHeaderHeading>
        <PageHeaderDescription>
          Enhance your staff management platform with powerful integrations
        </PageHeaderDescription>
      </PageHeader>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Add-ons</TabsTrigger>
          <TabsTrigger value="core">Core Features</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, index) => (
              <IntegrationCard key={index} {...integration} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 bg-primary/5 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-3">Custom Integrations</h2>
        <p className="text-muted-foreground mb-6">
          Need a specific integration not listed here? Our development team can create custom
          solutions tailored to your organization's unique requirements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="sm:w-auto">Request Custom Integration</Button>
          <Button variant="outline">Schedule Consultation</Button>
        </div>
      </div>
    </div>
  );
}
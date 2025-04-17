import React from 'react';
import { WebLayout } from '@/components/web-interface/layout';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  MousePointer, 
  Columns, 
  PanelLeft, 
  PanelRight, 
  BarChart3, 
  Smartphone, 
  ArrowRight,
  Share2 
} from 'lucide-react';
import { Link } from 'wouter';

export default function WebInterfaceDemo() {
  return (
    <WebLayout>
      <PageHeader>
        <PageHeaderHeading>Web Interface Demo</PageHeaderHeading>
        <PageHeaderDescription>
          Explore the desktop-optimized interface with expanded features and visualizations
        </PageHeaderDescription>
      </PageHeader>

      <Tabs defaultValue="features" className="mt-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="comparison">Interface Comparison</TabsTrigger>
          <TabsTrigger value="switching">Switching Between Interfaces</TabsTrigger>
        </TabsList>
        
        {/* Features Tab */}
        <TabsContent value="features">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Web Interface Benefits
                </CardTitle>
                <CardDescription>
                  Optimized for large screens with enhanced navigation and visualization capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <PanelLeft className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Sidebar Navigation</h3>
                        <p className="text-sm text-muted-foreground">
                          Persistent sidebar menu for quick access to all features
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <Columns className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Multi-Column Layout</h3>
                        <p className="text-sm text-muted-foreground">
                          View more information at once with efficient space usage
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <MousePointer className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Mouse & Keyboard Controls</h3>
                        <p className="text-sm text-muted-foreground">
                          Optimized for desktop input methods with shortcuts
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Advanced Data Visualization</h3>
                        <p className="text-sm text-muted-foreground">
                          Detailed charts, graphs and reports for better insights
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <PanelRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Contextual Side Panels</h3>
                        <p className="text-sm text-muted-foreground">
                          View related information alongside main content
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <Share2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Data Export & Sharing</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate reports and share data more easily
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Still Need Mobile?
                </CardTitle>
                <CardDescription>
                  You can easily switch back to the mobile interface at any time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  The mobile interface provides a touch-optimized experience perfect for:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>On-the-go management</li>
                  <li>Quick shift check-ins</li>
                  <li>Venue staff using smartphones</li>
                  <li>Emergency access when away from computer</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2" onClick={() => {
                  localStorage.setItem("useWebInterface", JSON.stringify(false));
                  window.location.reload();
                }}>
                  <Smartphone className="h-4 w-4" />
                  <span>Switch to Mobile Interface</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Interface Comparison</CardTitle>
                <CardDescription>
                  Understand the differences between mobile and web interfaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Mobile Interface</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Monitor className="h-4 w-4" />
                            <span>Web Interface</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Navigation</td>
                        <td className="py-3 px-4 text-center">Bottom tabs + Cards</td>
                        <td className="py-3 px-4 text-center">Sidebar + Header</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Layout</td>
                        <td className="py-3 px-4 text-center">Single column</td>
                        <td className="py-3 px-4 text-center">Multi-column</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Data Visualization</td>
                        <td className="py-3 px-4 text-center">Basic</td>
                        <td className="py-3 px-4 text-center">Advanced</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Input Method</td>
                        <td className="py-3 px-4 text-center">Touch-optimized</td>
                        <td className="py-3 px-4 text-center">Mouse & Keyboard</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Camera Access</td>
                        <td className="py-3 px-4 text-center">Native</td>
                        <td className="py-3 px-4 text-center">Limited</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Offline Support</td>
                        <td className="py-3 px-4 text-center">Enhanced</td>
                        <td className="py-3 px-4 text-center">Basic</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Data Entry</td>
                        <td className="py-3 px-4 text-center">Simplified</td>
                        <td className="py-3 px-4 text-center">Comprehensive</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Best For</td>
                        <td className="py-3 px-4 text-center">On-the-go management</td>
                        <td className="py-3 px-4 text-center">Office/admin work</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Switching Tab */}
        <TabsContent value="switching">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Web to Mobile
                </CardTitle>
                <CardDescription>
                  How to switch from web interface to mobile interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Method 1: Interface Toggle</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the interface toggle in the top navigation bar to quickly switch interfaces.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Monitor className="h-4 w-4" />
                    <span className="text-sm">Web Interface</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                    <span className="text-xs text-muted-foreground mx-2">click to open menu, then select:</span>
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Mobile Interface</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Method 2: Dashboard Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the "Switch to Mobile Interface" card on the web dashboard page.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2" onClick={() => {
                  localStorage.setItem("useWebInterface", JSON.stringify(false));
                  window.location.reload();
                }}>
                  <Smartphone className="h-4 w-4" />
                  <span>Switch to Mobile Now</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Mobile to Web
                </CardTitle>
                <CardDescription>
                  How to switch from mobile interface to web interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Method 1: Interface Toggle</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the interface toggle in the top right of the mobile header.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Mobile Interface</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                    <span className="text-xs text-muted-foreground mx-2">click to open menu, then select:</span>
                    <Monitor className="h-4 w-4" />
                    <span className="text-sm">Web Interface</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Method 2: Web Interface Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the prominent "Web Interface Available" card on the mobile dashboard.
                  </p>
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-4 w-4 text-primary" />
                      <span className="font-medium">Web Interface Available</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Need more screen space? Switch to web...</p>
                    <div className="bg-primary text-primary-foreground text-xs py-1 px-2 rounded text-center">
                      Use Web Interface
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full gap-2" asChild>
                  <Link href="/web">
                    <Monitor className="h-4 w-4" />
                    <span>Explore Web Dashboard</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-center">
        <Button variant="default" className="gap-2" asChild>
          <Link href="/demo-dashboard">
            Return to Demo Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </WebLayout>
  );
}

// Component for the ChevronDown icon
const ChevronDown = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
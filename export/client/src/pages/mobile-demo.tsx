import React, { useState } from 'react';
import { MobileProfileEditor } from '@/components/profile/mobile-profile-editor';
import { MobileImagePicker } from '@/components/mobile-image-picker';
import { MobileCameraAccess } from '@/components/mobile-camera-access';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Image, User, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: string;
}

export default function MobileDemo() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [demoImage, setDemoImage] = useState<string | null>(null);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Demo user profile
  const demoUser: DemoUser = {
    id: 1,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    profilePicture: ''
  };
  
  // Handle profile save
  const handleProfileSave = (profile: DemoUser) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    }, 1500);
  };
  
  return (
    <div className="container py-6 space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-2">Mobile Optimizations Demo</h1>
        <p className="text-muted-foreground">
          Explore mobile-optimized components with camera and photo access
        </p>
      </div>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profile">Profile Editor</TabsTrigger>
          <TabsTrigger value="gallery">Gallery Picker</TabsTrigger>
          <TabsTrigger value="camera">Camera Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <MobileProfileEditor 
            profile={demoUser}
            onSave={handleProfileSave}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Selection</CardTitle>
              <CardDescription>Select an image from your device</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="flex flex-col items-center gap-4">
                  <MobileImagePicker
                    onImageSelect={setDemoImage}
                    title="Select Image"
                    description="Choose from your gallery"
                    aspectRatio="square"
                    className="w-full max-w-[200px] aspect-square"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Square aspect ratio
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  {demoImage ? (
                    <div className="relative w-full max-w-[200px] aspect-square">
                      <img 
                        src={demoImage} 
                        alt="Selected" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => setDemoImage(null)}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center rounded-lg bg-muted">
                      <FileImage className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground text-center">
                    Selected image preview
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground max-w-md text-center">
                The image picker automatically resizes and optimizes your images for mobile upload, 
                reducing both file size and network usage.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Camera Access</CardTitle>
              <CardDescription>Take a photo using your device camera</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="flex flex-col items-center gap-4">
                  {cameraImage ? (
                    <Button 
                      variant="outline" 
                      className="mb-2"
                      onClick={() => setCameraImage(null)}
                    >
                      Clear Photo
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 mb-2"
                      onClick={() => {
                        const cameraComp = document.getElementById('camera-trigger');
                        if (cameraComp) {
                          (cameraComp as HTMLElement).click();
                        }
                      }}
                    >
                      <Camera className="h-4 w-4" />
                      Open Camera
                    </Button>
                  )}
                  
                  <div id="camera-trigger" className="hidden">
                    <MobileCameraAccess 
                      onImageCapture={setCameraImage}
                      title="Take Photo"
                      description="Use your camera to take a photo"
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Uses the device camera with permissions
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  {cameraImage ? (
                    <div className="relative w-full max-w-[200px] aspect-square">
                      <img 
                        src={cameraImage} 
                        alt="Captured" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center rounded-lg bg-muted">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground text-center">
                    Captured photo preview
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground max-w-md text-center">
                The camera access component supports both front and rear cameras, 
                handles permissions gracefully, and includes image processing capabilities.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Mobile Optimizations</h2>
        <ul className="space-y-2 ml-5 list-disc">
          <li>Safe area insets for modern mobile devices (notches & dynamic islands)</li>
          <li>Responsive touch-friendly controls for all interactions</li>
          <li>Optimized image processing to reduce bandwidth usage</li>
          <li>Graceful permission handling for camera access</li>
          <li>Offline-aware components that work without connectivity</li>
        </ul>
      </div>
    </div>
  );
}
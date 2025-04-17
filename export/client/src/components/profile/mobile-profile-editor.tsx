import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MobileImagePicker } from '@/components/mobile-image-picker';
import { User, PenSquare, ChevronRight, Phone, Mail, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: string;
}

interface MobileProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  isLoading?: boolean;
  className?: string;
}

export function MobileProfileEditor({
  profile,
  onSave,
  isLoading = false,
  className
}: MobileProfileEditorProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [profileImage, setProfileImage] = useState<string | null>(profile.profilePicture || null);
  const { toast } = useToast();

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageSelect = (imageData: string | null) => {
    setProfileImage(imageData);
    setFormData(prev => ({ ...prev, profilePicture: imageData || undefined }));
  };

  // Save the profile changes
  const saveProfile = () => {
    // Basic validation
    if (!formData.fullName.trim()) {
      toast({
        title: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }
    
    onSave(formData);
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="relative pb-0">
        <CardTitle className="text-xl">Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Profile image */}
        <div className="flex justify-center mb-6">
          <MobileImagePicker
            onImageSelect={handleImageSelect}
            initialImage={profileImage}
            aspectRatio="square"
            className="h-24 w-24 rounded-full"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 flex items-center justify-center bg-muted">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5">
                <Upload className="h-3.5 w-3.5" />
              </div>
            </div>
          </MobileImagePicker>
        </div>
        
        {/* Form fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your full name"
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <div className="relative">
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your phone number"
              />
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="pl-9"
                placeholder="Your role"
                readOnly
              />
              <PenSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <ChevronRight className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={saveProfile} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardFooter>
    </Card>
  );
}
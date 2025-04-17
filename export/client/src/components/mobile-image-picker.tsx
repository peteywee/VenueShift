import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageResult {
  file?: File;
  dataUrl: string;
}

interface MobileImagePickerProps {
  onImageSelect: (imageData: string | null) => void;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  title?: string;
  description?: string;
  className?: string;
  initialImage?: string | null;
  returnFormat?: 'data-url' | 'file' | 'both';
  children?: React.ReactNode;
  allowCamera?: boolean;
}

export function MobileImagePicker({
  onImageSelect,
  aspectRatio = 'square',
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.9,
  title = 'Upload Image',
  description = 'Take a photo or choose from your gallery',
  className,
  initialImage = null,
  returnFormat = 'data-url',
  children,
  allowCamera = true
}: MobileImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get dimensions based on aspect ratio
  const getDimensions = () => {
    switch (aspectRatio) {
      case 'portrait':
        return { width: maxWidth, height: maxWidth * (4/3) };
      case 'landscape':
        return { width: maxHeight * (16/9), height: maxHeight };
      case 'square':
      default:
        return { width: maxWidth, height: maxWidth };
    }
  };

  // Function to handle camera capture
  const handleCameraCapture = () => {
    // Check if device supports camera input and if camera access is allowed
    const hasCameraSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    if (hasCameraSupport && allowCamera) {
      // Create file input with camera capture
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.setAttribute('accept', 'image/*');
        fileInputRef.current.click();
      }
    } else {
      // Fallback to regular file picker if camera isn't available
      toast({
        title: 'Camera not available',
        description: 'Your device does not support camera access. Please select from gallery instead.',
        variant: 'destructive',
      });
      handleGallerySelect();
    }
  };

  // Function to handle gallery selection
  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.click();
    }
  };

  // Process the selected file
  const processFile = (file: File) => {
    setIsLoading(true);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Process the image to resize and compress it
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsLoading(false);
          return;
        }
        
        // Calculate dimensions
        const { width, height } = getDimensions();
        const scaleFactor = Math.min(width / img.width, height / img.height);
        const targetWidth = img.width * scaleFactor;
        const targetHeight = img.height * scaleFactor;
        
        // Set canvas size
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw image with proper orientation and scaling
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Get data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        setSelectedImage(dataUrl);
        
        // Return the image in the correct format
        if (returnFormat === 'data-url' || returnFormat === 'both') {
          // For data-url or both, we can immediately use the dataUrl
          onImageSelect(dataUrl);
        } else if (returnFormat === 'file') {
          // For file-only format, convert to file then pass through the string data
          fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
              // Create a new file but since our interface only supports string|null,
              // we convert back to dataUrl for compatibility
              new File([blob], file.name, { type: 'image/jpeg' });
              onImageSelect(dataUrl);
            });
        }
        
        setIsLoading(false);
        setIsOpen(false);
      };
    };
    
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Handle removing the image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    onImageSelect(null);
  };

  return (
    <>
      {/* Trigger element */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children ? (
            <div onClick={() => setIsOpen(true)}>{children}</div>
          ) : (
            <div className={cn("cursor-pointer relative", className)}>
              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className={cn(
                      "object-cover border rounded-lg",
                      aspectRatio === 'square' ? "aspect-square" : 
                      aspectRatio === 'portrait' ? "aspect-[3/4]" : 
                      "aspect-[16/9]",
                      className
                    )} 
                  />
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="absolute -top-2 -right-2 rounded-full h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 bg-muted/30 rounded-lg p-4",
                    aspectRatio === 'square' ? "aspect-square" : 
                    aspectRatio === 'portrait' ? "aspect-[3/4]" : 
                    "aspect-[16/9]",
                    className
                  )}
                >
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload Image</p>
                </div>
              )}
            </div>
          )}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {allowCamera && (
              <Button 
                variant="outline" 
                className="flex flex-col h-20 items-center justify-center gap-2"
                onClick={handleCameraCapture}
                disabled={isLoading}
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs">Camera</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="flex flex-col h-20 items-center justify-center gap-2"
              onClick={handleGallerySelect}
              disabled={isLoading}
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs">Gallery</span>
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept="image/*"
      />
    </>
  );
}
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
import { Camera, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCameraAccessProps {
  onImageCapture: (imageData: string | null) => void;
  title?: string;
  description?: string;
  quality?: number;
  children?: React.ReactNode;
}

export function MobileCameraAccess({
  onImageCapture,
  title = 'Take a photo',
  description = 'Use your camera to capture an image',
  quality = 0.9,
  children
}: MobileCameraAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // Initialize camera when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    if (open) {
      checkCameraAvailability();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
  };
  
  // Check if camera is available
  const checkCameraAvailability = async () => {
    try {
      setIsLoading(true);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: 'Camera not available',
          description: 'Your device or browser does not support camera access.',
          variant: 'destructive',
        });
        setIsCameraAvailable(false);
        setIsLoading(false);
        return;
      }
      
      // Try to access camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraAvailable(true);
      setIsCameraActive(true);
      
      // Stop test stream
      stream.getTracks().forEach(track => track.stop());
      
      // Start actual camera stream for use
      startCamera();
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraAvailable(false);
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to use this feature.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start camera with specified settings
  const startCamera = async () => {
    if (!videoRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Stop any existing stream
      stopCamera();
      
      // Get camera access
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setIsCameraAvailable(false);
      toast({
        title: 'Camera error',
        description: 'Failed to start camera. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stop active camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  // Toggle between front and back camera
  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    startCamera();
  };
  
  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setIsLoading(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      setCapturedImage(dataUrl);
      
      // Stop camera after capture
      stopCamera();
      setIsCameraActive(false);
    } catch (err) {
      console.error('Error capturing photo:', err);
      toast({
        title: 'Capture failed',
        description: 'Failed to capture photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save captured image
  const saveImage = () => {
    if (capturedImage) {
      onImageCapture(capturedImage);
      setIsOpen(false);
    }
  };
  
  // Clear captured image and restart camera
  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCameraActive(true);
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Open Camera</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="relative mt-2 aspect-video overflow-hidden rounded-lg bg-black">
          {/* Camera view */}
          {isCameraActive && isCameraAvailable && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          )}
          
          {/* Captured image view */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="h-full w-full object-cover"
            />
          )}
          
          {/* Canvas for capturing (hidden) */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          
          {/* Camera not available message */}
          {!isCameraAvailable && !isLoading && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
              <Camera className="mb-2 h-8 w-8" />
              <p className="text-center text-sm">Camera access is required</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={checkCameraAvailability}
              >
                Allow Camera Access
              </Button>
            </div>
          )}
        </div>
        
        {/* Camera controls */}
        {isCameraActive && isCameraAvailable && (
          <div className="mt-2 flex justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-12 rounded-full p-0"
              onClick={capturePhoto}
              disabled={isLoading}
            >
              <div className="h-6 w-6 rounded-full bg-primary" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleCamera}
              disabled={isLoading}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Captured image controls */}
        {capturedImage && (
          <div className="mt-2 flex justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={retakePhoto}
              disabled={isLoading}
            >
              Retake
            </Button>
            
            <Button
              size="sm"
              onClick={saveImage}
              disabled={isLoading}
            >
              Use Photo
            </Button>
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
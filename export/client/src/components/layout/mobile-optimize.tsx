import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeviceDetection } from "@/hooks/use-device-detection";

// Extended types for device detection
interface ScreenSize {
  width: number;
  height: number;
}

/**
 * Mobile Optimization Component
 * This component handles device-specific optimizations and features
 * - Optimizes render performance on mobile devices
 * - Handles touch events and gestures better
 * - Adjusts layouts based on device capabilities
 */
export function useMobileOptimization() {
  const isMobile = useIsMobile();
  const { isDesktop } = useDeviceDetection();
  
  // Define additional properties that we'll detect ourselves
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [deviceType, setDeviceType] = useState("unknown");
  const [screenSize, setScreenSize] = useState<ScreenSize>({ width: 0, height: 0 });
  const [hasNotch, setHasNotch] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isSamsung: false,
    hasBottomBar: false,
    browserType: "",
    devicePixelRatio: 1,
  });

  // Detect device type and features
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect iOS
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
      
      // Detect Android
      const isAndroid = /Android/.test(navigator.userAgent);
      
      // Detect Samsung
      const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
      
      // Detect browser type
      let browserType = "unknown";
      if (/CriOS/.test(navigator.userAgent)) browserType = "Chrome iOS";
      else if (/FxiOS/.test(navigator.userAgent)) browserType = "Firefox iOS";
      else if (/EdgiOS/.test(navigator.userAgent)) browserType = "Edge iOS";
      else if (/OPiOS/.test(navigator.userAgent)) browserType = "Opera iOS";
      else if (/Safari/.test(navigator.userAgent) && isIOS) browserType = "Safari";
      else if (/Chrome/.test(navigator.userAgent)) browserType = "Chrome";
      else if (/Firefox/.test(navigator.userAgent)) browserType = "Firefox";
      else if (/Edge/.test(navigator.userAgent)) browserType = "Edge";
      else if (/Opera/.test(navigator.userAgent)) browserType = "Opera";
      
      // Check for notch (iOS)
      const hasNotch = isIOS && 
                      ((screenSize.width === 375 && screenSize.height === 812) || // iPhone X, XS, 11 Pro
                       (screenSize.width === 414 && screenSize.height === 896) || // iPhone XR, XS Max, 11, 11 Pro Max
                       (screenSize.width === 390 && screenSize.height === 844) || // iPhone 12, 12 Pro, 13, 13 Pro
                       (screenSize.width === 428 && screenSize.height === 926) || // iPhone 12 Pro Max, 13 Pro Max
                       (screenSize.width === 430 && screenSize.height === 932) || // iPhone 14 Pro Max, 15 Pro Max
                       (screenSize.width === 393 && screenSize.height === 852)); // iPhone 14 Pro, 15 Pro
      
      // Has bottom navigation bar (Android)
      const hasBottomBar = isAndroid && 
                          document.documentElement.clientHeight < window.innerHeight;
      
      setHasNotch(hasNotch);
      setDeviceInfo({
        isIOS,
        isAndroid,
        isSamsung,
        hasBottomBar,
        browserType,
        devicePixelRatio: window.devicePixelRatio || 1
      });
    }
  }, [screenSize]);

  // Apply CSS variables for device-specific adjustments
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Set device-specific custom properties
      root.style.setProperty('--device-pixel-ratio', deviceInfo.devicePixelRatio.toString());
      root.style.setProperty('--safe-area-top', hasNotch ? '44px' : '0px');
      root.style.setProperty('--safe-area-bottom', deviceInfo.hasBottomBar ? '20px' : '0px');

      // Mobile optimization classes
      if (isMobile) {
        document.body.classList.add('mobile-device');
        if (deviceInfo.isIOS) document.body.classList.add('ios-device');
        if (deviceInfo.isAndroid) document.body.classList.add('android-device');
        if (deviceInfo.isSamsung) document.body.classList.add('samsung-device');
        if (hasNotch) document.body.classList.add('has-notch');
      } else {
        document.body.classList.remove(
          'mobile-device', 
          'ios-device', 
          'android-device', 
          'samsung-device',
          'has-notch'
        );
      }
    }
  }, [isMobile, hasNotch, deviceInfo]);

  // Return device information and optimization features
  return {
    isMobile,
    isDesktop,
    isTouchDevice,
    hasNotch,
    deviceType,
    screenSize,
    ...deviceInfo
  };
}

/**
 * MobileOptimizer Component - Applies mobile-specific optimizations to the app
 */
export function MobileOptimizer({ children }: { children: React.ReactNode }) {
  const { 
    isMobile, 
    isIOS, 
    isAndroid,
    devicePixelRatio
  } = useMobileOptimization();

  // Apply performance optimizations
  useEffect(() => {
    if (isMobile) {
      // Optimize scrolling - handle vendor prefixes with type safety
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      
      // Prevent pull-to-refresh on iOS
      document.body.style.overscrollBehavior = 'none';
      
      // Optimize for high pixel ratio devices (Samsung, iPhone Pro)
      if (devicePixelRatio > 2) {
        document.body.classList.add('high-dpi-device');
      }

      // Remove hover effects for better touch experience
      document.body.classList.add('no-hover-effects');
      
      // Safari-specific optimizations
      if (isIOS) {
        // Prevent elastic scrolling
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'auto';
        
        // Disable user selection - handle vendor prefixes with type safety
        (document.body.style as any).webkitUserSelect = 'none';
      }
      
      // Android-specific optimizations
      if (isAndroid) {
        // Use passive event listeners for better scroll performance
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
      }
    }
    
    return () => {
      // Clean up
      (document.body.style as any).webkitOverflowScrolling = '';
      document.body.style.overscrollBehavior = '';
      document.body.classList.remove('high-dpi-device', 'no-hover-effects');
      
      if (isIOS) {
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        (document.body.style as any).webkitUserSelect = '';
      }
    };
  }, [isMobile, isIOS, isAndroid, devicePixelRatio]);

  return <>{children}</>;
}
import { useState, useEffect } from 'react';

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check for mobile devices
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|phone/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // Determine device type based on screen width
      const width = window.innerWidth;
      const isMobileWidth = width < 768;
      const isTabletWidth = width >= 768 && width < 1024;
      const isDesktopWidth = width >= 1024;
      
      // Set state based on combined checks
      setIsMobile(isMobileDevice || isMobileWidth);
      setIsTablet(isTabletWidth);
      setIsDesktop(isDesktopWidth && !isMobileDevice);
      setIsFirstRender(false);
    };

    // Check on first render
    checkDevice();

    // Add event listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isFirstRender
  };
}
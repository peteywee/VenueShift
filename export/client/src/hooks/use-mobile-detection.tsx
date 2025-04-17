import { useState, useEffect } from 'react';

// More advanced mobile detection with specific device capabilities
export function useMobileDetection() {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTouchScreen, setIsTouchScreen] = useState(false);
  
  useEffect(() => {
    // Detect mobile/tablet/desktop
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    
    // Touch screen detection
    const hasTouchScreen = (
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
    setIsTouchScreen(hasTouchScreen);
    
    // Device detection
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobileUserAgent = isIOS || isAndroid || /mobile|blackberry|opera mini|opera mobi|webos/i.test(userAgent);
    
    // Size-based detection
    const isSmallScreen = width < 768;
    const isMediumScreen = width >= 768 && width < 1024;
    const isLargeScreen = width >= 1024;
    
    // Determine device type
    const isMobileDevice = isMobileUserAgent || isSmallScreen;
    const isTabletDevice = (
      !isMobileDevice && (isMediumScreen || 
      /tablet|ipad/.test(userAgent) || 
      (isAndroid && !userAgent.includes('mobile')))
    );
    const isDesktopDevice = !isMobileDevice && !isTabletDevice;
    
    // Set state
    setIsMobile(isMobileDevice);
    setIsTablet(isTabletDevice);
    setIsDesktop(isDesktopDevice);
    setIsIOS(isIOS);
    setIsAndroid(isAndroid);
    setIsFirstRender(false);
    
    // Add classes to body for CSS targeting
    document.body.classList.toggle('is-mobile', isMobileDevice);
    document.body.classList.toggle('is-tablet', isTabletDevice);
    document.body.classList.toggle('is-desktop', isDesktopDevice);
    document.body.classList.toggle('is-ios', isIOS);
    document.body.classList.toggle('is-android', isAndroid);
    document.body.classList.toggle('is-touch-device', hasTouchScreen);
    
    // Add CSS variables for viewport dimensions
    document.documentElement.style.setProperty('--viewport-width', `${width}px`);
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    
    // Handle orientation
    const detectOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      document.body.classList.toggle('is-portrait', isPortrait);
      document.body.classList.toggle('is-landscape', !isPortrait);
      document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
      document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    };
    
    detectOrientation();
    window.addEventListener('resize', detectOrientation);
    window.addEventListener('orientationchange', detectOrientation);
    
    return () => {
      window.removeEventListener('resize', detectOrientation);
      window.removeEventListener('orientationchange', detectOrientation);
    };
  }, []);
  
  return {
    isFirstRender,
    isDesktop,
    isMobile,
    isTablet,
    isIOS,
    isAndroid,
    isTouchScreen
  };
}
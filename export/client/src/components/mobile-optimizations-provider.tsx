import { ReactNode, useEffect } from 'react';
import { OfflineIndicator } from '@/components/offline-indicator';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

/**
 * Provider component that activates all mobile optimizations
 * This wraps the application and applies device detection and optimizations
 */
export function MobileOptimizationsProvider({ children }: { children: ReactNode }) {
  // Add viewport meta tag with safe-area support
  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (!isMobile) return;
    
    // Set up mobile-specific meta tags and styles
    const setupMobileMeta = () => {
      // Check if viewport meta tag exists
      let viewportTag = document.querySelector('meta[name="viewport"]');
      
      // If it doesn't exist, create it
      if (!viewportTag) {
        viewportTag = document.createElement('meta');
        viewportTag.setAttribute('name', 'viewport');
        document.head.appendChild(viewportTag);
      }
      
      // Set optimized viewport properties
      viewportTag.setAttribute('content', 
        'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, minimum-scale=1, maximum-scale=1'
      );
      
      // Add theme-color meta tag for browser UI
      const themeColorTag = document.createElement('meta');
      themeColorTag.setAttribute('name', 'theme-color');
      themeColorTag.setAttribute('content', '#000000');
      document.head.appendChild(themeColorTag);
      
      // Add apple-mobile-web-app-capable meta tag
      const webAppCapableTag = document.createElement('meta');
      webAppCapableTag.setAttribute('name', 'apple-mobile-web-app-capable');
      webAppCapableTag.setAttribute('content', 'yes');
      document.head.appendChild(webAppCapableTag);
      
      // Add apple-mobile-web-app-status-bar-style meta tag
      const statusBarTag = document.createElement('meta');
      statusBarTag.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      statusBarTag.setAttribute('content', 'black-translucent');
      document.head.appendChild(statusBarTag);
      
      // Add preload directives for key resources
      const preloadImages = document.createElement('link');
      preloadImages.setAttribute('rel', 'preload');
      preloadImages.setAttribute('as', 'image');
      preloadImages.setAttribute('href', '/assets/app-icon.png');
      document.head.appendChild(preloadImages);
      
      // Add touch-action CSS overrides
      const touchStyle = document.createElement('style');
      touchStyle.innerHTML = `
        /* Improve touch interactions */
        button, a, input[type=button], input[type=submit], .interactive {
          touch-action: manipulation;
        }
        
        /* Remove delayed tap highlight on mobile */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Optimize scrolling containers */
        .scroll-container, .overflow-auto, .overflow-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        /* Add notch support */
        .has-safe-area {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        /* CSS variables for safe area values */
        :root {
          --safe-area-top: env(safe-area-inset-top);
          --safe-area-bottom: env(safe-area-inset-bottom);
          --safe-area-left: env(safe-area-inset-left);
          --safe-area-right: env(safe-area-inset-right);
        }
      `;
      document.head.appendChild(touchStyle);
      
      // Add device detection CSS classes
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      document.body.classList.add('is-mobile');
      document.body.classList.toggle('is-ios', isIOS);
      document.body.classList.toggle('is-android', isAndroid);
      
      return {
        touchStyle,
        themeColorTag,
        webAppCapableTag,
        statusBarTag,
        preloadImages
      };
    };
    
    // Call the setup function
    const elements = setupMobileMeta();
    
    // Handle orientation changes
    const handleOrientationChange = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      document.body.classList.toggle('is-portrait', isPortrait);
      document.body.classList.toggle('is-landscape', !isPortrait);
    };
    
    // Initial orientation check
    handleOrientationChange();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Add device performance detection
    if (window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
      }
      
      const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)');
      if (prefersReducedData.matches) {
        document.body.classList.add('reduced-data');
      }
      
      // Simple low-end device detection
      if (
        ('connection' in navigator && 
         (navigator as any).connection.saveData) ||
        (!('deviceMemory' in navigator) || (navigator as any).deviceMemory < 2) ||
        (!('hardwareConcurrency' in navigator) || navigator.hardwareConcurrency < 4)
      ) {
        document.body.classList.add('low-end-device');
      }
    }
    
    return () => {
      // Clean up
      if (elements.touchStyle.parentNode) document.head.removeChild(elements.touchStyle);
      if (elements.preloadImages.parentNode) document.head.removeChild(elements.preloadImages);
      if (elements.statusBarTag.parentNode) document.head.removeChild(elements.statusBarTag);
      if (elements.webAppCapableTag.parentNode) document.head.removeChild(elements.webAppCapableTag);
      if (elements.themeColorTag.parentNode) document.head.removeChild(elements.themeColorTag);
      
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
  
  return (
    <>
      {children}
      <MobileNavigation />
      <OfflineIndicator />
    </>
  );
}
import { useEffect, useState } from 'react';
import { useIsMobile } from './use-mobile';

interface DeviceInfo {
  // Basic device type
  type: 'ios' | 'android' | 'unknown';
  
  // OS information
  os: {
    name: string;
    version: string;
    majorVersion: number;
  };
  
  // Device model
  model: {
    name: string;
    family: string;
    identifier: string;
  };
  
  // Special hardware features
  features: {
    hasNotch: boolean;
    hasDynamicIsland: boolean;
    hasPunchHole: boolean;
    hasFoldableScreen: boolean;
    hasLargeScreen: boolean;
    hasPen: boolean;
  };
  
  // Screen details
  screen: {
    width: number;
    height: number;
    dpr: number;
    pixelDensity: 'low' | 'medium' | 'high' | 'ultra';
    refreshRate: '60hz' | '90hz' | '120hz' | 'variable';
    aspectRatio: number;
  };
}

/**
 * Hook for device-specific optimizations
 * Detects exact device model when possible and applies optimizations
 * specifically tailored for that device's capabilities/limitations
 */
export function useDeviceSpecificOptimizations() {
  const isMobile = useIsMobile();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'unknown',
    os: { name: 'unknown', version: '0', majorVersion: 0 },
    model: { name: 'unknown', family: 'unknown', identifier: 'unknown' },
    features: {
      hasNotch: false,
      hasDynamicIsland: false,
      hasPunchHole: false,
      hasFoldableScreen: false,
      hasLargeScreen: false,
      hasPen: false
    },
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      pixelDensity: 'medium',
      refreshRate: '60hz',
      aspectRatio: window.innerWidth / window.innerHeight
    }
  });
  
  // One-time device detection
  useEffect(() => {
    if (!isMobile) return;
    
    const ua = navigator.userAgent;
    let type: 'ios' | 'android' | 'unknown' = 'unknown';
    let osName = 'unknown';
    let osVersion = '0';
    let majorVersion = 0;
    let deviceName = 'unknown';
    let deviceFamily = 'unknown';
    let deviceIdentifier = 'unknown';
    
    // Detect basic OS
    if (/iPhone|iPad|iPod/.test(ua)) {
      type = 'ios';
      osName = 'iOS';
      
      // Extract iOS version
      const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        osVersion = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
        majorVersion = parseInt(match[1], 10);
      }
      
      // Try to detect iPhone model
      if (/iPhone/.test(ua)) {
        deviceFamily = 'iPhone';
        
        // Screen size based detection for newer iPhones that don't expose model
        const { width, height } = window.screen;
        const screenWidth = Math.max(width, height);
        const screenHeight = Math.min(width, height);
        
        // iPhone model detection based on screen dimensions
        if (screenHeight === 896 && screenWidth === 414) {
          // iPhone XR, XS Max, 11
          deviceName = devicePixelRatio === 3 ? 'iPhone XS Max/11 Pro Max' : 'iPhone XR/11';
        } else if (screenHeight === 844 && screenWidth === 390) {
          // iPhone 12, 12 Pro, 13, 13 Pro, 14
          deviceName = 'iPhone 12/13/14';
        } else if (screenHeight === 926 && screenWidth === 428) {
          // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
          deviceName = 'iPhone 12/13 Pro Max, 14 Plus';
        } else if (screenHeight === 852 && screenWidth === 393) {
          // iPhone 14 Pro
          deviceName = 'iPhone 14 Pro';
        } else if (screenHeight === 932 && screenWidth === 430) {
          // iPhone 14 Pro Max
          deviceName = 'iPhone 14 Pro Max';
        } else if (screenHeight === 812 && screenWidth === 375) {
          // iPhone X, XS, 11 Pro, 12 mini, 13 mini
          deviceName = 'iPhone X/XS/11 Pro/12 mini/13 mini';
        } else if (screenHeight === 736 && screenWidth === 414) {
          // iPhone 6+, 6s+, 7+, 8+
          deviceName = 'iPhone 6/7/8 Plus';
        } else if (screenHeight === 667 && screenWidth === 375) {
          // iPhone 6, 6s, 7, 8, SE (2nd gen)
          deviceName = 'iPhone 6/7/8/SE2';
        } else if (screenHeight === 568 && screenWidth === 320) {
          // iPhone 5, 5C, 5S, SE (1st gen)
          deviceName = 'iPhone 5/5C/5S/SE1';
        } else {
          deviceName = 'iPhone (unknown model)';
        }
      } else if (/iPad/.test(ua)) {
        deviceFamily = 'iPad';
        
        // Try to determine iPad model
        const { width, height } = window.screen;
        const screenSize = Math.max(width, height);
        
        if (screenSize >= 1024) {
          deviceName = 'iPad Pro';
        } else if (screenSize >= 834) {
          deviceName = 'iPad Air/Pro 11"';
        } else if (screenSize >= 810) {
          deviceName = 'iPad 10th gen';
        } else if (screenSize >= 768) {
          deviceName = 'iPad/iPad Mini';
        }
      } else if (/iPod/.test(ua)) {
        deviceFamily = 'iPod';
        deviceName = 'iPod Touch';
      }
    } else if (/Android/.test(ua)) {
      type = 'android';
      osName = 'Android';
      
      // Extract Android version
      const match = ua.match(/Android (\d+)\.(\d+)\.?(\d+)?/);
      if (match) {
        osVersion = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
        majorVersion = parseInt(match[1], 10);
      }
      
      // Try to detect Samsung devices
      if (/Samsung|SM-|Galaxy/.test(ua)) {
        deviceFamily = 'Samsung Galaxy';
        
        if (/SM-G9/.test(ua) || /Galaxy S\d{2}/.test(ua)) {
          deviceName = 'Samsung Galaxy S Series';
        } else if (/SM-N9/.test(ua) || /Galaxy Note/.test(ua)) {
          deviceName = 'Samsung Galaxy Note Series';
        } else if (/SM-A/.test(ua)) {
          deviceName = 'Samsung Galaxy A Series';
        } else if (/SM-F/.test(ua) || /Fold/.test(ua) || /Flip/.test(ua)) {
          deviceName = 'Samsung Galaxy Fold/Flip';
        } else {
          deviceName = 'Samsung Galaxy';
        }
      } 
      // Google Pixel devices
      else if (/Pixel/.test(ua)) {
        deviceFamily = 'Google Pixel';
        
        const pixelMatch = ua.match(/Pixel (\d+)(?: XL| Pro)?/);
        if (pixelMatch) {
          deviceName = `Google ${pixelMatch[0]}`;
        } else {
          deviceName = 'Google Pixel';
        }
      }
      // OnePlus devices
      else if (/OnePlus/.test(ua)) {
        deviceFamily = 'OnePlus';
        const oneMatch = ua.match(/OnePlus[ ]?([A-Za-z0-9]+)/);
        if (oneMatch) {
          deviceName = `OnePlus ${oneMatch[1]}`;
        } else {
          deviceName = 'OnePlus';
        }
      }
      // Xiaomi devices
      else if (/Mi |Redmi|POCO/.test(ua)) {
        deviceFamily = 'Xiaomi';
        if (/Mi /.test(ua)) {
          deviceName = 'Xiaomi Mi Series';
        } else if (/Redmi/.test(ua)) {
          deviceName = 'Xiaomi Redmi Series';
        } else if (/POCO/.test(ua)) {
          deviceName = 'Xiaomi POCO Series';
        } else {
          deviceName = 'Xiaomi';
        }
      }
      // Huawei devices
      else if (/HUAWEI|Honor/.test(ua)) {
        deviceFamily = /Honor/.test(ua) ? 'Honor' : 'Huawei';
        deviceName = /Honor/.test(ua) ? 'Honor Series' : 'Huawei Series';
      }
      // OPPO devices 
      else if (/OPPO/.test(ua)) {
        deviceFamily = 'OPPO';
        deviceName = 'OPPO Series';
      }
      // Vivo devices
      else if (/vivo/.test(ua)) {
        deviceFamily = 'Vivo';
        deviceName = 'Vivo Series';
      } else {
        deviceName = 'Android Device';
      }
    }
    
    // Generate device identifier
    deviceIdentifier = `${type}-${deviceFamily}-${osVersion}`;
    
    // Detect screen features
    const { width, height } = window.screen;
    const pixelDensity = devicePixelRatio >= 3 ? 'ultra' :
                        devicePixelRatio >= 2 ? 'high' :
                        devicePixelRatio >= 1.5 ? 'medium' : 'low';
    
    // Guess refresh rate based on device
    let refreshRate: '60hz' | '90hz' | '120hz' | 'variable' = '60hz';
    if (type === 'ios') {
      // Only Pro iPhones have high refresh rate screens
      if (
        deviceName.includes('Pro') && 
        deviceName.includes('iPhone 13') ||
        deviceName.includes('iPhone 14')
      ) {
        refreshRate = 'variable'; // ProMotion on iPhone
      } else if (deviceFamily === 'iPad' && deviceName.includes('Pro')) {
        refreshRate = 'variable'; // ProMotion on iPad Pro
      }
    } else if (type === 'android') {
      // Many flagship Android phones have high refresh rates
      if (
        (deviceFamily === 'Samsung Galaxy' && deviceName.includes('S')) ||
        (deviceFamily === 'OnePlus') ||
        (deviceFamily === 'Google Pixel' && !deviceName.includes('Pixel 3'))
      ) {
        refreshRate = deviceName.includes('Pro') ? '120hz' : '90hz';
      }
    }
    
    // Detect notch, punch hole, etc.
    const hasNotch = 
      (type === 'ios' && majorVersion >= 11 && deviceFamily === 'iPhone' && !deviceName.includes('SE')) || 
      (type === 'android' && majorVersion >= 9 && (
        deviceName.includes('Pixel 3 XL') || 
        deviceName.includes('OnePlus 6') ||
        deviceName.includes('OnePlus 7')
      ));
    
    const hasDynamicIsland = type === 'ios' && (
      deviceName.includes('iPhone 14 Pro') || 
      deviceName.includes('iPhone 15')
    );
    
    const hasPunchHole = type === 'android' && (
      (deviceFamily === 'Samsung Galaxy' && !deviceName.includes('S10+')) ||
      deviceName.includes('Pixel 4') ||
      deviceName.includes('Pixel 5') ||
      deviceName.includes('Pixel 6') ||
      deviceName.includes('OnePlus 8')
    );
    
    const hasFoldableScreen = deviceName.includes('Fold') || deviceName.includes('Flip');
    const hasLargeScreen = Math.max(width, height) >= 800;
    
    // Detect S Pen support
    const hasPen = deviceName.includes('Note') || deviceName.includes('S21 Ultra') || deviceName.includes('S22 Ultra');
    
    // Create detailed device info
    const detailedDeviceInfo: DeviceInfo = {
      type,
      os: {
        name: osName,
        version: osVersion,
        majorVersion
      },
      model: {
        name: deviceName,
        family: deviceFamily,
        identifier: deviceIdentifier
      },
      features: {
        hasNotch,
        hasDynamicIsland,
        hasPunchHole,
        hasFoldableScreen,
        hasLargeScreen,
        hasPen
      },
      screen: {
        width: Math.max(width, height),
        height: Math.min(width, height),
        dpr: devicePixelRatio,
        pixelDensity,
        refreshRate,
        aspectRatio: Math.max(width, height) / Math.min(width, height)
      }
    };
    
    setDeviceInfo(detailedDeviceInfo);
    
    // Apply device-specific optimizations
    applyDeviceSpecificOptimizations(detailedDeviceInfo);
  }, [isMobile]);
  
  const applyDeviceSpecificOptimizations = (device: DeviceInfo) => {
    // Add device type class
    document.body.classList.add(`device-${device.type}`);
    
    // Add OS version class
    document.body.classList.add(`os-${device.os.name.toLowerCase()}-${device.os.majorVersion}`);
    
    // Add device family class
    document.body.classList.add(`device-family-${device.model.family.toLowerCase().replace(/\s+/g, '-')}`);
    
    // Add screen classes
    document.body.classList.add(`screen-${device.screen.pixelDensity}`);
    document.body.classList.add(`screen-${device.screen.refreshRate}`);
    
    // Add feature classes
    if (device.features.hasNotch) document.body.classList.add('has-notch');
    if (device.features.hasDynamicIsland) document.body.classList.add('has-dynamic-island');
    if (device.features.hasPunchHole) document.body.classList.add('has-punch-hole');
    if (device.features.hasFoldableScreen) document.body.classList.add('has-foldable-screen');
    if (device.features.hasLargeScreen) document.body.classList.add('has-large-screen');
    if (device.features.hasPen) document.body.classList.add('has-pen');
    
    // CSS variables for device-specific adjustments
    document.documentElement.style.setProperty('--device-name', `"${device.model.name}"`);
    document.documentElement.style.setProperty('--device-type', device.type);
    document.documentElement.style.setProperty('--screen-dpr', device.screen.dpr.toString());
    
    // Device-specific CSS
    const style = document.createElement('style');
    
    // Fix for iOS Safari issues
    if (device.type === 'ios') {
      style.innerHTML += `
        /* Fix for overscroll bounce in iOS Safari */
        html, body {
          position: fixed;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        #root {
          width: 100%;
          height: 100%;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Fix for iOS Safari 100vh issue */
        .h-screen, .min-h-screen {
          height: 100% !important;
          min-height: 100% !important;
        }
        
        /* Dynamic Island adjustments */
        ${device.features.hasDynamicIsland ? `
          .has-dynamic-island .safe-area-top {
            padding-top: max(20px, env(safe-area-inset-top)) !important;
          }
        ` : ''}
      `;
    }
    
    // Android-specific fixes
    if (device.type === 'android') {
      style.innerHTML += `
        /* Fix for Android overscroll effect */
        body {
          overscroll-behavior: none;
        }
        
        /* Handle punch hole cutouts */
        ${device.features.hasPunchHole ? `
          .adjust-for-punch-hole {
            padding-top: 0.5rem !important;
          }
        ` : ''}
      `;
    }
    
    // Foldable device optimizations
    if (device.features.hasFoldableScreen) {
      style.innerHTML += `
        /* Optimize layouts for foldable screens */
        .optimize-for-fold {
          display: flex;
          flex-direction: row;
        }
        
        @media (max-width: 768px) {
          .optimize-for-fold {
            flex-direction: column;
          }
        }
      `;
    }
    
    document.head.appendChild(style);
  };
  
  return deviceInfo;
}
import { useEffect, useState, useCallback } from 'react';

interface DevicePerformance {
  tier: 'low' | 'medium' | 'high';
  isLowEnd: boolean;
  score: number;
  metrics: {
    memory: number | null;
    cpu: number;
    connectionType: string | null;
    deviceMemory: number | null;
    hardwareConcurrency: number;
    saveData: boolean;
  };
}

/**
 * Hook to detect device performance capabilities and optimize accordingly
 * Automatically applies performance optimizations for low-end devices
 */
export function usePerformanceOptimizations() {
  const [performance, setPerformance] = useState<DevicePerformance>({
    tier: 'medium', // Default assumption
    isLowEnd: false,
    score: 50,
    metrics: {
      memory: null,
      cpu: 1,
      connectionType: null,
      deviceMemory: null,
      hardwareConcurrency: 2,
      saveData: false
    }
  });

  // Helper to apply performance-specific optimizations
  const applyOptimizations = useCallback((devicePerformance: DevicePerformance) => {
    // Don't apply optimizations for high-end devices
    if (devicePerformance.tier === 'high') return;

    // Add performance-specific CSS class to body
    document.body.classList.add(`performance-${devicePerformance.tier}`);
    
    // Low-end device specific optimizations
    if (devicePerformance.isLowEnd) {
      document.body.classList.add('low-end-device');
      
      // Reduce animation complexity
      document.body.style.setProperty('--animation-duration-factor', '1.5');
      document.body.style.setProperty('--transition-duration-factor', '1.5');
      
      // Disable some CSS features that are heavy on low-end devices
      const style = document.createElement('style');
      style.innerHTML = `
        @media (prefers-reduced-motion: no-preference) {
          .low-end-device .disable-on-low-end {
            display: none !important;
          }
          
          .low-end-device * {
            animation-duration: calc(var(--animation-duration, 0.2s) * var(--animation-duration-factor)) !important;
            transition-duration: calc(var(--transition-duration, 0.2s) * var(--transition-duration-factor)) !important;
          }
          
          /* Simplify box-shadows */
          .low-end-device .shadow-lg, 
          .low-end-device .shadow-xl,
          .low-end-device .shadow-2xl {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24) !important;
          }
          
          /* Reduce backdrop-filter usage */
          .low-end-device .backdrop-blur-sm,
          .low-end-device .backdrop-blur-md,
          .low-end-device .backdrop-blur-lg {
            backdrop-filter: none !important;
            background-color: rgba(var(--background), 0.9) !important;
          }
          
          /* Disable fancy background effects */
          .low-end-device .bg-gradient-to-r,
          .low-end-device .bg-gradient-to-l,
          .low-end-device .bg-gradient-to-t,
          .low-end-device .bg-gradient-to-b {
            background: var(--background) !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Medium tier optimizations
    if (devicePerformance.tier === 'medium') {
      document.body.classList.add('medium-tier-device');
      
      // Slightly reduce animation complexity
      document.body.style.setProperty('--animation-duration-factor', '1.2');
      document.body.style.setProperty('--transition-duration-factor', '1.2');
    }
  }, []);

  // Effect to detect device performance
  useEffect(() => {
    const detectPerformance = async () => {
      // Basic metrics available in most browsers
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      const deviceMemory = (navigator as any).deviceMemory || null;
      
      // Connection information if available
      let connectionType = null;
      let saveData = false;
      
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          connectionType = conn.effectiveType || null;
          saveData = !!conn.saveData;
        }
      }
      
      // Detect memory constraints
      let memory: number | null = null;
      if ((performance as any).memory) {
        memory = (performance as any).memory.jsHeapSizeLimit / 1048576; // Convert to MB
      }
      
      // Attempt to measure CPU performance
      let cpuScore = 1;
      try {
        const startTime = window.performance.now();
        let result = 0;
        // Simple CPU benchmark - loops and math operations
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i * Math.sin(i) * Math.cos(i));
        }
        const endTime = window.performance.now();
        // Normalize score - lower is better
        cpuScore = Math.min(10, Math.max(1, Math.round((endTime - startTime) / 100)));
      } catch (err) {
        console.error('CPU benchmark failed', err);
      }
      
      // Calculate overall device score (0-100)
      // Higher score means better performance
      let score = 50; // Start with a middle score
      
      // Adjust based on CPU (0-40 points)
      score += Math.max(0, 40 - (cpuScore * 4));
      
      // Adjust based on memory if available (0-30 points)
      if (deviceMemory) {
        score += Math.min(30, deviceMemory * 5);
      } else if (memory) {
        score += Math.min(30, memory / 1000 * 10);
      }
      
      // Adjust based on cores (0-20 points)
      score += Math.min(20, hardwareConcurrency * 2);
      
      // Adjust based on connection (0-10 points)
      if (connectionType) {
        switch (connectionType) {
          case 'slow-2g':
            score -= 10;
            break;
          case '2g':
            score -= 7;
            break;
          case '3g':
            score -= 3;
            break;
          case '4g':
            score += 5;
            break;
        }
      }
      
      // Data saver mode is a strong signal for a low-end device or limited conditions
      if (saveData) {
        score -= 20;
      }
      
      // Determine performance tier based on score
      let tier: 'low' | 'medium' | 'high';
      if (score < 40) {
        tier = 'low';
      } else if (score < 70) {
        tier = 'medium';
      } else {
        tier = 'high';
      }
      
      // Create final performance profile
      const devicePerformance: DevicePerformance = {
        tier,
        isLowEnd: tier === 'low',
        score: Math.max(0, Math.min(100, Math.round(score))),
        metrics: {
          memory,
          cpu: cpuScore,
          connectionType,
          deviceMemory,
          hardwareConcurrency,
          saveData
        }
      };
      
      setPerformance(devicePerformance);
      
      // Apply optimizations based on detected performance
      applyOptimizations(devicePerformance);
    };
    
    // Run the detection
    detectPerformance();
  }, [applyOptimizations]);
  
  return performance;
}
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface GestureNavigationState {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

/**
 * Hook that provides gesture-based navigation for mobile devices
 * Enables swipe left/right to navigate between pages and tracks history
 */
export function useGestureNavigation(): GestureNavigationState {
  const [, navigate] = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Initialize with current path
  useEffect(() => {
    if (!hasInitialized) {
      setNavigationHistory([window.location.pathname]);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Track navigation
  useEffect(() => {
    const handleNavigation = () => {
      const currentPath = window.location.pathname;
      
      if (!navigationHistory.length || navigationHistory[historyIndex] !== currentPath) {
        // Trim history after current position when navigating to a new path
        const newHistory = navigationHistory.slice(0, historyIndex + 1);
        
        // Add the current path to history
        newHistory.push(currentPath);
        
        // Update state
        setNavigationHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    };
    
    // Track navigation
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);
    window.addEventListener('replacestate', handleNavigation);
    
    // Listen for touch gestures
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches.length) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      // Calculate the distance and direction of the swipe
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      // Check if the swipe is horizontal
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
        // Right to left swipe
        if (diffX < 0 && canGoForward) {
          goForward();
        }
        // Left to right swipe
        else if (diffX > 0 && canGoBack) {
          goBack();
        }
      }
    };
    
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('pushstate', handleNavigation);
      window.removeEventListener('replacestate', handleNavigation);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigationHistory, historyIndex]);
  
  // Navigation functions
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevPath = navigationHistory[prevIndex];
      navigate(prevPath);
      setHistoryIndex(prevIndex);
    }
  }, [navigate, navigationHistory, historyIndex]);
  
  const goForward = useCallback(() => {
    if (historyIndex < navigationHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextPath = navigationHistory[nextIndex];
      navigate(nextPath);
      setHistoryIndex(nextIndex);
    }
  }, [navigate, navigationHistory, historyIndex]);
  
  // Determine if navigation is possible
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;
  
  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward
  };
}
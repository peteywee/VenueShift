import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Offline indicator component
 * Shows a notification when the user loses internet connection
 * Provides functionality to retry failed API requests when coming back online
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [failedRequests, setFailedRequests] = useState<Array<{ url: string; options: RequestInit; timestamp: number }>>([]);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine);

    // Event handlers for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Connected',
        description: 'Your internet connection has been restored',
        duration: 3000,
      });
      
      // Automatically retry failed requests
      if (failedRequests.length > 0) {
        retryFailedRequests();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      toast({
        title: 'Offline',
        description: 'You are currently offline. Some features may not work properly.',
        variant: 'destructive',
      });
    };

    // Setup network status monitoring
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Intercept fetch to track failed requests when offline
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        return response;
      } catch (err) {
        // If the error is due to network issue and we're offline
        if (!navigator.onLine) {
          // Store failed request for retry
          let url = '';
          if (typeof input === 'string') {
            url = input;
          } else if (input instanceof Request) {
            url = input.url;
          } else if (input instanceof URL) {
            url = input.toString();
          }
          const options = init || {};
          setFailedRequests(prev => [...prev, { url, options, timestamp: Date.now() }]);

          toast({
            title: 'Request failed',
            description: 'Your request will be retried when you are back online',
            variant: 'destructive',
          });
        }
        throw err;
      }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.fetch = originalFetch;
    };
  }, [failedRequests, toast]);

  // Function to retry failed requests
  const retryFailedRequests = async () => {
    if (failedRequests.length === 0) return;
    
    setIsReconnecting(true);
    
    const requests = [...failedRequests];
    setFailedRequests([]);
    
    // Process each failed request
    for (const request of requests) {
      try {
        await fetch(request.url, request.options);
      } catch (err) {
        console.error('Failed to retry request:', err);
        // If still failing, add back to queue, but avoid very old requests
        const isRecent = Date.now() - request.timestamp < 3600000; // 1 hour
        if (isRecent) {
          setFailedRequests(prev => [...prev, { ...request, timestamp: Date.now() }]);
        }
      }
    }
    
    setIsReconnecting(false);
    
    // Show success toast if any requests were processed
    if (requests.length > 0) {
      toast({
        title: 'Sync complete',
        description: `Synchronized ${requests.length} offline ${requests.length === 1 ? 'request' : 'requests'}`,
        duration: 3000,
      });
    }
  };

  // Don't render if online with no pending requests
  if (isOnline && !showBanner && failedRequests.length === 0) {
    return null;
  }

  // Offline banner with retry button
  return (
    <div className={cn(
      "fixed bottom-20 inset-x-0 z-50 px-4 transition-transform duration-300 has-safe-area pb-[var(--safe-area-bottom)]",
      isOnline && !showBanner ? "translate-y-full" : "translate-y-0"
    )}>
      <Alert className={cn(
        "border shadow-lg",
        isOnline ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : 
                   "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
            
            <div>
              <AlertTitle>
                {isOnline ? 'Back online' : 'Offline mode'}
              </AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {isOnline
                  ? failedRequests.length > 0
                    ? `You have ${failedRequests.length} pending ${failedRequests.length === 1 ? 'request' : 'requests'} to sync`
                    : 'Your connection has been restored'
                  : 'Your changes will be saved and synced when you reconnect'
                }
              </AlertDescription>
            </div>
          </div>
          
          {isOnline && (
            <div className="flex gap-2">
              {failedRequests.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={retryFailedRequests}
                  disabled={isReconnecting}
                >
                  {isReconnecting ? 'Syncing...' : 'Sync now'}
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowBanner(false)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
}
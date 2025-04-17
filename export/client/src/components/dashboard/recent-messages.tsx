import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Plus, MessageSquare } from "lucide-react";
import { Message, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format, formatDistanceToNow } from "date-fns";

export function RecentMessages() {
  const { user: currentUser } = useAuth();
  
  // Fetch messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
  });
  
  // Fetch users for sender names
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!currentUser,
  });
  
  const isLoading = isLoadingMessages || isLoadingUsers;
  
  // Get user by ID
  const getUserById = (userId: number) => {
    return users?.find(u => u.id === userId);
  };
  
  // Format message timestamp
  const formatMessageTime = (timestamp: Date | string) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    
    // If today, show time
    if (format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
      return format(date, "h:mm a");
    }
    
    // If within a week, show relative time
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: false });
    }
    
    // Otherwise show date
    return format(date, "MMM d");
  };
  
  // Get sorted recent messages
  const recentMessages = messages
    ?.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 3);
  
  return (
    <Card className="border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Recent Messages</CardTitle>
          <Link href="/messages">
            <a className="text-primary dark:text-primary-light text-sm font-medium flex items-center">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentMessages?.length > 0 ? (
              recentMessages.map(message => {
                const sender = getUserById(message.senderId);
                const isAnnouncement = !message.receiverId;
                const isCurrentUserSender = message.senderId === currentUser?.id;
                
                return (
                  <Link key={message.id} href={`/messages?id=${message.id}`}>
                    <a className={`flex space-x-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      isAnnouncement ? "bg-primary-light bg-opacity-5 dark:bg-primary-dark dark:bg-opacity-10 border border-primary-light border-opacity-20" : 
                      "bg-neutral-50 dark:bg-neutral-800"
                    }`}>
                      {isAnnouncement ? (
                        <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={sender?.profilePicture} alt={sender?.fullName} />
                          <AvatarFallback className="bg-primary text-white">
                            {sender?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {isAnnouncement ? "Announcement" : 
                             isCurrentUserSender ? `You → ${getUserById(message.receiverId!)?.fullName || "Unknown"}` : 
                             sender?.fullName || "Unknown"}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatMessageTime(message.sentAt)}
                          </p>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                          {message.content}
                        </p>
                      </div>
                    </a>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            )}
            
            <Link href="/messages/new">
              <Button className="w-full mt-4">
                <Plus className="h-5 w-5 mr-2" />
                New Message
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

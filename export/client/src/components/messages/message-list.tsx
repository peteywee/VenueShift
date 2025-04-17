import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Message, User } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Search, 
  MessageSquare, 
  Bell, 
  Mail,
  Check
} from "lucide-react";

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  onNewMessage: (recipient?: User) => void;
  highlightedMessageId?: number;
}

export function MessageList({ 
  messages, 
  users, 
  currentUser, 
  onNewMessage,
  highlightedMessageId
}: MessageListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [messageType, setMessageType] = useState<"all" | "personal" | "announcements">("all");
  const [openConversation, setOpenConversation] = useState<{
    userId?: number;
    isAnnouncement?: boolean;
    messages: Message[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}`, { isRead: true });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark message as read",
        variant: "destructive",
      });
    },
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number | null; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });
  
  // Process messages to get unique conversations
  const processMessages = () => {
    if (!currentUser) return { conversations: [], announcements: [] };
    
    const convMap = new Map<number, { user: User; lastMessage: Message; unreadCount: number }>();
    const announcements: Message[] = [];
    
    // Sort messages by sent time (newest first)
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    
    sortedMessages.forEach(message => {
      // Handle announcements (null receiver)
      if (message.receiverId === null) {
        announcements.push(message);
        return;
      }
      
      // Handle personal messages
      const otherUserId = message.senderId === currentUser.id 
        ? message.receiverId 
        : message.senderId;
      
      if (otherUserId) {
        const otherUser = users.find(u => u.id === otherUserId);
        
        if (otherUser) {
          const existing = convMap.get(otherUserId);
          const isUnread = !message.isRead && message.receiverId === currentUser.id;
          
          if (!existing) {
            convMap.set(otherUserId, { 
              user: otherUser, 
              lastMessage: message,
              unreadCount: isUnread ? 1 : 0
            });
          } else if (new Date(message.sentAt) > new Date(existing.lastMessage.sentAt)) {
            convMap.set(otherUserId, { 
              ...existing, 
              lastMessage: message,
              unreadCount: existing.unreadCount + (isUnread ? 1 : 0)
            });
          } else {
            convMap.set(otherUserId, { 
              ...existing,
              unreadCount: existing.unreadCount + (isUnread ? 1 : 0)
            });
          }
        }
      }
    });
    
    return {
      conversations: Array.from(convMap.values()),
      announcements
    };
  };
  
  const { conversations, announcements } = processMessages();
  
  // Filter conversations based on search and type
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (messageType === "personal") {
      return matchesSearch;
    }
    
    return matchesSearch;
  });
  
  // Filter announcements based on search
  const filteredAnnouncements = announcements.filter(ann => {
    if (messageType === "personal") {
      return false;
    }
    
    return ann.content.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Open conversation with user
  const openConversationWithUser = (userId: number) => {
    if (!currentUser) return;
    
    // Get all messages between current user and selected user
    const conversationMessages = messages.filter(msg => 
      (msg.senderId === userId && msg.receiverId === currentUser.id) ||
      (msg.senderId === currentUser.id && msg.receiverId === userId)
    ).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    
    setOpenConversation({
      userId,
      messages: conversationMessages
    });
    
    // Mark unread messages as read
    conversationMessages.forEach(msg => {
      if (!msg.isRead && msg.receiverId === currentUser.id) {
        markAsReadMutation.mutate(msg.id);
      }
    });
  };
  
  // Open announcements conversation
  const openAnnouncementsConversation = () => {
    if (!currentUser) return;
    
    // Get all announcement messages
    const announcementMessages = messages
      .filter(msg => msg.receiverId === null)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    
    setOpenConversation({
      isAnnouncement: true,
      messages: announcementMessages
    });
    
    // Mark unread announcements as read
    announcementMessages.forEach(msg => {
      if (!msg.isRead) {
        markAsReadMutation.mutate(msg.id);
      }
    });
  };
  
  // Send message to current conversation
  const sendMessage = (content: string) => {
    if (!currentUser || !openConversation || content.trim() === "") return;
    
    const receiverId = openConversation.isAnnouncement 
      ? null 
      : openConversation.userId || null;
    
    sendMessageMutation.mutate(
      { receiverId, content },
      {
        onSuccess: (newMessage) => {
          // Update conversation with new message
          setOpenConversation(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...prev.messages, newMessage]
            };
          });
        }
      }
    );
  };
  
  // Format message time
  const formatMessageTime = (timestamp: Date | string) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    
    // If today, show time
    if (format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
      return format(date, "h:mm a");
    }
    
    // If within a week, show relative time
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise show date
    return format(date, "MMM d, yyyy");
  };
  
  // Get user by ID
  const getUserById = (userId: number) => {
    return users.find(u => u.id === userId);
  };
  
  // Get user avatar
  const getUserAvatar = (user: User) => {
    return (
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.profilePicture} alt={user.fullName} />
        <AvatarFallback className="bg-primary text-white">
          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  };
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [openConversation]);
  
  // Check for highlighted message
  useEffect(() => {
    if (highlightedMessageId && messages.length > 0) {
      const message = messages.find(m => m.id === highlightedMessageId);
      if (message) {
        if (message.receiverId === null) {
          openAnnouncementsConversation();
        } else {
          const userId = message.senderId === currentUser?.id 
            ? message.receiverId 
            : message.senderId;
          
          if (userId) {
            openConversationWithUser(userId);
          }
        }
      }
    }
  }, [highlightedMessageId, messages, currentUser]);
  
  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-210px)] min-h-[500px]">
      {/* Message List */}
      <Card className={`border md:w-1/3 flex flex-col ${openConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
            <Input 
              placeholder="Search messages..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          className="flex-1 flex flex-col"
          onValueChange={(value) => setMessageType(value as any)}
        >
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              <TabsTrigger value="announcements" className="flex-1">Announcements</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1 mt-2">
              {/* Announcements Section */}
              {filteredAnnouncements.length > 0 && (
                <div 
                  onClick={openAnnouncementsConversation}
                  className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    openConversation?.isAnnouncement ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Announcements</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatMessageTime(filteredAnnouncements[0].sentAt)}
                      </p>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                      {filteredAnnouncements[0].content}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Conversations */}
              {filteredConversations.map((conv) => {
                const { user, lastMessage, unreadCount } = conv;
                return (
                  <div 
                    key={user.id}
                    onClick={() => openConversationWithUser(user.id)}
                    className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      openConversation?.userId === user.id ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                    }`}
                  >
                    {getUserAvatar(user)}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.fullName}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatMessageTime(lastMessage.sentAt)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate flex-1">
                          {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                        {unreadCount > 0 && (
                          <Badge className="ml-2 bg-accent text-white">{unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredAnnouncements.length === 0 && filteredConversations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-500 dark:text-neutral-400">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-center">No messages found</p>
                  <p className="text-sm text-center mt-1">Start a new conversation</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => onNewMessage()}
                  >
                    New Message
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="personal" className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1 mt-2">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-500 dark:text-neutral-400">
                  <Mail className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-center">No personal messages found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => onNewMessage()}
                  >
                    New Message
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const { user, lastMessage, unreadCount } = conv;
                  return (
                    <div 
                      key={user.id}
                      onClick={() => openConversationWithUser(user.id)}
                      className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        openConversation?.userId === user.id ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                      }`}
                    >
                      {getUserAvatar(user)}
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.fullName}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatMessageTime(lastMessage.sentAt)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate flex-1">
                            {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                            {lastMessage.content}
                          </p>
                          {unreadCount > 0 && (
                            <Badge className="ml-2 bg-accent text-white">{unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="announcements" className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1 mt-2">
              {filteredAnnouncements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-500 dark:text-neutral-400">
                  <Bell className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-center">No announcements found</p>
                  {currentUser?.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => onNewMessage()}
                    >
                      Create Announcement
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div 
                    onClick={openAnnouncementsConversation}
                    className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      openConversation?.isAnnouncement ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Announcements</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatMessageTime(filteredAnnouncements[0].sentAt)}
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                        {filteredAnnouncements[0].content}
                      </p>
                    </div>
                  </div>
                  
                  {filteredAnnouncements.map((announcement, index) => {
                    if (index === 0) return null; // Skip the first one that's already shown
                    
                    const sender = getUserById(announcement.senderId);
                    
                    return (
                      <div 
                        key={announcement.id}
                        onClick={openAnnouncementsConversation}
                        className="flex items-center p-3 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <div className="ml-10 flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {sender?.fullName || "Unknown"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {formatMessageTime(announcement.sentAt)}
                            </p>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                            {announcement.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Conversation View */}
      {openConversation ? (
        <Card className={`border flex-1 flex flex-col ${openConversation ? 'flex' : 'hidden md:flex'}`}>
          {/* Conversation Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              {openConversation.isAnnouncement ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">Announcements</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {announcements.length} messages
                    </p>
                  </div>
                </>
              ) : (
                openConversation.userId && (
                  <>
                    {getUserAvatar(getUserById(openConversation.userId)!)}
                    <div className="ml-3">
                      <h3 className="text-lg font-medium">
                        {getUserById(openConversation.userId)?.fullName}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {openConversation.messages.length} messages
                      </p>
                    </div>
                  </>
                )
              )}
            </div>
            
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpenConversation(null)}
              >
                Back
              </Button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {openConversation.messages.map((message) => {
              const isSentByCurrentUser = message.senderId === currentUser?.id;
              const sender = getUserById(message.senderId);
              
              return (
                <div 
                  key={message.id}
                  className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                  id={`message-${message.id}`}
                >
                  <div className={`flex max-w-[80%] ${isSentByCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isSentByCurrentUser && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarImage src={sender?.profilePicture} alt={sender?.fullName} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {sender?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`mx-2 ${message.id === highlightedMessageId ? 'animate-pulse' : ''}`}>
                      {openConversation.isAnnouncement && !isSentByCurrentUser && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          {sender?.fullName || "Unknown"}
                        </div>
                      )}
                      
                      <div 
                        className={`p-3 rounded-lg ${
                          isSentByCurrentUser 
                            ? 'bg-primary text-white' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <div className="flex items-center mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{formatMessageTime(message.sentAt)}</span>
                        {isSentByCurrentUser && message.isRead && (
                          <span className="ml-2 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isSentByCurrentUser && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarImage src={currentUser?.profilePicture} alt={currentUser?.fullName} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {currentUser?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <MessageInput 
            onSend={sendMessage} 
            isAnnouncement={openConversation.isAnnouncement || false}
            isPending={sendMessageMutation.isPending}
            canSend={currentUser?.role === 'admin' || !openConversation.isAnnouncement}
          />
        </Card>
      ) : (
        <Card className="border flex-1 hidden md:flex items-center justify-center">
          <div className="text-center p-6">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Select a conversation or start a new one
            </p>
            <Button onClick={() => onNewMessage()}>New Message</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Message Input Component
interface MessageInputProps {
  onSend: (content: string) => void;
  isAnnouncement: boolean;
  isPending: boolean;
  canSend: boolean;
}

function MessageInput({ onSend, isAnnouncement, isPending, canSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  
  const handleSend = () => {
    if (message.trim() && !isPending && canSend) {
      onSend(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="p-4 border-t bg-neutral-50 dark:bg-neutral-900 flex items-center">
      {!canSend && isAnnouncement ? (
        <div className="w-full text-center text-neutral-500 dark:text-neutral-400 text-sm py-2">
          Only administrators can send announcements
        </div>
      ) : (
        <>
          <Input
            placeholder={`Type your message${isAnnouncement ? ' announcement' : ''}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 mr-2"
            disabled={isPending || !canSend}
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || isPending || !canSend}
          >
            Send
          </Button>
        </>
      )}
    </div>
  );
}

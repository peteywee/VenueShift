import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MessageList } from "@/components/messages/message-list";
import { MessageForm } from "@/components/messages/message-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Message, User } from "@shared/schema";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Messages() {
  const { user: currentUser } = useAuth();
  const [location] = useLocation();
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Parse query parameters
  const query = new URLSearchParams(location.split("?")[1] || "");
  const messageId = query.get("id");
  
  // Fetch messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
  });
  
  // Fetch users for sender names
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!currentUser,
  });
  
  // Handle opening message form for selected user
  const handleCreateMessage = (recipient?: User) => {
    if (recipient) {
      setSelectedUser(recipient);
    } else {
      setSelectedUser(null);
    }
    setIsNewMessageOpen(true);
  };
  
  const handleCloseMessageForm = () => {
    setIsNewMessageOpen(false);
    setSelectedUser(null);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* Main Content Area */}
      <div className="pt-16 pb-16 lg:pl-64 min-h-screen flex flex-col">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 z-10">
          <Sidebar />
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Messages
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Communicate with your team
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={() => handleCreateMessage()} 
                  className="bg-primary hover:bg-primary-dark text-white shadow-sm"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Message
                </Button>
              </div>
            </div>

            {/* Messages List */}
            <MessageList 
              messages={messages} 
              users={users}
              currentUser={currentUser}
              onNewMessage={handleCreateMessage}
              highlightedMessageId={messageId ? parseInt(messageId) : undefined}
            />
          </div>
        </main>
      </div>

      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={handleCloseMessageForm}>
        <DialogContent className="sm:max-w-[500px]">
          <MessageForm 
            recipient={selectedUser}
            users={users}
            onClose={handleCloseMessageForm}
          />
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}

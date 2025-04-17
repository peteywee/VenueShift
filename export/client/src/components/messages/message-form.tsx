import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Bell } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

interface MessageFormProps {
  recipient?: User | null;
  users: User[];
  onClose: () => void;
}

// Schema for message form
const messageFormSchema = z.object({
  receiverId: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

export function MessageForm({ recipient, users, onClose }: MessageFormProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  // Filter out current user from recipients
  const availableRecipients = users.filter(user => user.id !== currentUser?.id);

  // Form setup with zod validation
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      receiverId: recipient?.id.toString() || "",
      content: "",
    },
  });

  // Handle form field changes
  const watchReceiverId = form.watch("receiverId");
  
  // Update isAnnouncement when receiverId changes
  useState(() => {
    setIsAnnouncement(watchReceiverId === "announcement");
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
      toast({
        title: isAnnouncement ? "Announcement sent" : "Message sent",
        description: isAnnouncement 
          ? "Your announcement has been sent to all users." 
          : "Your message has been sent successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: MessageFormValues) => {
    const receiverId = isAnnouncement 
      ? null 
      : data.receiverId ? parseInt(data.receiverId) : null;
    
    sendMessageMutation.mutate({
      receiverId,
      content: data.content
    });
  };

  // Toggle announcement mode
  const toggleAnnouncementMode = (value: string) => {
    const isAnnouncementMode = value === "announcement";
    setIsAnnouncement(isAnnouncementMode);
    form.setValue("receiverId", isAnnouncementMode ? "announcement" : "");
  };

  const isPending = sendMessageMutation.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isAnnouncement ? 'Send Announcement' : 'New Message'}</DialogTitle>
        <DialogDescription>
          {isAnnouncement 
            ? 'Create an announcement that will be sent to all users.' 
            : 'Send a direct message to another user.'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="receiverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send to</FormLabel>
                <Select
                  onValueChange={(value) => {
                    toggleAnnouncementMode(value);
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Only show announcement option for admins */}
                    {currentUser?.role === "admin" && (
                      <SelectItem value="announcement" className="flex items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-light text-white flex items-center justify-center mr-2">
                            <Bell className="h-4 w-4" />
                          </div>
                          <span>All Users (Announcement)</span>
                        </div>
                      </SelectItem>
                    )}
                    
                    {availableRecipients.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.profilePicture} alt={user.fullName} />
                            <AvatarFallback className="bg-primary text-white">
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.fullName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAnnouncement && (
                  <FormDescription>
                    This will send a message to all users in the system.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isAnnouncement ? 'Announcement' : 'Message'}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={isAnnouncement 
                      ? "Type your announcement here..." 
                      : "Type your message here..."
                    }
                    className="resize-none min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !form.watch("receiverId")}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                isAnnouncement ? "Send Announcement" : "Send Message"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send } from "lucide-react";

interface SMSInviteDialogProps {
  leagueName: string;
  inviteCode: string;
}

export default function SMSInviteDialog({ leagueName, inviteCode }: SMSInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const sendSMSMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; leagueName: string; inviteCode: string }) => {
      const res = await apiRequest("POST", "/api/auth/send-sms-invite", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "SMS sent!",
        description: `Invite sent to ${phoneNumber}`,
      });
      setOpen(false);
      setPhoneNumber("");
    },
    onError: (error: Error) => {
      toast({
        title: "SMS failed",
        description: error.message || "Failed to send SMS invite",
        variant: "destructive",
      });
    },
  });

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    sendSMSMutation.mutate({ phoneNumber, leagueName, inviteCode });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Send SMS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send SMS Invite</DialogTitle>
          <DialogDescription>
            Send a text message invite for "{leagueName}" to a phone number.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendSMS} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              required
            />
            <p className="text-xs text-gray-500">
              Include country code for international numbers
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Preview Message</Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
              🎵 You're invited to join "{leagueName}" on PhishDraft! Use code: {inviteCode} or visit: [app-url]/join/{inviteCode}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={sendSMSMutation.isPending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sendSMSMutation.isPending ? "Sending..." : "Send SMS"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
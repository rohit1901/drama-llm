import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Mic, Paperclip } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { isFieldEmpty } from "@/lib/utils";
import { LoadingButton } from "@/components/custom/Loader";
import { useChatStore } from "@/store/chatStore";

export const Chat = () => {
  const [message, setMessage] = useState("");
  const chatStore = useChatStore();

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
      {chatStore.messages.map((message, index) => (
        <div
          key={index}
          className={`flex flex-col items-${message.type === "question" ? "start" : "end"}`}
        >
          <Badge className="mb-2">
            {message.type === "question" ? "You" : "AI"}
          </Badge>
          <p className="p-3 bg-neutral rounded-lg shadow-sm">
            {message.content}
          </p>
        </div>
      ))}
      <div className="flex-1" />
      <div
        className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        x-chunk="dashboard-03-chunk-1"
      >
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          value={message}
          onChange={handleTextareaChange}
        />
        <div className="flex items-center p-3 pt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Paperclip className="size-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach File</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Mic className="size-4" />
                  <span className="sr-only">Use Microphone</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Use Microphone</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <LoadingButton
            loading={chatStore.loading}
            disabled={isFieldEmpty(message) || chatStore.loading}
            onClick={() => {
              chatStore.addMessage({
                type: "question",
                content: message,
              });
                setMessage("");
            }}
          />
        </div>
      </div>
    </div>
  );
};

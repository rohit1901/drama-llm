import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/custom/ChatBubble";
import { useChatStore } from "@/store/chatStore";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Square } from "lucide-react";
import { isFieldEmpty } from "@/lib/utils";
import { NoMessages } from "@/components/custom/NoMessages";
import { ChatButton } from "@/components/custom/ChatButton.tsx";
import { useToast } from "@/hooks/use-toast";

export const Chat = () => {
  const [message, setMessage] = useState("");
  const chatStore = useChatStore((state) => ({
    messages: state.messages,
    loading: state.loading,
    isGenerating: state.isGenerating,
    addMessage: state.addMessage,
    stopGeneration: state.stopGeneration,
    editMessage: state.editMessage,
    deleteMessage: state.deleteMessage,
    regenerateResponse: state.regenerateResponse,
    settings: state.settings,
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messagesEndRef.current) {
      const { current } = messagesEndRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [chatStore.messages]);

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    chatStore.addMessage({
      type: "question",
      content: message,
    });
    setMessage("");
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    try {
      await chatStore.editMessage(index, newContent);
      toast({
        title: "Message updated",
        description: "Your message has been edited successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to edit message",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleDeleteMessage = async (index: number) => {
    try {
      await chatStore.deleteMessage(index);
      toast({
        title: "Message deleted",
        description: "The message has been removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete message",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleRegenerateResponse = async (index: number) => {
    try {
      await chatStore.regenerateResponse(index);
      toast({
        title: "Regenerating response",
        description: "Generating a new response...",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to regenerate",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <div className="flex-1 p:6 sm:p-4 justify-between flex flex-col max-h-[90vh] min-h-[50vh] bg-muted overflow-hidden rounded-lg">
      <div className="overflow-y-auto m-1 scrollbar" ref={messagesEndRef}>
        {chatStore.messages.length === 0 ? (
          <NoMessages />
        ) : (
          chatStore.messages.map((message, index) => (
            <ChatBubble
              type={message.type}
              message={message.content}
              isStreaming={message.isStreaming}
              messageIndex={index}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onRegenerate={handleRegenerateResponse}
              key={`${message.type}-${index}`}
            />
          ))
        )}
      </div>
      <div
        className="mx-1 my-2 inset-x-0 rounded-lg border-accent bg-background"
        x-chunk="dashboard-03-chunk-1"
      >
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          className="min-h-12 resize-none p-3 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex items-center p-3 pt-0">
          <Button variant="ghost" size="icon">
            <Paperclip className="size-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Mic className="size-4" />
            <span className="sr-only">Use Microphone</span>
          </Button>
          {chatStore.isGenerating ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={chatStore.stopGeneration}
              className="ml-auto"
            >
              <Square className="size-4 mr-2" />
              Stop
            </Button>
          ) : (
            <ChatButton
              loading={chatStore.loading}
              disabled={isFieldEmpty(message) || chatStore.loading}
              onClick={handleSend}
            />
          )}
        </div>
      </div>
    </div>
  );
};

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/custom/ChatBubble";
import { useChatStore } from "@/store/chatStore";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Paperclip } from "lucide-react";
import { isFieldEmpty } from "@/lib/utils";
import { NoMessages } from "@/components/custom/NoMessages";
import { ChatButton } from "@/components/custom/ChatButton.tsx";

export const Chat = () => {
  const [message, setMessage] = useState("");
  const chatStore = useChatStore((state) => ({
    messages: state.messages,
    loading: state.loading,
    addMessage: state.addMessage,
    settings: state.settings,
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      const { current } = messagesEndRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [chatStore.messages]); // Dependency array includes chatStore.messages to trigger the effect on message updates

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

  return (
    <div className="flex-1 p:6 sm:p-4 justify-between flex flex-col max-h-[90vh] min-h-[50vh] bg-muted overflow-hidden rounded-lg">
      <div className="overflow-y-auto m-1" ref={messagesEndRef}>
        {chatStore.messages.length === 0 ? (
          <NoMessages />
        ) : (
          chatStore.messages.map((message, index) => (
            <ChatBubble
              type={message.type}
              message={message.content}
              key={`${message.type}-${index}`}
            />
          ))
        )}
      </div>
      <div
        className="mx-1 my-2 inset-x-0 rounded-lg border bg-background"
        x-chunk="dashboard-03-chunk-1"
      >
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          className="min-h-12 resize-none border-none p-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
          <ChatButton
            loading={chatStore.loading}
            disabled={isFieldEmpty(message) || chatStore.loading}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};

import {ChangeEvent, useEffect, useRef, useState} from "react";
import { ChatBubble } from "@/components/custom/ChatBubble.tsx";
import { useChatStore } from "@/store/chatStore";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Paperclip } from "lucide-react";
import { LoadingButton } from "@/components/custom/Loader";
import { isFieldEmpty } from "@/lib/utils";

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
      <div className="relative flex flex-col rounded-xl bg-muted/50 p-4 mb-4 lg:col-span-2">
        <div className="flex flex-col h-full min-h-[50vh] overflow-y-auto">
          {chatStore.messages.map((message, index) => (
              <ChatBubble type={message.type} message={message.content} key={`${message.type}-${index}`} />
          ))}
        </div>
        <div
            className="absolute bottom-0 mx-4 mb-4 inset-x-0 rounded-lg border bg-background mt-4"
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
            <LoadingButton
                loading={chatStore.loading}
                disabled={isFieldEmpty(message) || chatStore.loading}
                onClick={handleSend}
            />
          </div>
        </div>
      </div>
  );
};
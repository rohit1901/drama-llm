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
import { ChangeEvent, useEffect, useState } from "react";
import { isArrayEmpty, isFieldEmpty } from "@/lib/utils";
import { LoadingButton } from "@/components/custom/Loader";
import { useChatStore } from "@/store/chatStore";
import ollama from "ollama";

export const Chat = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatStore = useChatStore();
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    if (isArrayEmpty(chatStore.questions)) return;
    setLoading(true);
    ollama
      .chat({
        model: "llama3",
        messages: chatStore.questions.map((question) => ({
          role: "user",
          content: question,
        })),
      })
      .then((response) => {
        chatStore.addAnswer(response.message.content);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [chatStore.questions]);
  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
      {!isArrayEmpty(chatStore.questions) &&
        chatStore.questions.map((question, index) => (
          <div key={index} className="flex flex-col items-start">
            <Badge className="mb-2">You</Badge>
            <p className="p-3 bg-neutral rounded-lg shadow-sm">{question}</p>
          </div>
        ))}
      {!isArrayEmpty(chatStore.answers) &&
        chatStore.answers.map((answer, index) => (
          <div key={index} className="flex flex-col items-end">
            <Badge className="mb-2">AI</Badge>
            <p className="p-3 bg-background rounded-lg shadow-sm">{answer}</p>
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
            loading={loading}
            disabled={isFieldEmpty(message) || loading}
            onClick={() => chatStore.addQuestion(message)}
          />
        </div>
      </div>
    </div>
  );
};

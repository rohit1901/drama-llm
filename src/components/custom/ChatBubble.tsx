import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import Markdown from "react-markdown";
import { Copy } from "lucide-react";
import { CopyToClipboard } from "@/components/custom/CopyToClipboard";

type ChatBubbleProps = {
  type: string;
  message: string;
};
export const ChatBubble = ({ type, message }: ChatBubbleProps) => {
  const img =
    type === "question"
      ? "https://d28xxvmjntstuh.cloudfront.net/portfolio/profile.pic.svg"
      : "https://github.com/shadcn.png";
  const fallback = type === "question" ? "You" : "AI";
  return (
    <div
      className={`flex flex-row sm:flex-col ${type === "question" ? "items-start" : "items-end"} mb-4 sm:mb-2`}
    >
      <div
        className={`sm:max-w-[45vw] ${type === "question" ? "items-start" : "items-end"}`}
      >
        <div className="flex flex-col justify-between space-x-4 bg-card rounded-lg border p-4">
          <div className="flex flex-row justify-between p-2">
            <Avatar>
              <AvatarImage src={img} alt={type} />
              <AvatarFallback delayMs={600}>{fallback}</AvatarFallback>
            </Avatar>
            <CopyToClipboard
              text={message}
              description={"Message copied to clipboard!"}
              button={<Copy className="size-3.5" />}
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm">
              <Markdown>{message}</Markdown>
            </div>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">
                {formatDate()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

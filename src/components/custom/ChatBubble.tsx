import { formatDate } from "@/lib/utils";
import Markdown from "react-markdown";
import { Copy } from "lucide-react";
import { CopyToClipboard } from "@/components/custom/CopyToClipboard";
import Code from "./Code";

type ChatBubbleProps = {
  type: string;
  message: string;
};
export const ChatBubble = ({ type, message }: ChatBubbleProps) => {
  return (
    <div
      className={`flex flex-row sm:flex-col ${type === "question" ? "items-start" : "items-end"} mb-4 sm:mb-2`}
    >
      <div
        className={`sm:max-w-[45vw] ${type === "question" ? "items-start" : "items-end"}`}
      >
        <div
          className={`flex flex-col justify-between ${type === "question" ? "bg-card" : "bg-slate-300"} rounded-lg border p-4`}
        >
          <div className="text-sm">
            <Markdown
              components={{
                code(props) {
                  return <Code {...props} />;
                },
              }}
            >
              {message}
            </Markdown>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {formatDate()}
            </span>
            <CopyToClipboard
              text={message}
              description={"Message copied to clipboard!"}
              button={<Copy className="size-3" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

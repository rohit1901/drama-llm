import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {formatDate} from "@/lib/utils";

type ChatBubbleProps = {
    type: string;
    message: string;
}
export const ChatBubble = ({ type, message }: ChatBubbleProps) => {
    const img = type === "question" ? "https://d28xxvmjntstuh.cloudfront.net/portfolio/profile.pic.svg" : "https://github.com/shadcn.png"
    const fallback = type === "question" ? "You" : "AI"
    return <div
        className={`flex flex-row sm:flex-col ${type === "question" ? "items-start" : "items-end"} mb-4 sm:mb-2`}
    >
        <div className={`sm:max-w-[45vw] ${type === "question" ? "items-start" : "items-end"}`}>
            <div className="flex justify-between space-x-4 bg-card rounded-lg border p-4">
                <Avatar>
                    <AvatarImage src={img}/>
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{fallback}</h4>
                    <p className="text-sm">
                        {message}
                    </p>
                    <div className="flex items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                            {formatDate()}
                          </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
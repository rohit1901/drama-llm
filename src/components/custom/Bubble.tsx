import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

type BubbleProps = {
    type: string;
    message: string;
}
export const Bubble = ({ type, message }: BubbleProps) => {
    const img = type === "question" ? "https://d28xxvmjntstuh.cloudfront.net/portfolio/profile.pic.svg" : "https://github.com/shadcn.png"
    const fallback = type === "question" ? "You" : "AI"
    return <div
        className={`flex flex-col ${type === "question" ? "items-start" : "items-end"}`}
    >
        <div className={`flex flex-row align-middle sm:max-w-[30vw] ${type === "question" ? "items-start" : "items-end"}`}>
            <Avatar>
                <AvatarImage src={img}/>
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <p className="ml-3 p-3 bg-neutral rounded-lg shadow-sm text-sm">
                {message}
            </p>
        </div>
    </div>
        }
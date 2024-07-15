import {HeartCrack} from "lucide-react";

export const NoMessages = () => {
    return <span className="font-semibold sm:text-md text-sm">
        <p className="flex"> No messages yet <HeartCrack className="fill-destructive ml-2"/>. Start conversing...</p></span>
}
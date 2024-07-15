import { ReactNode, useState } from "react";
import { copyToClipboard } from "@/lib/utils.ts";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyToClipboardProps = {
  text: string;
  description: string;
  button: ReactNode;
};
export const CopyToClipboard = ({ text, description, button }: CopyToClipboardProps) => {
    const [isCopying, setIsCopying] = useState(false);
    
    return (
        <Button
            variant="outline"
            disabled={isCopying}
            size="sm"
            className="ml-auto gap-1.5 text-sm"
            onClick={async () => {
                setIsCopying(true);
                await copyToClipboard(text);
                setIsCopying(false)
                toast(<div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                        <ClipboardCheck className="size-4.5 mr-3" />
                        <p>Copied!</p>
                    </div>
                    <div className="text-muted-foreground">{description}</div>
                </div>);
            }}
        >
            {button}
        </Button>
    )
}
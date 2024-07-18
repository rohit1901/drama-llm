import { ReactNode, useState } from "react";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyToClipboardProps = {
  text: string;
  description: string;
  button: ReactNode;
};
export const CopyToClipboard = ({
  text,
  description,
  button,
}: CopyToClipboardProps) => {
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
        setIsCopying(false);
        toast.success(description, {
          description: formatDate(),
          icon: <ClipboardCheck className="size-4" />,
        });
      }}
    >
      {button}
    </Button>
  );
};

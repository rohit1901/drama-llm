import { CornerDownLeft, LoaderPinwheel } from "lucide-react";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";

type LoadingButtonProps = {
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
export const ChatButton = ({
  loading,
  disabled,
  onClick,
}: PropsWithChildren<LoadingButtonProps>) => {
  return (
    <Button
      onClick={onClick}
      size="sm"
      className="ml-auto gap-1.5"
      disabled={disabled}
    >
      {loading && <LoaderPinwheel className="animate-spin h-5 w-5" />}
      {!loading && (
        <>
          <p className="ml-2">Send Message</p>
          <CornerDownLeft className="size-3.5" />
        </>
      )}
    </Button>
  );
};

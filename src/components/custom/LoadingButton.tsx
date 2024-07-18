import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";
import { PropsWithChildren, useState } from "react";

type LoadingButtonProps = {
  loading?: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
} & ButtonProps;
export const LoadingButton = ({
  disabled,
  onClick,
  children,
}: PropsWithChildren<LoadingButtonProps>) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      disabled={disabled ?? isLoading}
      onClick={(e) => {
        setIsLoading(true);
        onClick?.(e).finally(() => {
          setIsLoading(false);
        });
      }}
      variant="ghost"
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
    </Button>
  );
};

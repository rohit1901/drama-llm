import { Share } from "lucide-react";
import { CopyToClipboard } from "@/components/custom/CopyToClipboard";
import { ModeToggle } from "@/components/custom/ThemeToggle";
import { useLocation } from "boom-router";
import { routes } from "@/lib/routes";

export const Header = () => {
  const [location] = useLocation();
  return (
    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
      <h1 className="text-xl font-semibold">
        {routes.find((route) => route.path === location)?.value}
      </h1>

      <CopyToClipboard
        text={window.location.href}
        description={"URL copied to clipboard!"}
        button={
          <>
            <Share className="size-3.5" />
            Share
          </>
        }
      />
      <ModeToggle />
    </header>
  );
};

import { Share, LogOut } from "lucide-react";
import { CopyToClipboard } from "@/components/custom/CopyToClipboard";
import { ModeToggle } from "@/components/custom/ThemeToggle";
import { useLocation } from "boom-router";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { authService, apiClient } from "@/api";
import { useAppStore } from "@/store/appStore";
import { useChatStore } from "@/store/chatStore";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const [location] = useLocation();
  const setAuthenticated = useAppStore().setAuthenticated;
  const clearMessages = useChatStore().clearMessages;
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuthenticated(false);
      clearMessages();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Clear local state even if API call fails
      apiClient.setToken(null);
      setAuthenticated(false);
      clearMessages();
    }
  };

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
      <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
        <LogOut className="size-3.5 mr-2" />
        Logout
      </Button>
    </header>
  );
};

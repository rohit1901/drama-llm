import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Book, Bot, Settings, SquareTerminal } from "lucide-react";
import { useLocation } from "boom-router";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChatSettings } from "./ChatSettings";

export const MainNavigation = () => {
  const [location, setLocation] = useLocation();

  return (
    <nav className="grid gap-1 p-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-lg ${location === "/chat" ? "bg-muted" : ""}`}
              aria-label="Playground"
            >
              <SquareTerminal
                className="size-5"
                onClick={() => setLocation("/chat")}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Playground
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-lg ${location === "/models" ? "bg-muted" : ""}`}
              aria-label="Models"
            >
              <Bot className="size-5" onClick={() => setLocation("/models")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Models
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-lg`}
              aria-label="Documentation"
            >
              <Book className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Documentation
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {location === "/chat" ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="size-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="flex flex-col items-center justify-center">
              <DrawerTitle>Configuration</DrawerTitle>
              <DrawerDescription>
                Configure the settings for the model and messages.
              </DrawerDescription>
            </DrawerHeader>
            <ChatSettings />
          </DrawerContent>
        </Drawer>
      ) : null}
    </nav>
  );
};

import { Origami } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chat } from "@/components/custom/Chat";
import { MainNavigation } from "@/components/custom/MainNavigation";
import { BottomNavigation } from "@/components/custom/BottomNavigation";
import { ChatSettings } from "@/components/custom/ChatSettings";
import { Header } from "@/components/custom/Header.tsx";

export function Dashboard() {
  return (
    <div className="grid h-screen w-full pl-[56px] h-[100vh] overflow-hidden">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <Origami className="size-5 fill-foreground" color="bg-primary" />
          </Button>
        </div>
        <MainNavigation />
        <BottomNavigation />
      </aside>
      <div className="flex flex-col">
        <Header />
        <main className="grid flex-1 gap-4 overflow-none p-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex"
            x-chunk="dashboard-03-chunk-0"
          >
            <ChatSettings />
          </div>
          <Chat />
        </main>
      </div>
    </div>
  );
}

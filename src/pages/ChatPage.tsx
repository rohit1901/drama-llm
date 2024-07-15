import { ChatSettings } from "@/components/custom/ChatSettings.tsx";
import { Chat } from "@/components/custom/Chat.tsx";

export const ChatPage = () => {
  return (
    <>
      <div
        className="relative hidden flex-col items-start gap-8 lg:flex"
        x-chunk="dashboard-03-chunk-0"
      >
        <ChatSettings />
      </div>
      <Chat />
    </>
  );
};

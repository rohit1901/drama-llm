import { Chat } from "@/components/custom/Chat.tsx";
import { ConversationsList } from "@/components/custom/ConversationsList";
import { useChatStore } from "@/store/chatStore.ts";
import { useShallow } from "zustand/react/shallow";
import { useModelsStore } from "@/store/modelsStore.ts";
import { useEffect } from "react";
import { useLocation } from "boom-router";

export const ChatPage = () => {
  const { pulledModels, getPulledModels } = useModelsStore(
    useShallow((state) => ({
      pulledModels: state.pulledModels,
      getPulledModels: state.getPulledModels,
      availableModels: state.availableModels,
    })),
  );
  const { settings, setSettings } = useChatStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  );
  const [, setLocation] = useLocation();

  useEffect(() => {
    getPulledModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pulledModels.length === 0) {
      setLocation("/models");
      return;
    }
    const defaultModel = pulledModels[0]?.model || "";
    setSettings({
      ...settings,
      model: defaultModel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulledModels]);

  return (
    <div className="flex flex-1 gap-4 h-full">
      {/* Conversations Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ConversationsList />
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-w-0">
        <Chat />
      </div>
    </div>
  );
};

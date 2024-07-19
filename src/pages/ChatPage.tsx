import { ChatSettings } from "@/components/custom/ChatSettings.tsx";
import { Chat } from "@/components/custom/Chat.tsx";
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
  }, [pulledModels]);
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

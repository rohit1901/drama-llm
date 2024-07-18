import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rabbit } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useShallow } from "zustand/react/shallow";
import { useModelsStore } from "@/store/modelsStore.ts";

export const AvailableModels = () => {
  const { settings, setSettings } = useChatStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  );
  const { pulledModels, getPulledModels } = useModelsStore(
    useShallow((state) => ({
      pulledModels: state.pulledModels,
      getPulledModels: state.getPulledModels,
    })),
  );
  useEffect(() => {
    getPulledModels();
  }, []);
  return (
    <div className="grid gap-3">
      <Label htmlFor="modelsSelect">Model</Label>
      <Select
        onValueChange={(value) => {
          if (!value || value === "") return;
          setSettings({ ...settings, model: value });
        }}
        value={pulledModels[0]?.model}
        name="modelsSelect"
      >
        <SelectTrigger
          id="modelsSelect"
          className="items-start [&_[data-description]]:hidden"
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {pulledModels?.map(({ model }) => (
            <SelectItem value={model ?? ""} key={model}>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Rabbit className="size-5" />
                <div className="grid gap-0.5">
                  <p>
                    Latest{" "}
                    <span className="font-medium text-foreground">{model}</span>
                  </p>
                  <p className="text-xs" data-description>
                    Our fastest model for general use cases.
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

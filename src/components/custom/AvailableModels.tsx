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
import { isFieldEmptyOrBlank } from "@/lib/utils";

const modelLabel = "Model";
const selectPlaceholder = "Select a model";
const defaultModel = {
  type: "Latest",
  info: "Our fastest model for general use cases.",
};

export const AvailableModels = () => {
  const { settings, setSettings } = useChatStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  );
  const { pulledModels } = useModelsStore(
    useShallow((state) => ({
      pulledModels: state.pulledModels,
      getPulledModels: state.getPulledModels,
    })),
  );

  return (
    <div className="grid gap-3">
      <Label htmlFor="modelsSelect">{modelLabel}</Label>
      <Select
        onValueChange={(value) => {
          if (isFieldEmptyOrBlank(value)) return;
          setSettings({ ...settings, model: value });
        }}
        value={pulledModels[0]?.model}
        name="modelsSelect"
      >
        <SelectTrigger
          id="modelsSelect"
          className="items-start [&_[data-description]]:hidden"
        >
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {pulledModels?.map(({ model }) => (
            <SelectItem value={model ?? ""} key={model}>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Rabbit className="size-5" />
                <div className="grid gap-0.5">
                  <p>
                    {defaultModel.type}
                    <span className="font-medium text-foreground pl-2">
                      {model}
                    </span>
                  </p>
                  <p className="text-xs" data-description>
                    {defaultModel.info}
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

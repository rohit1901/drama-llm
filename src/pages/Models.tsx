import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownToLine, Check, Trash2, X } from "lucide-react";
import { useModelsStore } from "@/store/modelsStore.ts";
import { useEffect } from "react";
import { formatDate, isModelPulled, safeLocaleCompare } from "@/lib/utils.ts";
import ollama from "ollama/browser";
import { LoadingButton } from "@/components/custom/LoadingButton.tsx";
import { useChatStore } from "@/store/chatStore.ts";
import { useToast } from "@/hooks/use-toast.ts";
import SafeNameDisplay from "@/components/SafeNameDisplay.tsx";
import { Model } from "@/types/ollama";
const sortModels = (
  pulledModels: Partial<Model>[],
  availableModels: Partial<Model>[],
) => [
  ...pulledModels.sort((a, b) => safeLocaleCompare(a.name, b.name)),
  ...availableModels
    .filter(({ model }) => !isModelPulled(pulledModels, model))
    .sort((a, b) => safeLocaleCompare(a.name, b.name)),
];
export const Models = () => {
  const { availableModels, pulledModels, getPulledModels, setPulledModels } =
    useModelsStore((state) => ({
      availableModels: state.availableModels,
      pulledModels: state.pulledModels,
      getPulledModels: state.getPulledModels,
      setPulledModels: state.setPulledModels,
    }));
  const { settings, setSettings } = useChatStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));
  useEffect(() => {
    getPulledModels();
  }, []);
  const { toast } = useToast();
  const sortedModels = sortModels(pulledModels, availableModels);
  return (
    <div className="container">
      <Table>
        <TableCaption>Models</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModels.map(({ model, name }) => (
            <TableRow key={model || "unknown"}>
              <TableCell>{model || "Unknown Model"}</TableCell>
              <TableCell>
                <SafeNameDisplay name={name} />
              </TableCell>
              <TableCell>
                {isModelPulled(pulledModels, model || "") ? (
                  <Check className="text-green-500" />
                ) : (
                  <X />
                )}
              </TableCell>
              <TableCell className="flex">
                <LoadingButton
                  variant="ghost"
                  size="sm"
                  disabled={isModelPulled(pulledModels, model || "")}
                  onClick={async () => {
                    if (!model) return;
                    try {
                      await ollama.pull({
                        model,
                      });
                      setPulledModels([...pulledModels, { model: name || "" }]);
                      setPulledModels([
                        ...pulledModels,
                        { ...availableModels.find((m) => m.model === model) },
                      ]);
                      setSettings({ ...settings, model });
                      toast({
                        title: "Model pulled successfully",
                        description: formatDate(),
                      });
                    } catch (error) {
                      console.error("Failed to pull model: ", error);
                      toast({
                        variant: "destructive",
                        title: "Failed to pull model",
                        description: formatDate(),
                      });
                    }
                  }}
                >
                  <ArrowDownToLine className="text-primary" />
                </LoadingButton>

                <LoadingButton
                  disabled={!isModelPulled(pulledModels, model || "")}
                  variant="ghost"
                  onClick={async () => {
                    if (!model) return;
                    try {
                      await ollama.delete({
                        model,
                      });
                      setPulledModels(
                        pulledModels.filter((m) => m.name !== model),
                      );
                      if (settings.model === model) {
                        setSettings({
                          ...settings,
                          model: pulledModels[0]?.name ?? "",
                        });
                      }
                      toast({
                        title: "Model deleted successfully",
                        description: formatDate(),
                      });
                    } catch (error) {
                      console.error("Failed to delete model: ", error);
                      toast({
                        variant: "destructive",
                        title: "Failed to delete model",
                        description: formatDate(),
                      });
                    }
                  }}
                  size="sm"
                >
                  <Trash2 className="text-destructive dark:text-destructive-foreground" />
                </LoadingButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

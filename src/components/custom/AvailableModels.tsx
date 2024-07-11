import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Rabbit } from "lucide-react";
import { Model, Tags } from "@/types/ollama.ts";

export const AvailableModels = () => {
  const [models, setModels] = useState<string[]>([]);
  useEffect(() => {
    fetch("http://localhost:11434/api/tags")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch models");
        return response.json();
      })
      .then((data: Tags) => {
        setModels(data.models.map((obj: Model) => obj.model));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  return (
    <div className="grid gap-3">
      <Label htmlFor="model">Model</Label>
      <Select>
        <SelectTrigger
          id="model"
          className="items-start [&_[data-description]]:hidden"
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models?.map((model) => (
            <SelectItem value="genesis" key={model}>
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

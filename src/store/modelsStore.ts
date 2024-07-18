import { create } from "zustand";
import { listPulledModels } from "@/lib/utils";
import ModelsData from "../data/models.json";
import { ModelResponse } from "ollama";
import { Model } from "@/types/ollama.ts";

type ModelsStore = {
  availableModels: Partial<Model>[];
  pulledModels: Partial<Model>[];
  getPulledModels: () => void;
  setAvailableModels: (availableModels: Partial<ModelResponse>[]) => void;
  setPulledModels: (pulledModels: Partial<ModelResponse>[]) => void;
};
export const useModelsStore = create<ModelsStore>((set, get) => ({
  availableModels: ModelsData,
  pulledModels: [],
  getPulledModels: async () => {
    const availableModels = get().availableModels;
    if (availableModels.length === 0) {
      set({ pulledModels: [], availableModels: [] });
      return;
    }
    try {
      const pulledModels = await listPulledModels();
      set({ pulledModels });
    } catch (error) {
      console.error("ERROR: Fetching models failed... ", error);
    }
  },
  setAvailableModels: (availableModels) => {
    set({ availableModels });
  },
  setPulledModels: (pulledModels) => {
    set({ pulledModels });
  },
}));

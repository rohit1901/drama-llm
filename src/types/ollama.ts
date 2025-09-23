import { ModelResponse } from "ollama";

export type Role = "system" | "user" | "assistant";
export type Model = {
  model: string;
  name: string;
  size: number;
  modified_at: Date;
  digest: string;
  details: ModelDetails;
};
export type ModelDetails = {
  families: string[];
  family: string;
  format: string;
  parameter_size: string;
  parent_model: string;
  quantization_level: string;
};
export type Tags = {
  models: ModelResponse[];
};

export type Model = {
  model: string;
  name: string;
  size: number;
  modified_at: string;
  digest: string;
  details: ModelDetails;
};
export type ModelDetails = {
  families: string[];
  family: string;
  format: string;
  parameter_size: number;
  parent_model: string;
  quantization_level: number;
};
export type Tags = {
  models: Model[];
};
export type Route = {
  path: string;
  value: string;
};

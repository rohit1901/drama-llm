import ModelsData from "../data/models.json";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Model } from "@/types/ollama";
import { ArrowBigDownDash } from "lucide-react";
export const Models = () => {
  return (
    <div className="container">
      <Table>
        <TableCaption>Models</TableCaption>
        <TableRow>
          <TableHead>Model</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
        <TableBody>
          {ModelsData.map((model: Partial<Model>) => (
            <TableRow key={model.model}>
              <TableCell>{model.model}</TableCell>
              <TableCell>{model.name}</TableCell>
              <TableCell>
                <ArrowBigDownDash />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

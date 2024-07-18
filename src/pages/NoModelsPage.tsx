import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Origami } from "lucide-react";
import { Link } from "boom-router";

export const NoModelsPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-background ">
      <Card className="w-full border-0 shadow-none sm:border sm:shadow max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex">
            <Origami className="w-8 h-8 mr-2 fill-primary" />
            <div className="flex justify-between">
              <pre className="ml-2 text-primary">drama-llm</pre>
            </div>
          </CardTitle>
          <CardDescription>No Models found.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <h2>Please download a model to continue.</h2>
        </CardContent>
        <CardFooter>
          <CardDescription>
            <Link
              href="/models"
              className="bg-primary dark:bg-primary-foreground dark:border text-white font-bold py-2 px-4 rounded"
            >
              Download a Model
            </Link>
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
};

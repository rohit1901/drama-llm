import { Button } from "@/components/ui/button";
import Magnet from "@/components/ui/Magnet";
import { Origami } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <p className="text-lg text-muted-foreground">
        Oops! The page you are looking for does not exist.
      </p>
      <Magnet padding={300} disabled={false} magnetStrength={2}>
        <Button
          variant="outline"
          size="icon"
          aria-label="Home"
          className="cursor-default"
        >
          <Origami className="size-5 fill-primary" color="bg-primary" />
        </Button>
      </Magnet>
    </div>
  );
}

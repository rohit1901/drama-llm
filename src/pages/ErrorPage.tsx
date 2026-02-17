import { Button } from "@/components/ui/button";
import Magnet from "@/components/ui/Magnet";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

export default function ErrorPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
      <Magnet padding={300} disabled={false} magnetStrength={2}>
        <div className="rounded-full bg-destructive/10 p-6">
          <AlertCircle className="size-16 text-destructive" />
        </div>
      </Magnet>

      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Ollama Not Running
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Cannot connect to Ollama service on localhost:11434
        </p>

        <div className="bg-muted p-4 rounded-lg text-sm text-left mb-6">
          <p className="font-semibold mb-2">To fix this:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Install Ollama from ollama.ai</li>
            <li>Start Ollama service</li>
            <li>Verify it's running on port 11434</li>
            <li>Click retry below</li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="size-4" />
            Retry Connection
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
              Get Ollama
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

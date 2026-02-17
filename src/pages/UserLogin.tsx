import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { authService } from "@/api";
import { Origami } from "lucide-react";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export function UserLogin() {
  const setAuthenticated = useAppStore().setAuthenticated;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend login API
      const response = await authService.login({ email, password });

      // Authentication successful
      setAuthenticated(true);

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.email}!`,
      });
    } catch (error: any) {
      // Authentication failed
      console.error("Login error:", error);

      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-background ">
      <Card className="w-full border-0 shadow-none sm:border sm:shadow max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex">
            <Origami className="w-8 h-8 mr-2 fill-primary" />
            <div className="flex justify-between">
              <p>Login to</p>
              <pre className="ml-2 text-primary">drama-llm</pre>
            </div>
          </CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

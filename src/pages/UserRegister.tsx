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
import { Link } from "boom-router";

export function UserRegister() {
  const setAuthenticated = useAppStore().setAuthenticated;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Passwords do not match",
      });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      // Call backend register API
      const response = await authService.register({
        email,
        password,
        username: username.trim() || undefined,
      });

      // Registration successful - user is now authenticated
      setAuthenticated(true);

      toast({
        title: "Registration successful",
        description: `Welcome, ${response.user.email}!`,
      });

      // Navigate to home page
      window.location.href = "/";
    } catch (error) {
      // Registration failed
      console.error("Registration error:", error);

      toast({
        variant: "destructive",
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-background">
      <Card className="w-full border-0 shadow-none sm:border sm:shadow max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex">
            <Origami className="w-8 h-8 mr-2 fill-primary" />
            <div className="flex justify-between">
              <p>Register for</p>
              <pre className="ml-2 text-primary">drama-llm</pre>
            </div>
          </CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
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
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                minLength={3}
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

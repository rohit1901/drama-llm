import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { SIWE } from "@/components/custom/SIWE";
import { Separator } from "@/components/ui/separator";
import { Origami } from "lucide-react";
import useLogin from "@/hooks/use-login";
import { transformDisplayStates } from "@/lib/utils";

export function UserLogin() {
  const setAuthenticated = useAppStore().setAuthenticated;
  const showEthLogin = transformDisplayStates(useLogin().ethLogin);
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
            Enter your email below to login to your account{" "}
            {showEthLogin
              ? `or login with
            Ethereum.`
              : `.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={() => setAuthenticated(true)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </form>
          {showEthLogin && (
            <div className="grid gap-4">
              <Separator />
              <SIWE />
            </div>
          )}
        </CardContent>
        <CardFooter>
          {showEthLogin && (
            <CardDescription>
              <a
                href="https://ethereum.org/en/"
                target="_blank"
                className="text-primary"
              >
                Ethereum
              </a>{" "}
              login detected. Ready to surf the Web3 dataverse! 🧠🌊💻🔗
            </CardDescription>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

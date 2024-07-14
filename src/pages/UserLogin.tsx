import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useAppStore} from "@/store/appStore";
import {SIWE} from "@/components/custom/SIWE";
import {Separator} from "@/components/ui/separator.tsx";
import {Origami} from "lucide-react";

export function UserLogin() {
    const setAuthenticated = useAppStore().setAuthenticated;
    return (
        <div className="flex items-center justify-center h-screen w-full bg-background ">
            <Card className="w-full border-0 shadow-none sm:border sm:shadow max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl flex">
                        <Origami className="w-8 h-8 mr-2 fill-primary"/>
                        <div className="flex justify-between">
                            <p>Login to</p>
                            <pre className="ml-2 text-primary">drama-gpt</pre>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required/>
                    </div>
                    <div className="grid gap-4">
                        <Button className="w-full" onClick={() => setAuthenticated(true)}>Sign in</Button>
                        <Separator/>
                        <SIWE/>
                    </div>
                </CardContent>
                <CardFooter>
                    <CardDescription>
                        Don't have an account? <a href="#" className="text-primary">Sign up</a>
                    </CardDescription>
                </CardFooter>
            </Card>
        </div>
    )
}

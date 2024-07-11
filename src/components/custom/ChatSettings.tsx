import {AvailableModels} from "@/components/custom/AvailableModels.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useChatStore} from "@/store/chatStore.ts";

export const ChatSettings = () => {
    const {
        settings,
        setSettings,
    } = useChatStore((state) => ({
        settings: state.settings,
        setSettings: state.setSettings,
    }));
    return (
        <form className="grid w-full items-start gap-6">
            <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                    Settings
                </legend>
                <AvailableModels/>
                <div className="grid gap-3">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input id="temperature" type="number" placeholder="0.4" value={settings.temperature} onChange={(event) => setSettings({ ...settings, temperature: parseFloat(event.currentTarget.value) })}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="top-p">Top P</Label>
                        <Input id="top-p" type="number" placeholder="0.7" onChange={(event) => setSettings({ ...settings, topP: parseFloat(event.currentTarget.value) })} value={settings.topP}/>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="top-k">Top K</Label>
                        <Input id="top-k" type="number" placeholder="0.0" onChange={(event) => setSettings({ ...settings, topK: parseFloat(event.currentTarget.value) })} value={settings.topK}/>
                    </div>
                </div>
            </fieldset>
            <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                    Messages
                </legend>
                <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="system" onValueChange={(value) => setSettings({ ...settings, role: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                        id="content"
                        placeholder="You are a..."
                        className="min-h-[9.5rem]"
                    />
                </div>
            </fieldset>
        </form>
    )
}
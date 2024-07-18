import { AvailableModels } from "@/components/custom/AvailableModels";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/chatStore";

export const ChatSettings = () => {
  const { settings, setSettings } = useChatStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));
  return (
    <form className="grid w-full items-start gap-6">
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
        <AvailableModels />
        <div className="grid gap-3">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            name="temperature"
            type="number"
            placeholder="0.4"
            value={settings.temperature}
            onChange={(event) =>
              setSettings({
                ...settings,
                temperature: parseFloat(event.currentTarget.value),
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="top-p">Top P</Label>
            <Input
              id="top-p"
              name="top-p"
              type="number"
              placeholder="0.7"
              onChange={(event) => {
                setSettings({
                  ...settings,
                  topP: parseFloat(event.currentTarget.value),
                });
              }}
              value={settings.topP}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="top-k">Top K</Label>
            <Input
              id="top-k"
              name="top-k"
              type="number"
              placeholder="0.0"
              onChange={(event) =>
                setSettings({
                  ...settings,
                  topK: parseFloat(event.currentTarget.value),
                })
              }
              value={settings.topK}
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Messages</legend>
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <Select
            name="role"
            value={settings.role}
            onValueChange={(value) => {
              if (!value || value === "") return;
              setSettings({ ...settings, role: value });
            }}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
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
            name="content"
            placeholder="You are a..."
            className="min-h-[9.5rem]"
          />
        </div>
      </fieldset>
    </form>
  );
};

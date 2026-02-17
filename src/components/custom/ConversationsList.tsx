import { useEffect, useState, useCallback } from "react";
import { conversationsService } from "@/api";
import type { ConversationWithCount } from "@/api/conversations";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Search,
  Download,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ConversationsList() {
  const [conversations, setConversations] = useState<ConversationWithCount[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const {
    currentConversationId,
    loadConversation,
    createNewConversation,
    clearMessages,
  } = useChatStore();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching conversations...");
      const data = await conversationsService.getAllConversations();
      console.log("📦 Received data:", data);
      console.log("📊 Data type:", typeof data);
      console.log(
        "📏 Data length:",
        Array.isArray(data) ? data.length : "NOT AN ARRAY",
      );
      setConversations(data);
    } catch (error) {
      console.error("❌ Failed to fetch conversations:", error);
      setConversations([]); // Set to empty array on error
      toast({
        variant: "destructive",
        title: "Failed to load conversations",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh conversations list when a conversation is created or changed
  useEffect(() => {
    if (currentConversationId) {
      fetchConversations();
    }
  }, [currentConversationId, fetchConversations]);

  const handleNewConversation = async () => {
    try {
      clearMessages();
      await createNewConversation();
      await fetchConversations();
      toast({
        title: "New conversation created",
        description: "Start chatting!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create conversation",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        await fetchConversations();
        return;
      }

      try {
        setIsSearching(true);
        const results = await conversationsService.searchConversations(query);
        setConversations(results);
      } catch (error) {
        console.error("❌ Search failed:", error);
        toast({
          variant: "destructive",
          title: "Search failed",
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      } finally {
        setIsSearching(false);
      }
    },
    [fetchConversations, toast],
  );

  const handleExportMarkdown = async (id: string, title: string) => {
    try {
      const exportData = await conversationsService.exportConversation(id);

      // Convert to Markdown format
      let markdown = `# ${exportData.conversation.title}\n\n`;
      markdown += `**Model:** ${exportData.conversation.model}\n`;
      markdown += `**Created:** ${new Date(exportData.conversation.created_at).toLocaleString()}\n`;
      markdown += `**Exported:** ${new Date(exportData.exported_at).toLocaleString()}\n\n`;
      markdown += `---\n\n`;

      exportData.messages.forEach((msg) => {
        const role = msg.role === "user" ? "👤 User" : "🤖 Assistant";
        markdown += `## ${role}\n\n`;
        markdown += `${msg.content}\n\n`;
        markdown += `*${new Date(msg.created_at).toLocaleString()}*\n\n`;
        markdown += `---\n\n`;
      });

      // Create Markdown blob
      const mdBlob = new Blob([markdown], { type: "text/markdown" });

      // Create download link
      const url = URL.createObjectURL(mdBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Conversation exported",
        description: "Downloaded as Markdown file",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleSelectConversation = async (id: string) => {
    try {
      await loadConversation(id);
      toast({
        title: "Conversation loaded",
        description: "Continue your chat",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load conversation",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await conversationsService.deleteConversation(id);

      // If we deleted the current conversation, clear messages
      if (id === currentConversationId) {
        clearMessages();
      }

      await fetchConversations();

      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete conversation",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchConversations}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
        <Button onClick={handleNewConversation} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => handleSearch("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {(loading || isSearching) &&
        (!conversations || conversations.length === 0) ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery
              ? "No conversations found"
              : "No conversations yet. Start a new chat!"}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-colors hover:bg-accent",
                  currentConversationId === conversation.id &&
                    "bg-accent border border-primary/20",
                )}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {conversation.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{conversation.message_count} messages</span>
                      <span>•</span>
                      <span>{formatDate(conversation.updated_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {conversation.model}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportMarkdown(
                          conversation.id,
                          conversation.title,
                        );
                      }}
                      title="Export as Markdown"
                    >
                      <Download className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(conversation.id);
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {conversation.last_message && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {conversation.last_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteConversation(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { formatDate } from "@/lib/utils";
import Markdown from "react-markdown";
import {
  Copy,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { CopyToClipboard } from "@/components/custom/CopyToClipboard";
import Code from "./Code";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type ChatBubbleProps = {
  type: string;
  message: string;
  isStreaming?: boolean;
  messageIndex?: number;
  onEdit?: (index: number, newContent: string) => void;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number) => void;
};

export const ChatBubble = ({
  type,
  message,
  isStreaming,
  messageIndex,
  onEdit,
  onDelete,
  onRegenerate,
}: ChatBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSaveEdit = () => {
    if (messageIndex !== undefined && onEdit && editedContent.trim()) {
      onEdit(messageIndex, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(message);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (messageIndex !== undefined && onDelete) {
      onDelete(messageIndex);
      setShowDeleteDialog(false);
    }
  };

  const handleRegenerate = () => {
    if (messageIndex !== undefined && onRegenerate) {
      onRegenerate(messageIndex);
    }
  };
  return (
    <div
      className={`flex flex-row sm:flex-col ${type === "question" ? "items-start" : "items-end"} mb-4 sm:mb-2`}
    >
      <div
        className={`sm:max-w-[45vw] ${type === "question" ? "items-start" : "items-end"}`}
      >
        <div
          className={`flex flex-col justify-between ${type === "question" ? "bg-card" : "bg-slate-300 dark:bg-slate-800"} rounded-lg border p-4 group`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px] text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm">
                <Markdown
                  components={{
                    code(props) {
                      return <Code {...props} />;
                    },
                  }}
                >
                  {message}
                </Markdown>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  {isStreaming && (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      <span>Generating...</span>
                    </>
                  )}
                  {!isStreaming && formatDate()}
                </span>
                {!isStreaming && (
                  <div className="flex items-center gap-1">
                    <CopyToClipboard
                      text={message}
                      description={"Message copied to clipboard!"}
                      button={<Copy className="size-3" />}
                    />
                    {messageIndex !== undefined &&
                      (onEdit || onDelete || onRegenerate) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => setIsEditing(true)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {type === "question" && onRegenerate && (
                              <DropdownMenuItem onClick={handleRegenerate}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate Response
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setShowDeleteDialog(true)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              message
              {type === "question" && " and all responses after it"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownToLine,
  Check,
  Trash2,
  X,
  Search,
  Filter,
  ArrowUpDown,
  XCircle,
} from "lucide-react";
import { useModelsStore } from "@/store/modelsStore";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { formatDate, isModelPulled, safeLocaleCompare } from "@/lib/utils";
import ollama from "ollama/browser";
import { LoadingButton } from "@/components/custom/LoadingButton";
import { useChatStore } from "@/store/chatStore";
import { useToast } from "@/hooks/use-toast";
import SafeNameDisplay from "@/components/SafeNameDisplay";
import { Model } from "@/types/ollama";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Utility that merges pulled and available models.
 * The function is pure – it never mutates the incoming arrays.
 */
const mergeModels = (
  pulledModels: Partial<Model>[],
  availableModels: Partial<Model>[],
): Array<Partial<Model>> => [
  ...pulledModels,
  ...availableModels.filter(({ model }) => !isModelPulled(pulledModels, model)),
];

type SortOption = "name" | "status" | "size";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "pulled" | "available";

/**
 * Sort models based on the selected option and order
 */
const sortModelsList = (
  models: Array<Partial<Model>>,
  pulledModels: Partial<Model>[],
  sortBy: SortOption,
  sortOrder: SortOrder,
): Array<Partial<Model>> => {
  const sorted = [...models];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name": {
        comparison = safeLocaleCompare(a.name, b.name);
        break;
      }
      case "status": {
        const aIsPulled = isModelPulled(pulledModels, a.model ?? "");
        const bIsPulled = isModelPulled(pulledModels, b.model ?? "");
        comparison = aIsPulled === bIsPulled ? 0 : aIsPulled ? -1 : 1;
        break;
      }
      case "size": {
        // If size information is available (for pulled models)
        const aSize = (a as Model & { size?: number }).size ?? 0;
        const bSize = (b as Model & { size?: number }).size ?? 0;
        comparison = aSize - bSize;
        break;
      }
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
};

export const Models = () => {
  /* ----------------------- Redux‑like stores ----------------------- */
  const { availableModels, pulledModels, getPulledModels, setPulledModels } =
    useModelsStore((state) => ({
      availableModels: state.availableModels,
      pulledModels: state.pulledModels,
      getPulledModels: state.getPulledModels,
      setPulledModels: state.setPulledModels,
    }));

  const { settings, setSettings } = useChatStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));

  /* ----------------------- One‑time fetch ----------------------- */
  useEffect(() => {
    getPulledModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { toast } = useToast();

  /* ----------------------- Search and filter state ----------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  /* ----------------------- Debounced search effect ----------------------- */
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  /* ----------------------- Merged models list ----------------------- */
  const mergedModels = useMemo(
    () => mergeModels(pulledModels, availableModels),
    [pulledModels, availableModels],
  );

  /* ----------------------- Filtered and sorted models ----------------------- */
  const filteredModels = useMemo(() => {
    let filtered = mergedModels;

    // Filter by search query
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        ({ model, name }) =>
          model?.toLowerCase().includes(query) ||
          name?.toLowerCase().includes(query),
      );
    }

    // Filter by status
    if (filterStatus === "pulled") {
      filtered = filtered.filter(({ model }) =>
        isModelPulled(pulledModels, model ?? ""),
      );
    } else if (filterStatus === "available") {
      filtered = filtered.filter(
        ({ model }) => !isModelPulled(pulledModels, model ?? ""),
      );
    }

    // Sort models
    return sortModelsList(filtered, pulledModels, sortBy, sortOrder);
  }, [
    mergedModels,
    debouncedQuery,
    filterStatus,
    sortBy,
    sortOrder,
    pulledModels,
  ]);

  /* ----------------------- Active filters count ----------------------- */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (sortBy !== "name" || sortOrder !== "asc") count++;
    return count;
  }, [filterStatus, sortBy, sortOrder]);

  /* ----------------------- Clear all filters ----------------------- */
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setFilterStatus("all");
    setSortBy("name");
    setSortOrder("asc");
  }, []);

  /* ----------------------- Keyboard shortcuts ----------------------- */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search on "/" key
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("model-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  /* ----------------------- Pull handler ----------------------- */
  const handlePull = useCallback(
    async (model?: string, name?: string) => {
      if (!model) return;

      try {
        await ollama.pull({ model });

        /* Avoid mutating state twice – build the new array once */
        const newPulled = [
          ...pulledModels,
          {
            model,
            name: name ?? model, // fall back to the model id if no display name
          },
        ];
        setPulledModels(newPulled);

        setSettings({ ...settings, model });
        toast({
          title: "Model pulled successfully",
          description: formatDate(),
        });
      } catch (err) {
        console.error("Failed to pull model:", err);
        toast({
          variant: "destructive",
          title: "Failed to pull model",
          description: formatDate(),
        });
      }
    },
    [pulledModels, settings, setPulledModels, setSettings, toast],
  );

  /* ----------------------- Delete handler ----------------------- */
  const handleDelete = useCallback(
    async (model: string | undefined) => {
      if (!model) return;

      try {
        await ollama.delete({ model });

        /* Remove the model using its unique identifier */
        const newPulled = pulledModels.filter((m) => m.model !== model);
        setPulledModels(newPulled);

        /* If the deleted model is currently selected, reset the selector */
        if (settings.model === model && newPulled.length) {
          setSettings({
            ...settings,
            model: newPulled[0].model ?? "",
          });
        }

        toast({
          title: "Model deleted successfully",
          description: formatDate(),
        });
      } catch (err) {
        console.error("Failed to delete model:", err);
        toast({
          variant: "destructive",
          title: "Failed to delete model",
          description: formatDate(),
        });
      }
    },
    [pulledModels, settings, setSettings, setPulledModels, toast],
  );

  /* ----------------------- Render ----------------------- */
  return (
    <div className="container">
      {/* Search and Filters Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            id="model-search"
            placeholder="Search models... (Press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                {filterStatus !== "all" && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterStatus === "all"}
                onCheckedChange={() => setFilterStatus("all")}
              >
                All Models
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus === "pulled"}
                onCheckedChange={() => setFilterStatus("pulled")}
              >
                Pulled Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus === "available"}
                onCheckedChange={() => setFilterStatus("available")}
              >
                Available Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Options */}
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="gap-2"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 ml-auto"
            >
              <XCircle className="h-4 w-4" />
              Clear Filters
            </Button>
          )}

          {/* Results Count */}
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredModels.length}{" "}
            {filteredModels.length === 1 ? "model" : "models"}
          </div>
        </div>
      </div>

      {/* Models Table */}
      <Table>
        <TableCaption>
          {filteredModels.length === 0 && debouncedQuery
            ? `No models found matching "${debouncedQuery}"`
            : "Available Ollama Models"}
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredModels.map(({ model, name }) => {
            const key = `${model ?? "unknown"}-${name ?? ""}`;
            const isPulled = isModelPulled(pulledModels, model ?? "");

            return (
              <TableRow key={key}>
                <TableCell>{model ?? "Unknown Model"}</TableCell>

                <TableCell>
                  <SafeNameDisplay name={name} />
                </TableCell>

                <TableCell>
                  {isPulled ? <Check className="text-green-500" /> : <X />}
                </TableCell>

                <TableCell className="flex gap-2">
                  <LoadingButton
                    variant="ghost"
                    size="sm"
                    disabled={isPulled}
                    onClick={() => handlePull(model, name)}
                  >
                    <ArrowDownToLine className="text-primary" />
                  </LoadingButton>

                  <LoadingButton
                    variant="ghost"
                    size="sm"
                    disabled={!isPulled}
                    onClick={() => handleDelete(model)}
                  >
                    <Trash2 className="text-destructive" />
                  </LoadingButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

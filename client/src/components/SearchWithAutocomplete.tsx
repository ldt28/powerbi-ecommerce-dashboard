import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Clock, X } from "lucide-react";

interface SearchResult {
  id: string;
  type: "dashboard" | "metric" | "report" | "config";
  title: string;
  description?: string;
  score: number;
}

interface FilterHistory {
  id: string;
  timestamp: Date;
  conditions: Array<{ field: string; operator: string; value: unknown }>;
  resultCount: number;
}

interface SearchWithAutocompleteProps {
  onSearch: (query: string) => void;
  onFilterSelect: (conditions: Array<{ field: string; operator: string; value: unknown }>) => void;
  suggestions?: string[];
  history?: FilterHistory[];
}

/**
 * Search Component with Autocomplete and Filter History
 */
export function SearchWithAutocomplete({
  onSearch,
  onFilterSelect,
  suggestions = [],
  history = [],
}: SearchWithAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Mock search results
  const mockResults: SearchResult[] = [
    { id: "1", type: "dashboard", title: "Revenue Dashboard", description: "Total revenue metrics", score: 95 },
    { id: "2", type: "dashboard", title: "Order Analytics", description: "Order processing", score: 85 },
    { id: "3", type: "metric", title: "Revenue Metric", description: "Revenue per customer", score: 75 },
  ];

  useEffect(() => {
    if (query.length > 0) {
      // Filter mock results based on query
      const filtered = mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    setQuery("");
    setIsOpen(false);
  };

  const handleFilterClick = (filter: FilterHistory) => {
    onFilterSelect(filter.conditions);
    setShowHistory(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "dashboard":
        return "bg-blue-100 text-blue-800";
      case "metric":
        return "bg-green-100 text-green-800";
      case "report":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search dashboards, metrics, reports..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length > 0) setIsOpen(true);
            else if (history.length > 0) setShowHistory(true);
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-0 z-50 shadow-lg">
          <div className="max-h-80 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSearch(result.title)}
                className="w-full text-left px-4 py-3 hover:bg-accent border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xs px-2 py-1 rounded ${getTypeColor(result.type)}`}>
                    {result.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Filter History */}
      {showHistory && history.length > 0 && !query && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-0 z-50 shadow-lg">
          <div className="p-3 border-b">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Filters
            </h4>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {history.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => handleFilterClick(item)}
                className="w-full text-left px-4 py-3 hover:bg-accent border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {item.conditions.map((c) => `${c.field}: ${c.value}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.resultCount} results
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {isOpen && results.length === 0 && query && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 shadow-lg text-center">
          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
        </Card>
      )}
    </div>
  );
}

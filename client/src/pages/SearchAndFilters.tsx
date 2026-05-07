import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchWithAutocomplete } from "@/components/SearchWithAutocomplete";
import { AdvancedFilterBuilder } from "@/components/AdvancedFilterBuilder";
import { Search, Filter, History, Save } from "lucide-react";
import { toast } from "sonner";

interface FilterCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in" | "between";
  value: string | number | string[];
}

interface FilterHistory {
  id: string;
  timestamp: Date;
  conditions: FilterCondition[];
  resultCount: number;
}

/**
 * Search and Filters Page
 * Comprehensive search and filtering interface
 */
export default function SearchAndFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [filterHistory, setFilterHistory] = useState<FilterHistory[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 60000),
      conditions: [{ field: "marketplace", operator: "eq", value: "Amazon" }],
      resultCount: 245,
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 300000),
      conditions: [{ field: "status", operator: "eq", value: "Active" }],
      resultCount: 1203,
    },
  ]);
  const [savedPresets, setSavedPresets] = useState([
    {
      id: "preset_1",
      name: "High Revenue Items",
      conditions: [{ field: "revenue", operator: "gt", value: 1000 }],
    },
    {
      id: "preset_2",
      name: "Active Amazon Products",
      conditions: [
        { field: "marketplace", operator: "eq", value: "Amazon" },
        { field: "status", operator: "eq", value: "Active" },
      ],
    },
  ]);

  const availableFields = [
    { name: "marketplace", label: "Marketplace", type: "text" as const },
    { name: "category", label: "Category", type: "text" as const },
    { name: "status", label: "Status", type: "text" as const },
    { name: "revenue", label: "Revenue", type: "number" as const },
    { name: "orders", label: "Orders", type: "number" as const },
    { name: "date", label: "Date", type: "date" as const },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast.success(`Searching for: ${query}`);
  };

  const handleApplyFilters = (conditions: FilterCondition[]) => {
    setAppliedFilters(conditions);
    const newHistoryItem: FilterHistory = {
      id: `hist_${Date.now()}`,
      timestamp: new Date(),
      conditions,
      resultCount: Math.floor(Math.random() * 1000),
    };
    setFilterHistory([newHistoryItem, ...filterHistory.slice(0, 9)]);
    toast.success(`Applied ${conditions.length} filter(s)`);
  };

  const handleSavePreset = (name: string, conditions: FilterCondition[]) => {
    const newPreset = {
      id: `preset_${Date.now()}`,
      name,
      conditions,
    };
    setSavedPresets([...savedPresets, newPreset]);
    toast.success(`Filter preset "${name}" saved`);
  };

  const handleApplyPreset = (conditions: FilterCondition[]) => {
    setAppliedFilters(conditions);
    toast.success("Filter preset applied");
  };

  const handleDeletePreset = (id: string) => {
    setSavedPresets(savedPresets.filter((p) => p.id !== id));
    toast.success("Filter preset deleted");
  };

  const handleClearHistory = () => {
    setFilterHistory([]);
    toast.success("Filter history cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search & Filters</h1>
          <p className="text-muted-foreground">
            Find and filter dashboards, metrics, and reports across your entire workspace
          </p>
        </div>

        {/* Main Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Global Search
            </CardTitle>
            <CardDescription>Full-text search with autocomplete suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchWithAutocomplete
              onSearch={handleSearch}
              onFilterSelect={handleApplyFilters}
              history={filterHistory}
            />
            {searchQuery && (
              <div className="mt-4 p-3 bg-accent rounded-lg">
                <p className="text-sm">
                  Search results for: <span className="font-semibold">{searchQuery}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="builder" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">
              <Filter className="h-4 w-4 mr-2" />
              Filter Builder
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Save className="h-4 w-4 mr-2" />
              Saved Presets
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Filter Builder Tab */}
          <TabsContent value="builder">
            <AdvancedFilterBuilder
              availableFields={availableFields}
              onApply={handleApplyFilters}
              onSave={handleSavePreset}
            />

            {appliedFilters.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Active Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {appliedFilters.map((filter, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-accent rounded">
                        <span className="text-sm font-medium">{filter.field}</span>
                        <span className="text-xs text-muted-foreground">{filter.operator}</span>
                        <span className="text-sm">{String(filter.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Presets Tab */}
          <TabsContent value="presets">
            <Card>
              <CardHeader>
                <CardTitle>Saved Filter Presets</CardTitle>
                <CardDescription>Quick access to your frequently used filters</CardDescription>
              </CardHeader>
              <CardContent>
                {savedPresets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved presets yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {preset.conditions.length} condition{preset.conditions.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyPreset(preset.conditions)}
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePreset(preset.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Filter History</CardTitle>
                  <CardDescription>Your recent filter searches</CardDescription>
                </div>
                {filterHistory.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearHistory}>
                    Clear History
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {filterHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No filter history yet</p>
                ) : (
                  <div className="space-y-3">
                    {filterHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => handleApplyPreset(item.conditions)}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.conditions.map((c) => `${c.field}: ${c.value}`).join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.resultCount} results • {item.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Reuse
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

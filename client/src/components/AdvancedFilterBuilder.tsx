import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

export interface FilterCondition {
  id: string;
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in" | "between";
  value: string | number | string[];
}

interface AdvancedFilterBuilderProps {
  onApply: (conditions: FilterCondition[]) => void;
  onSave?: (name: string, conditions: FilterCondition[]) => void;
  availableFields: Array<{ name: string; label: string; type: "text" | "number" | "date" }>;
}

const OPERATORS = {
  text: [
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "contains", label: "Contains" },
  ],
  number: [
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "gte", label: "Greater or Equal" },
    { value: "lte", label: "Less or Equal" },
    { value: "between", label: "Between" },
  ],
  date: [
    { value: "eq", label: "Equals" },
    { value: "gt", label: "After" },
    { value: "lt", label: "Before" },
    { value: "between", label: "Between" },
  ],
};

/**
 * Advanced Filter Builder Component
 * Allows users to create complex filter conditions with multiple fields
 */
export function AdvancedFilterBuilder({
  onApply,
  onSave,
  availableFields,
}: AdvancedFilterBuilderProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([
    { id: "1", field: availableFields[0]?.name || "", operator: "eq", value: "" },
  ]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [filterName, setFilterName] = useState("");

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: String(Date.now()),
      field: availableFields[0]?.name || "",
      operator: "eq",
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const getFieldType = (fieldName: string) => {
    return availableFields.find((f) => f.name === fieldName)?.type || "text";
  };

  const handleApply = () => {
    onApply(conditions);
  };

  const handleSave = () => {
    if (filterName.trim() && onSave) {
      onSave(filterName, conditions);
      setFilterName("");
      setSaveModalOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Filter Builder</CardTitle>
        <CardDescription>Create complex filters with multiple conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Conditions */}
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div key={condition.id} className="flex gap-2 items-end">
              {index > 0 && <div className="text-sm text-muted-foreground w-8">AND</div>}

              {/* Field Selector */}
              <div className="flex-1 min-w-0">
                <Label className="text-xs">Field</Label>
                <Select
                  value={condition.field}
                  onValueChange={(value) => updateCondition(condition.id, { field: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator Selector */}
              <div className="flex-1 min-w-0">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={condition.operator}
                  onValueChange={(value) =>
                    updateCondition(condition.id, {
                      operator: value as FilterCondition["operator"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS[getFieldType(condition.field) as keyof typeof OPERATORS].map(
                      (op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input */}
              <div className="flex-1 min-w-0">
                <Label className="text-xs">Value</Label>
                <Input
                  type={getFieldType(condition.field) === "number" ? "number" : "text"}
                  placeholder="Enter value"
                  value={String(condition.value)}
                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                />
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(condition.id)}
                className="h-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={addCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
          <Button onClick={handleApply} className="ml-auto">
            Apply Filters
          </Button>
          {onSave && (
            <Button variant="outline" onClick={() => setSaveModalOpen(true)}>
              Save as Preset
            </Button>
          )}
        </div>

        {/* Save Modal */}
        {saveModalOpen && (
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., High Revenue Items"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!filterName.trim()}>
                Save Filter
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

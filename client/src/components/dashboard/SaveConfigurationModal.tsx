import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

export interface ComparisonConfig {
  id: string;
  name: string;
  description?: string;
  comparisonType: "period" | "platform";
  periodType?: "week" | "month" | "quarter" | "year";
  selectedPlatforms?: string[];
  createdAt: number;
  updatedAt: number;
}

interface SaveConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ComparisonConfig) => void;
  comparisonType: "period" | "platform";
  periodType?: "week" | "month" | "quarter" | "year";
  selectedPlatforms?: string[];
}

export default function SaveConfigurationModal({
  isOpen,
  onClose,
  onSave,
  comparisonType,
  periodType,
  selectedPlatforms,
}: SaveConfigurationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setError("Configuration name is required");
      return;
    }

    if (name.trim().length < 3) {
      setError("Configuration name must be at least 3 characters");
      return;
    }

    if (name.trim().length > 50) {
      setError("Configuration name must be less than 50 characters");
      return;
    }

    const config: ComparisonConfig = {
      id: `config-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      comparisonType,
      periodType,
      selectedPlatforms,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSave(config);
    setName("");
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Comparison Configuration</DialogTitle>
          <DialogDescription>
            Save this comparison setup with a name for quick access later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Configuration Summary */}
          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">Configuration Details:</p>
            <p className="text-muted-foreground">
              Type: <span className="font-medium capitalize">{comparisonType}</span>
            </p>
            {comparisonType === "period" && periodType && (
              <p className="text-muted-foreground">
                Period: <span className="font-medium capitalize">{periodType}</span>
              </p>
            )}
            {comparisonType === "platform" && selectedPlatforms && selectedPlatforms.length > 0 && (
              <p className="text-muted-foreground">
                Platforms: <span className="font-medium">{selectedPlatforms.length} selected</span>
              </p>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="config-name">Configuration Name *</Label>
            <Input
              id="config-name"
              placeholder="e.g., Monthly vs Last Month"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">{name.length}/50 characters</p>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="config-description">Description (Optional)</Label>
            <Textarea
              id="config-description"
              placeholder="Add notes about this comparison..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{description.length}/200 characters</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Trash2, Download, ChevronDown } from "lucide-react";
import type { ComparisonConfig } from "./SaveConfigurationModal";

interface SavedConfigurationsProps {
  configurations: ComparisonConfig[];
  onLoad: (config: ComparisonConfig) => void;
  onDelete: (configId: string) => void;
}

export default function SavedConfigurations({
  configurations,
  onLoad,
  onDelete,
}: SavedConfigurationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (configurations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Configurations</CardTitle>
          <CardDescription>No saved configurations yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Save your comparison configurations to quickly access them later. Click "Save Configuration" to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConfigurationSummary = (config: ComparisonConfig): string => {
    if (config.comparisonType === "period") {
      return `${config.periodType?.charAt(0).toUpperCase()}${config.periodType?.slice(1)} Comparison`;
    } else {
      const platformCount = config.selectedPlatforms?.length || 0;
      return `${platformCount} Platform${platformCount !== 1 ? "s" : ""} Comparison`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Configurations</CardTitle>
        <CardDescription>
          {configurations.length} configuration{configurations.length !== 1 ? "s" : ""} saved
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {configurations.map((config) => (
          <div key={config.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === config.id ? null : config.id)}
              className="w-full p-3 hover:bg-muted/50 transition-colors flex items-center justify-between text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{config.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getConfigurationSummary(config)} • {formatDate(config.createdAt)}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ml-2 ${
                  expandedId === config.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedId === config.id && (
              <div className="bg-muted/30 border-t p-3 space-y-3">
                {/* Configuration Details */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{config.comparisonType}</p>
                  </div>

                  {config.comparisonType === "period" && config.periodType && (
                    <div>
                      <p className="text-muted-foreground">Period</p>
                      <p className="font-medium capitalize">{config.periodType}</p>
                    </div>
                  )}

                  {config.comparisonType === "platform" && config.selectedPlatforms && (
                    <div>
                      <p className="text-muted-foreground">Platforms</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.selectedPlatforms.map((platform) => (
                          <span
                            key={platform}
                            className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.description && (
                    <div>
                      <p className="text-muted-foreground">Description</p>
                      <p className="text-sm">{config.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-xs">{formatDate(config.updatedAt)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => onLoad(config)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Load Configuration
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(config.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

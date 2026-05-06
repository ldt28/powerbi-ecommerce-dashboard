import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Plus, Trash2, Edit, Mail } from "lucide-react";
import { toast } from "sonner";

interface ExportSchedule {
  id: number;
  name: string;
  format: "csv" | "excel" | "pdf";
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  emailRecipients: string[];
  includeMetrics: string[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

interface ExportSchedulerProps {
  onScheduleCreate?: (schedule: Omit<ExportSchedule, "id" | "lastRun" | "nextRun">) => Promise<void>;
  onScheduleUpdate?: (id: number, schedule: Omit<ExportSchedule, "id" | "lastRun" | "nextRun">) => Promise<void>;
  onScheduleDelete?: (id: number) => Promise<void>;
  existingSchedules?: ExportSchedule[];
  availableMetrics?: string[];
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FREQUENCIES = ["daily", "weekly", "monthly"] as const;
const FORMATS = ["csv", "excel", "pdf"] as const;

/**
 * Export Scheduler Component
 * Allows users to schedule recurring data exports
 */
export function ExportScheduler({
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete,
  existingSchedules = [],
  availableMetrics = ["Revenue", "Orders", "Conversion Rate", "AOV", "Customers", "Products"],
}: ExportSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ExportSchedule, "id" | "lastRun" | "nextRun">>({
    name: "",
    format: "csv",
    frequency: "daily",
    time: "09:00",
    emailRecipients: [],
    includeMetrics: [],
    isActive: true,
  });
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEmail = () => {
    if (newEmail && !formData.emailRecipients.includes(newEmail)) {
      setFormData({
        ...formData,
        emailRecipients: [...formData.emailRecipients, newEmail],
      });
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setFormData({
      ...formData,
      emailRecipients: formData.emailRecipients.filter((e) => e !== email),
    });
  };

  const handleToggleMetric = (metric: string) => {
    if (formData.includeMetrics.includes(metric)) {
      setFormData({
        ...formData,
        includeMetrics: formData.includeMetrics.filter((m) => m !== metric),
      });
    } else {
      setFormData({
        ...formData,
        includeMetrics: [...formData.includeMetrics, metric],
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a schedule name");
      return;
    }

    if (formData.emailRecipients.length === 0) {
      toast.error("Please add at least one email recipient");
      return;
    }

    if (formData.includeMetrics.length === 0) {
      toast.error("Please select at least one metric");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await onScheduleUpdate?.(editingId, formData);
        toast.success("Schedule updated successfully");
      } else {
        await onScheduleCreate?.(formData);
        toast.success("Schedule created successfully");
      }

      // Reset form
      setFormData({
        name: "",
        format: "csv",
        frequency: "daily",
        time: "09:00",
        emailRecipients: [],
        includeMetrics: [],
        isActive: true,
      });
      setEditingId(null);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule: ExportSchedule) => {
    setFormData({
      name: schedule.name,
      format: schedule.format,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      time: schedule.time,
      emailRecipients: schedule.emailRecipients,
      includeMetrics: schedule.includeMetrics,
      isActive: schedule.isActive,
    });
    setEditingId(schedule.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      try {
        await onScheduleDelete?.(id);
        toast.success("Schedule deleted successfully");
      } catch (error) {
        toast.error("Failed to delete schedule");
      }
    }
  };

  const formatNextRun = (schedule: ExportSchedule) => {
    if (!schedule.nextRun) return "Not scheduled";
    const date = new Date(schedule.nextRun);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Schedules</h2>
          <p className="text-muted-foreground">Automate recurring data exports to email</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Schedule" : "Create Export Schedule"}</DialogTitle>
              <DialogDescription>
                Set up automatic data exports to be sent to your email on a recurring basis
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Schedule Name */}
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Schedule Name</Label>
                <Input
                  id="schedule-name"
                  placeholder="e.g., Weekly Revenue Report"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Format and Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value as any })}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((fmt) => (
                        <SelectItem key={fmt} value={fmt}>
                          {fmt.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time of Day</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* Email Recipients */}
              <div className="space-y-3">
                <Label>Email Recipients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="recipient@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
                  />
                  <Button onClick={handleAddEmail} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.emailRecipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button onClick={() => handleRemoveEmail(email)} className="ml-1">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics Selection */}
              <div className="space-y-3">
                <Label>Metrics to Include</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={formData.includeMetrics.includes(metric)}
                        onCheckedChange={() => handleToggleMetric(metric)}
                      />
                      <Label htmlFor={metric} className="font-normal cursor-pointer">
                        {metric}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {existingSchedules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No export schedules yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          existingSchedules.map((schedule) => (
            <Card key={schedule.id} className={!schedule.isActive ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-lg">{schedule.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.time}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={schedule.isActive ? "default" : "secondary"}>
                    {schedule.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-medium">{schedule.format.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recipients</p>
                    <p className="font-medium">{schedule.emailRecipients.length} email(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Metrics</p>
                    <p className="font-medium">{schedule.includeMetrics.length} selected</p>
                  </div>
                </div>

                {/* Recipients and Metrics Preview */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">Recipients</p>
                    <div className="flex flex-wrap gap-1">
                      {schedule.emailRecipients.map((email) => (
                        <Badge key={email} variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Metrics</p>
                    <div className="flex flex-wrap gap-1">
                      {schedule.includeMetrics.map((metric) => (
                        <Badge key={metric} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Run */}
                <div className="text-sm">
                  <p className="text-muted-foreground">Next Run</p>
                  <p className="font-medium">{formatNextRun(schedule)}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

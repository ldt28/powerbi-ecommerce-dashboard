import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Download, Filter } from "lucide-react";
import { toast } from "sonner";

interface ActivityLogEntry {
  id: number;
  userId: number;
  userName: string;
  action: string;
  resourceType: string;
  resourceName: string;
  timestamp: Date;
  details?: string;
  ipAddress?: string;
}

/**
 * Activity Logs Page
 * Shows audit trail of user actions and changes
 */
export default function ActivityLogs() {
  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [logs, setLogs] = useState<ActivityLogEntry[]>([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      action: "CREATE_DASHBOARD",
      resourceType: "dashboard",
      resourceName: "Q1 Revenue Report",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: "Created new dashboard with 5 widgets",
      ipAddress: "192.168.1.1",
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      action: "EDIT_DASHBOARD",
      resourceType: "dashboard",
      resourceName: "Q1 Revenue Report",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      details: "Updated chart colors and labels",
      ipAddress: "192.168.1.2",
    },
    {
      id: 3,
      userId: 1,
      userName: "John Doe",
      action: "INVITE_MEMBER",
      resourceType: "team_member",
      resourceName: "alice@example.com",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      details: "Invited with Editor role",
      ipAddress: "192.168.1.1",
    },
    {
      id: 4,
      userId: 3,
      userName: "Bob Johnson",
      action: "EXPORT_DATA",
      resourceType: "dashboard",
      resourceName: "Q1 Revenue Report",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      details: "Exported as CSV",
      ipAddress: "192.168.1.3",
    },
    {
      id: 5,
      userId: 2,
      userName: "Jane Smith",
      action: "SHARE_DASHBOARD",
      resourceType: "dashboard",
      resourceName: "Q1 Revenue Report",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      details: "Shared with Viewer role",
      ipAddress: "192.168.1.2",
    },
  ]);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesUser = !filterUser || log.userName.toLowerCase().includes(filterUser.toLowerCase());
    return matchesAction && matchesUser;
  });

  const handleExportLogs = () => {
    const csv = [
      ["User", "Action", "Resource", "Timestamp", "IP Address"],
      ...filteredLogs.map((log) => [
        log.userName,
        log.action,
        log.resourceName,
        log.timestamp.toISOString(),
        log.ipAddress || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Activity logs exported");
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATE_DASHBOARD":
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "EDIT_DASHBOARD":
      case "UPDATE":
      case "UPDATE_MEMBER_ROLE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
      case "REMOVE_MEMBER":
        return "bg-red-100 text-red-800";
      case "SHARE_DASHBOARD":
      case "INVITE_MEMBER":
        return "bg-purple-100 text-purple-800";
      case "EXPORT_DATA":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE_DASHBOARD: "Created Dashboard",
      EDIT_DASHBOARD: "Edited Dashboard",
      DELETE_DASHBOARD: "Deleted Dashboard",
      SHARE_DASHBOARD: "Shared Dashboard",
      INVITE_MEMBER: "Invited Member",
      REMOVE_MEMBER: "Removed Member",
      UPDATE_MEMBER_ROLE: "Updated Member Role",
      EXPORT_DATA: "Exported Data",
      CONNECT_PLATFORM: "Connected Platform",
      DISCONNECT_PLATFORM: "Disconnected Platform",
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground">
            Audit trail of all user actions and system changes
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Action</label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE_DASHBOARD">Create Dashboard</SelectItem>
                    <SelectItem value="EDIT_DASHBOARD">Edit Dashboard</SelectItem>
                    <SelectItem value="SHARE_DASHBOARD">Share Dashboard</SelectItem>
                    <SelectItem value="INVITE_MEMBER">Invite Member</SelectItem>
                    <SelectItem value="EXPORT_DATA">Export Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">User</label>
                <Input
                  placeholder="Filter by user name..."
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleExportLogs} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>{filteredLogs.length} entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity logs found
                </p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getActionBadgeColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-sm font-medium">{log.userName}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        {log.resourceType}: <strong>{log.resourceName}</strong>
                      </p>

                      {log.details && (
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{log.timestamp.toLocaleString()}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Dashboard Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.resourceType === "dashboard").length}
              </div>
              <p className="text-xs text-muted-foreground">Edits & shares</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Team Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.resourceType === "team_member").length}
              </div>
              <p className="text-xs text-muted-foreground">Invites & updates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.action === "EXPORT_DATA").length}
              </div>
              <p className="text-xs text-muted-foreground">Data exports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getBgColor(notification.type)} ${
                  !notification.read ? "border-current opacity-100" : "opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                      <div className="flex gap-1">
                        {notification.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={notification.action.onClick}
                            className="text-xs"
                          >
                            {notification.action.label}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete?.(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Notification Toast - Temporary notification
 */
export function NotificationToast({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "warning":
        return "bg-yellow-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertCircle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`${getBgColor(notification.type)} text-white rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md`}
    >
      {getIcon(notification.type)}
      <div className="flex-1">
        <p className="font-medium">{notification.title}</p>
        <p className="text-sm opacity-90">{notification.message}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClose}
        className="text-white hover:bg-white/20 h-6 w-6 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Notification Preferences Card
 */
export function NotificationPreferencesCard() {
  const [preferences, setPreferences] = useState({
    syncSuccess: true,
    syncError: true,
    weeklyReport: true,
    monthlyReport: false,
    platformUpdates: true,
    teamInvites: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Control what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    [key]: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          ))}
        </div>
        <Button className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Notification History
 */
export function NotificationHistory({ notifications }: { notifications: Notification[] }) {
  const [filter, setFilter] = useState<"all" | "unread" | "success" | "error">("all");

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <CardDescription>View all your notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(["all", "unread", "success", "error"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
          ) : (
            filtered.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-600" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

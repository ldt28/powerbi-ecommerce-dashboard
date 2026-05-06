import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "@/_core/hooks/useKeyboardShortcuts";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Search, Home, Settings, HelpCircle, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "actions" | "settings" | "help";
}

/**
 * Command Palette Component
 * Accessible via Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { logout } = useAuth();

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      metaKey: true,
      handler: () => setOpen(true),
    },
    {
      key: "k",
      ctrlKey: true,
      handler: () => setOpen(true),
    },
    {
      key: "Escape",
      handler: () => setOpen(false),
    },
  ]);

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-home",
      label: "Go to Dashboard",
      description: "Navigate to main dashboard",
      icon: <Home className="h-4 w-4" />,
      shortcut: "⌘D",
      action: () => {
        navigate("/dashboard");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-channels",
      label: "Go to Channels",
      description: "View channel performance",
      action: () => {
        navigate("/dashboard/channels");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-marketplace",
      label: "Go to Marketplace Comparison",
      description: "Compare platform performance",
      action: () => {
        navigate("/marketplace-comparison");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-revenue",
      label: "Go to Revenue Overview",
      description: "View revenue analytics",
      action: () => {
        navigate("/dashboard/revenue");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-customers",
      label: "Go to Customer Analytics",
      description: "View customer insights",
      action: () => {
        navigate("/dashboard/customers");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-products",
      label: "Go to Product Analysis",
      description: "View product performance",
      action: () => {
        navigate("/dashboard/products");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-marketing",
      label: "Go to Marketing Performance",
      description: "View marketing metrics",
      action: () => {
        navigate("/dashboard/marketing");
        setOpen(false);
      },
      category: "navigation",
    },
    {
      id: "nav-realtime",
      label: "Go to Real-time Sales",
      description: "View live sales data",
      action: () => {
        navigate("/dashboard/realtime");
        setOpen(false);
      },
      category: "navigation",
    },

    // Actions
    {
      id: "action-refresh",
      label: "Refresh Data",
      description: "Refresh all dashboard data",
      shortcut: "⌘R",
      action: () => {
        window.location.reload();
      },
      category: "actions",
    },
    {
      id: "action-export",
      label: "Export Data",
      description: "Export current view as CSV or PDF",
      shortcut: "⌘E",
      action: () => {
        // Dispatch custom event for export
        window.dispatchEvent(new CustomEvent("export-data"));
        setOpen(false);
      },
      category: "actions",
    },

    // Settings
    {
      id: "settings-connections",
      label: "Platform Connections",
      description: "Manage platform connections",
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        navigate("/platform-connections");
        setOpen(false);
      },
      category: "settings",
    },
    {
      id: "settings-preferences",
      label: "Settings & Preferences",
      description: "Manage account settings",
      action: () => {
        navigate("/settings");
        setOpen(false);
      },
      category: "settings",
    },

    // Help
    {
      id: "help-docs",
      label: "Documentation",
      description: "View help documentation",
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => {
        navigate("/documentation");
        setOpen(false);
      },
      category: "help",
    },
    {
      id: "help-shortcuts",
      label: "Keyboard Shortcuts",
      description: "View all keyboard shortcuts",
      shortcut: "?",
      action: () => {
        // Show shortcuts dialog
        window.dispatchEvent(new CustomEvent("show-shortcuts"));
        setOpen(false);
      },
      category: "help",
    },
    {
      id: "action-logout",
      label: "Logout",
      description: "Sign out of your account",
      icon: <LogOut className="h-4 w-4" />,
      action: async () => {
        await logout();
        setOpen(false);
      },
      category: "help",
    },
  ];

  const navigationCommands = commands.filter((c) => c.category === "navigation");
  const actionCommands = commands.filter((c) => c.category === "actions");
  const settingsCommands = commands.filter((c) => c.category === "settings");
  const helpCommands = commands.filter((c) => c.category === "help");

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search dashboards, actions, settings..." />
      <div className="absolute left-3 top-3 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {navigationCommands.length > 0 && (
          <CommandGroup heading="Navigation">
            {navigationCommands.map((cmd) => (
              <CommandItem key={cmd.id} value={cmd.id} onSelect={cmd.action}>
                {cmd.icon && <span className="mr-2">{cmd.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium">{cmd.label}</div>
                  {cmd.description && <div className="text-xs text-muted-foreground">{cmd.description}</div>}
                </div>
                {cmd.shortcut && <Badge variant="secondary">{cmd.shortcut}</Badge>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {actionCommands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              {actionCommands.map((cmd) => (
                <CommandItem key={cmd.id} value={cmd.id} onSelect={cmd.action}>
                  {cmd.icon && <span className="mr-2">{cmd.icon}</span>}
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && <div className="text-xs text-muted-foreground">{cmd.description}</div>}
                  </div>
                  {cmd.shortcut && <Badge variant="secondary">{cmd.shortcut}</Badge>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {settingsCommands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              {settingsCommands.map((cmd) => (
                <CommandItem key={cmd.id} value={cmd.id} onSelect={cmd.action}>
                  {cmd.icon && <span className="mr-2">{cmd.icon}</span>}
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && <div className="text-xs text-muted-foreground">{cmd.description}</div>}
                  </div>
                  {cmd.shortcut && <Badge variant="secondary">{cmd.shortcut}</Badge>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {helpCommands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Help & Account">
              {helpCommands.map((cmd) => (
                <CommandItem key={cmd.id} value={cmd.id} onSelect={cmd.action}>
                  {cmd.icon && <span className="mr-2">{cmd.icon}</span>}
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && <div className="text-xs text-muted-foreground">{cmd.description}</div>}
                  </div>
                  {cmd.shortcut && <Badge variant="secondary">{cmd.shortcut}</Badge>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

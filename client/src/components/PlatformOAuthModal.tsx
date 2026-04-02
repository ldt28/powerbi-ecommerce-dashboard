import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PlatformOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "google_analytics" | "facebook_ads" | "youtube";
  onConnect: (connectionName: string) => Promise<void>;
  isLoading?: boolean;
}

export function PlatformOAuthModal({
  isOpen,
  onClose,
  platform,
  onConnect,
  isLoading = false,
}: PlatformOAuthModalProps) {
  const [connectionName, setConnectionName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const platformConfig = {
    google_analytics: {
      label: "Google Analytics",
      icon: "📊",
      description: "Connect your Google Analytics account to track website traffic and user behavior",
      scopes: ["Google Analytics 4", "Read-only access"],
      permissions: [
        "View website traffic data",
        "Access conversion metrics",
        "Read audience insights",
      ],
    },
    facebook_ads: {
      label: "Facebook Ads Manager",
      icon: "📱",
      description: "Connect your Facebook Ads account to track ad performance and ROI",
      scopes: ["Ad Manager", "Read-only access"],
      permissions: [
        "View ad campaign data",
        "Access spending metrics",
        "Read conversion tracking",
      ],
    },
    youtube: {
      label: "YouTube Analytics",
      icon: "▶️",
      description: "Connect your YouTube channel to track video performance and audience metrics",
      scopes: ["YouTube Analytics", "Read-only access"],
      permissions: [
        "View channel analytics",
        "Access video metrics",
        "Read audience insights",
      ],
    },
  };

  const config = platformConfig[platform];

  const handleConnect = async () => {
    if (!connectionName.trim()) {
      toast.error("Please enter a connection name");
      return;
    }

    setIsConnecting(true);
    try {
      await onConnect(connectionName);
      setConnectionName("");
      onClose();
    } catch (error) {
      toast.error("Failed to connect account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenOAuth = () => {
    // In a real implementation, this would open the OAuth flow
    // For now, we'll just show a message
    toast.info("OAuth flow would open in a new window");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <DialogTitle>Connect {config.label}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Name */}
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              placeholder={`e.g., My ${config.label} Account`}
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              disabled={isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              Give this connection a name to identify it later
            </p>
          </div>

          {/* Permissions Info */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Permissions Required</p>
              <ul className="space-y-2">
                {config.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  We only request read-only access to your data. Your account credentials are never stored.
                </p>
              </div>
            </div>
          </div>

          {/* Scopes Info */}
          <div>
            <p className="text-sm font-medium mb-2">Data Access</p>
            <div className="flex flex-wrap gap-2">
              {config.scopes.map((scope, index) => (
                <span
                  key={index}
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isConnecting} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting || !connectionName.trim()} className="flex-1">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Account
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to {config.label} to authorize this connection
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Platform Connection Button
 */
export function PlatformConnectButton({
  platform,
  onConnect,
  isLoading = false,
}: {
  platform: "google_analytics" | "facebook_ads" | "youtube";
  onConnect: (platform: "google_analytics" | "facebook_ads" | "youtube") => void;
  isLoading?: boolean;
}) {
  const platformConfig = {
    google_analytics: { label: "Google Analytics", icon: "📊", color: "bg-blue-50 hover:bg-blue-100" },
    facebook_ads: { label: "Facebook Ads", icon: "📱", color: "bg-blue-50 hover:bg-blue-100" },
    youtube: { label: "YouTube", icon: "▶️", color: "bg-red-50 hover:bg-red-100" },
  };

  const config = platformConfig[platform];

  return (
    <button
      onClick={() => onConnect(platform)}
      disabled={isLoading}
      className={`w-full p-4 rounded-lg border border-border transition-colors ${config.color} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="text-left">
            <p className="font-medium">Connect {config.label}</p>
            <p className="text-sm text-muted-foreground">Link your account to sync data</p>
          </div>
        </div>
        <ExternalLink className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}

/**
 * Platform Connection Selector
 */
export function PlatformConnectionSelector({
  onSelectPlatform,
  isLoading = false,
}: {
  onSelectPlatform: (platform: "google_analytics" | "facebook_ads" | "youtube") => void;
  isLoading?: boolean;
}) {
  const platforms: Array<"google_analytics" | "facebook_ads" | "youtube"> = [
    "google_analytics",
    "facebook_ads",
    "youtube",
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Connect a Platform</h3>
      <p className="text-sm text-muted-foreground">
        Choose a platform to connect and start syncing your analytics data
      </p>
      <div className="space-y-2">
        {platforms.map((platform) => (
          <PlatformConnectButton
            key={platform}
            platform={platform}
            onConnect={onSelectPlatform}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

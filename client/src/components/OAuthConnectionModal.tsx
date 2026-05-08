import React, { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OAuthConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: "google_analytics" | "facebook_ads" | "youtube" | "amazon" | "ebay" | "walmart";
  onConnect: (connectionName: string) => Promise<void>;
}

const PLATFORM_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    description: string;
    scopes: string[];
    authUrl: string;
    instructions: string[];
  }
> = {
  google_analytics: {
    label: "Google Analytics",
    icon: "📊",
    description: "Connect your Google Analytics account to track website traffic and conversions",
    scopes: ["analytics.readonly"],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    instructions: [
      "Click the 'Connect with Google' button below",
      "Sign in with your Google account",
      "Grant permission to access your Google Analytics data",
      "You'll be redirected back to complete the connection",
    ],
  },
  facebook_ads: {
    label: "Facebook Ads",
    icon: "📱",
    description: "Connect your Facebook Ads account to monitor ad performance and spending",
    scopes: ["ads_management", "ads_read"],
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    instructions: [
      "Click the 'Connect with Facebook' button below",
      "Sign in with your Facebook account",
      "Grant permission to manage your ads",
      "You'll be redirected back to complete the connection",
    ],
  },
  youtube: {
    label: "YouTube",
    icon: "🎥",
    description: "Connect your YouTube channel to track video analytics and revenue",
    scopes: ["youtube.readonly"],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    instructions: [
      "Click the 'Connect with Google' button below",
      "Sign in with your Google account",
      "Grant permission to access your YouTube analytics",
      "You'll be redirected back to complete the connection",
    ],
  },
  amazon: {
    label: "Amazon",
    icon: "🛒",
    description: "Connect your Amazon Seller account to sync sales and advertising data",
    scopes: ["sellingpartnerapi"],
    authUrl: "https://sellercentral.amazon.com/",
    instructions: [
      "Click the 'Connect with Amazon' button below",
      "Sign in with your Amazon Seller account",
      "Grant permission to access your sales data",
      "You'll be redirected back to complete the connection",
    ],
  },
  ebay: {
    label: "eBay",
    icon: "🏪",
    description: "Connect your eBay seller account to track sales and listings",
    scopes: ["sell.account", "sell.analytics"],
    authUrl: "https://auth.ebay.com/oauth2/authorize",
    instructions: [
      "Click the 'Connect with eBay' button below",
      "Sign in with your eBay seller account",
      "Grant permission to access your seller data",
      "You'll be redirected back to complete the connection",
    ],
  },
  walmart: {
    label: "Walmart",
    icon: "🏬",
    description: "Connect your Walmart seller account to monitor sales and inventory",
    scopes: ["orders", "inventory"],
    authUrl: "https://marketplace.walmart.com/",
    instructions: [
      "Click the 'Connect with Walmart' button below",
      "Sign in with your Walmart seller account",
      "Grant permission to access your seller data",
      "You'll be redirected back to complete the connection",
    ],
  },
};

export const OAuthConnectionModal: React.FC<OAuthConnectionModalProps> = ({
  open,
  onOpenChange,
  platform,
  onConnect,
}) => {
  const [connectionName, setConnectionName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = PLATFORM_CONFIG[platform];

  const handleConnect = async () => {
    if (!connectionName.trim()) {
      setError("Please enter a connection name");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await onConnect(connectionName);
      toast.success(`Connected to ${config.label}`);
      setConnectionName("");
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenAuthWindow = () => {
    // In a real implementation, this would open the OAuth flow
    // For now, we'll just show a message
    toast.info("OAuth flow would open in a new window");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <DialogTitle>Connect {config.label}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Name Input */}
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              placeholder={`e.g., My ${config.label} Account`}
              value={connectionName}
              onChange={(e) => {
                setConnectionName(e.target.value);
                setError(null);
              }}
              disabled={isConnecting}
            />
            <p className="text-xs text-gray-600">
              Give this connection a memorable name to identify it later
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">How to connect:</h4>
            <ol className="space-y-2">
              {config.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Scopes Information */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Required Permissions:</h4>
            <div className="flex flex-wrap gap-2">
              {config.scopes.map((scope) => (
                <div key={scope} className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                  {scope}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your credentials are encrypted and never stored in plain text. We only request the
              minimum permissions needed to sync your data.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !connectionName.trim()}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Connect with {config.label}
                </>
              )}
            </Button>
          </div>

          {/* Privacy Link */}
          <p className="text-xs text-gray-600 text-center">
            By connecting, you agree to our{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

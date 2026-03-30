import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

/**
 * OAuth2 Connect Button Component
 * Initiates OAuth2 authentication flow for a specific platform
 */

interface OAuth2ConnectButtonProps {
  platform: "google" | "facebook" | "linkedin" | "tiktok";
  scopes?: string[];
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const PLATFORM_CONFIG = {
  google: {
    name: "Google",
    icon: "🔍",
    color: "bg-red-50 hover:bg-red-100",
    scopes: ["openid", "profile", "email", "https://www.googleapis.com/auth/analytics.readonly"],
  },
  facebook: {
    name: "Facebook",
    icon: "f",
    color: "bg-blue-50 hover:bg-blue-100",
    scopes: ["public_profile", "email", "instagram_basic"],
  },
  linkedin: {
    name: "LinkedIn",
    icon: "in",
    color: "bg-blue-50 hover:bg-blue-100",
    scopes: ["profile", "email", "openid"],
  },
  tiktok: {
    name: "TikTok",
    icon: "♪",
    color: "bg-black hover:bg-gray-900",
    scopes: ["user.info.basic", "video.list"],
  },
};

export const OAuth2ConnectButton: React.FC<OAuth2ConnectButtonProps> = ({
  platform,
  scopes,
  onSuccess,
  onError,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const config = PLATFORM_CONFIG[platform];
  const defaultScopes = scopes || config.scopes;

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setStatus("idle");
      setErrorMessage("");

      // Call backend to get authorization URL
      const response = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          scopes: defaultScopes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate OAuth2 flow");
      }

      const { url } = await response.json();

      // Store state and code verifier in sessionStorage for callback
      // Redirect to OAuth2 provider
      window.location.href = url;
    } catch (error) {
      setIsLoading(false);
      setStatus("error");
      const errorMsg = error instanceof Error ? error.message : "Connection failed";
      setErrorMessage(errorMsg);
      onError?.(error instanceof Error ? error : new Error(errorMsg));
    }
  };

  const buttonContent = (
    <>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {status === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
      {status === "error" && <AlertCircle className="mr-2 h-4 w-4 text-red-600" />}
      {!isLoading && status === "idle" && <span className="mr-2">{config.icon}</span>}
      {isLoading ? "Connecting..." : `Connect ${config.name}`}
    </>
  );

  return (
    <div className="space-y-2">
      <Button
        onClick={handleConnect}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={`w-full ${className}`}
      >
        {buttonContent}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-600">Connected successfully!</p>
      )}
    </div>
  );
};

/**
 * OAuth2 Status Badge Component
 * Displays connection status for a platform
 */

interface OAuth2StatusBadgeProps {
  platform: "google" | "facebook" | "linkedin" | "tiktok";
  isConnected: boolean;
  accountName?: string;
  expiresAt?: Date;
  isExpiringSoon?: boolean;
}

export const OAuth2StatusBadge: React.FC<OAuth2StatusBadgeProps> = ({
  platform,
  isConnected,
  accountName,
  expiresAt,
  isExpiringSoon,
}) => {
  const config = PLATFORM_CONFIG[platform];

  if (!isConnected) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Not connected
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
        isExpiringSoon
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isExpiringSoon ? "bg-yellow-600" : "bg-green-600"}`} />
      <span>
        {accountName ? `${config.name}: ${accountName}` : `${config.name} Connected`}
      </span>
      {isExpiringSoon && expiresAt && (
        <span className="text-xs ml-1">
          (expires {new Date(expiresAt).toLocaleDateString()})
        </span>
      )}
    </div>
  );
};

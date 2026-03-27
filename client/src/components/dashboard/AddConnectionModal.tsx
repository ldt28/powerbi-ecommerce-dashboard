import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

type Platform = "google" | "facebook" | "amazon" | "ebay" | "walmart" | "instagram";
type ConnectionType = "analytics" | "ads" | "commerce" | "social";

interface PlatformConfig {
  label: string;
  icon: string;
  types: ConnectionType[];
  fields: {
    name: string;
    label: string;
    type: "text" | "password" | "email";
    required: boolean;
    placeholder: string;
  }[];
  description: string;
}

const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  google: {
    label: "Google",
    icon: "🔍",
    types: ["analytics", "ads"],
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        type: "password",
        required: true,
        placeholder: "Your Google OAuth access token",
      },
      {
        name: "accountId",
        label: "Account ID",
        type: "text",
        required: false,
        placeholder: "e.g., 123456789",
      },
      {
        name: "accountEmail",
        label: "Account Email",
        type: "email",
        required: false,
        placeholder: "your-email@gmail.com",
      },
    ],
    description: "Connect your Google Analytics and Google Ads accounts",
  },
  facebook: {
    label: "Facebook",
    icon: "f",
    types: ["ads", "social"],
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        type: "password",
        required: true,
        placeholder: "Your Facebook Graph API token",
      },
      {
        name: "accountId",
        label: "Ad Account ID",
        type: "text",
        required: false,
        placeholder: "act_123456789",
      },
      {
        name: "accountName",
        label: "Account Name",
        type: "text",
        required: false,
        placeholder: "My Business Account",
      },
    ],
    description: "Connect your Facebook Ads and Business accounts",
  },
  amazon: {
    label: "Amazon",
    icon: "🛒",
    types: ["commerce"],
    fields: [
      {
        name: "accessToken",
        label: "Refresh Token",
        type: "password",
        required: true,
        placeholder: "Your Amazon SP-API refresh token",
      },
      {
        name: "accountId",
        label: "Seller ID",
        type: "text",
        required: true,
        placeholder: "Your Amazon Seller ID",
      },
      {
        name: "accountName",
        label: "Store Name",
        type: "text",
        required: false,
        placeholder: "My Amazon Store",
      },
    ],
    description: "Connect your Amazon Seller Central account",
  },
  ebay: {
    label: "eBay",
    icon: "📦",
    types: ["commerce"],
    fields: [
      {
        name: "accessToken",
        label: "Auth Token",
        type: "password",
        required: true,
        placeholder: "Your eBay API token",
      },
      {
        name: "accountId",
        label: "User ID",
        type: "text",
        required: true,
        placeholder: "Your eBay User ID",
      },
      {
        name: "accountName",
        label: "Store Name",
        type: "text",
        required: false,
        placeholder: "My eBay Store",
      },
    ],
    description: "Connect your eBay seller account",
  },
  walmart: {
    label: "Walmart",
    icon: "🏪",
    types: ["commerce"],
    fields: [
      {
        name: "accessToken",
        label: "API Key",
        type: "password",
        required: true,
        placeholder: "Your Walmart API key",
      },
      {
        name: "accountId",
        label: "Seller ID",
        type: "text",
        required: true,
        placeholder: "Your Walmart Seller ID",
      },
      {
        name: "accountName",
        label: "Store Name",
        type: "text",
        required: false,
        placeholder: "My Walmart Store",
      },
    ],
    description: "Connect your Walmart Seller Center account",
  },
  instagram: {
    label: "Instagram",
    icon: "📷",
    types: ["social"],
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        type: "password",
        required: true,
        placeholder: "Your Instagram Graph API token",
      },
      {
        name: "accountId",
        label: "Business Account ID",
        type: "text",
        required: false,
        placeholder: "Your Instagram Business Account ID",
      },
      {
        name: "accountName",
        label: "Account Name",
        type: "text",
        required: false,
        placeholder: "My Instagram Business",
      },
    ],
    description: "Connect your Instagram Business account",
  },
};

interface AddConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionAdded?: () => void;
}

export function AddConnectionModal({
  open,
  onOpenChange,
  onConnectionAdded,
}: AddConnectionModalProps) {
  const showNotification = (title: string, description: string, isError = false) => {
    console.log(`${isError ? "Error" : "Success"}: ${title} - ${description}`);
  };
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
  const [connectionName, setConnectionName] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const createConnection = trpc.apiConnections.create.useMutation();
  const testConnection = trpc.apiConnections.testConnection.useMutation();

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform);
    setSelectedType(null);
    setFormData({});
    setTestResult(null);
  };

  const handleFormChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleTestConnection = async () => {
    if (!selectedPlatform || !connectionName || !formData.accessToken) {
      showNotification("Validation Error", "Please fill in required fields", true);
      return;
    }

    setTestingConnection(true);
    try {
      const result = await createConnection.mutateAsync({
        platform: selectedPlatform,
        connectionName,
        connectionType: selectedType || "analytics",
        accessToken: formData.accessToken,
        refreshToken: formData.refreshToken,
        accountId: formData.accountId,
        accountEmail: formData.accountEmail,
        accountName: formData.accountName,
      });

      if (result) {
        // Test the connection
        const testRes = await testConnection.mutateAsync({
          connectionId: result.id,
        });

        setTestResult({
          success: true,
          message: testRes.message,
        });

        showNotification("Success", "Connection created and tested successfully");

        // Reset form
        setTimeout(() => {
          setSelectedPlatform(null);
          setSelectedType(null);
          setConnectionName("");
          setFormData({});
          setTestResult(null);
          onOpenChange(false);
          onConnectionAdded?.();
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create connection";
      setTestResult({
        success: false,
        message: errorMessage,
      });
      showNotification("Error", errorMessage, true);
    } finally {
      setTestingConnection(false);
    }
  };

  const platformConfig = selectedPlatform ? PLATFORM_CONFIGS[selectedPlatform] : null;
  const isFormValid =
    selectedPlatform &&
    selectedType &&
    connectionName &&
    formData.accessToken &&
    !platformConfig?.fields.some((f) => f.required && !formData[f.name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New API Connection</DialogTitle>
          <DialogDescription>
            Connect your store and social media accounts to sync data automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Select Platform</Label>
            <Select value={selectedPlatform || ""} onValueChange={(v) => handlePlatformChange(v as Platform)}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Choose a platform..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {platformConfig && (
            <>
              {/* Platform Description */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{platformConfig.description}</AlertDescription>
              </Alert>

              {/* Connection Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="type">Connection Type</Label>
                <Select value={selectedType || ""} onValueChange={(v) => setSelectedType(v as ConnectionType)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Choose connection type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {platformConfig.types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Connection Name */}
              <div className="space-y-2">
                <Label htmlFor="connectionName">Connection Name</Label>
                <Input
                  id="connectionName"
                  placeholder="e.g., My Google Analytics"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Credentials</Label>
                {platformConfig.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFormChange(field.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Test Result */}
              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={testingConnection}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTestConnection}
                  disabled={!isFormValid || testingConnection}
                  className="flex-1"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    "Test & Add Connection"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

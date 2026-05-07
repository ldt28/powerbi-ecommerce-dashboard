import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, Slack, MessageSquare, Phone, Bell } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: { enabled: true, templates: ["anomalyAlert", "dailyReport"] },
    slack: { enabled: false, webhookUrl: "" },
    discord: { enabled: false, webhookUrl: "" },
    sms: { enabled: false, phoneNumber: "" },
    push: { enabled: false },
  });

  const handleToggle = (channel: string) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: { ...prev[channel as keyof typeof prev], enabled: !prev[channel as keyof typeof prev].enabled },
    }));
  };

  const handleInputChange = (channel: string, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: { ...prev[channel as keyof typeof prev], [field]: value },
    }));
  };

  const handleSave = () => {
    toast.success("Notification settings saved");
  };

  const handleTest = (channel: string) => {
    toast.success(`Test ${channel} notification sent`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notification Settings
        </h1>
        <p className="text-muted-foreground mb-8">Configure how you receive notifications</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
              <CardDescription>Receive notifications via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Email Notifications</Label>
                <Switch
                  checked={settings.email.enabled}
                  onCheckedChange={() => handleToggle("email")}
                />
              </div>

              {settings.email.enabled && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="text-sm">
                    <p className="font-medium mb-2">Notification Types</p>
                    <div className="space-y-2">
                      {["anomalyAlert", "dailyReport", "exportReady", "roleChanged"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{type.replace(/([A-Z])/g, " $1")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleTest("email")}>
                    Send Test Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Slack className="h-5 w-5" />
                Slack
              </CardTitle>
              <CardDescription>Send alerts to Slack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Slack</Label>
                <Switch
                  checked={settings.slack.enabled}
                  onCheckedChange={() => handleToggle("slack")}
                />
              </div>

              {settings.slack.enabled && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <Label htmlFor="slack-url" className="text-sm">
                      Webhook URL
                    </Label>
                    <Input
                      id="slack-url"
                      type="password"
                      placeholder="https://hooks.slack.com/services/..."
                      value={settings.slack.webhookUrl}
                      onChange={(e) =>
                        handleInputChange("slack", "webhookUrl", e.target.value)
                      }
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleTest("slack")}>
                    Send Test Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discord */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discord
              </CardTitle>
              <CardDescription>Send alerts to Discord</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Discord</Label>
                <Switch
                  checked={settings.discord.enabled}
                  onCheckedChange={() => handleToggle("discord")}
                />
              </div>

              {settings.discord.enabled && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <Label htmlFor="discord-url" className="text-sm">
                      Webhook URL
                    </Label>
                    <Input
                      id="discord-url"
                      type="password"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={settings.discord.webhookUrl}
                      onChange={(e) =>
                        handleInputChange("discord", "webhookUrl", e.target.value)
                      }
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleTest("discord")}>
                    Send Test Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                SMS (Twilio)
              </CardTitle>
              <CardDescription>Send alerts via SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable SMS</Label>
                <Switch
                  checked={settings.sms.enabled}
                  onCheckedChange={() => handleToggle("sms")}
                />
              </div>

              {settings.sms.enabled && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <Label htmlFor="phone" className="text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={settings.sms.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("sms", "phoneNumber", e.target.value)
                      }
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleTest("sms")}>
                    Send Test SMS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>Mobile and browser push notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Push</Label>
                <Switch
                  checked={settings.push.enabled}
                  onCheckedChange={() => handleToggle("push")}
                />
              </div>

              {settings.push.enabled && (
                <div className="space-y-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Push notifications will be sent to your registered devices
                  </p>
                  <Button size="sm" variant="outline" onClick={() => handleTest("push")}>
                    Send Test Notification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-3">
          <Button onClick={handleSave} size="lg">
            Save Settings
          </Button>
          <Button variant="outline" size="lg">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * User Settings and Preferences Page
 */

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    timezone: "UTC",
    language: "en",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    syncErrors: true,
    weeklyReport: true,
    monthlyReport: false,
    platformUpdates: true,
  });

  // Dashboard Settings
  const [dashboardSettings, setDashboardSettings] = useState({
    defaultView: "overview",
    autoRefresh: true,
    refreshInterval: "30",
    compactMode: false,
    darkMode: false,
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    shareAnalytics: true,
    allowCookies: true,
    dataRetention: "12",
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDashboard = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Dashboard settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileSettings.name}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={profileSettings.timezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                    <SelectItem value="CST">Central Time (CST)</SelectItem>
                    <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                    <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={profileSettings.language}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-muted-foreground">See notifications in the app</p>
                </div>
                <Switch
                  checked={notificationSettings.inAppNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      inAppNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sync Errors</p>
                  <p className="text-sm text-muted-foreground">Alert me when data sync fails</p>
                </div>
                <Switch
                  checked={notificationSettings.syncErrors}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      syncErrors: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-muted-foreground">Get a weekly summary email</p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      weeklyReport: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Monthly Report</p>
                  <p className="text-sm text-muted-foreground">Get a monthly summary email</p>
                </div>
                <Switch
                  checked={notificationSettings.monthlyReport}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      monthlyReport: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Platform Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about new features</p>
                </div>
                <Switch
                  checked={notificationSettings.platformUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      platformUpdates: checked,
                    })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Dashboard Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Settings</CardTitle>
            <CardDescription>Customize your dashboard experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select value={dashboardSettings.defaultView}>
                  <SelectTrigger id="default-view">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Auto-Refresh Interval (minutes)</Label>
                <Select value={dashboardSettings.refreshInterval}>
                  <SelectTrigger id="refresh-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Refresh</p>
                  <p className="text-sm text-muted-foreground">Automatically refresh data</p>
                </div>
                <Switch
                  checked={dashboardSettings.autoRefresh}
                  onCheckedChange={(checked) =>
                    setDashboardSettings({ ...dashboardSettings, autoRefresh: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Show more data in less space</p>
                </div>
                <Switch
                  checked={dashboardSettings.compactMode}
                  onCheckedChange={(checked) =>
                    setDashboardSettings({ ...dashboardSettings, compactMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch
                  checked={dashboardSettings.darkMode}
                  onCheckedChange={(checked) =>
                    setDashboardSettings({ ...dashboardSettings, darkMode: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveDashboard} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data</CardTitle>
            <CardDescription>Control your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share Analytics</p>
                  <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                </div>
                <Switch
                  checked={privacySettings.shareAnalytics}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, shareAnalytics: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Cookies</p>
                  <p className="text-sm text-muted-foreground">Allow cookies for better experience</p>
                </div>
                <Switch
                  checked={privacySettings.allowCookies}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, allowCookies: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention (months)</Label>
                <Select value={privacySettings.dataRetention}>
                  <SelectTrigger id="data-retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Your data is protected</p>
                  <p className="mt-1">
                    We comply with GDPR, CCPA, and other privacy regulations. Your data is encrypted
                    and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full">
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { emailTemplates, sendEmail } from "./notifications/email-templates";
import { sendSlackNotification, sendDiscordNotification } from "./notifications/webhooks";
import { sendSMS, sendPushNotificationBatch } from "./notifications/sms-push";

describe("Email Templates", () => {
  it("should create team invite template", () => {
    const template = emailTemplates.teamInvite("https://example.com/invite", "Admin");
    expect(template.subject).toContain("invited you");
    expect(template.html).toContain("Accept Invitation");
    expect(template.text).toContain("https://example.com/invite");
  });

  it("should create anomaly alert template", () => {
    const template = emailTemplates.anomalyAlert("Amazon", "Revenue", 15000);
    expect(template.subject).toContain("Anomaly");
    expect(template.html).toContain("Amazon");
    expect(template.html).toContain("15000");
  });

  it("should create daily report template", () => {
    const template = emailTemplates.dailyReport("2024-05-07", {
      Revenue: "$2400",
      Orders: "150",
    });
    expect(template.subject).toContain("Daily Report");
    expect(template.html).toContain("Revenue");
    expect(template.html).toContain("2400");
  });

  it("should create export ready template", () => {
    const template = emailTemplates.exportReady("CSV", "https://example.com/download");
    expect(template.subject).toContain("export is ready");
    expect(template.html).toContain("Download");
  });

  it("should create role changed template", () => {
    const template = emailTemplates.roleChanged("Editor");
    expect(template.subject).toContain("role has been updated");
    expect(template.html).toContain("Editor");
  });
});

describe("Slack Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send Slack notification", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    );

    const result = await sendSlackNotification("https://hooks.slack.com/services/123", {
      title: "Test Alert",
      message: "This is a test",
      color: "#3b82f6",
    });

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should handle Slack webhook errors", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    const result = await sendSlackNotification("https://hooks.slack.com/services/123", {
      title: "Test",
      message: "Test",
    });

    expect(result).toBe(false);
  });
});

describe("Discord Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send Discord notification", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    );

    const result = await sendDiscordNotification("https://discord.com/api/webhooks/123", {
      title: "Test Alert",
      message: "This is a test",
      color: "#3b82f6",
    });

    expect(result).toBe(true);
  });

  it("should format Discord embed correctly", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    );

    await sendDiscordNotification("https://discord.com/api/webhooks/123", {
      title: "Test",
      message: "Message",
      fields: { Platform: "Amazon", Value: "1000" },
    });

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.embeds[0].fields).toHaveLength(2);
  });
});

describe("SMS Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TWILIO_ACCOUNT_SID = "test_sid";
    process.env.TWILIO_AUTH_TOKEN = "test_token";
    process.env.TWILIO_PHONE_NUMBER = "+1234567890";
  });

  it("should send SMS when credentials are configured", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    );

    const result = await sendSMS("+1987654321", "Test message");
    expect(result).toBe(true);
  });

  it("should return false when Twilio credentials missing", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;

    const result = await sendSMS("+1987654321", "Test message");
    expect(result).toBe(false);
  });
});

describe("Push Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FCM_SERVER_KEY = "test_key";
  });

  it("should send push notification batch", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    );

    const result = await sendPushNotificationBatch(
      ["token1", "token2", "token3"],
      "Test Title",
      "Test Body"
    );

    expect(result.success).toBeGreaterThan(0);
  });

  it("should return false when FCM key missing", async () => {
    delete process.env.FCM_SERVER_KEY;

    const result = await sendPushNotificationBatch(
      ["token1"],
      "Title",
      "Body"
    );

    expect(result.success).toBe(0);
  });
});

describe("Email Sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send email with template", async () => {
    const template = emailTemplates.teamInvite("https://example.com", "Admin");
    const result = await sendEmail("test@example.com", template);

    expect(result).toBe(true);
  });

  it("should handle email errors gracefully", async () => {
    const template = emailTemplates.teamInvite("https://example.com", "Admin");
    // Mock console.error to avoid output
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendEmail("invalid-email", template);
    expect(typeof result).toBe("boolean");
  });
});

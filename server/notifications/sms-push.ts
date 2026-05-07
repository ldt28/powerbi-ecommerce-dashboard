/**
 * SMS (Twilio) & Push Notification Integrations
 */

/**
 * Send SMS via Twilio
 */
export async function sendSMS(
  phoneNumber: string,
  message: string,
  twilioAccountSid?: string,
  twilioAuthToken?: string,
  twilioPhoneNumber?: string
): Promise<boolean> {
  try {
    // Use environment variables if not provided
    const accountSid = twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn("Twilio credentials not configured");
      return false;
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phoneNumber,
          Body: message,
        }).toString(),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

/**
 * Send push notification via Firebase Cloud Messaging
 */
export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  serverKey?: string
): Promise<boolean> {
  try {
    const key = serverKey || process.env.FCM_SERVER_KEY;

    if (!key) {
      console.warn("FCM server key not configured");
      return false;
    }

    const payload = {
      notification: {
        title,
        body,
      },
      data: data || {},
      to: deviceToken,
    };

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${key}`,
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error("Push notification error:", error);
    return false;
  }
}

/**
 * Send push notifications to multiple devices
 */
export async function sendPushNotificationBatch(
  deviceTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failed: number }> {
  const results = await Promise.all(
    deviceTokens.map((token) => sendPushNotification(token, title, body, data))
  );

  return {
    success: results.filter((r) => r).length,
    failed: results.filter((r) => !r).length,
  };
}

/**
 * Send all notification types
 */
export async function sendMultiChannelNotification(
  options: {
    email?: { to: string; template: any };
    sms?: { phoneNumber: string; message: string };
    slack?: { webhookUrl: string; payload: any };
    discord?: { webhookUrl: string; payload: any };
    push?: { deviceTokens: string[]; title: string; body: string };
  }
): Promise<{ email: boolean; sms: boolean; slack: boolean; discord: boolean; push: boolean }> {
  const { sendEmail } = await import("./email-templates");
  const { sendSlackNotification, sendDiscordNotification } = await import("./webhooks");

  const results = {
    email: options.email ? await sendEmail(options.email.to, options.email.template) : false,
    sms: options.sms ? await sendSMS(options.sms.phoneNumber, options.sms.message) : false,
    slack: options.slack
      ? await sendSlackNotification(options.slack.webhookUrl, options.slack.payload)
      : false,
    discord: options.discord
      ? await sendDiscordNotification(options.discord.webhookUrl, options.discord.payload)
      : false,
    push: options.push
      ? (await sendPushNotificationBatch(options.push.deviceTokens, options.push.title, options.push.body)).success > 0
      : false,
  };

  return results;
}

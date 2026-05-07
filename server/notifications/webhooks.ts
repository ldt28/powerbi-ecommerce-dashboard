/**
 * Slack & Discord Webhook Integrations
 * Send notifications to Slack and Discord channels
 */

export interface WebhookPayload {
  title: string;
  message: string;
  color?: string;
  fields?: Record<string, string>;
}

/**
 * Send notification to Slack webhook
 */
export async function sendSlackNotification(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const slackMessage = {
      attachments: [
        {
          color: payload.color || "#3b82f6",
          title: payload.title,
          text: payload.message,
          fields: payload.fields
            ? Object.entries(payload.fields).map(([key, value]) => ({
                title: key,
                value: value,
                short: true,
              }))
            : [],
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    return response.ok;
  } catch (error) {
    console.error("Slack webhook error:", error);
    return false;
  }
}

/**
 * Send notification to Discord webhook
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const discordMessage = {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color: payload.color ? parseInt(payload.color.replace("#", ""), 16) : 3447003,
          fields: payload.fields
            ? Object.entries(payload.fields).map(([name, value]) => ({
                name,
                value,
                inline: true,
              }))
            : [],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordMessage),
    });

    return response.ok;
  } catch (error) {
    console.error("Discord webhook error:", error);
    return false;
  }
}

/**
 * Send to both Slack and Discord simultaneously
 */
export async function sendToWebhooks(
  slackUrl: string | null,
  discordUrl: string | null,
  payload: WebhookPayload
): Promise<{ slack: boolean; discord: boolean }> {
  const results = {
    slack: slackUrl ? await sendSlackNotification(slackUrl, payload) : false,
    discord: discordUrl ? await sendDiscordNotification(discordUrl, payload) : false,
  };
  return results;
}

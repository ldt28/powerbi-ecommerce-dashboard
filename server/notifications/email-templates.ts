/**
 * Email Notification Templates
 * Reusable email templates for various notifications
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  teamInvite: (inviteLink: string, inviterName: string): EmailTemplate => ({
    subject: `${inviterName} invited you to join EcomAnalytics`,
    html: `
      <h2>You're invited to EcomAnalytics!</h2>
      <p>${inviterName} has invited you to join their team on EcomAnalytics.</p>
      <p><a href="${inviteLink}" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Accept Invitation</a></p>
      <p>Or copy this link: ${inviteLink}</p>
    `,
    text: `You're invited to EcomAnalytics! ${inviterName} has invited you to join their team.\n\nAccept here: ${inviteLink}`,
  }),

  anomalyAlert: (platformName: string, metric: string, value: number): EmailTemplate => ({
    subject: `🚨 Anomaly Detected: ${platformName} ${metric}`,
    html: `
      <h2>Anomaly Detected</h2>
      <p>An unusual spike/drop was detected on <strong>${platformName}</strong></p>
      <p><strong>${metric}:</strong> ${value}</p>
      <p><a href="https://dashboard.example.com/alerts" style="background: #ef4444; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Alert</a></p>
    `,
    text: `Anomaly Detected on ${platformName}: ${metric} = ${value}`,
  }),

  dailyReport: (date: string, metrics: Record<string, number>): EmailTemplate => ({
    subject: `Daily Report - ${date}`,
    html: `
      <h2>Daily Report</h2>
      <p>Here's your daily summary for ${date}:</p>
      <ul>
        ${Object.entries(metrics)
          .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          .join("")}
      </ul>
      <p><a href="https://dashboard.example.com" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Dashboard</a></p>
    `,
    text: `Daily Report - ${date}\n${Object.entries(metrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")}`,
  }),

  exportReady: (exportType: string, downloadLink: string): EmailTemplate => ({
    subject: `Your ${exportType} export is ready`,
    html: `
      <h2>Export Ready</h2>
      <p>Your ${exportType} export has been generated and is ready to download.</p>
      <p><a href="${downloadLink}" style="background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Download ${exportType}</a></p>
    `,
    text: `Your ${exportType} export is ready: ${downloadLink}`,
  }),

  roleChanged: (role: string): EmailTemplate => ({
    subject: `Your role has been updated`,
    html: `
      <h2>Role Updated</h2>
      <p>Your role in EcomAnalytics has been updated to <strong>${role}</strong>.</p>
      <p><a href="https://dashboard.example.com" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Go to Dashboard</a></p>
    `,
    text: `Your role has been updated to: ${role}`,
  }),
};

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  options?: { from?: string }
): Promise<boolean> {
  try {
    // This would integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, just log it
    console.log(`[EMAIL] To: ${to}, Subject: ${template.subject}`);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

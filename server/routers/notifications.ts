import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { emailTemplates, sendEmail } from "../notifications/email-templates";
import { sendSlackNotification, sendDiscordNotification } from "../notifications/webhooks";
import { sendSMS, sendPushNotificationBatch } from "../notifications/sms-push";

export const notificationsRouter = router({
  /**
   * Send test email notification
   */
  sendTestEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        templateType: z.enum(["teamInvite", "anomalyAlert", "dailyReport", "exportReady", "roleChanged"]),
      })
    )
    .mutation(async ({ input }) => {
      const template =
        emailTemplates[input.templateType as keyof typeof emailTemplates];

      if (!template) {
        throw new Error("Invalid template type");
      }

      let emailTemplate;
      if (input.templateType === "teamInvite") {
        emailTemplate = template("https://example.com/invite/123", "Admin");
      } else if (input.templateType === "anomalyAlert") {
        emailTemplate = template("Amazon", "Revenue", 15000);
      } else if (input.templateType === "dailyReport") {
        emailTemplate = template("2024-05-07", { Revenue: "$2,400", Orders: "150" });
      } else if (input.templateType === "exportReady") {
        emailTemplate = template("CSV", "https://example.com/download/123");
      } else {
        emailTemplate = template("Admin");
      }

      const success = await sendEmail(input.email, emailTemplate);
      return { success, message: success ? "Email sent" : "Failed to send email" };
    }),

  /**
   * Send test Slack notification
   */
  sendTestSlack: protectedProcedure
    .input(
      z.object({
        webhookUrl: z.string().url(),
        title: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendSlackNotification(input.webhookUrl, {
        title: input.title,
        message: input.message,
        color: "#3b82f6",
      });

      return { success, message: success ? "Notification sent" : "Failed to send" };
    }),

  /**
   * Send test Discord notification
   */
  sendTestDiscord: protectedProcedure
    .input(
      z.object({
        webhookUrl: z.string().url(),
        title: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendDiscordNotification(input.webhookUrl, {
        title: input.title,
        message: input.message,
        color: "#3b82f6",
      });

      return { success, message: success ? "Notification sent" : "Failed to send" };
    }),

  /**
   * Send test SMS notification
   */
  sendTestSMS: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendSMS(input.phoneNumber, input.message);
      return { success, message: success ? "SMS sent" : "Failed to send SMS" };
    }),

  /**
   * Send test push notification
   */
  sendTestPush: protectedProcedure
    .input(
      z.object({
        deviceTokens: z.array(z.string()),
        title: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendPushNotificationBatch(
        input.deviceTokens,
        input.title,
        input.body
      );

      return {
        success: result.success > 0,
        sent: result.success,
        failed: result.failed,
      };
    }),

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // Mock preferences - would come from database
    return {
      email: { enabled: true, templates: ["anomalyAlert", "dailyReport"] },
      slack: { enabled: false, webhookUrl: null },
      discord: { enabled: false, webhookUrl: null },
      sms: { enabled: false, phoneNumber: null },
      push: { enabled: false, deviceTokens: [] },
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        channel: z.enum(["email", "slack", "discord", "sms", "push"]),
        enabled: z.boolean(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Would update database here
      console.log(`Updated ${input.channel} preferences for user ${ctx.user?.id}`);
      return { success: true, message: "Preferences updated" };
    }),
});

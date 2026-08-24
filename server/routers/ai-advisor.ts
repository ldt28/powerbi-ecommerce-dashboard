import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { AIAdvisorService } from "../services/ai-advisor-service";
import { TRPCError } from "@trpc/server";

/**
 * AI-Powered E-Commerce Advisor Router
 * Provides natural language querying, prompt suggestions, and executive summaries
 */
export const aiAdvisorRouter = router({
  /**
   * Ask natural language question to the AI advisor
   */
  askQuestion: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Query cannot be empty"),
        timeframe: z.string().optional(),
        channel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await AIAdvisorService.answerQuery(ctx.user.id, input.query);
        return response;
      } catch (error) {
        console.error("[aiAdvisorRouter] Error in askQuestion:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to analyze query",
        });
      }
    }),

  /**
   * Get structured executive summary & weekly briefing
   */
  getExecutiveSummary: protectedProcedure
    .input(
      z.object({
        timeframe: z.enum(["7d", "30d", "90d"]).default("7d"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const timeframe = input?.timeframe ?? "7d";
        const summary = await AIAdvisorService.getExecutiveSummary(ctx.user.id, timeframe);
        return summary;
      } catch (error) {
        console.error("[aiAdvisorRouter] Error in getExecutiveSummary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate executive summary",
        });
      }
    }),

  /**
   * Get contextual prompt suggestions
   */
  getPromptSuggestions: protectedProcedure.query(async () => {
    try {
      return AIAdvisorService.getPromptSuggestions();
    } catch (error) {
      console.error("[aiAdvisorRouter] Error in getPromptSuggestions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch prompt suggestions",
      });
    }
  }),
});

export default aiAdvisorRouter;

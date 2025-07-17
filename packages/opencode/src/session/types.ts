import { z } from "zod"

export const FeedbackType = z.enum(["upvote", "downvote", "neutral"]).openapi({
  ref: "FeedbackType",
})
export type FeedbackType = z.infer<typeof FeedbackType>

export const MessageFeedback = z
  .object({
    messageId: z.string(),
    sessionId: z.string(),
    feedback: FeedbackType,
    timestamp: z.number(),
  })
  .openapi({
    ref: "MessageFeedback",
  })
export type MessageFeedback = z.infer<typeof MessageFeedback>

// KTO export data structure
export const KTOData = z
  .object({
    input: z.string(),
    completion: z.string(),
    signal: z.boolean(),
  })
  .openapi({
    ref: "KTOData",
  })
export type KTOData = z.infer<typeof KTOData>
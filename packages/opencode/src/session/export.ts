import { Session } from "./index"
import { sessionFeedback } from "../storage/namespace"
import { KTOData, MessageFeedback } from "./types"
import { MessageV2 } from "./message-v2"

/**
 * Extract text content from message parts
 */
function extractTextContent(parts: MessageV2.Part[]): string {
  const textParts = parts
    .filter(part => part.type === "text")
    .map(part => (part as MessageV2.TextPart).text)
  
  return textParts.join("\n").trim()
}

/**
 * Group messages by conversation turns (user message followed by assistant message)
 */
function groupMessagesByTurns(messages: Array<{ info: MessageV2.Info; parts: MessageV2.Part[] }>): Array<{
  user: { info: MessageV2.Info; parts: MessageV2.Part[] } | null
  assistant: { info: MessageV2.Info; parts: MessageV2.Part[] } | null
}> {
  const turns: Array<{ 
    user: { info: MessageV2.Info; parts: MessageV2.Part[] } | null; 
    assistant: { info: MessageV2.Info; parts: MessageV2.Part[] } | null 
  }> = []
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    
    if (message.info.role === "user") {
      // Look for the next assistant message
      const nextMessage = messages[i + 1]
      if (nextMessage && nextMessage.info.role === "assistant") {
        turns.push({
          user: message,
          assistant: nextMessage
        })
        i++ // Skip the assistant message since we've paired it
      }
    }
  }
  
  return turns
}

/**
 * Get all feedback for a session
 */
async function getAllFeedback(sessionId: string): Promise<Record<string, MessageFeedback>> {
  const feedbackList = await sessionFeedback.list(sessionId)
  const feedbackMap: Record<string, MessageFeedback> = {}
  
  for (const feedbackKey of feedbackList) {
    const feedback = await sessionFeedback.read(feedbackKey)
    if (feedback) {
      feedbackMap[feedback.messageId] = feedback
    }
  }
  
  return feedbackMap
}

/**
 * Export a session as KTO dataset for training
 * KTO (Kahneman-Tversky Optimization) format includes:
 * - input: The user's prompt
 * - completion: The assistant's response
 * - signal: true for upvoted responses, false for downvoted responses
 * 
 * Only includes message pairs where the assistant's response has been rated
 */
export async function exportSessionAsKTO(sessionId: string): Promise<KTOData[]> {
  // Get all messages for the session
  const messages = await Session.messages(sessionId)
  
  // Get all feedback for the session
  const feedbacks = await getAllFeedback(sessionId)
  
  // Group messages into conversation turns
  const turns = groupMessagesByTurns(messages)
  
  // Build KTO dataset
  const ktoData: KTOData[] = []
  
  for (const turn of turns) {
    if (!turn.user || !turn.assistant) {
      continue
    }
    
    // Check if the assistant message has feedback
    const feedback = feedbacks[turn.assistant.info.id]
    
    // Only include messages with explicit upvote/downvote feedback
    if (feedback && (feedback.feedback === "upvote" || feedback.feedback === "downvote")) {
      ktoData.push({
        input: extractTextContent(turn.user.parts),
        completion: extractTextContent(turn.assistant.parts),
        signal: feedback.feedback === "upvote"
      })
    }
  }
  
  return ktoData
}

/**
 * Export session as KTO dataset with metadata
 */
export async function exportSessionAsKTOWithMetadata(sessionId: string): Promise<{
  sessionId: string
  exportedAt: number
  totalMessages: number
  exportedPairs: number
  data: KTOData[]
}> {
  const messages = await Session.messages(sessionId)
  const ktoData = await exportSessionAsKTO(sessionId)
  
  return {
    sessionId,
    exportedAt: Date.now(),
    totalMessages: messages.length,
    exportedPairs: ktoData.length,
    data: ktoData
  }
}
import { App } from "../../app/app"
import { cmd } from "./cmd"
import { Server } from "../../server/server"
import fetch from "node-fetch"

export const FeedbackCommand = cmd({
  command: "feedback <sessionId> <messageId>",
  describe: "Add feedback to a message",
  builder: (yargs) =>
    yargs
      .positional("sessionId", {
        describe: "Session ID",
        type: "string",
        demandOption: true,
      })
      .positional("messageId", {
        describe: "Message ID",
        type: "string",
        demandOption: true,
      })
      .option("upvote", {
        alias: "u",
        describe: "Upvote the message",
        type: "boolean",
        conflicts: "downvote",
      })
      .option("downvote", {
        alias: "d",
        describe: "Downvote the message",
        type: "boolean",
        conflicts: "upvote",
      })
      .check((argv) => {
        if (!argv.upvote && !argv.downvote) {
          throw new Error("You must specify either --upvote or --downvote")
        }
        return true
      }),
  handler: async (args) => {
    await App.provide({ cwd: process.cwd() }, async () => {
      // Start the server temporarily to make the API call
      const server = Server.listen({ port: 0, hostname: "127.0.0.1" })
      const port = server.port
      const baseUrl = `http://127.0.0.1:${port}`

      try {
        let feedback: "upvote" | "downvote" | "neutral" = "neutral"
        if (args.upvote) feedback = "upvote"
        if (args.downvote) feedback = "downvote"

        const response = await fetch(
          `${baseUrl}/session/${args.sessionId}/message/${args.messageId}/feedback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ feedback }),
          }
        )

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Failed to add feedback: ${error}`)
        }

        await response.json()
        console.log(`Feedback (${feedback}) added to message ${args.messageId}`)
      } finally {
        server.stop()
      }
    })
  },
})
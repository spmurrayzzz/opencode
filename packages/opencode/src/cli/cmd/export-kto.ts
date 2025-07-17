import { App } from "../../app/app"
import { cmd } from "./cmd"
import { Server } from "../../server/server"
import fetch from "node-fetch"
import fs from "fs/promises"
import path from "path"

export const ExportKTOCommand = cmd({
  command: "export-kto <sessionId>",
  describe: "Export session as KTO dataset",
  builder: (yargs) =>
    yargs
      .positional("sessionId", {
        describe: "Session ID to export",
        type: "string",
        demandOption: true,
      })
      .option("output", {
        alias: "o",
        describe: "Output file path",
        type: "string",
        default: null,
      })
      .option("pretty", {
        alias: "p",
        describe: "Pretty print JSON output",
        type: "boolean",
        default: true,
      }),
  handler: async (args) => {
    await App.provide({ cwd: process.cwd() }, async () => {
      // Start the server temporarily to make the API call
      const server = Server.listen({ port: 0, hostname: "127.0.0.1" })
      const port = server.port
      const baseUrl = `http://127.0.0.1:${port}`

      try {
        const response = await fetch(
          `${baseUrl}/session/${args.sessionId}/export/kto`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Failed to export KTO data: ${error}`)
        }

        const data = await response.json()
        
        // Determine output file name
        const outputFile = args.output || `opencode-kto-${args.sessionId}-${Date.now()}.json`
        const outputPath = path.resolve(process.cwd(), outputFile)
        
        // Format JSON based on pretty option
        const jsonContent = args.pretty 
          ? JSON.stringify(data, null, 2)
          : JSON.stringify(data)
        
        // Write to file
        await fs.writeFile(outputPath, jsonContent, "utf-8")
        
        console.log(`✓ Exported KTO dataset to ${outputPath}`)
        console.log(`  Total entries: ${data.length}`)
        
        // Show summary statistics
        if (data.length > 0) {
          const upvotes = data.filter((item: any) => item.signal === true).length
          const downvotes = data.filter((item: any) => item.signal === false).length
          console.log(`  Upvotes: ${upvotes}`)
          console.log(`  Downvotes: ${downvotes}`)
        }
      } finally {
        server.stop()
      }
    })
  },
})
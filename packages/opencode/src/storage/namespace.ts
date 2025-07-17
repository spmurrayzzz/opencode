import { Storage } from "./storage"
import { MessageFeedback } from "../session/types"

export function namespace<T>(prefix: string) {
  return {
    async read(key: string): Promise<T | undefined> {
      try {
        return await Storage.readJSON<T>(`${prefix}/${key}`)
      } catch {
        return undefined
      }
    },

    async write(key: string, value: T): Promise<void> {
      await Storage.writeJSON(`${prefix}/${key}`, value)
    },

    async remove(key: string): Promise<void> {
      await Storage.remove(`${prefix}/${key}`)
    },

    async list(subPrefix: string = ""): Promise<string[]> {
      const fullPrefix = subPrefix ? `${prefix}/${subPrefix}` : prefix
      const items = await Storage.list(fullPrefix)
      return items.map(item => item.slice(prefix.length + 1))
    },

    async removeDir(key: string): Promise<void> {
      await Storage.removeDir(`${prefix}/${key}`)
    }
  }
}

// Create namespace for session feedback
export const sessionFeedback = namespace<MessageFeedback>("session/feedback")
# KTO Export Feature Documentation

## Overview

The KTO (Kahneman-Tversky Optimization) export feature allows you to export your OpenCode chat sessions as training datasets. This feature enables you to rate assistant responses with upvotes or downvotes and export these ratings for model fine-tuning purposes.

## Features

- **Message Feedback**: Rate assistant messages as upvote (good) or downvote (bad)
- **KTO Dataset Export**: Export conversations with ratings in KTO format
- **Multiple Interfaces**: Available in TUI, CLI, and REST API

## Usage

### Terminal UI (TUI)

#### Rating Messages

- **Upvote**: Press `<leader>+` to upvote the current assistant message
- **Downvote**: Press `<leader>-` to downvote the current assistant message

#### Exporting KTO Dataset

- Press `<leader>k` to export the current session as a KTO dataset
- The file will be saved as `opencode-kto-{session-id}.json` in your current directory

### Command Line Interface (CLI)

#### Adding Feedback

```bash
# Upvote a message
opencode feedback <session-id> <message-id> --upvote

# Downvote a message
opencode feedback <session-id> <message-id> --downvote
```

#### Exporting KTO Dataset

```bash
# Export with default filename
opencode export-kto <session-id>

# Export to specific file
opencode export-kto <session-id> --output my-dataset.json

# Export without pretty printing
opencode export-kto <session-id> --no-pretty
```

### REST API

#### Add Feedback

```http
POST /session/{sessionId}/message/{messageId}/feedback
Content-Type: application/json

{
  "feedback": "upvote" | "downvote" | "neutral"
}
```

Response:
```json
{
  "success": true,
  "feedback": {
    "messageId": "msg_123",
    "sessionId": "session_456",
    "feedback": "upvote",
    "timestamp": 1234567890
  }
}
```

#### Get Feedback

```http
GET /session/{sessionId}/message/{messageId}/feedback
```

Response:
```json
{
  "feedback": {
    "messageId": "msg_123",
    "sessionId": "session_456",
    "feedback": "upvote",
    "timestamp": 1234567890
  }
}
```

#### Export KTO Dataset

```http
GET /session/{sessionId}/export/kto
```

Response:
```json
[
  {
    "input": "How do I implement a binary search tree in Python?",
    "completion": "Here's how to implement a binary search tree in Python...",
    "signal": true
  },
  {
    "input": "What's the weather today?",
    "completion": "I cannot provide weather information...",
    "signal": false
  }
]
```

## KTO Dataset Format

The exported KTO dataset follows this structure:

```typescript
interface KTOData {
  input: string;      // User's prompt/question
  completion: string; // Assistant's response
  signal: boolean;    // true for upvoted, false for downvoted
}
```

### Fields

- **input**: The user's message that prompted the assistant's response
- **completion**: The assistant's response being evaluated
- **signal**: Quality indicator (true = good response, false = bad response)

## Best Practices

### When to Upvote

- The response directly answers the question
- The code provided works correctly
- The explanation is clear and accurate
- The response follows best practices

### When to Downvote

- The response is incorrect or misleading
- The code has bugs or security issues
- The response is incomplete or unhelpful
- The assistant misunderstood the question

### Export Considerations

- Only message pairs with explicit feedback are included in the export
- Neutral or unrated messages are excluded
- Export regularly to avoid losing feedback data
- Review exported data before using for training

## Example Workflow

1. **Have a conversation** with the assistant about coding problems
2. **Rate responses** using the upvote/downvote commands as you go
3. **Export the dataset** when you have enough rated examples
4. **Review the exported JSON** to ensure quality
5. **Use the dataset** for model fine-tuning or analysis

## Example Export

```json
[
  {
    "input": "Write a function to reverse a string in Python",
    "completion": "Here's a simple function to reverse a string in Python:\n\n```python\ndef reverse_string(s):\n    return s[::-1]\n```\n\nThis uses Python's slice notation with a step of -1 to reverse the string.",
    "signal": true
  },
  {
    "input": "How do I sort a list in JavaScript?",
    "completion": "You can sort a list in JavaScript using the `sort()` method:\n\n```javascript\nconst numbers = [3, 1, 4, 1, 5];\nnumbers.sort();\n// Note: This sorts lexicographically by default\n```\n\nFor numeric sorting, use a compare function:\n```javascript\nnumbers.sort((a, b) => a - b);\n```",
    "signal": true
  }
]
```

## Troubleshooting

### No data in export
- Ensure you've rated at least one assistant message
- Only user-assistant message pairs with feedback are exported

### Feedback not saving
- Check that the session and message IDs are valid
- Ensure the OpenCode server is running

### Export fails
- Verify the session ID exists
- Check file write permissions in the output directory

## Future Enhancements

- Support for filtering exports by date range
- Bulk rating operations
- Integration with popular fine-tuning platforms
- Analytics dashboard for feedback patterns
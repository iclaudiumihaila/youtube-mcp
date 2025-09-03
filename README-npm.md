# yutu-mcp

YouTube MCP (Model Context Protocol) server for Claude and other AI assistants. This package provides a fully functional MCP server for YouTube automation.

## Installation

You can use this package directly with `npx` (no installation required):

```bash
npx yutu-mcp mcp
```

Or install globally:

```bash
npm install -g yutu-mcp
```

## Quick Setup

### 🚀 One-Command Setup (Recommended)

Get started in under 5 minutes:

```bash
# 1. Run the automated setup
npx yutu-mcp setup

# 2. Add to Claude Desktop (copy the config from output)
# 3. Start using YouTube tools in Claude!
```

The setup script will:
- Guide you through creating a Google Cloud project
- Enable the YouTube Data API v3
- Create OAuth 2.0 credentials automatically
- Save credentials to `~/.config/yutu-mcp/client_secret.json`
- Complete the authentication process
- Show you the exact Claude Desktop configuration to copy

### Manual Setup (Advanced)

If you prefer manual setup:

1. Create a project on [Google Cloud Platform](https://console.cloud.google.com/)
2. Enable the YouTube Data API v3
3. Create OAuth 2.0 credentials with redirect URI `http://localhost:8216`
4. Download the credentials and save as `~/.config/yutu-mcp/client_secret.json`
5. Run: `npx yutu-mcp auth`

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": [
        "-y",
        "yutu-mcp",
        "mcp"
      ],
      "env": {
        "YUTU_CREDENTIAL": "~/.config/yutu-mcp/client_secret.json",
        "YUTU_CACHE_TOKEN": "~/.config/yutu-mcp/youtube.token.json"
      }
    }
  }
}
```

> **Note**: The `~` path will automatically resolve to your home directory. If you encounter issues, use the full absolute path instead.

## Usage with Cursor

Add to your Cursor configuration:

```json
{
  "youtube": {
    "command": "npx",
    "args": [
      "-y", 
      "yutu-mcp",
      "mcp"
    ],
    "env": {
      "YUTU_CREDENTIAL": "~/.config/yutu-mcp/client_secret.json",
      "YUTU_CACHE_TOKEN": "~/.config/yutu-mcp/youtube.token.json"
    }
  }
}
```

## CLI Usage

The package also works as a standalone CLI:

```bash
# List videos
npx yutu-mcp video list --mine true

# Upload a video
npx yutu-mcp video insert --file video.mp4 --title "My Video"

# Manage comments
npx yutu-mcp comment list --videoId VIDEO_ID
```

## Available Commands

- **video** - Manage YouTube videos (list, upload, update, delete)
- **playlist** - Manage playlists
- **comment** - Manage comments and replies
- **channel** - Manage channel settings
- **caption** - Manage video captions
- **subscription** - Manage subscriptions
- And many more...

## Environment Variables

- `YUTU_CREDENTIAL` - Path to client_secret.json
- `YUTU_CACHE_TOKEN` - Path to youtube.token.json

## License

Apache-2.0

## Author

Claudiu Mihaila <iclaudiumihaila@gmail.com>

## Links

- [GitHub Repository](https://github.com/claudiumihaila/youtube-mcp)
- [Issue Tracker](https://github.com/claudiumihaila/youtube-mcp/issues)
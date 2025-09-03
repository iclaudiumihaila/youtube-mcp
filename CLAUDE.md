# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Yutu is a fully functional MCP (Model Context Protocol) server and CLI for YouTube written in Go. It provides comprehensive YouTube API automation capabilities including manipulation of videos, playlists, channels, comments, captions, and more.

## Development Commands

### Build
```bash
# Build the binary
go build -o yutu main.go

# Build with Bazel (alternative)
bazel build //...
```

### Test
```bash
# Run all tests with coverage
go test ./... -coverprofile=cover.out -coverpkg="./pkg/..."

# Run command tests
./scripts/command-test.sh

# Run a specific test
go test ./pkg/[package_name] -run TestName
```

### Dependencies
```bash
# Download dependencies
go mod download

# Update dependencies
go mod tidy
```

### Generate Resources
```bash
# Generate Windows resources (if needed)
go generate
```

## Architecture

### Directory Structure
- **cmd/**: Command-line interface implementation for each YouTube resource
  - Each subdirectory (e.g., `video/`, `playlist/`, `channel/`) contains CLI command implementations
  - `mcp.go`: MCP server implementation
  - `auth.go`: OAuth authentication handling
  - `root.go`: Main command entry point
  
- **pkg/**: Core business logic and API interactions
  - Mirrors cmd/ structure with corresponding packages for each YouTube resource
  - `auth/`: Authentication and OAuth token management
  - `utils/`: Shared utility functions
  - `interface.go`: Common interfaces used across packages
  - `vars.go`: Shared variables and constants

### Key Components

1. **Authentication Flow**: 
   - Uses OAuth 2.0 for YouTube API authentication
   - Requires `client_secret.json` and generates `youtube.token.json`
   - Environment variables: `YUTU_CREDENTIAL` and `YUTU_CACHE_TOKEN`

2. **Command Pattern**:
   - Built with Cobra framework for CLI commands
   - Each YouTube resource has its own command module with list/insert/update/delete operations
   - Commands map directly to YouTube Data API v3 operations

3. **MCP Server**:
   - Implements Model Context Protocol for AI integration
   - Located in `cmd/mcp.go` using `github.com/mark3labs/mcp-go`
   - Exposes YouTube operations as tools for AI assistants

4. **Resource Operations**:
   - Standard CRUD operations for YouTube resources
   - Quota management (10,000 units/day limit)
   - Supports batch operations where applicable

## Testing Approach

Tests are located alongside source files in `*_test.go` files. The project uses standard Go testing with coverage reporting. Command-line functionality is tested via the `scripts/command-test.sh` script.

## Build System

The project supports multiple build systems:
- Native Go build tools
- Bazel build system (BUILD.bazel files present)
- GitHub Actions for CI/CD (.github/workflows/)
- GoReleaser for release management (.goreleaser.yaml)
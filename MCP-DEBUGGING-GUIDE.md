# Playwright MCP for AI-Assisted Debugging

## Quick Start

### 1. Start Both Servers

```bash
# Option A: Start both servers at once
npm run mcp:debug

# Option B: Start separately in different terminals
# Terminal 1: Start React app
npm start

# Terminal 2: Start MCP server
npm run mcp:server
```

### 2. Access URLs

- **React App**: http://localhost:3000
- **MCP Server**: http://localhost:3001

### 3. Configure AI Tool (GitHub Copilot/Claude Desktop)

Add this to your AI tool's MCP configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp",
        "--host",
        "localhost",
        "--port",
        "3001",
        "--browser",
        "chrome",
        "--output-dir",
        "./test-results/mcp-sessions",
        "--save-trace",
        "--save-video",
        "1280x720"
      ]
    }
  }
}
```

### 4. AI Debugging Commands You Can Use

Ask your AI assistant to:

1. **Navigate and explore**:

   - "Open my React app at localhost:3000"
   - "Take a screenshot of the current page"
   - "Navigate to the form and show me what's there"

2. **Test form functionality**:

   - "Fill the user name field with 'Test User' and submit"
   - "Check if validation errors appear when submitting empty form"
   - "Test file upload functionality"

3. **Debug specific issues**:

   - "Click the copy button and see what happens"
   - "Check if the AI analysis panel is working"
   - "Test the form with invalid data"

4. **Performance and behavior**:
   - "Record a trace of the user workflow"
   - "Take screenshots at each step of form submission"
   - "Check console errors during form interaction"

### 5. Session Files

All debugging sessions are saved to `./test-results/mcp-sessions/`:

- **Videos**: Recording of browser interactions
- **Traces**: Detailed Playwright traces for analysis
- **Screenshots**: Snapshots taken during debugging

### 6. Example AI Debugging Session

1. Start: `npm run mcp:debug`
2. Tell AI: "Connect to my MCP server and test the onboarding form"
3. AI will:
   - Open browser
   - Navigate to your app
   - Test form inputs
   - Take screenshots
   - Record interactions
   - Report findings

### 7. Stopping

- **Ctrl+C** in the terminal running MCP server
- Or close the browser window
- Sessions are automatically saved

## Troubleshooting

- **Port 3001 in use**: Change port in package.json script
- **Browser not opening**: Check if Chrome is installed
- **AI can't connect**: Verify MCP server is running on localhost:3001

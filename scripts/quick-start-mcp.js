#!/usr/bin/env node

console.log('🚀 Starting Playwright MCP debugging session...');

const { spawn } = require('child_process');

// Start React app
console.log('Starting React app on http://localhost:3000...');
const reactProcess = spawn('npm', ['start'], { 
  stdio: 'inherit',
  shell: true 
});

// Wait a bit for React to start
setTimeout(() => {
  console.log('Starting MCP server on http://localhost:3001...');
  
  // Start MCP server
  const mcpProcess = spawn('npx', [
    '@playwright/mcp',
    '--host', 'localhost',
    '--port', '3001',
    '--browser', 'chrome',
    '--output-dir', './test-results/mcp-sessions',
    '--save-trace',
    '--save-video', '1280x720'
  ], { 
    stdio: 'inherit',
    shell: true 
  });
  
  console.log('\n🎉 Both servers started!');
  console.log('📱 React App: http://localhost:3000');
  console.log('🤖 MCP Server: http://localhost:3001');
  console.log('\n💡 Configure your AI tool with:');
  console.log(JSON.stringify({
    "mcpServers": {
      "playwright": {
        "url": "http://127.0.0.1:3001/mcp"
      }
    }
  }, null, 2));
  
  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    reactProcess.kill();
    mcpProcess.kill();
    process.exit(0);
  });
  
}, 3000);

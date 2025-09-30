#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Playwright MCP Troubleshooting Script\n');

async function checkPlaywrightInstallation() {
  console.log('1️⃣ Checking Playwright installation...');
  
  try {
    const output = execSync('npx playwright --version', { encoding: 'utf8' });
    console.log('✅ Playwright version:', output.trim());
  } catch (error) {
    console.log('❌ Playwright not found. Installing...');
    execSync('npm install @playwright/test', { stdio: 'inherit' });
  }
}

async function checkBrowsers() {
  console.log('\n2️⃣ Checking browsers...');
  
  try {
    // Check if chromium browser exists
    const output = execSync('npx playwright install --dry-run chromium', { encoding: 'utf8' });
    if (output.includes('is already installed')) {
      console.log('✅ Chromium browser is installed');
    } else {
      console.log('❌ Browsers not installed. Installing...');
      execSync('npx playwright install', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('❌ Error checking browsers. Installing...');
    try {
      execSync('npx playwright install', { stdio: 'inherit' });
      console.log('✅ Browsers installed successfully');
    } catch (installError) {
      console.log('❌ Failed to install browsers:', installError.message);
    }
  }
}

async function checkMCPPackage() {
  console.log('\n3️⃣ Checking Playwright MCP package...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasMCP = packageJson.devDependencies && packageJson.devDependencies['@playwright/mcp'];
  
  if (hasMCP) {
    console.log('✅ @playwright/mcp is installed');
  } else {
    console.log('❌ @playwright/mcp not found. Installing...');
    execSync('npm install @playwright/mcp --save-dev', { stdio: 'inherit' });
  }
}

async function testMCPServer() {
  console.log('\n4️⃣ Testing MCP server startup...');
  
  return new Promise((resolve) => {
    // Handle Windows environment properly
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'cmd' : 'npx';
    const args = isWindows ? ['/c', 'npx', '@playwright/mcp', '--help'] : ['@playwright/mcp', '--help'];
    
    const mcpProcess = spawn(command, args, {
      stdio: 'pipe',
      shell: isWindows
    });
    
    let output = '';
    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    mcpProcess.on('error', (error) => {
      console.log('❌ MCP server test failed:', error.message);
      resolve();
    });
    
    mcpProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ MCP server can start successfully');
      } else {
        console.log('❌ MCP server failed to start');
        if (output) console.log('Output:', output);
      }
      resolve();
    });
    
    setTimeout(() => {
      mcpProcess.kill();
      console.log('✅ MCP server test completed');
      resolve();
    }, 3000);
  });
}

async function createQuickStartScript() {
  console.log('\n5️⃣ Creating quick start script...');
  
  const quickStart = `#!/usr/bin/env node

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
  
  console.log('\\n🎉 Both servers started!');
  console.log('📱 React App: http://localhost:3000');
  console.log('🤖 MCP Server: http://localhost:3001');
  console.log('\\n💡 Configure your AI tool with:');
  console.log(JSON.stringify({
    "mcpServers": {
      "playwright": {
        "url": "http://127.0.0.1:3001/mcp"
      }
    }
  }, null, 2));
  
  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down servers...');
    reactProcess.kill();
    mcpProcess.kill();
    process.exit(0);
  });
  
}, 3000);
`;

  fs.writeFileSync('scripts/quick-start-mcp.js', quickStart);
  console.log('✅ Created scripts/quick-start-mcp.js');
}

async function main() {
  // Create scripts directory if it doesn't exist
  if (!fs.existsSync('scripts')) {
    fs.mkdirSync('scripts');
  }
  
  await checkPlaywrightInstallation();
  await checkBrowsers();
  await checkMCPPackage();
  await testMCPServer();
  await createQuickStartScript();
  
  console.log('\\n🎉 Troubleshooting complete!');
  console.log('\\n📝 Next steps:');
  console.log('1. Run: node scripts/quick-start-mcp.js');
  console.log('2. Configure your AI tool with the MCP server URL');
  console.log('3. Ask AI to "Navigate to my React app and take a screenshot"');
}

main().catch(console.error);
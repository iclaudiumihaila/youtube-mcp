import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DOWNLOADS_DIR = join(homedir(), '.config', 'yutu-mcp');
const CREDENTIAL_PATH = join(DOWNLOADS_DIR, 'client_secret.json');

// Ensure directory exists
if (!existsSync(DOWNLOADS_DIR)) {
  mkdirSync(DOWNLOADS_DIR, { recursive: true });
  console.log(`Created directory: ${DOWNLOADS_DIR}`);
}

function openBrowser(url) {
  const platform = process.platform;
  let command;
  
  switch (platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${url}"`;
      break;
    default: // Linux
      command = `xdg-open "${url}"`;
      break;
  }
  
  return execAsync(command);
}

async function setupGoogleCloud() {
  console.log('🚀 Starting Google Cloud setup for YouTube API...\n');
  
  console.log('📋 Setup Steps:');
  console.log('1. Sign in to your Google account');
  console.log('2. Create or select a project');
  console.log('3. Enable YouTube Data API v3');
  console.log('4. Create OAuth 2.0 credentials');
  console.log('5. Download credentials\n');
  
  console.log('🌐 Opening Google Cloud Console in your default browser...');
  await openBrowser('https://console.cloud.google.com/');
  
  console.log('⏳ Please sign in to your Google account in the browser...');
  console.log('   Press Enter when you are signed in...');
  await waitForEnter();
  
  console.log('\n📚 Step 1: Enable YouTube Data API v3');
  console.log('   Opening API Library...');
  await openBrowser('https://console.cloud.google.com/apis/library/youtube.googleapis.com');
  
  console.log('   Please:');
  console.log('   1. Click "ENABLE" button');
  console.log('   2. Wait for it to be enabled');
  console.log('   Press Enter when API is enabled...');
  await waitForEnter();
  
  console.log('\n📝 Step 2: Create OAuth 2.0 Credentials');
  console.log('   Opening Credentials page...');
  await openBrowser('https://console.cloud.google.com/apis/credentials');
  
  console.log('   Please follow these steps:');
  console.log('   1. Click "CREATE CREDENTIALS" → "OAuth client ID"');
  console.log('   2. If prompted, configure OAuth consent screen first:');
  console.log('      - Choose "External" user type');
  console.log('      - App name: "yutu-mcp"');
  console.log('      - Add your email as support/developer contact');
  console.log('      - Save and continue through all steps');
  console.log('      - Add yourself as a test user');
  console.log('   3. For OAuth client:');
  console.log('      - Application type: "Web application"');
  console.log('      - Name: "yutu-mcp-client"');
  console.log('      - Authorized redirect URIs: "http://localhost:8216"');
  console.log('   4. Click "CREATE"');
  console.log('   5. Download the JSON credentials file');
  console.log('   6. Move/rename the file to:');
  console.log(`      ${CREDENTIAL_PATH}`);
  console.log('\n   Press Enter when you have saved the credentials file...');
  await waitForEnter();
  
  // Check for downloaded file
  if (existsSync(CREDENTIAL_PATH)) {
    console.log(`\n✅ Credentials saved to: ${CREDENTIAL_PATH}`);
    console.log('\n🔑 Running authentication...');
    
    // TODO: Run auth command here if needed
    console.log('   Authentication will happen automatically on first use.');
    
    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Copy this configuration to Claude Desktop:');
    console.log('   File: ~/Library/Application Support/Claude/claude_desktop_config.json\n');
    
    const config = {
      mcpServers: {
        youtube: {
          command: "npx",
          args: ["-y", "yutu-mcp", "mcp"],
          env: {
            YUTU_CREDENTIAL: "~/.config/yutu-mcp/client_secret.json",
            YUTU_CACHE_TOKEN: "~/.config/yutu-mcp/youtube.token.json"
          }
        }
      }
    };
    
    console.log(JSON.stringify(config, null, 2));
    
    console.log('\n🚀 After adding the configuration:');
    console.log('   1. Restart Claude Desktop');
    console.log('   2. You can now use YouTube commands in Claude!');
    console.log('\n💡 Try asking Claude: "List my YouTube videos"');
    
  } else {
    console.log('\n⚠️  Credentials file not found at expected location.');
    console.log('   Please move your downloaded credentials to:');
    console.log(`   ${CREDENTIAL_PATH}`);
  }
  
  console.log('\nPress Enter to finish setup...');
  await waitForEnter();
}

function waitForEnter() {
  return new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

// Run the setup
setupGoogleCloud().catch(console.error);
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DOWNLOADS_DIR = join(homedir(), '.config', 'yutu-mcp');
const CREDENTIAL_PATH = join(DOWNLOADS_DIR, 'client_secret.json');

// Ensure directory exists
if (!existsSync(DOWNLOADS_DIR)) {
  mkdirSync(DOWNLOADS_DIR, { recursive: true });
  console.log(`Created directory: ${DOWNLOADS_DIR}`);
}

async function setupGoogleCloud() {
  console.log('🚀 Starting Google Cloud setup for YouTube API...\n');
  
  // Launch browser with visible UI
  const browser = await chromium.launch({
    headless: false,
    downloadsPath: DOWNLOADS_DIR
  });
  
  const context = await browser.newContext({
    acceptDownloads: true
  });
  
  const page = await context.newPage();
  
  console.log('📋 Setup Steps:');
  console.log('1. Sign in to your Google account');
  console.log('2. Create or select a project');
  console.log('3. Enable YouTube Data API v3');
  console.log('4. Create OAuth 2.0 credentials');
  console.log('5. Download credentials\n');
  
  // Navigate to Google Cloud Console
  console.log('🌐 Opening Google Cloud Console...');
  await page.goto('https://console.cloud.google.com/');
  
  // Wait for user to log in
  console.log('⏳ Please sign in to your Google account...');
  await page.waitForURL('**/console.cloud.google.com/**', { timeout: 0 });
  
  console.log('✅ Logged in successfully!\n');
  
  // Guide to API Library
  console.log('📚 Next: Enable YouTube Data API v3');
  console.log('   Click "APIs & Services" → "Library" in the left sidebar');
  console.log('   OR press Enter to navigate automatically...');
  
  await waitForEnter();
  
  // Navigate to API Library
  await page.goto('https://console.cloud.google.com/apis/library');
  await page.waitForLoadState('networkidle');
  
  // Search for YouTube Data API
  console.log('🔍 Searching for YouTube Data API v3...');
  const searchInput = await page.locator('input[aria-label="Search for APIs and Services"]').first();
  if (searchInput) {
    await searchInput.fill('YouTube Data API v3');
    await page.waitForTimeout(1000);
    
    // Click on the API
    const apiCard = await page.locator('text=YouTube Data API v3').first();
    if (apiCard) {
      await apiCard.click();
      console.log('📦 Found YouTube Data API v3!');
      
      // Check if API is already enabled
      const enableButton = await page.locator('button:has-text("ENABLE")').first();
      const manageButton = await page.locator('button:has-text("MANAGE")').first();
      
      if (await manageButton.isVisible()) {
        console.log('✅ API is already enabled!');
      } else if (await enableButton.isVisible()) {
        console.log('🔧 Enabling API...');
        await enableButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ API enabled successfully!');
      }
    }
  }
  
  console.log('\n📝 Next: Create OAuth 2.0 Credentials');
  console.log('   Press Enter to continue...');
  await waitForEnter();
  
  // Navigate to Credentials
  await page.goto('https://console.cloud.google.com/apis/credentials');
  await page.waitForLoadState('networkidle');
  
  // Check if OAuth consent screen needs setup
  const consentScreenButton = await page.locator('text="CONFIGURE CONSENT SCREEN"').first();
  if (await consentScreenButton.isVisible()) {
    console.log('⚙️  Setting up OAuth consent screen...');
    await consentScreenButton.click();
    
    console.log('📋 Please configure the consent screen:');
    console.log('   1. Choose "External" user type');
    console.log('   2. Fill in App name: "yutu-mcp"');
    console.log('   3. Add your email as support and developer contact');
    console.log('   4. Save and continue through all steps');
    console.log('   5. Add yourself as a test user');
    console.log('\n   Press Enter when consent screen is configured...');
    await waitForEnter();
    
    // Go back to credentials
    await page.goto('https://console.cloud.google.com/apis/credentials');
  }
  
  // Create OAuth Client
  console.log('🔑 Creating OAuth 2.0 Client ID...');
  const createButton = await page.locator('button:has-text("CREATE CREDENTIALS")').first();
  if (await createButton.isVisible()) {
    await createButton.click();
    await page.locator('text="OAuth client ID"').click();
    
    // Wait for form to load
    await page.waitForTimeout(2000);
    
    // Select Web application
    const appTypeSelect = await page.locator('select[aria-label="Application type"]').first();
    if (appTypeSelect) {
      await appTypeSelect.selectOption('Web application');
    }
    
    // Set name
    const nameInput = await page.locator('input[aria-label="Name"]').first();
    if (nameInput) {
      await nameInput.fill('yutu-mcp-client');
    }
    
    // Add redirect URI
    console.log('🔗 Adding redirect URI...');
    const addUriButton = await page.locator('button:has-text("ADD URI")').first();
    if (await addUriButton.isVisible()) {
      await addUriButton.click();
      const uriInput = await page.locator('input[placeholder*="redirect"]').last();
      await uriInput.fill('http://localhost:8216');
    }
    
    console.log('💾 Creating credentials...');
    console.log('   Click "CREATE" button at the bottom');
    console.log('   Then click "DOWNLOAD JSON" in the popup');
    console.log('\n   Press Enter after downloading...');
    await waitForEnter();
  }
  
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
  
  console.log('\nPress Enter to close browser...');
  await waitForEnter();
  
  await browser.close();
}

function waitForEnter() {
  return new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

// Run the setup
setupGoogleCloud().catch(console.error);
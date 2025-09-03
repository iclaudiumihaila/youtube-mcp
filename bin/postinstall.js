#!/usr/bin/env node

import { platform, arch } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, createWriteStream, chmodSync } from 'fs';
import { pipeline } from 'stream/promises';
import { request } from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO = 'eat-pray-ai/yutu';
const VERSION = 'latest'; // Or specify a version

async function getLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/latest`,
      headers: {
        'User-Agent': 'yutu-mcp-installer'
      }
    };
    
    request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject).end();
  });
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading from: ${url}`);
    
    const file = createWriteStream(destPath);
    
    request(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          // Make binary executable on Unix-like systems
          if (platform() !== 'win32') {
            chmodSync(destPath, 0o755);
          }
          resolve();
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).end();
  });
}

async function getBinaryUrl() {
  const os = platform();
  const architecture = arch();
  
  const osMap = {
    'darwin': 'darwin',
    'linux': 'linux',
    'win32': 'windows'
  };
  
  const archMap = {
    'x64': 'amd64',
    'arm64': 'arm64'
  };
  
  const mappedOs = osMap[os];
  const mappedArch = archMap[architecture];
  
  if (!mappedOs || !mappedArch) {
    throw new Error(`Unsupported platform: ${os} ${architecture}`);
  }
  
  const binaryName = `yutu-${mappedOs}-${mappedArch}`;
  const fileName = os === 'win32' ? `${binaryName}.exe` : binaryName;
  
  try {
    const release = await getLatestRelease();
    const asset = release.assets.find(a => a.name === fileName);
    
    if (!asset) {
      throw new Error(`Binary not found for ${os} ${architecture}`);
    }
    
    return {
      url: asset.browser_download_url,
      fileName: fileName
    };
  } catch (err) {
    // Fallback to direct URL construction if API fails
    const version = VERSION === 'latest' ? 'latest' : `v${VERSION}`;
    return {
      url: `https://github.com/${REPO}/releases/download/${version}/${fileName}`,
      fileName: fileName
    };
  }
}

async function install() {
  try {
    console.log('Installing yutu MCP server...');
    console.log(`Platform: ${platform()} ${arch()}`);
    
    const binariesDir = join(__dirname, '..', 'binaries');
    
    // Create binaries directory if it doesn't exist
    if (!existsSync(binariesDir)) {
      mkdirSync(binariesDir, { recursive: true });
    }
    
    const { url, fileName } = await getBinaryUrl();
    const destPath = join(binariesDir, fileName);
    
    // Check if binary already exists
    if (existsSync(destPath)) {
      console.log('Binary already exists, skipping download');
      return;
    }
    
    console.log(`Downloading binary: ${fileName}`);
    await downloadFile(url, destPath);
    
    console.log('Installation complete!');
    console.log('You can now use yutu-mcp in your Claude configuration');
  } catch (error) {
    console.error('Installation failed:', error.message);
    console.error('You may need to download the binary manually from:');
    console.error(`https://github.com/${REPO}/releases/latest`);
    process.exit(1);
  }
}

// Only run install if not in CI/CD environment
if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
  install();
}
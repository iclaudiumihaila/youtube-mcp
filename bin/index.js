#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { platform, arch } from 'os';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getBinaryName() {
  const os = platform();
  const architecture = arch();
  
  // Map Node.js platform/arch to Go binary naming
  const osMap = {
    'darwin': 'darwin',
    'linux': 'linux', 
    'win32': 'windows'
  };
  
  const archMap = {
    'x64': 'amd64',
    'arm64': 'arm64'
  };
  
  const mappedOs = osMap[os] || os;
  const mappedArch = archMap[architecture] || architecture;
  
  const binaryName = `yutu-${mappedOs}-${mappedArch}`;
  return os === 'win32' ? `${binaryName}.exe` : binaryName;
}

function getBinaryPath() {
  const binaryName = getBinaryName();
  const binaryPath = join(__dirname, '..', 'binaries', binaryName);
  
  if (!existsSync(binaryPath)) {
    console.error(`Binary not found: ${binaryPath}`);
    console.error('Please ensure the package was installed correctly.');
    console.error(`Expected binary for: ${platform()} ${arch()}`);
    process.exit(1);
  }
  
  return binaryPath;
}

function main() {
  const args = process.argv.slice(2);
  
  // Handle special setup command
  if (args[0] === 'setup') {
    console.log('🚀 Starting YouTube MCP setup...\n');
    const setupScript = join(__dirname, '..', 'setup-google-cloud.js');
    
    if (!existsSync(setupScript)) {
      console.error('Setup script not found. Please reinstall the package.');
      process.exit(1);
    }
    
    // Run the Node.js setup script
    const child = spawn('node', [setupScript], {
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('error', (err) => {
      console.error('Failed to start setup:', err);
      process.exit(1);
    });
    
    child.on('exit', (code) => {
      process.exit(code || 0);
    });
    
    return;
  }
  
  // For all other commands, use the Go binary
  const binaryPath = getBinaryPath();
  
  // Spawn the Go binary with all arguments
  const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    env: process.env
  });
  
  child.on('error', (err) => {
    console.error('Failed to start yutu:', err);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main();
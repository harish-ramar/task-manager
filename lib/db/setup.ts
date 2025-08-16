import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function getPostgresURL(): Promise<string> {
  console.log('Step 1: Setting up Postgres');
  console.log('Choose your database option:');
  console.log('1. (L) Local Postgres with Docker - for development');
  console.log('2. (S) Supabase - recommended for production');
  console.log('3. (R) Other remote Postgres instance');
  
  const dbChoice = await question(
    'Enter your choice (L/S/R): '
  );

  if (dbChoice.toLowerCase() === 'l') {
    console.log('Setting up local Postgres instance with Docker...');
    await setupLocalPostgres();
    return 'postgres://postgres:postgres@localhost:54322/postgres';
  } else if (dbChoice.toLowerCase() === 's') {
    return await setupSupabase();
  } else {
    console.log(
      'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
    );
    return await question('Enter your POSTGRES_URL: ');
  }
}

async function setupSupabase(): Promise<string> {
  console.log('\n🚀 Setting up Supabase Database');
  console.log('📋 Follow these steps to get your Supabase connection URL:');
  console.log('');
  console.log('1. Go to https://supabase.com and create a free account');
  console.log('2. Create a new project');
  console.log('3. Go to Settings → Database');
  console.log('4. Copy the connection string under "Connection pooling"');
  console.log('   (Use the "Transaction" mode for better compatibility)');
  console.log('');
  console.log('⚠️  Important: Use the POOLED connection string, not the direct one!');
  console.log('   It should look like: postgresql://postgres:[password]@[host]:6543/postgres');
  console.log('   (Note the port 6543 for pooled connections)');
  console.log('');
  
  const supabaseUrl = await question('Enter your Supabase connection string: ');
  
  if (!supabaseUrl.includes(':6543')) {
    console.log('⚠️  Warning: Make sure you\'re using the pooled connection (port 6543)');
    const confirm = await question('Continue anyway? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      return await setupSupabase();
    }
  }
  
  console.log('✅ Supabase configuration complete!');
  return supabaseUrl;
}

async function setupLocalPostgres() {
  console.log('Checking if Docker is installed...');
  try {
    await execAsync('docker --version');
    console.log('Docker is installed.');
  } catch (error) {
    console.error(
      'Docker is not installed. Please install Docker and try again.'
    );
    console.log(
      'To install Docker, visit: https://docs.docker.com/get-docker/'
    );
    process.exit(1);
  }

  console.log('Creating docker-compose.yml file...');
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(
    path.join(process.cwd(), 'docker-compose.yml'),
    dockerComposeContent
  );
  console.log('docker-compose.yml file created.');

  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
    console.log('Docker container started successfully.');
  } catch (error) {
    console.error(
      'Failed to start Docker container. Please check your Docker installation and try again.'
    );
    process.exit(1);
  }
}

function generateAuthSecret(): string {
  console.log('Step 2: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 3: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.log('.env file created with the necessary variables.');
}

async function main() {
  const POSTGRES_URL = await getPostgresURL();
  const BASE_URL = 'http://localhost:3000';
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    POSTGRES_URL,
    BASE_URL,
    AUTH_SECRET,
  });

  console.log('🎉 Setup completed successfully!');
}

main().catch(console.error);

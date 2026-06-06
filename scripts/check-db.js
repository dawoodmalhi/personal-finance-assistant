const fs = require('fs');
const path = require('path');

// Load .env into process.env if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const s = line.trim();
      if (!s || s.startsWith('#')) return;
      const idx = s.indexOf('=');
      if (idx === -1) return;
      const key = s.slice(0, idx).trim();
      let val = s.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
    console.log('Loaded environment from .env');
  } else {
    console.log('.env file not found; using existing environment variables');
  }
} catch (err) {
  console.warn('Failed to load .env file:', err && err.message ? err.message : err);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill in the DATABASE_URL from Supabase.');
  process.exit(1);
}

console.log('DATABASE_URL is present. Testing database connection...');

// Test connection by querying the User table
async function testConnection() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const userCount = await prisma.user.count();
    console.log(`✓ Database connection successful`);
    console.log(`✓ User table is accessible — ${userCount} user(s) found`);

    // Optionally fetch first user if any exist
    if (userCount > 0) {
      const firstUser = await prisma.user.findFirst();
      console.log('✓ Sample user:', firstUser);
    }
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
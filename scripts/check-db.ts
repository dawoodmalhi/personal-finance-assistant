import prisma from '../lib/db';

async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('DB connection OK', res);
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

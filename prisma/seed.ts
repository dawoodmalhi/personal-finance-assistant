import { TransactionSource } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

import { prisma } from '../lib/prisma'

const CATEGORIES = [
  "Groceries",
  "Dining",
  "Transport",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Subscriptions",
  "Travel",
  "Education",
];

const MERCHANTS: Record<string, string> = {
  Groceries: "Whole Foods",
  Dining: "Chipotle",
  Transport: "Uber",
  Entertainment: "Netflix",
  Utilities: "Con Edison",
  Healthcare: "CVS Pharmacy",
  Shopping: "Amazon",
  Subscriptions: "Spotify",
  Travel: "Delta Airlines",
  Education: "Udemy",
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}

function generateTransactions(userId: string, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[i % CATEGORIES.length];
    const merchant = MERCHANTS[category];
    const amount = parseFloat(randomBetween(5, 250).toFixed(2));
    return {
      userId,
      date: randomDate(180),
      amount,
      merchant,
      category,
      description: `${merchant} purchase`,
      source: TransactionSource.CSV,
      isDuplicate: false,
    };
  });
}

async function main() {
  console.log("Seeding database...");

  let clerkUser;
  try {
    clerkUser = await clerk.users.createUser({
      emailAddress: ['dawoodmalhi@outlook.com'],
      password: 'AForArjan2',
      firstName: 'Test',
      lastName: 'User',
    });
    console.log(`Clerk user created: ${clerkUser.id}`);
  } catch (err: any) {
    console.log(err);
    console.log('Create failed, attempting to find existing user...', err.status, err.message)
    
    // Always try to find existing user on any error
    try {
      const existing = await clerk.users.getUserList({
        emailAddress: ['test@example.com'],
      });
      
      if (existing.data.length === 0) {
        throw new Error('User not found in Clerk after create failed')
      }
      
      clerkUser = existing.data[0];
      console.log(`Clerk user already exists: ${clerkUser.id}`);
    } catch (findErr: any) {
      throw new Error(`Failed to create or find Clerk user: ${findErr.message}`)
    }
  }

  // Upsert into Supabase via Prisma
  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email: "dawoodmalhi@outlook.com",
      name: "Test User",
    },
  });

  console.log(`User ready: ${user.email} (${user.id})`);

  // Skip if transactions already seeded
  const existing = await prisma.transaction.count({
    where: { userId: user.id },
  });

  if (existing >= 50) {
    console.log(`Skipping transactions — ${existing} already exist`);
  } else {
    const transactions = generateTransactions(user.id, 50);
    await prisma.transaction.createMany({ data: transactions });
    console.log("Created 50 sample transactions");
  }

  // Seed a default budget
  await prisma.budget.upsert({
    where: {
      userId_category_period: {
        userId: user.id,
        category: "Groceries",
        period: "MONTHLY",
      },
    },
    update: {},
    create: {
      userId: user.id,
      category: "Groceries",
      limitAmount: 400,
      period: "MONTHLY",
    },
  });

  console.log("Seeded default Groceries budget ($400/month)");
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

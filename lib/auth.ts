import { auth, currentUser } from '@clerk/nextjs/server';
import { cache } from 'react';

import prisma from './db';

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    const e: any = new Error('Unauthenticated');
    e.status = 401;
    throw e;
  }

  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    const e: any = new Error('User not found');
    e.status = 404;
    throw e;
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
  const name =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name, deleted: false },
    create: { clerkId: userId, email, name },
  });
});

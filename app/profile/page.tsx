import React from 'react';
import { getCurrentUser } from '../../lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-4">
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </div>
    </div>
  );
}

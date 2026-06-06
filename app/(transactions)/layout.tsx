import React from 'react';

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col p-6">{children}</div>;
}

import React from 'react';
import '../styles/tailwind.css';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';
import Footer from '../components/Footer';
import Nav from '../components/Nav';
import { Noto_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={cn("dark font-sans", notoSans.variable)}>
            <body className="min-h-screen">
                <ClerkProvider
                    appearance={{
                        theme: shadcn,
                    }}
                    afterSignOutUrl="/"
                >
                    <div className="flex min-h-screen flex-col">
                        <Nav />
                        <main className="flex flex-1 flex-col">{children}</main>
                        <Footer />
                    </div>
                </ClerkProvider>
            </body>
        </html>
    );
}